# Netze, Verkehr und Stadtstoffwechsel

## Die Vision hier

Eine Stadt, gegen die Tokio ein Witz ist, ist zuerst ein Kreislauf, erst danach ein Bild. Tokio heute: ~37 Mio. Menschen im Großraum, Zig-Millionen Wege am Tag, Shinjuku allein 2,7–3,6 Mio. Fahrgäste. Die Vision liegt eine bis zwei Größenordnungen darüber: 10⁸ Menschen in EINER Stadt, 10⁹ Wege am Tag, ein Netz in drei Dimensionen — Gassen, Achsen, Kreuze auf fünf Ebenen, Röhren zehn Ebenen tief, Brücken zwischen Türmen, Luftspuren über den Dächern —, und darin fließen Wasser, Abwasser, Strom, Müll, Güter und Daten als geschlossene Ströme. Jeder Wagen, jeder Zug, jeder Kran trägt eine Person mit einem Anlass, nie einen Statisten im Kreis. Man schneidet die Straße auf und sieht die Leitungen, wechselt die Epoche und sieht dasselbe Netz vom Trampelpfad über die Römerstraße bis zur Magnetbahn wachsen, landet auf einem fremden Planeten und erlebt ein Netz, das fremde Physik und fremde Wesen geformt haben. Ein Ausfall folgt dem Gesetz: das Kraftwerk fällt, Viertel werden in der Reihenfolge des Netzes dunkel, die Ampeln fallen, der Verkehr staut sich nach dem Fluss, nicht nach dem Drehbuch. Und der Spieler findet sich darin zurecht, weil die Stadt ihre eigenen Zeichen, Namen und Pläne trägt. Alles aus EINEM Samen, im Browser, ohne Download.

## Das Beste der Gegenwart

- **Cities: Skylines II** (Colossal Order 2023): Wasser, Abwasser, Strom, Müll, Bürger als Agenten ohne feste Grenze (der Vorgänger: 65 536) — Grenze: Draufsicht, Städte in Zehn- bis wenigen Hunderttausend, auf Spitzen-PCs zäh, Netze vom Spieler gezogen statt gewachsen, Leitungen unsichtbar ([gamesradar](https://www.gamesradar.com/cities-skylines-2-removes-the-agent-limit-finally-letting-city-builder-fans-utterly-melt-their-machines), [Paradox](https://www.paradoxinteractive.com/games/cities-skylines-ii/features/city-services-districts-policies)).
- **GTA V / Cyberpunk 2077**: Verkehr als Kulisse in einer Blase um den Spieler, Wagen ohne Ziel und Lebenslauf; Night City zeigt laut Spielerberichten oft „1 oder 2 Wagen" trotz hoher Dichte ([Steam](https://steamcommunity.com/app/1091500/discussions/0/3809530424065790042), [Nexus](https://www.nexusmods.com/cyberpunk2077/mods/3955)) — Grenze: kein Netz-Gesetz, kein Stoffwechsel, keine echte Vertikale im Verkehr, Gigabytes Daten.
- **OpenTTD / Transport Fever 2**: Straße, Schiene, Wasser, Luft über Epochen — Grenze: abstrakte Fahrgäste ohne Leib, große Netze brechen die Leistung ([TF2](https://nodal.gg/game/transport-fever-2-1066780), [OpenTTD](https://nodal.gg/game/openttd-1536610)).
- **MATSim** (Wissenschaft): Millionen Agenten mit Tagesplan auf echten Netzen, die Schweiz mit ~6 Mio. — Grenze: Stunden bis Tage je Iteration, kein Bild ([matsim.org](https://matsim.org/about-matsim), [HERMES](https://matsim.org/news/2020/introducing-hermes/)).
- **Stadtnetz-Statistik** (Boeing, OSMnx): Orientierungs-Entropie, Kreuzungsgrad, Block-Größe für Tausende echter Städte — das Referenzband für L1, frei verfügbar.
- **Die Wirklichkeit**: Shinjuku 2,7 Mio./Tag (Guinness 2022), >200 Ausgänge; Straßennetz der Erde ~6×10⁷ km; ~1,5×10⁹ Kraftfahrzeuge; Stoffwechsel der 27 Megastädte (Kennedy et al., PNAS 2015: Wasser je Kopf schwankt Faktor 23, Strom folgt Geschossfläche, Dichte senkt den Pro-Kopf-Verbrauch, [PubMed](https://www.pubmed.gov/25918371/)).

Keiner verbindet Leib-genaue Bewohner, Netz-Gesetz, Stoffwechsel, Vertikale und Echtzeit-Bild im Browser. Das ist die Lücke — und sie liegt bei jedem oberhalb der Tokio-Sprosse leer.

## Der Same

**Fluss formt Röhre.** Ein Netz ist die Spur von Bedarf zwischen Quellen und Senken unter den Kosten des Geländes: wo viel fließt, wird die Röhre breiter und wechselt den Modus (Pfad → Gasse → Straße → Achse → Tram → Bahn → Röhre → Luftspur), wo nichts fließt, stirbt sie. Dasselbe Gesetz trägt Wege, Rohre, Kabel, Kanäle, Güter und Daten — nur Stoff, Kostenfeld und Kapazitätsstufe wechseln; die Vertikale ist nur eine weitere Kostenachse. Die Biologie zeigt, dass es reicht: *Physarum* baute in 26 Stunden ein Netz mit Kosten, Effizienz und Fehlertoleranz des Tokioter Bahnnetzes (Tero et al., Science 2010). Die Laufzeit-Hälfte: wer fährt, reserviert Raum-Zeit (Dresner & Stone 2008, REFERENZ-ATLAS § 5). Der Same ist EIN Paar: Bedarfsfeld (aus Siedlung und Tagesplänen) × Fluss-Adaption auf dem Gelände — das Netz ist dessen Gleichgewicht, der Verkehr dessen Momentaufnahme, der Stoffwechsel derselbe Fluss mit anderem Stoff. Die Leitern messen, was daraus im Spiel erscheint — nie, ob Physarum, IDM oder Reservierung im Code steht.

## Die Leitern

**Preis gilt in jeder Sprosse ZUSAMMEN** (R3): Bild p95 ≤ 33 ms und Ankunft ≤ 5 s kalt auf dem Standardgerät (Radeon 890M / GTX 1060), null Download, gemessen im teuersten Moment der Sprosse (die Preis-Spalte nennt ihn). Sim-Teilbudgets sind kein Preis, nur Werkzeug. „Saaten" = N zufällige Samen, Anteil plausibel. „Echtheits-Probe" = Bildpaar oder Videopaar Spiel ↔ Referenz gleicher Lage-Art, beurteilt von einem maschinellen Unterscheider gegen einen Referenz-Satz UND einem blinden Panel ohne den Schöpfer; bestanden heißt: Treffer des Unterscheiders ≤ 60 % (nicht trennbar).

**Heute hält keine Sprosse ihren Preis:** Ankunft kalt 16,6 s (GTX) / ~11 s (Radeon) gegen 5 s. Was Umfang und Tiefe trägt, steht als „halb (Preis ROT)".

### L1 · Das Netz als Gestalt — misst, ob die Netze, die der Spieler sieht und befährt, in Größe, Hierarchie und Form echten Städten gleichen und ob EIN Gesetz jede Dichte, jede Kultur und jede Welt trägt.

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | 1 Ort, ~10 km Weg, 4 Klassen | Trasse folgt Hang, Brücke über Wasser | 33 ms beim Fahren · 5 s | Gassen-Gefälle p95 ≤ 9,5 % über 8 Saaten UND der Spieler fährt jede Klasse von Ende zu Ende ohne Wand, Sturz oder Klemmen | halb: Gefälle headless gebucht (siedlung.K3), Befahrbarkeit nie im Spiel gefahren, Preis ROT |
| 2 | Stadt 10³ Häuser, ~50 km | Kreuzungsgrad, Sackgassen-Anteil, Block-Größe, Orientierungs-Entropie im Band echter Städte derselben Kultur | 33 ms am dichtesten Platz · 5 s | 3 von 4 Kennzahlen im OSM-Referenzband ±20 % in ≥ 80 % von 32 Saaten, gemessen am befahrbaren Netz | |
| 3 | Stadt 10⁴ Häuser, ~500 km, Achsen + Ring | die breiten Straßen tragen den Verkehr: Hierarchie, die man fährt | 33 ms im Fernblick über die Stadt | Korrelation Straßenbreite ↔ gezählte Fahrten ≥ 0,7; Luftbild-Echtheits-Probe gegen Stadt gleicher Epoche bestanden | |
| 4 | Metropole 10⁵ Häuser, ~5 000 km, Schnellstraßen, Kreuze auf 2+ Ebenen | Kultur prägt die Form (Raster, gewachsen, radial) erkennbar | Fahrt 130 km/h quer: p95 33 ms, kein Hänger > 50 ms | Kultur-Probe: Unterscheider ordnet Netzbilder von 64 Saaten der Kultur ihres Samens zu ≥ 80 %; 10 km Fahrt 0 Brüche, 0 Pop über 100 m | |
| 5 | Tokio-Maß: 10⁶ Häuser, ~3×10⁴ km, 5 Ebenen Hochstraße | jede Rampe, jede Kreuzungsform aus Fluss × Raum | Flug über die ganze Stadt 33 ms · Landung an jedem Ort ≤ 5 s | Luftbild-Echtheits-Probe gegen Tokio/Shanghai bestanden; Umweg-Faktor 1000 zufälliger Paare im Tokio-Band | |
| 6 | Jenseits von Tokio: 10⁷ Häuser, 10⁸ Menschen, ~5×10⁵ km Netz in drei Dimensionen (Ebenen, Brücken zwischen Türmen, Luftspuren) | die Stadt bleibt erreichbar bei 10-facher Tokio-Last | wie 5, bei 10× Fläche und Last | mittlere Tür-zu-Tür-Reisezeit 1000 zufälliger Paare ≤ Tokio-Referenz bei gleicher Distanz; Umweg-Faktor ≤ 1,4 | |
| 7 | Planeten: 10⁸–10⁹ km Netz, jede Kultur, fremde Welten | Netzform folgt der Physik und den Wesen ihrer Welt | jeder Ort ≤ 5 s erreichbar, 0 Download | 3 Welten × 32 Saaten: erdähnliche Fernnetze (Umweg, Erreichbarkeit) im Band echter Länder; fremde weichen messbar ab und ihre Kennzahlen sind aus dem Gesetz der Welt ±20 % vorhergesagt | |

### L2 · Verkehr mit Anlass — misst, wie viele Menschen mit eigenem Anlass gleichzeitig in allen Moden unterwegs sind und ob der Strom sich wie echter Verkehr verhält.

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | 10¹ Wagen, je ein Bewohner am Steuer | 0 Berührungen, 0 Stillstand, Fahrten kommen an | 33 ms am Marktplatz · 5 s | pflicht.C: nH 300, Tag + Nacht, 10 min: Berührungen 0, Gridlock 0, Fahrten am Ziel 100 % — UND Wagen im Bild am Marktplatz (Bildpaar) | unter der Leiter: gebaut, 0/3 gemessen, im Bild kein Wagen, Ziel ist eine gewürfelte Wende |
| 2 | 10² Teilnehmer: Wagen, Räder, Fußgänger an Ampel und Übergang | Folgeabstand und Vorfahrt wie echter Verkehr | 33 ms am vollen Knoten | Zeitlücken an der Hauptstraße Median 1–3 s (Band realer Messungen); Wartezeit an der Kreuzung im Band; 0 Konflikte | |
| 3 | 10³ sichtbar, 10⁴ in der Stadt | Fluss–Dichte mit Kipp-Punkt, Stau entsteht von selbst | 33 ms mit 10³ Wagen im Bild | Fundamentaldiagramm ±25 % gegen Messdaten; Stauwelle läuft rückwärts mit 15–20 km/h | |
| 4 | 10⁵ Wege am Tag, jeder mit Anlass (Pendeln, Liefern, Schule, Taxi) | Spitzenstunde aus Tagesplänen | 33 ms zur Spitzenstunde | Tagesganglinie (2 Spitzen) Korrelation ≥ 0,8 gegen Zählstelle; der Spieler folgt 20 zufälligen Wagen: der Fahrer steigt an einem Ort aus, dessen Zweck zur Uhrzeit passt, ≥ 90 % | |
| 5 | Tokio-Maß: 10⁷–10⁸ Wege/Tag, alle Moden (Fuß, Rad, Wagen, Bus, Lkw, Boot) | Moduswahl aus Kosten, Umleitung, Unfall, Notfallwagen | Bildzeit mit 10⁶ Fahrern ≤ Bildzeit mit 10⁴ + 10 % | Spieler sperrt eine Achse: Reisezeiten ±30 % gegen Referenzlauf desselben Netzes; Modal Split im Band realer Städte gleicher Dichte | |
| 6 | Jenseits von Tokio: 10⁹ Wege/Tag in einer Stadt, Verkehr in drei Dimensionen (Luftspuren, Drohnen, Hochbahn) | Verkehrskultur aus Gesetz (Kairo ≠ Zürich ≠ Tokio) | 33 ms im dichtesten Knoten | Video-Echtheits-Probe Kreuzung gegen echte Stadt gleicher Kultur bestanden; Kultur-Unterscheider ≥ 80 % richtig | |
| 7 | Planeten, jede Epoche: 10¹⁰ Reisende, fremde Wesen mit fremden Fahrzeugen | jede Person, die der Spieler trifft, ist mit Anlass unterwegs | 33 ms überall, 0 Download | 5 zufällige Orte × 3 Welten × 3 Epochen: 100 verfolgte Reisende erreichen einen Ort, der ihren Anlass erklärt, ≥ 95 %; Verkehrsdichte folgt Siedlungsdichte im Band | |

### L3 · Massenverkehr und die dritte Dimension — misst, ob Bahnen, Bahnhöfe und die Ebenen unter UND über der Stadt aus dem Fluss entstehen und vom Spieler betreten und benutzt werden.

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | 1 Linie (Bus/Tram), 2 Halte | Linie liegt, wo Bedarf ist | 33 ms im Fahrzeug | Spieler steigt ein und fährt mit; ≥ 10 Bewohner je Stunde mit eigenem Ziel | unter der Leiter |
| 2 | eine Stadt wählt ihre Moden selbst (Bus → Tram → Bahn) | Fahrwerk und Gleis wie echt | 33 ms im fahrenden Zug | 32 Saaten: Modus je Korridor passt zur Last (Bus < 2 000/h, Bahn > 10 000/h) ≥ 80 %; Querbeschleunigung im Bogen ≤ 1 m/s² | |
| 3 | 1 Tiefen-Ebene + 1 Hochebene, betretbar, 10³ Fahrgäste/Tag | Treppe, Rolltreppe, Bahnsteig, Tunnel, Hochbahn | Ebenenwechsel ohne Hänger > 50 ms | Straße → Bahnsteig → Zug → Ziel: 0 Brüche, p95 33 ms durchgehend | |
| 4 | 10 Linien, Umsteigeknoten, 10⁵/Tag | Netz misst sich an realen Metros | 33 ms im vollen Knoten | Kosten, Effizienz, Fehlertoleranz (Maße nach Tero 2010) im Band realer Metros, ≥ 80 % von 32 Saaten | |
| 5 | Shinjuku-Maß: 10⁶/Tag, 5+ Tiefen-Ebenen, Türme als Netz (Aufzüge, Brücken zwischen Türmen) | Gedränge wie echt: Stau an Treppen, Dichte am Bahnsteig | 33 ms mit 10³ Leibern im Bild | Durchsatz ≥ 10⁶/Tag; Bahnsteig-Dichte zur Spitze in Fruin-Stufe D–E; Bild-Echtheits-Probe gegen Shinjuku bestanden | |
| 6 | Jenseits von Tokio: 10⁸ Fahrgäste/Tag, 10+ Ebenen über und unter dem Boden, Fernbahn ≥ 300 km/h | jede Ebene belebt und erreichbar — eine Stadt, nicht gestapelte Kulissen | Fahrt 300 km/h: 33 ms, kein Ladebild | Fernzug zwischen 2 Städten 0 Ladebilder, Fahrzeit ±20 %; 1000 zufällige Punkte aller Ebenen: ≥ 95 % zu Fuß + Bahn erreichbar und mit Bewohnern | |
| 7 | Planeten, jede Epoche, fremde Netze (Röhren, Seilnetze, Orbitallift) | Technik aus Epoche × Physik der Welt | jeder Bahnhof ≤ 5 s | 5 Bahnhöfe × 3 Saaten × 3 Epochen: begehbar, belebt, Echtheits-Probe gegen Epochen-Fotos bestanden | |

### L4 · Stadtstoffwechsel — misst, ob Wasser, Abwasser, Energie, Müll und Daten als geschlossene Flüsse EINES Gesetzes existieren, die der Spieler sieht und deren Ausfall die Welt beobachtbar ändert.

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | 1 Ort: Quelle → Häuser, Licht aus 1 Netz | Trennung wirkt | 33 ms | Spieler trennt eine Leitung: abhängige Fenster/Laternen dunkel binnen 1 s, der Rest brennt | unter der Leiter |
| 2 | 1 Stadt: Wasser, Strom, Abwasser, Müll aus demselben Fluss-Gesetz | Bedarf je Kopf im Band realer Städte (Kennedy 2015) | 33 ms im Viertel | Bilanz Zufluss = Verbrauch + Verlust ±5 %, l/Kopf/Tag im Band; Quelle gedrosselt: Brunnen und Hähne versiegen in der Reihenfolge des Netzes, sichtbar | |
| 3 | Leitungen sichtbar und aufschneidbar: Masten, Schächte, Kläranlage, Deponie | Abwasser fließt bergab, Leitungen folgen Straßen | 33 ms im Schnitt | Schnitt durch die Straße: Rohre in plausibler Tiefe; Kanal-Gefälle ≥ Norm 100 % | |
| 4 | Metropole 10⁵ Häuser, Werke, Müllabfuhr als Fahrer | Ausfall kaskadiert (Strom → Pumpe → Wasser → Ampel → Stau) | 33 ms während des Ausfalls | Kraftwerk-Ausfall: Dunkel-Reihenfolge folgt der Topologie, Ampeln fallen, gemessene Reisezeit steigt | |
| 5 | Tokio-Maß 10⁶ Häuser, Daten- und Funknetz | Nachtbild aus Verbrauch: jedes Fenster ein Verbraucher | Nachtflug 33 ms | Nachtluftbild gegen Satelliten-Nachtfoto (Black Marble): Helligkeits-Histogramm ±20 % | |
| 6 | Jenseits von Tokio + Kontinent: Hochspannung, Pipelines, Kabel zwischen Städten | Pro-Kopf-Verbrauch sinkt mit Dichte wie real; Energieträger aus Geologie und Epoche | 33 ms im Fernbild | Steigung Verbrauch ↔ Dichte über 32 Saaten ±30 % der Kennedy-Kurve; Fernknoten-Ausfall: betroffene Städte aus dem Netz vorhergesagt, 100 % Treffer | |
| 7 | Planeten: Stoffwechsel jeder Siedlung jeder Epoche, fremde Biologien mit fremdem Stoff | die Stadt als Organismus: Wachstum folgt der Ressource | 33 ms | 32 Saaten × 3 Welten: Städte ohne Quelle ihres Lebensstoffs wachsen nicht (0 %), Stoffbilanz geschlossen in 100 % | |

### L5 · Knoten und Ketten — misst, ob Häfen, Flughäfen, Lager und Ketten ihren Ort aus Geographie × Fluss selbst wählen und Güter vom Feld bis ins Regal fließen, die der Spieler erlebt.

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | 1 Ware, 1 Weg: Feld → Markt mit Fahrer | Marktstand leert sich ohne Lieferung | 33 ms | Lieferung unterbrochen: Stand leer binnen Tagesfrist; zurück: gefüllt | unter der Leiter |
| 2 | 10 Waren, Lager, Lieferwagen in der Stadt | Lieferwege aus Bedarf | 33 ms | 100 % der Läden beliefert; Lieferfahrten 10–20 % des Verkehrs (reales Band) | |
| 3 | jeder Knoten-Typ (Hafen, Flughafen, Rangierbahnhof) wählt seinen Ort selbst | Hafen an tiefem, geschütztem Wasser; Bahn nach Hauptwind | 33 ms im Knoten | 32 Saaten: Hafenlage plausibel 100 %, Bahn-Achse ±15° zum Hauptwind 100 %; Bild-Echtheits-Probe Knoten bestanden | |
| 4 | Ketten über Städte, Containerhafen 10⁶ TEU/Jahr | ein Engpass wirkt fern | 33 ms | Hafen-Sperre: Regale ferner Städte leeren sich in zeitlich plausibler Reihenfolge der Kette | |
| 5 | Tokio-Maß und darüber: 10⁷–10⁸ Menschen täglich versorgt | die Stadt hungert sichtbar ohne Kette | 33 ms im Gedränge der Knappheit | Kette 3 Tage gesperrt: Lieferverkehr, Regale und das Verhalten der Bewohner ändern sich in der Reihenfolge ihrer Reserven | |
| 6 | Planet: Welthandel 10⁸ TEU/Jahr, Luftfracht, Pipelines | Handelswege aus Geographie und Epoche | 33 ms | Haupt-Seewege der Saat liegen auf den kürzesten Meerespassagen ±10 % | |
| 7 | Sonnensystem: Fracht zwischen Planeten, Raumhäfen | Orbitalmechanik bestimmt die Fenster | 33 ms · 5 s am Raumhafen | Startfenster stimmen mit Hohmann-Rechnung ±5 % | |

### L6 · Kopplung Gelände ↔ Netz ↔ Stadt ↔ Zeit — misst, ob Netze aus Gelände, Gewässer und Geschichte wachsen, die Stadt zurückformen und auf Änderung reagieren (Vulkan formt Küste formt Stadt formt Verkehr).

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | Tunnel, Damm, Pass, Serpentine | Abwägung Tunnel ↔ Umweg ↔ Brücke wie real | 33 ms im Tunnel | Spieler quert ein Gebirge: Tunnel nur, wo der Umweg > Faktor 3; Bild-Echtheits-Probe Pass bestanden | |
| 2 | Stadtlage aus Netzknoten (Furt, Pass, Mündung, Hafen) | Städte entstehen an den Kreuzungen der Fernwege | Ankunft 5 s | ≥ 70 % der großen Städte von 32 Saaten an Furt/Mündung/Pass/Hafen (reales Band) | |
| 3 | das Netz formt die Stadt zurück | Dichte und Höhe steigen um Halte und Knoten wie real | 33 ms im Knoten | Dichte-Gefälle um Bahnhöfe (Häuser/ha über Distanz) im Band realer Städte, ≥ 80 % Saaten | |
| 4 | das Netz wächst über Epochen am selben Ort | Pfad → Römerstraße → Chaussee → Autobahn auf derselben Achse | Zeitwechsel ≤ 5 s | Zeitreise 5 Epochen: Achsen-Persistenz ≥ 60 % (wie reale Altstädte); Echtheits-Probe gegen historische Karten bestanden | |
| 5 | Ereignis schneidet Netz: Flut, Beben, Lava | Umleitung, Reparatur oder Aufgabe nach Gesetz | 33 ms während des Ereignisses | Lavastrom über die Trasse: Verkehr leitet binnen 1 min um; Wiederaufbau oder Aufgabe aus Kosten nachvollziehbar | |
| 6 | Klima verschiebt Küsten über Jahrhunderte, Häfen wandern | Jahrhunderte als Zeitraffer | 33 ms im Zeitraffer | Meeresspiegel +X m: Häfen verlegt, alte versunken sichtbar, 100 % der Saaten konsistent | |
| 7 | die ganze Geschichte eines Planeten und fremder Welten: Netze von der ersten Siedlung bis heute, unter fremder Schwerkraft und Geologie | Netzgestalt jeder Epoche und Welt folgt ihrem Gesetz | 33 ms · Zeit- und Weltwechsel ≤ 5 s | 3 Welten × 5 Epochen: jede Netz-Kennzahl aus dem Gesetz der Welt ±20 % vorhergesagt; erdähnliche Epochen bestehen die Echtheits-Probe | |

### L7 · Lesbarkeit — misst, ob der Spieler sich in der Stadt zurechtfindet, weil das Netz seine eigenen Namen, Zeichen, Pläne und Landmarken trägt (neu in der Gegenlese).

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | 1 Ort: Wegweiser an Kreuzungen | zeigt auf Ziele, die es gibt | 33 ms | 100 % der Wegweiser zeigen auf ein erreichbares Ziel in der angezeigten Richtung | 0 (kein Wegweiser, kein Name im Code) |
| 2 | 1 Stadt: Straßennamen und Hausnummern | Namen nach Kultur und Sprache des Samens | 33 ms | ein Agent nur mit den Zeichen der Welt findet 20 zufällige Adressen ≥ 95 %, Weg ≤ 1,3 × kürzester | |
| 3 | Liniennetzplan und Stadtplan aus dem Netz | stimmt mit der Welt | 33 ms beim Lesen | 100 zufällige Umstiege und Abzweige laut Plan existieren in der Welt 100 % | |
| 4 | Tokio-Maß: Landmarken, Bezirke, Knoten (Lynch) | Orientierung ohne Karte | 33 ms | Agent quert die Stadt nur mit Zeichen und Landmarken, Weg ≤ 1,5 × kürzester; jede Bezirks-Grenze im Bild erkennbar (Unterscheider ≥ 80 %) | |
| 5 | Jenseits von Tokio, 10+ Ebenen | Ebenen lesbar: Ausgänge, Aufzüge, Ebenen-Namen | 33 ms | Agent findet 20 Adressen über 3+ Ebenen ≥ 90 %, Weg ≤ 1,5 × kürzester | |
| 6 | Planeten, jede Epoche: Meilenstein bis Leitsystem, fremde Zeichen | Zeichen der Epoche echt; fremde Zeichen in sich stimmig und erlernbar | 33 ms | Echtheits-Probe Beschilderung gegen Epochen-Fotos bestanden; ein Agent ohne Vorwissen lernt fremde Zeichen aus ihrer Konsistenz und findet 20 Ziele ≥ 80 % | |

## Stand heute

- **Netz aus Gesetz, eine Stadt (geprüft):** `fachwerk-core.js:3810` STRASSENGRAPH-GESETZ, `:3818` `trasseLenk`, `:3903` `wegUeberBruecken` (die Kollegen-Zeile :4021 ist ein Aufruf, nicht die Funktion), vier Klassen bei `:4013`; siedlung.K2–K5 laut REFERENZ-ATLAS.md:216. Stadt des Worts 300 Häuser. Preis: Ankunft kalt 11–17 s gegen 5 s — keine Sprosse dieses Blatts hält heute ihren Preis.
- **Verkehr (geprüft, berichtigt):** `fachwerk-core.js:4070` `VERKEHR_GESETZ` (`hausJeWagen: 15`; `:4073` N = ⌈Slots/15⌉ nur für städtische Pläne → 20 Wagen bei 300 Häusern); `stamm/siedlung-verkehr.js:3-21` Wagen mit Bewohner (Rolle `fahrer`) am Steuer. **Berichtigung:** der Fahrer hat keinen Anlass — `_verkehrZielNeu` (`siedlung-verkehr.js:934-937`) würfelt aus dem Samen eine beliebige andere Wende; er fährt den Arbeitstag von Wende zu Wende. Der Leib am Steuer ist echt, die Fahrt ist Beruf ohne Zweck — L2:4 ist darum nicht angebrochen. Vorfahrt als Schlüssel je Ort (`_verkehrZonen`) statt EINER Reservierung (REFERENZ-ATLAS.md:218-220); pflicht.C 0/3; im Bild am Stadt-Platz „kein Wagen" (TIEFEN-KARTE-2026-11-11.md:7, geprüft).
- **Schiene, Bahnhof, Hafen, Flughafen, Leitungen, Kanal, Stromnetz (geprüft):** Grep nach bahnhof|gleis|hafen|flughafen|kanalisation|wasserleitung|stromnetz|abwasser in Kernen und `stamm/` trifft einen einzigen fremden Treffer (`stamm/kampf.js`). Laternen und Brunnen stehen als Ausstattung ohne Fluss dahinter.
- **Lesbarkeit:** Grep nach wegweiser|straßenname|hausnummer: 0 Treffer. „adresse" trifft nur Netz-Adressen (P2P, Portal).
- **Fahrgefühl Spieler:** Fahrzeuge 8/10 auf der alten Karte (MEISTERKARTE.md:113), vmax 58 km/h, GTX reißt bei 36 km/h (CPU-Takt 31 ms, :210) — L1:4 verlangt 130 km/h.

## Abhängigkeiten

- **Siedlung und Stadt** (Bedarfsfeld) und **Millionen: Bevölkerung** (Tagespläne) speisen den Samen. L2 ab 4 braucht Anlässe aus **Der Mensch: Geist, Alltag, Lebenslauf** — heute würfelt der Fahrer.
- **Fahrzeuge und Maschinen** liefert den Fahr-Schritt (`vehicle-core`); dieses Blatt misst den Strom, nicht den Wagen.
- **Maßstab-Kontinuum** und **Ankunft, Geräte und Zugang** sind Vorbedingung für JEDE Sprosse (Ankunft 5 s), besonders L1 ab 4, L2 ab 3, L3 ab 5 (Fernbild, Kosten an Schirm statt Stadtgröße).
- **Planet und Geologie**, **Ozean, Wasser und Eis**, **Atmosphäre, Wetter und Klima** tragen L5:3 und L6.
- **Kopplung, Kaskade und Katastrophe** teilt L4:4 und L6:5 — dieses Blatt richtet die Netz-Reaktion, jenes das Ereignis.
- **Arbeit, Technik und Handel** teilt L5 (Wert dort, Fluss hier). **Menschenzeit: Epochen** trägt L6:4 und L6:7 (die Epochen-Sprossen liegen nur noch in L6). **Licht, Bild und Horizont** trägt L4:5. **Sprache und Schrift** (falls ein Blatt sie trägt) speist L7:2 und L7:6.
- Intern: L2:1 (pflicht.C) vor allem anderen; L4:3 setzt L1:2 voraus; L7:3 setzt L3:4 voraus.

## Was die alte Karte hier misst

- **pflicht.C** (MEISTERKARTE.md:47, :53; Richter REFERENZ-ATLAS.md:235) → **L2:1**.
- **siedlung.K2** (Zipf, 8 Saaten) → Teil von **L6:2** (Stadtgrößen-Verteilung); **siedlung.K3** (Trasse, Gefälle, gebucht 14.11.) → **L1:1** (nur die Gefälle-Hälfte).
- **siedlung.K5** (erstes Haus ≤ x ms) → Preis-Spalte von L1:2.
- **fahrzeug.K2** (Route auf dem Wegenetz, Klassen nach RASt 06) → **L2:1** (Fahrten am Ziel).
- **Tempo F5** und **profiband.K4** (Hänger > 100 ms) → Preis-Spalte von L1:4 und L3:6.
- **pflicht.B** (Ankunft ≤ 5 s) → Preis-Spalte JEDER Sprosse.
- Stoffwechsel, Schiene, Häfen, Logistik, Lesbarkeit: die alte Karte misst hier nichts.

## Zweifel

- Die Echtheits-Probe braucht einen Referenz-Satz (Luftbilder, Straßenfotos, Epochen-Karten) und einen Unterscheider; beides ist nicht gebaut. Ohne sie fallen L1:3–5, L3:5, L6:4 auf Kennzahlen allein zurück.
- Die Größenordnungen oberhalb Tokio (10⁸ Menschen, 10⁹ Wege/Tag in EINER Stadt) haben keine reale Referenz; ihr Richter ist darum relativ zu Tokio (Reisezeit, Umweg nicht schlechter bei 10× Last). Ob „Kosten an Schirm" das bei 33 ms hält, ist offene Frage, kein Punkt.
- Referenzbänder (OSM-Kennzahlen, Zeitlücken, Kennedy-Werte, Fruin-Stufen, Dichte um Bahnhöfe) sind benannt, nicht als Tabellen im Repo; die Toleranzen sind gesetzt, nicht hergeleitet.
- L5:7 und L6:7 überlappen mit „Himmel, Sonnensysteme" und „Physik und Stoff"; L7 überlappt mit einem möglichen Blatt zu Sprache und Schrift.
- Agent-Richter (L2:4, L7) messen mit einem Sucher-Agenten statt dem Auge des Spielers — Stellvertreter für „der Spieler findet sich zurecht", nicht dasselbe.

## Gegenlese — was sich änderte und was strittig bleibt

- **Preis ehrlich:** R3 gilt zusammen — bei Ankunft 11–17 s hält keine Sprosse; die beiden „HEUTE" (L1:1, L6:1) stehen nun „halb (Preis ROT)" bzw. sind gefallen. Sim-Teilbudgets („Sim ≤ 1 ms", „Fernbild ≤ 2 ms") sind aus der Preis-Spalte entfernt; dort steht der teuerste Moment der Sprosse.
- **Vision gehoben:** jede Leiter trägt jetzt eine Tokio-Sprosse UND eine Sprosse „jenseits von Tokio" (10⁸ Menschen, 10⁹ Wege/Tag, Netz in drei Dimensionen) unter der Planeten-Sprosse; L2:7 auf 10¹⁰ Reisende über Epochen.
- **Bauweise aus den Richtern:** „Physarum-Prüfung", „IDM", „Raum-Zeit-Reservierung", „Gleisbogen-Radius nach Norm" ersetzt durch was man sieht oder spürt (Breite ↔ Last, Zeitlücken, Querbeschleunigung); „Fahrer hat Wohnung, Werk, Zweck — auflösbar" (ein Datenblick) ersetzt durch „Spieler folgt dem Wagen, der Fahrer steigt am passenden Ort aus".
- **Fleiß → Fähigkeit:** L3 zählt nicht mehr Bus, Bahn, U-Bahn als Einzelbauten, sondern ob die Stadt ihren Modus aus der Last wählt; L5 misst, ob jeder Knoten-Typ seinen Ort selbst findet; L4 fordert EIN Fluss-Gesetz für alle Stoffe.
- **Doppelte entfernt:** L1:1 = alte L6:1 (gleicher Richter), alte L1:7 = L6:4 (Epochen) — L6 trägt nun Zeit und Kopplung, L1 Raum; neu L6:3 (Netz formt Stadt zurück, die fehlende Rückkopplung).
- **Lücken gefüllt:** L7 Lesbarkeit (neu, heute 0); die Vertikale (Ebenen über der Stadt, Türme als Netz, Luftspuren) in L1:6, L2:6, L3:5–6.
- **Stand berichtigt:** der Fahrer hat keinen Anlass (`_verkehrZielNeu` würfelt eine Wende); `wegUeberBruecken` steht bei :3903, nicht :4021; die übrigen drei geprüften Behauptungen stimmen.
- **Strittig:** ob die Echtheits-Probe ohne gebauten Unterscheider zählt; ob Fußverkehr eine eigene Leiter braucht (hier in L2/L3/L7 verteilt); ob L7 hierher oder zu „Sprache und Schrift" gehört.
