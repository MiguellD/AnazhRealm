# Millionen: Bevölkerung, Masse und Strom

## Die Vision hier

Ein Planet trägt nicht Tausende, sondern Milliarden Menschen, und jeder einzelne ist eine Funktion aus dem Samen: geboren in einem Jahr, mit Haus, Werk, Krankheiten, Kindern und Tod. Von nah hat er sein Gesicht und sein Ziel, von fern ist er ein Pixel in einer Ganglinie. Es gibt Städte, die keine Gegenwart kennt: eine zusammenhängende Bebauung mit hundert Millionen Bewohnern, gegen die Tokio (37 Mio. in der Metropolregion) ein Vorort ist. Die Menge ist dabei eine eigene Physik und keine Kulisse: drei Millionen Pendler laufen jeden Morgen durch einen Bahnhof, der größer ist als Shinjuku, im Engpass staut sich eine Stoßwelle, im Stadion läuft die La-Ola-Welle um die Ränge, ein Badefest mit zehn Millionen Pilgern füllt ein Flussufer und kippt dort ins Gedränge, wo die Topologie es erzwingt. Die Menge trägt ihre Kultur und ihre Epoche am Leib: Paris 1347 sieht anders aus als Lagos 2100, und ein Volk auf einem fremden Planeten liest als Volk, nicht als Kostüm. Seuchen entstehen aus den Kontakten genau dieser Leute, wandern über ihre Pendlerwege und Handelsrouten und biegen die Lebenserwartung einer Epoche, bis Medizin sie wieder anhebt. Wenn ein Vulkan ausbricht oder ein Krieg beginnt, setzt sich ein ganzes Volk in Bewegung und gründet anderswo neue Städte. Dasselbe Gesetz der Masse trägt den Starenschwarm, die Gnu-Wanderung und die Heuschreckenplage. Fliegt man vom Gesicht eines Flüchtlings bis in den Orbit oder reist man 700 Jahre zurück, wechselt man nur den Maßstab, nicht die Wahrheit, und das alles bei 33 ms ohne Download.

## Das Beste der Gegenwart

- **Assassin's Creed Unity** (Ubisoft 2014): 5 000 KI-Figuren in Missionen, bis 10 000–12 000 bei der Hinrichtung des Königs, mit KI-LOD und „AI Recycling“ (GDC-Vortrag Cournoyer). Die Grenze: Die Figuren werden wiederverwertet und haben kein Leben, das über den Blick des Spielers hinausreicht.
- **Kingdom Come: Deliverance II** (Warhorse 2025): etwa 2 400 NPCs mit Tagesablauf (MEISTERKARTE.md:445). Die Grenze sind Tausende statt Millionen, und es gibt weder Demografie noch Tod.
- **Cities: Skylines II** (Paradox 2023): Lebensläufe mit Gesundheit, Krankheit und Sterberisiko, das Agenten-Limit von 65 536 aus Teil 1 ist gefallen. Die Grenze: Die Bürger sind aus der Vogelschau gesehene Pünktchen ohne Gesicht, und ein Patch löste „Todeswellen“ aus, ein Beleg für eine Demografie ohne Gesetzestreue.
- **Hitman** (IOI 2016–2021): laut Game Developer über 1 000 Crowd-NPCs je Level, zum Teil laut Spielerberichten nur Partikel-Attrappen. Die Grenze: Die Masse ist Kulisse und kein Kollektiv.
- **Forschung GPU-Crowd:** ORCA auf der GPU (Charlton et al. 2019) mit über 100 000 Agenten bei 60 fps, Compute-Shader-Crowds (IEEE Access 2024) mit 20 000 bei 60 fps auf Mittelklasse-Hardware. Die Grenze: Das läuft ohne Darstellung als Person und ohne Tag oder Ziel.
- **Epidemiologie:** Epicast 2.0 (arXiv 2504.03604) mit etwa 324 Mio. synthetischen Agenten mit je 25 Attributen, die die ganze USA in Schule, Arbeit und Haushalt nachbilden. Die Grenze: Das braucht Supercomputer, ist nicht interaktiv, und keiner der Agenten hat einen Leib.
- **Kollektive Tierbewegung:** Feldmessungen an Starenschwärmen (Cavagna, Giardina et al. 2010) zeigen skalenfreie Korrelation: die Korrelationslänge wächst mit der Schwarmgröße. Kein Spiel hält das als Gesetz; Schwärme sind dort Boids-Partikel ohne Feld.
- **Die Wirklichkeit:** Shinjuku zählt laut nippon.com über 3,5 Mio. Fahrgäste am Tag, die Kumbh Mela trägt an Hauptbadetagen Zehnmillionen Pilger. Die Gefahrenschwelle für Gedränge liegt bei mehr als 5 P/m² für stehende und mehr als 3 P/m² für gehende Massen (G. K. Still), die IMO wertet 4 P/m² über 10 % der Räumzeit als unsicher. Die Erde trägt 8,1 Mrd. Menschen, die Lebenserwartung stieg in 200 Jahren von etwa 30 auf 73 Jahre. Die bevorzugte Distanz zu Fremden schwankt zwischen Kulturen messbar (Sorokowska et al. 2017, 42 Länder).

## Der Same

**Die Person ist eine reine Funktion `p(samen, i, t)`, und die Menge ist ihr Integral.** Wer i ist, folgt aus der Demografie des Ortes und der Epoche: aus Geburtsjahr, Haushalt, Rolle, Kultur, Gesundheitszustand und dem Ziel zur Uhrzeit t. Gezeichnet oder simuliert wird nur, was der Schirm verlangt. Nah sind es Leib, Gesicht und Ausweichen (Sozialkraft und ORCA), mittel ein Fluss-Feld (das Fundamentaldiagramm, Dichte gegen Geschwindigkeit), fern eine Dichte-Textur und eine Ganglinie. Alle drei lesen dieselbe Funktion, sodass ein Mensch, der aus dem Strom tritt, genau der ist, den der Strom gezählt hat. Dasselbe Kontinuum trägt jede Masse von Lebewesen: der Schwarm ist dieselbe Gleichung mit anderen Konstanten. Ereignisse (Gefahr, Seuche, Krieg) sind Felder, auf die die Menge mit EINEM Antwort-Gesetz reagiert, nie Skripte je Fall. Gelöst haben Teile davon andere Branchen: die Epidemiologie mit synthetischen Populationen (Haushalte aus Zensus-Randverteilungen, Kontakte aus Wegeketten), die Verkehrsplanung (MATSim, Vier-Stufen-Modell: Ganglinien aus Wohn- und Arbeitsort), die Fluiddynamik (Hughes-Kontinuumsmodell der Fußgänger), die Versicherungsmathematik (Gompertz-Makeham, das Sterbegesetz in zwei Zahlen) und die statistische Physik der Schwärme.

## Der Preis P* (gilt in jeder Sprosse, sonst gilt die Sprosse nicht)

**P\*** = Frame p95 ≤ 33 ms an Radeon 890M UND GTX 1060 in genau der Szene und Kamera des Richters · Ankunft an diesem Ort (und in diesem Jahr) ≤ 5 s kalt · null Download über das Skript hinaus. Wo eine Sprosse mehr verlangt, steht es dazu (etwa „Bildkosten wachsen nicht mit N“). Interne Teilbudgets („≤ 1 ms CPU“, „≤ 150k Dreiecke“) sind Wege, keine Richter, und stehen hier nicht.

## Die Leitern

### L1 Bevölkerung: lebende Menschen mit eigenem Plan in einer Welt
Misst, wie viele Menschen die Welt gleichzeitig führt. Jeder hat einen Tagesplan f(samen, t) und ist auf ±2 m an seinem Soll-Ort, wenn der Spieler hinkommt, egal wohin und egal in welchem Jahr.

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | 10² (ein Dorf) | Tag als Funktion der Uhr, 4–10 Wege, Tür | P* | Zensus: Körper ÷ Σ leute = 1,0 ±0,05; 24-h-Zeitraffer ≥ 0,9 Soll-Orte | 2 von 3 Achsen: Umfang und Tiefe gemessen (81/81 Häuser), Preis an der Radeon gerissen (Dorfplatz 26,9 fps ≈ 37 ms) |
| 2 | 10³ (Stadt, 300 Häuser) | wie 1, dazu Wohnort ≠ Arbeitsort | P* | Zensus an der Stadt des Worts; 20 zufällige Stichproben-Personen auf ±2 m angetroffen | Test-Stadt 35 Häuser, 118 Bewohner: Umfang 10² |
| 3 | 10⁴ | Haushalte, Alter 0–100 (Säugling bis Greis), Rollen aus Zensus-Randverteilungen | P* | Alters- und Haushaltsgrößen-Verteilung gegen eine Zensus-Referenz der Epoche (KS ≤ 0,1) in ≥ 0,9 von N = 20 Saaten | |
| 4 | 10⁵ (Großstadt) | Sprung an beliebigen Ort ohne Bruch | P* an beliebigem Ort | 100 Teleports an zufällige Orte, je ≥ 0,95 der Angetroffenen am Plan-Ort | |
| 5 | 10⁶ (Megastadt) | Ganglinien und Spitzenstunden emergent | P*, dazu Bildkosten bei 10⁶ gegenüber 10³ ≤ +10 % (gleiche Kamera) | wie 4 bei 10⁶ | |
| 6 | 10⁷ (Tokio-Region) | Region aus mehreren Städten, Fernpendeln | P* | wie 4 über 10⁷, Zensus-Plausibilität bei N = 20 Saaten ≥ 0,9 | |
| 7 | 10⁸ in EINER zusammenhängenden Stadt (größer als jede reale) | die Stadt trägt sich: jeder hat Wohnung, Werk, Versorgung (Kopplung Stadtstoffwechsel) | P* | 100 Teleports in dieselbe Bebauung ≥ 0,95 am Plan-Ort; 1 000 Zufallspersonen: Anteil mit Wohnung, Werk und erreichbarer Versorgung ≥ 0,99 | |
| 8 | 10⁹–10¹⁰ (ein Planet) | Nationen, Epochen-Demografie | P*, Speicher ≤ Gerät | Bevölkerungsdichte aus dem Orbit gegen das Muster einer Nachtlicht-Aufnahme (Rangkorrelation ≥ 0,7), N = 20 Saaten ≥ 0,8 | |
| 9 | 10¹⁰ je Planet × jedes Jahr × viele Welten | jede Zufallsperson hat Gesicht, Biografie und Ziel, in jedem Jahr | P*, Zeitreise ≤ 5 s | 1 000 Proben (Planet, Jahr, Person) aufsuchen: Lebenslauf konsistent (Alter, Haus, Rolle, Familie) ≥ 0,99; Doppelprobe: dieselbe Person in t und t + 20 Jahren ist gealtert dieselbe | |

### L2 Sichtbare Menge: Menschen gleichzeitig im Bild
Misst, wie viele Menschen der Spieler in einem Bild sieht, alle lebendig, ohne Zwillinge und ohne Attrappen, und ob die Menge auf jedem Abstand als Menschen liest. Wer konsistent ist, misst L1; hier zählt das Bild.

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | 10¹ im Bild | Leiber mit Gang, die Gehenden gehen | P* | Third-Bild Dorfplatz 8 Uhr: ≥ 10 Menschen, ≥ 3 gehend | 1 von 3: 18 im Bild, aber 0 gehend, 26,9 fps Radeon |
| 2 | 10² | 50 Saaten ohne zwei gleiche, ≥ 40 % gehend | P* | Markt-Bild: ≥ 100 Menschen, ≥ 40 gehend; Zwillings-Suche (paarweiser Bildabstand der Gestalten) findet 0 | |
| 3 | 10³ (Markt, Bahnsteig) | jeder im Nahring 20 m voll lebendig (Gang, Atem, Blick), keine zwei gleichen | P* | Bildpaar gegen ein Foto eines vollen Bahnsteigs gleicher Brennweite: Dichte ±20 %, Zwillingsfund 0 | Gesetz heute: höchstens 4 Leiber im 8-m-Kreis voll lebendig (`nahLeiber`) |
| 4 | 10⁴ (Platz, Demonstration) | fernes Volk als Dichte, nahe als Leiber, kein Sprung beim Übergang | P* | Kamerafahrt vom Rand in die Mitte: Bild-Differenz am Übergang ≤ Schwelle (0 Ploppen), Zählung ≥ 10⁴ | |
| 5 | 10⁵ (Stadion) | Phänomene der Menge ohne Skript (La-Ola als Prüfstein), jeder Sitz besetzt | P* | Stadion-Bild gegen Referenzfoto; Welle 10–15 m/s, Breite 6–12 m (Farkas et al. 2002); in 10 Läufen ≥ 5 verschiedene Startorte | |
| 6 | 10⁶ (Pilgerfest) | aus der Höhe die Menge als Struktur, im Herunterfliegen Gesichter | P* | Flug Orbit → Gesicht in ≤ 10 s ohne Bruch; Zählung im Sichtkegel ≥ 10⁶ | |
| 7 | 10⁷–10⁸ (Blick vom Turm über die Stadt aus L1.7) | Menge liest auf jedem Abstand als Menschen (Fluss, Lichter, Bewegung), nie als Textur-Rauschen | P* | Bildpaare bei 10 m, 100 m, 1 km, 10 km gegen Fotos realer Großstädte gleicher Höhe und Uhrzeit; Zählung im Kegel ≥ 10⁷ | |

### L3 Massen-Physik: Dichte, Fluss, Gedränge
Misst, ob sich Mengen so verhalten wie in der Wirklichkeit, mit Fundamentaldiagramm, Engpass, Stoßwelle, Gedränge und Selbstorganisation.

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | Paar | Ausweichen ohne Berührung, Kopf-Zuwendung ≤ 0,5 s | P* | Begegnungs-Probe: Berührung 0, kleinster Abstand ≥ Radius | 2 von 3: Probe gemessen, Preis in derselben Szene unbelegt |
| 2 | 10² im Gang | Spurbildung in Gegenströmen | P* | Gegenstrom im Korridor: Spuren in ≤ 30 s (Ordnungsparameter ≥ 0,7) | |
| 3 | 10³ | Fundamentaldiagramm v(ρ) | P* | Messfeld im Spiel: v(ρ) in ±15 % der Weidmann-Kurve von 0,5 bis 4 P/m² | |
| 4 | 10³–10⁴ am Engpass | Engpass-Fluss, Bogenbildung, Faster-is-slower | P* | Tür-Räumung: spezifischer Fluss im Literaturband (etwa 1,2–1,9 P/(m·s)); Bild der Bogenbildung | |
| 5 | 10⁴ | Stop-and-go-Wellen und Turbulenz bei sehr hoher Dichte | P* | Video-Paar gegen Aufnahmen eines dichten Massenstroms: Wellenperiode und Geschwindigkeit ±25 % | |
| 6 | 10⁵ | Gedränge als Gefahr: Druck, Stürze, nur dort, wo sie real entstehen | P* | Dichte-Karte eines Fests: Gedränge-Zellen (> 5 P/m² stehend) dort, wo die Topologie sie erzwingt; Gegenprobe breiterer Ausgang ⇒ 0 Zellen | |
| 7 | 10⁷ (Badefest am Fluss) | Kontinuum und Einzelner zugleich wahr | P* | 3–6 bei 10⁷ gleichzeitig mit L2.6; N = 20 zufällige Festplätze: Gedränge-Zellen an den erzwungenen Stellen ≥ 0,9 | |

### L4 Ströme: Pendeln, Tagesrhythmus, Ganglinie
Misst den Puls einer Stadt: wer wann von wo nach wo geht oder fährt und wie sich daraus Spitzenstunden, Bahnhöfe und volle Straßen ergeben.

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | Wege in einer Siedlung | Heim, Platz, Werk, Mahl, Abend, Besuch; Wiederkehr nach 1 h ±2 m | P* | Zeitraffer 24 h: Wege je Tag 4–10, Wiederkehr-Fehler max ≤ 2 m | 2 von 3: 5–8 Wege, 1,2 m gemessen; Preis in der Szene unbelegt, Takt der Bewohner 1,52–1,82 ms an der Stadt |
| 2 | 10³ Wege/h (Stadt) | Ganglinie mit Morgen- und Abendspitze emergent | P* | Stündliche Zählung an einem Platz: zwei Spitzen, Spitze/Tal ≥ 3 | |
| 3 | 10⁴ Wege/h | Wohnort–Arbeitsort-Matrix nach Gravitationsmodell | P* | Pendeldistanz-Verteilung gegen eine Zensus-Referenz (KS ≤ 0,15), N = 20 Saaten ≥ 0,8 | |
| 4 | 10⁵/Tag an einem Knoten | Bahnhof als Schleuse zu Fuß, im Zug und im Wagen (Kopplung Verkehr) | P* | Bahnsteig um 8 Uhr: Dichte 2–4 P/m², um 3 Uhr < 0,05 | |
| 5 | 10⁶/Tag | Netz von Knoten, Umstiegsströme | P* | Durchgänge eines großen Knotens je Tag ≥ 10⁶, Ganglinie gegen die Form einer realen Bahnhofsganglinie | |
| 6 | 10⁷/Tag (Megaregion) | Wochen-, Feiertags- und Saisonrhythmus | P* | Sonntag/Werktag und Ferien/Schulzeit: Verhältnisse im Band realer Zählungen | |
| 7 | 10⁸–10⁹/Tag (Planet, jede Epoche) | Fernreisen und Pilgerzüge über Kontinente, mit dem Verkehrsmittel des Jahres | P*, Zeitreise ≤ 5 s | Weltkarte der Flüsse aus dem Orbit gegen das Muster realer Netze derselben Epoche (Pilgerwege um 1300, Flugnetz um 2000) | |

### L5 Demografie und Lebenslauf der Menge
Misst, ob die Bevölkerung lebt: Geburt, Altern, Tod und Generationen, und ob ihre Pyramide der Epoche entspricht.

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | Leute je Haus gezählt, Ort wächst mit Wohlstand | Chronik: Jahre · leute · wohl | P* | Ort-Wachstum: Häuserzahl folgt Leuten × Wohl (Verdopplung ≈ 21 min bei wohl 1) | HEUTE (Häuser wachsen, Menschen werden nicht geboren) |
| 2 | ein Ort, alle Alter | Säuglinge, Kinder, Erwachsene, Alte sichtbar verschieden | P* | Platz-Bild: Altersanteile im Band der Epoche (z. B. Mittelalter ≥ 35 % Kinder) | darunter: der Leib kennt nur 18–80 Jahre, Kinder gibt es nicht |
| 3 | 10³ über 100 Jahre | Geburt, Tod (Gompertz), Haushalte erben Häuser | P*, Zeitraffer ohne Bruch | Sterbetafel des Spiels gegen eine Epochen-Referenz (Lebenserwartung ±3 Jahre) | |
| 4 | 10⁴ über Generationen | Familien als Baum, Ähnlichkeit vererbt | P* | Bildpaar Eltern/Kind: Gesichtsabstand innerhalb der Familie < zwischen Familien bei ≥ 0,9 der Proben | |
| 5 | 10⁶ über 1 000 Jahre | demografischer Übergang, Urbanisierung | P*, Zeitreise ≤ 5 s | Pyramiden von 1300, 1800 und 2000 gegen historische Referenzen (Form-Abstand ≤ Schwelle) | |
| 6 | 10⁹ über die Menschenzeit | Bevölkerungsverlauf von 10⁶ (Jungsteinzeit) bis 10¹⁰ | P*, Zeitreise ≤ 5 s | Weltbevölkerung je Jahrtausend gegen die historische Kurve (log-Fehler ≤ 0,3) | |
| 7 | fremde Völker und Planeten | andere Lebensspannen und Fortpflanzungsweisen aus demselben Gesetz | P* | N = 20 Saaten: Anteil stabiler, nicht explodierender und nicht aussterbender Populationen ≥ 0,8 | |

### L6 Gesundheit, Seuche, Medizin
Misst, ob Krankheit und Heilung aus den Kontakten und der Zeit der Menge entstehen. Der Erreger ist EIN Parametersatz (Übertragungsweg, R0, Letalität, Immunität, Mutation), keine Liste benannter Seuchen.

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | eine Person krank | sichtbar: Haltung, Gang, Husten, bleibt daheim | P* | Bildpaar gesund/krank derselben Person; Krank-Tag weicht vom Plan ab (bleibt im Haus) | darunter: kein Gesetz für Krankheit bei Menschen |
| 2 | 10² (Dorf-Ausbruch) | Ansteckung aus echten Kontakten der Wege | P* | Epidemiekurve im Dorf: Form S-I-R, R0 aus Kontakten im Band des Erreger-Reglers | |
| 3 | 10⁴ (Stadt) | Ausbreitung entlang der Pendlerwege, Quarantäne wirkt | P* | Gegenprobe: Markt geschlossen ⇒ Spitze ≥ 30 % niedriger | |
| 4 | 10⁶ (Region) | Seuche wandert über Handelswege (Kopplung Netze) | P* | Ankunftszeit je Stadt korreliert mit Netzabstand (r ≥ 0,7), nicht mit Luftlinie | |
| 5 | 10⁸ über Epochen | Erreger und Medizin als Gesetz der Epoche | P*, Zeitreise ≤ 5 s | N = 20 zufällige Erreger: Kurven im Band historischer Ausbrüche ≥ 0,8; Prüfstein Europa-ähnliche Saat 1347–1351: 30–50 % Verlust; Lebenserwartung 1800 → 2000 steigt ≥ 30 Jahre | |
| 6 | 10¹⁰ (Planet, Pandemie) | Welle über das Flugnetz, Mutation, Immunität | P* | Wellenzahl und Zeitabstand im Band realer Pandemien; jeder Kranke aus der Nähe trägt eine verfolgbare Infektionskette | |

### L7 Kollektiv in Bewegung: das EINE Antwort-Gesetz
Misst, ob ganze Mengen auf Ereignisse antworten, von der Flucht vor Gewalt bis zur Wanderung eines Volkes über Kontinente — aus EINEM Gesetz (Gefahr, Ziel und Ressource als Felder), geprüft an zufälligen Ereignissen statt an gebauten Szenarien. Hier liegt die Kopplung Vulkan → Küste → Stadt → Strom.

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | Umstehende einer Szene | Furcht weitet den Abstand, nach Gewalt fliehen sie | P* | Gewalt-Probe: Abstand nach der Tat > vorher | 2 von 3: 1,95 gegenüber 1,34 m gemessen, Preis unbelegt |
| 2 | 10² | Schreck breitet sich durch Sicht und Klang aus | P* | Schreck-Front 3–8 m/s, Fluchtrichtung weg von der Quelle ≥ 0,9 | |
| 3 | 10³–10⁴ (Demonstration) | Zug mit Ziel, Ruf, Kordon (Kopplung Macht) | P* | Demo-Zug: Kopf 0,5–1 m/s, Länge × Dichte = Teilnehmer ±10 %, Bild gegen Foto | |
| 4 | 10⁵ (Räumung einer Stadt) | Gefahr ⇒ Räumung über Straßen und Brücken | P* | N = 20 zufällige Gefahren (Ausbruch, Flut, Brand) an zufälligen Städten: Räumungszeit ±25 % einer Referenzsimulation und Stau an den Engstellen in ≥ 0,8 | |
| 5 | 10⁶ (Flucht über Land) | Lager, Grenzen, Wege, Sterblichkeit unterwegs | P* | Tagesstrecke 10–30 km zu Fuß; Lager-Dichte gegen Luftbild-Referenz | |
| 6 | 10⁷ über Jahrzehnte (Völkerwanderung) | Volk zieht, gründet Städte, Sprache und Bauweise wandern mit | P*, Zeitreise ≤ 5 s | Zeitraffer 100 Jahre: Siedlungen der Herkunfts-Kultur entlang der Route (Anteil ≥ 0,6); N = 20 Saaten ohne gesetzten Auslöser: Wanderungen entstehen aus Mangel oder Gefahr ≥ 0,8 | |
| 7 | 10⁸–10⁹ über Jahrtausende | Ausbreitung einer Art über einen Planeten | P*, Zeitreise ≤ 5 s | Besiedlungsfront je Jahrtausend gegen archäologische Daten (log-Fehler ≤ 0,3); N = 20 Saaten plausibel ≥ 0,8 | |

### L8 Gesicht der Menge: Kultur, Epoche, Stand (NEU)
Misst, ob eine Menge ihre Kultur, ihre Epoche und ihre Stände am Leib trägt — aus dem Samen des Ortes, nicht aus einer Kleiderkiste.

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | ein Platz | Kleidung und Gestalt folgen Epoche und Kultur der Siedlung | P* | Blind-Zuordnung: Bild des Platzes → Epoche ±1 Jahrhundert richtig in ≥ 0,7 von 20 Saaten | unbelegt |
| 2 | 10² | Stände und Rollen sichtbar (arm, reich, Handwerk, Wache) | P* | Rolle aus dem Bild erraten ≥ 0,6 bei 50 Zufallspersonen | |
| 3 | 10³ | Gebärde, Gang und Abstand je Kultur | P* | Abstandsverteilung Fremder gegen Proxemik-Daten je Kultur (Sorokowska 2017), Abstand der Mittel ≤ 20 % | |
| 4 | 10⁴–10⁶ | die Menge der Megastadt mischt Herkünfte nach ihrer Wanderungsgeschichte (Kopplung L7) | P* | Mischanteil der Herkünfte am Platz folgt den Wanderungen der Saat (r ≥ 0,7) | |
| 5 | jede Epoche × jede Kultur | N = 100 zufällige (Ort, Jahr) | P*, Zeitreise ≤ 5 s | Blind-Zuordnung ≥ 0,7; keine zwei Saaten mit verwechselbarer Menge (Paar-Test) | |
| 6 | Völker fremder Planeten | lesbar als Kultur, nicht als Kostüm | P* | 10 Völker einer Saat: Person → Volk aus dem Bild zugeordnet ≥ 0,8 | |

### L9 Tier-Massen: Schwarm, Herde, Zug (NEU)
Misst, ob dasselbe Gesetz der Masse jede Art trägt. Die Arten selbst gehören in das Blatt des Lebens; hier zählt die Masse.

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | 10¹–10² (Herde) | Verband zieht zusammen, flieht zusammen | P* | Flucht-Probe: Herde bleibt Verband (Zusammenhalt ≥ 0,9), Fluchtrichtung weg vom Störer | Verband laut alter Karte vorhanden, Richter unbelegt |
| 2 | 10³ (Fisch- oder Vogelschwarm) | Ausweichwelle vor dem Räuber | P* | Wellen-Ausbreitung im Band der Feldmessungen (±30 %), Video-Paar gegen Aufnahme | |
| 3 | 10⁴–10⁵ (Murmuration) | skalenfreie Korrelation | P* | Korrelationslänge ÷ Schwarmgröße konstant über N = 10³ … 10⁵ (±20 %) (Cavagna 2010) | |
| 4 | 10⁶ (Herdenzug) | saisonaler Zug folgt Regen und Weide (Kopplung Wetter) | P*, Zeitraffer | Herdendichte gegen Weidefeld über ein Jahr r ≥ 0,7 | |
| 5 | 10⁹ (Heuschrecken, Krill) | Schwarm entsteht erst über einer Dichte-Schwelle und frisst Felder (Kopplung Ernte → Hunger → L7) | P* | N = 20 Saaten: Schwärme nur über der Schwelle ≥ 0,8; Ernteverlust sichtbar im Feld | |
| 6 | Planet, alle Arten | Zugwege der Arten über Kontinente | P* | Zugwege aus dem Orbit gegen reale Migrationskarten (Muster-Korrelation ≥ 0,7) | |

## Stand heute

- **Bevölkerung:** Das Budget der Bewohner ist der Plan Σ leute, nie ein Tier-Deckel (`stamm/siedlung-bewohner.js:224`); je Haus höchstens 12 Leute (`fachwerk-core.js:8163`, `LEUTE_GESETZ.max`). Gemessen sind 81/81 Häuser mit Bewohnern und die Test-Stadt mit 35 Häusern und 118 Bewohnern (14.11.). Jenseits nearM × fernFaktor gehen die Leiber, geboren werden 2 je Takt (`siedlung-bewohner.js:1263`, `:3491–3495`: `geburtenJeTakt 2`, `fernFaktor 1,25`, `nahM 8`, `nahLeiber 4`). Ferne Bewohner existieren als Plan, nicht als Bild.
- **Im Bild:** 18 Menschen am Dorfplatz um 8 Uhr, davon 0 gehend, bei 26,9 fps Radeon, also ≈ 37 ms und damit über P* (MEISTERKARTE.md:451). Voll lebendig (Gang, Atem, Stufen) sind höchstens 4 Leiber im 8-m-Kreis (`siedlung-bewohner.js:1551–1554`). Die 50-Saaten-Vielfalt kostet 132 200 Dreiecke und 0,072 ms je 50 (MEISTERKARTE.md:454). Die Stadt mit ≥ 200 Bewohnern und ≥ 40 nah animiert ist nicht gehalten (MEISTERKARTE.md:458, `_tickBewohner` 1,52–1,82 ms).
- **Massen-Physik:** Es gibt ein Raster der Leiber zum Ausweichen (`siedlung-bewohner.js:1559`) und ein Furcht-Gesetz, das den Raum weitet (`:1817–1823`). Kein Fundamentaldiagramm, keine Dichte, kein Engpass, kein Gedränge.
- **Ströme:** Der Tag ist eine Funktion der Uhr mit Ständen heim, platz, werk, mahl, abend und besuch (`siedlung-bewohner.js:3485`), 5–8 Wege je Tag, Wiederkehr max 1,2 m (MEISTERKARTE.md:452). Kein Pendeln zwischen Orten, keine Ganglinie.
- **Demografie:** Alter ist ein Regler des Leibs mit dem Gesetz „18–80 Jahre“ (`koerper-core.js:120–126`): Kinder und Säuglinge gibt es als Leib nicht. Der Ort wächst aus leute × wohl in der Chronik (`fachwerk-core.js:3581–3598`, `:3731–3735`). Geburt und Tod von Menschen gibt es nicht, Tod existiert nur für Tiere (`stamm/kreatur-leben.js:962`).
- **Gesundheit und Seuche:** Nichts. Der Grep nach Seuche, Infekt, krank, Epidem, Sterbe, Gompertz und Lebenserwartung über die Kerne und `stamm/` findet nur Pflanzen-Astung, Tier-Tod und „Infektion“ im Sinne der Netz-Sicherheit (`stamm/netz-identitaet.js:178`), nichts für Menschen.
- **Kollektiv:** Umstehende fliehen nach Gewalt, der Abstand steigt von 1,335 auf 1,952 m (MEISTERKARTE.md:455). Keine Demonstration, keine Räumung, keine Wanderung.
- **Kultur der Menge und Tier-Massen:** keine Messung. Gestalten je Siedlung gibt es (`_bewohnerGestalten`, `siedlung-bewohner.js:222`), ein Richter, ob sie Epoche oder Kultur lesen lassen, fehlt.

## Abhängigkeiten

- **Der Mensch: Leib, Gesicht, Kleidung:** Nahe Gesichter, Kinder-Leib, Vielfalt und Altersgestalt tragen L2, L5.2, L5.4 und L8.
- **Der Mensch: Geist, Alltag, Lebenslauf:** Dort lebt der EINE Lebenslauf. Dieses Blatt misst dessen Aggregat (Pyramide, Ganglinie, Epidemiekurve) und den Übergang zwischen nah und fern.
- **Siedlung und Stadt:** Ohne 10⁵–10⁸ Wohn- und Arbeitsorte gibt es keine L1 ab Sprosse 4.
- **Netze, Verkehr und Stadtstoffwechsel:** Bahnhof, Wagen und Handelswege tragen L4.4–L4.7, L6.4 und die Versorgung in L1.7.
- **Leben und Arten:** Die Arten von L9; hier nur deren Masse.
- **Sport, Spiel und Bewegungskönnen:** Das Stadion als Ort gehört dorthin, die Zuschauermenge und die La-Ola hierher.
- **Macht, Recht und Konflikt:** Kordon, Krieg und Grenze lösen L7 aus.
- **Kopplung, Kaskade und Katastrophe**, **Planet und Geologie**, **Wetter und Klima:** Der Vulkan treibt die Räumung in L7.4, der Regen den Herdenzug in L9.4.
- **Menschenzeit: Epochen und Geschichte:** Epochen-Referenzen für L5.5, L6.5, L8.
- **Maßstab-Kontinuum** sowie **Licht, Bild und Horizont:** Die Menge als Dichte-Textur aus der Ferne und der Flug vom Orbit zum Gesicht (L2.6, L2.7).
- **Der Same: Architektur der Entfaltung:** Die Person als Funktion p(samen, i, t) ohne Speicher setzt eine adressierbare Weltfunktion voraus.
- **Ankunft, Geräte und Zugang:** P* gilt in jeder Sprosse.

## Was die alte Karte hier misst

Bereich 9 „Menschen und Bewohner“ (MEISTERKARTE.md:438–462), heute 8/10:

| Kriterium der alten Karte | Wird zu Sprosse |
|---|---|
| K1 Besiedlung und Skala, Stufe 1: Quote 1,0, ≥ 10 Menschen im Bild | L1.1, L2.1 (unter P* beide nur 2 bzw. 1 von 3 Achsen) |
| K1 Stufe 2: Stadt ≥ 200 mit ≥ 40 nah animiert (offen) | L1.2, L2.2 |
| K2 Tagesablauf, 4–10 Wege, Wiederkehr ±2 m | L4.1 (und L1-Richter „Plan-Ort ±2 m“) |
| K3 Wege und Raum, keine Durchdringung, Ausweichen | L3.1 |
| K4 Vielfalt und Kosten von 50 Bewohnern | L2.2 (Vielfalt); die Kosten gehen in P* auf |
| K5 Begegnung, Gedächtnis, Furcht der Umstehenden | L3.1, L7.1 |
| Hebel H1 „Die Stadt lebt“ | L1.2 |
| (Leben) „Tiere ziehen als Verband“ | L9.1 |

Was die alte Karte nicht misst: Demografie, Gesundheit, Massen-Physik, Pendelströme, Kollektivbewegung, Kultur der Menge und Tier-Massen — sieben der neun Leitern.

## Zweifel

- **L1.9 (10¹⁰ Personen, jede konsistent, in jedem Jahr):** setzt voraus, dass eine Person ohne Speicher rein aus p(samen, i, t) existiert. Ereignisse, die sie verändern (Gespräch, Gewalt, Ansteckung), brauchen vermutlich einen Delta-Speicher nur für Berührte; seine Größe ist offen.
- **Toleranzen:** Die Referenzen (Weidmann, Still, Epicast, Sorokowska, Cavagna, historische Sterbetafeln) existieren, die Toleranzen (±15 %, ±25 %, KS ≤ 0,1, Anteil ≥ 0,8) sind gesetzt, nicht hergeleitet.
- **L6 und L7 im Spiel:** Ob eine Pandemie oder Völkerwanderung fahrbar ist, ohne Stunden zu warten, ist offen. Ansteckung ist pfadabhängig und keine reine Funktion von t; ein Zeitraffer, der mit der Funktion der Uhr verträglich ist, ist für Kontaktketten nicht bewiesen.
- **Blind-Zuordnung (L8):** Wer urteilt — ein Bild-Klassifikator oder ein Mensch? Ein Klassifikator kann auf Stereotype trainiert sein; der Richter misst dann Klischee statt Wahrheit. Offen.
- **L1.7 Versorgung:** ob „erreichbare Versorgung“ hier oder im Blatt Stadtstoffwechsel gemessen wird; hier steht nur der Anteil der Menschen, die sie haben.
- **Recherche dünn:** Hitman-Zahlen sind widersprüchlich, Unity-Zahlen stammen aus Interviews; Weidmann, La-Ola (Farkas 2002), Engpass-Band, Sorokowska und Cavagna stammen aus Kenntnis, nicht neu nachgeschlagen.

## Gegenlese — was sich änderte und was strittig bleibt

- **Preis vereinheitlicht (P\*):** jede Preis-Zelle verlangte bisher etwas anderes („≤ 1 ms CPU“, „≤ 150k Dreiecke“, „0 im Takt“, „Dorf-ABAB nicht schlechter“) — das waren Wege, keine Ergebnisse. Jetzt gilt in jeder Sprosse Frame + Ankunft + null Download in der Szene des Richters.
- **Stand ehrlich nach R3:** Die alte Fassung setzte L1.1 und L2.1 auf HEUTE, obwohl die Radeon dort 26,9 fps ≈ 37 ms zeigt und 0 Menschen gehen. Mit drei Achsen ist keine einzige Sprosse dieses Blatts heute ganz gehalten; L1.1, L3.1, L4.1 und L7.1 stehen bei 2 von 3, L2.1 bei 1 von 3, L5.1 bei Häusern statt Menschen.
- **Code berichtigt:** Die Parameter von `siedlung-bewohner.js:3491–3495` und das Fehlen jeder Seuche stimmen. Neu belegt: der Leib kennt nur 18–80 Jahre (keine Kinder, `koerper-core.js:126`, das alte Zitat `:1437` zeigte das nicht), nur 4 Leiber leben voll (`nahLeiber`), je Haus höchstens 12 Leute.
- **Gehoben:** L1 bekommt die Stadt mit 10⁸ in EINER Bebauung (die Gegenwart kennt keine; „Tokio ein Witz“) und als Spitze „jedes Jahr × viele Welten“; L3 endet bei 10⁷ (Kumbh Mela statt Hajj-Maß); L4.7 misst die Netze jeder Epoche.
- **Fleiß → Fähigkeit:** L6 misst zufällige Erreger statt Pest/Pocken/Cholera, L7 zufällige Gefahren und ungeskriptete Wanderungen statt gebauter Szenarien, L2.5 verlangt verschiedene Startorte der Welle.
- **Doppelt:** Der alte Richter von L2.7 (herangezoomte Personen am Plan-Ort) war L1.4; L2.7 misst jetzt das Bild auf jedem Abstand. Strittig bleibt die Naht L4.4/L3.3 (Bahnsteig-Dichte vs. Fundamentaldiagramm) und L5.6/L7.7 (wie viele vs. wo).
- **Lücken gefüllt:** L8 (Kultur, Epoche, Stand der Menge) und L9 (Tier-Massen). Strittig: ob L9 in das Blatt des Lebens gehört und ob ein Blind-Zuordnungs-Richter in L8 Wahrheit oder Klischee misst.
