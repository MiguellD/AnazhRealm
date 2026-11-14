# Der Mensch: Leib, Gesicht, Kleidung

## Die Vision hier

Jeder der Milliarden Menschen eines Planeten — und jedes denkende Wesen fremder Planeten — ist ein eigener Leib: kein Gesicht kehrt wieder, kein Gang gleicht dem anderen, Kinder tragen die Züge ihrer Eltern, und aus zwanzig Metern liest der Spieler Herkunft, Epoche, Stand, Beruf, Alter, Gemüt und das Wetter des Tages an Gestalt und Tracht ab, so wie man es auf einem echten Markt in Lagos, Kyoto 1650 oder Rom 80 n. Chr. könnte — und auf einem Markt einer Megastadt, die es nie gab: zwanzig Millionen Menschen, Implantate, Prothesen, Moden, die durch Viertel wandern, gegen die das Gedränge von Shinjuku dünn und die Straßen von Night City kostümiert wirken. Aus der Nähe hält das Gesicht dem Foto stand: Poren, Falten, Narben, Sonnenbrand, ein schief verheilter Bruch, die Tätowierung eines Seefahrers, der Schmuck einer Braut. Die Kleidung ist Stoff, nicht Hülle: sie fällt, schwingt, saugt Regen, verschleißt an den Knien des Bauern und wird geflickt. Der Spieler kann jeden dieser Leiber bewohnen und sieht sich selbst darin — Hände, Füße, Spiegelbild. Alles wächst aus EINEM Samen und den Gesetzen von Erbgang, Klima, Kultur und Lebenslauf, ob Mensch der Steinzeit, der Gegenwart, einer Zukunft oder einer fremden Evolution, und kostet am Standardgerät nicht mehr als das Bild, das man gerade sieht. Jenseits der Gegenwart heißt: nicht die zweihundert handgebauten Garnituren eines AAA-Titels, sondern ein Gesetz, das auch Trachten einer Kultur erzeugt, die niemand je entworfen hat — und sie wirkt trotzdem wahr.

## Das Beste der Gegenwart

- **Assassin's Creed Unity** (Ubisoft 2014, GDC-Vortrag zur Menge): 5 000 bis 10 000 Menschen gleichzeitig im Bild, aber nur ~40 echte KIs und ~120 hochaufgelöste Modelle; Vielfalt per Baukasten (Kopf, Hautton, Statur, Accessoires, Stimme). Grenze: Wiederholung aus der Nähe sichtbar, eine Epoche, eine Stadt, handgebaute Teile.
- **Hitman WoA** (IOI): über 1 000 aktive Menschen je Level (Mumbai); Kleidung trägt Stand und Rolle so lesbar, dass sie Spielmechanik ist (Verkleidung). Grenze: Garderobe von Hand, eine Gegenwart.
- **Red Dead Redemption 2 / Kingdom Come II**: 1 200 Darsteller bzw. ~2 400 NPCs, Kleidung verschmutzt und durchnässt (RDR2), Tracht 1403 historisch recherchiert (KCD2). Grenze: jede Garnitur ist ein Asset, Epoche fest.
- **Cyberpunk 2077** (CDPR): Körpermodifikation als Stil (Implantate, Chrom), dichte Straßen. Grenze: die Dichte ist Kulisse (Menschen verschwinden beim Umdrehen), die Mode eines Viertels ist gesetzt, nicht gewachsen.
- **MetaHuman** (Epic): Gesichter nahe am Foto, EINE Rig-Definition, 8 LOD-Stufen; Grenze: Gigabytes je Figur, Hunderte nicht Millionen, Kleidung und Haar als Assets (REFERENZ-ATLAS.md:163–169).
- **SMPL / SMPL-X** (MPI Tübingen 2015/2019): ein Körper = 10 Form-Zahlen, mit Händen und Gesicht 119 Parameter, gelernt aus Tausenden Scans. Grenze: nackt, keine Kleidung, keine Spur des Lebens, kein Erbgang.
- **Spore** (Maxis 2008): fremde Leiber aus einem Bau-Gesetz, prozedural animiert. Grenze: Spielzeug-Tiefe, keine Wahrheit gegen eine Realität.
- **Die Wirklichkeit:** Murdocks Ethnographic Atlas zählt 1 291 Gesellschaften; Trachtenatlanten über 150 Länder und Kulturen; Menschen kennen etwa 5 000 Gesichter und lesen Geschlecht, Alter und Gemüt schon aus Lichtpunkt-Gängen (Johansson-Displays). Grenze der Spiele: keines erzeugt Tracht aus Klima × Kultur × Epoche × Stand, keines vererbt Gesichter.

## Der Same

**Der Leib als Punkt in EINEM Raum, die Tracht als Funktion seiner Welt, das Gesicht als Erbe.** Ein Mensch ist β (Form, Gesicht, Alter — gezogen aus den β seiner Eltern plus Mutation) + λ (Lebenslauf: Arbeit, Verletzungen, Sonne, Moden, die er annahm) + τ (Tracht = f(Klima, Kultur, Epoche, Stand, verfügbarer Stoff, Wetter heute)), alles aus seinem Samen und dem Ort, an dem er lebt. Die Geometrie ist EINE Vorlage je Stufe, jede Person kostet Zahlen statt Dreiecke. Gelöst haben es: die Vision-Forschung (SMPL, SMPL-X, SMAL für Tiere: Form-Raum aus Scans), die Schneiderei (Schnittmuster als parametrische 2D-Konstruktion), die Genetik (Erbgang additiver Merkmale) und die Anthropologie (Bergmann/Allen-Regel, Hautton gegen UV-Breite). Der Prüfstein des Samens: das Gesetz muss auch Eingaben tragen, die keine Erd-Kultur hatte (fremde Schwerkraft, fremde Kultur), und dabei kohärent bleiben — sonst ist es eine Tabelle, kein Gesetz.

## Die Leitern

**Der Preis P\*** (gilt in jeder Sprosse, wo nichts anderes steht): Bild p95 ≤ 33 ms an Radeon 890M UND GTX 1060 **in der Szene, die die Umfang-Spalte nennt** (nicht in einer leeren Welt), Ankunft ≤ 5 s kalt, 0 B Download, Kosten wachsen mit dem Schirm, nie mit der Bevölkerung. Eine Sprosse ohne gemessenes P\* zählt nicht.

**Der Juror J** (für Wahrnehmungs-Richter): ein versioniertes Bild-Modell, je Quartal an einer Menschen-Stichprobe (≥ 20 Probanden) geeicht; ein Urteil gilt nur mit der Eich-Abweichung ≤ 10 %. Ohne geeichten Juror bleibt die Sprosse offen, nicht grün.

### L1 Ein Leib je Mensch — wie viele Menschen sind gleichzeitig verschieden und bleiben dieselben?

Wiedererkennung (Gesicht, Gang, Tracht zusammen) gehört hierher; die alte L5-Sprosse „ID am Gang" ist hier aufgegangen.

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | 10 nah unterscheidbare Leiber je Siedlung | Höhe, Bau, Gesicht verschieden | P\* am Dorf | Bild 10 Bewohner auf 2 m: J findet 0 gleiche Paare | halb: 8 Nah-Gestalten je Siedlung, alle tragen denselben Schnitt |
| 2 | 10² Personen nah, je eigener Leib | keine zwei unter 1 px Gestalt-Distanz | P\* in der Test-Stadt (118) | Zensus 100 Bewohner im Third, beide GPUs | halb: 50/50 headless, an GPUs ungemessen; nah nur 8 Formen |
| 3 | 10³ eigene Leiber in einer Stadt | Proband findet eine gezeigte Person unter 100 der Szene | P\* | J-Wiedererkennung ≥ 90 % | |
| 4 | 10⁴ im Bild (Platz, Stadion) | ab 30 m keine sichtbaren Klone | P\* im Stadion | Bild-Hash-Klonsuche über 10⁴ Silhouetten = 0 Paare | |
| 5 | 10⁵–10⁶ in einer Megastadt am Tag | dieselbe Person wird nach 1 h Spielzeit an Gesicht, Gang und Tracht wiedererkannt | P\*, Kosten an Schirm | Wiedererkennung ≥ 95 %, Gang allein ≥ 60 % aus 10 Kandidaten | |
| 6 | 10⁷ auf einem Kontinent | Familienähnlichkeit: Kinder ähneln Eltern | P\* | Geschwister-Test: J ordnet Familien ≥ 70 % richtig | |
| 7 | 10⁹–10¹⁰ auf einem Planeten, über Generationen | Gesichter-Verteilung wie reale Populationen; Erbgang über 10 Generationen sichtbar | P\*, Gesetz statt Speicher | 1 000 Zufallssamen weltweit: 0 Kollisionen; Ahnen-Zeitraffer: Gesichts-Drift einer Linie J-plausibel ≥ 0,8 | |

### L2 Das Gesicht nah — wie wahr hält ein Gesicht aus 0,5 m dem Foto stand?

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | Spieler-Kopf an der Third-Kamera 6 m | Augen, Lippe, Höhle, Haar-Deckung lesen als Kopf | P\* | J: „Kopf ohne Fehlstelle" an 10 Samen | HEUTE (mensch-kopf GRÜN, Radeon) |
| 2 | jeder Bewohner auf 2 m in einer Begegnung | Augen lebendig (Blick, Lidschlag), Haut ohne Wachs, Haar ohne Helm | P\* | Bildpaar gegen Porträtfoto gleicher Beleuchtung, J: „lebt" ≥ 50 % | |
| 3 | 0–100 Jahre, alle Populationen | Säugling bis Greis: Proportion, Falten, Poren, Zahnstand | P\* | Altersschätzung J über 100 Zufallssamen, Fehler ≤ 5 Jahre | |
| 4 | Ausdruck im Gespräch und unter Last | Freude, Furcht, Schmerz, Ekel als Gesichtsmuskel-Spiel | P\* | J erkennt die Basis-Emotion ≥ 80 % (Foto-Niveau) | |
| 5 | jeder Mensch, Ego 0,5 m, jedes Licht (Mittag, Kerze, Neon) | nicht vom Foto zu unterscheiden | P\* | Blindtest Render ↔ Foto: J und Menschen-Stichprobe 50 ± 5 % | |

### L3 Die Tracht-Kraft — erzeugt das Gesetz glaubhafte Tracht für jede Welt, auch für ungesehene?

Gemessen wird nicht die Zahl gebauter Garnituren, sondern der Anteil plausibler Ergebnisse über zufällige Eingaben (Klima × Kultur × Epoche × Stand) — die Zahl unterscheidbarer Trachten ist Folge, nicht Ziel.

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | Epoche wählt Schnitt und Farbe | Antike vs. Moderne unterscheidbar | P\* | Bildpaar Dorf 1320 ↔ Stadt 1935 | halb: 6 Schnitt-Kombinationen über 9 Epochen, Antike und Fernost tragen Poncho |
| 2 | Silhouette folgt Kultur (Rock, Mantel, Tunika, Kimono, Sari, Kopfbedeckung) | Region lesbar | P\* | 50 Zufalls-Eingaben: J ordnet Bild ↔ Epoche/Region ≥ 60 % | |
| 3 | Stand lesbar in jeder Epoche | Bauer, Händler, Adel, Soldat, Priester | P\* | Stand-Rateaufgabe aus 20 m ≥ 70 % | |
| 4 | jede Erd-Gesellschaft (Ethnographic-Atlas-Maß ~1 300) | Lagen nach Klima (Pelz bis Lendenschurz), Material der Epoche | P\* | N = 200 Zufallssamen: Anteil J-plausibel gegen Trachtenatlas ≥ 0,9; Epochenfehler ≤ 100 Jahre bei ≥ 80 % | |
| 5 | jede Person ihre eigene Garnitur, Mode wandert | Schmuck, Abzeichen, Prestige-Farbe; Moden diffundieren über Handelswege und Generationen | P\* in 10⁴ Menschen | 10⁴ Personen: 0 identische Garnituren; Zeitraffer 300 Jahre: Mode-Front folgt Handelswegen messbar | |
| 6 | Zukünfte und ungesehene Kulturen (Megastadt 2300, fremder Planet) | kohärent, nicht kostümiert: Funktion, Klima, Stand lesbar ohne Erd-Vorbild | P\* | 100 Zufalls-Welten ohne Erd-Kultur: Jury hält Trachten kohärent ≥ 0,8 und unterscheidet ≥ 20 Stile | |

### L4 Stoff in Bewegung — trägt die Kleidung als Stoff?

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | Stoff liegt am Leib, starr | Webart als Rauheit, keine Haut ragt durch | P\* | Bildreihe 16 Posen × 10 Samen: 0 Durchstiche | unter der Leiter: Stoff aus der Haut extrudiert, Durchstich nie gemessen |
| 2 | Spieler: Saum, Ärmel, Mantel schwingen | Fall nach Gewicht des Stoffs | P\* | Bildreihe Lauf: Saum folgt mit Verzug, Durchdringung 0 | |
| 3 | 10² Nahe mit Stoff-Sekundärbewegung, Lagen | Wind und Sprint sichtbar, Hemd unter Mantel unter Umhang | P\* in der Test-Stadt bei Sturm | Video gegen Referenz-Aufnahme, J ≥ 60 % „echt" | |
| 4 | jeder Stoff trägt sein Wetter und seine Arbeit | nass dunkel und klebend, staubig, Verschleiß und Flicken an Knie und Ellbogen | P\* | Bildpaar Regen vor/nach am selben Bewohner; Bauer ↔ Adliger: Verschleiß von J erkannt ≥ 80 % | |
| 5 | 10⁵ im Stadion, jeder Stoff lebendig | vom Film nicht unterscheidbar | P\* | Blindtest Video ↔ Render 50 ± 5 % | |

### L5 Bewegungs-Ausdruck — lesen Gang, Haltung und Gestik Alter, Last, Verletzung und Gemüt?

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | ein Gang-Gesetz (Froude) für jede Größe, 10³ Menschen | Fuß ohne Gleiten | P\* (Takt heute 0,75 ms je 1 094) | Fußgleiten ≤ 3 cm im Bild | HEUTE |
| 2 | Haltung nach Akt und Gemüt | gebeugt bei der Arbeit, müde am Abend, Furcht nach Bedrohung | P\* | J errät Akt/Gemüt aus Silhouette ≥ 60 % | halb: Haltung zum Akt des Tags und Furcht laufen (`tagesHaltung`, `_bewohnerGemuet`), ungemessen |
| 3 | Gang nach Alter, Bau, Last, Verletzung | Greis langsam, Kind hüpft, Sack auf der Schulter, Hinken | P\* | Lichtpunkt-Gang: Alter ± 15 Jahre; „verletzt/beladen" ≥ 80 % | |
| 4 | Gestik je Kultur und Gespräch | Gruß, Zeigen, Streit, Gebet, Verbeugung, Abstand | P\* | J erkennt Gemüt aus Ganzkörper ≥ 70 % und Kultur aus Gestik ≥ 50 % | |
| 5 | 10⁵ Menschen mit eigenem Gang und Gestus | Körper-Kultur einer Stadt (Tempo, Distanz) | P\* | Video Platz ↔ Feldaufnahme gleicher Kultur, J verwechselt ≥ 50 % | |

### L6 Spur am Leib — liest man den Lebenslauf an Haut, Schmuck und Ersatzteil?

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | Alter als Achse | sichtbar zwischen 18 und 80 | P\* | J-Altersschätzung Third, Fehler ≤ 15 Jahre | unter der Leiter: Dial 18–80 vorhanden, nie gemessen |
| 2 | Arbeit am Leib | Bauer gebräunt, Schmied rußig, Arbeitshände | P\* | Beruf-Rateaufgabe aus 5 m ≥ 50 % | |
| 3 | Verletzung live | Wunde → Verband → Narbe über Tage | P\* | Bildreihe Tag 0/3/30 am selben Bewohner | |
| 4 | Zeichen-System der Kultur am Leib | Schmuck, Tätowierung, Bemalung, Implantat folgen Stand und Glaube einer erzeugten Kultur | P\* | N = 100 Zufallskulturen: J ordnet Leib ↔ Kultur ≥ 60 % | |
| 5 | Biografie im Leib, bis zur Kybernetik | Brüche, Pocken, Kriegsnarben, Prothese, Chrom — Folge des Lebenslaufs, nie Zufallsdeko | P\* | Lebensgeschichte aus dem Bild geschätzt: ≥ 3 von 5 Fakten des Datensatzes | |
| 6 | jeder Mensch eines Planeten trägt seine Geschichte | plausibel und nicht klischeehaft | P\* | N = 500 Zufallssamen: J hält Spuren plausibel ≥ 0,9 | |

### L7 Kopplung Leib ↔ Welt — folgt der Mensch dem Planeten?

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | Kleidung folgt dem Wetter jetzt | Regen → Kapuze/Schirm, Kälte → Lagen | P\* | Bildpaar Sommer/Winter am selben Platz: Lagen-Anteil steigt | |
| 2 | Leib folgt dem Klima der Herkunft | Hautton nach UV-Breite, Statur nach Bergmann/Allen | P\* | 200 Zufallssamen: Hautton-Breite-Korrelation wie real (r ≥ 0,7) | |
| 3 | Tracht aus verfügbarem Stoff | Flachs, Wolle, Seide aus Feldern, Herden, Handel der Region | P\* | Stoffe ⊆ Erzeugnisse/Handel der Region in 100 % der Proben | |
| 4 | Migration mischt Leib und Mode | Hafenstadt sichtbar gemischt, Bergdorf einheitlich | P\* | Vielfalts-Index Hafen > Bergdorf, gegen reale Daten plausibel | |
| 5 | Zeitreise am selben Ort | dieselbe Küste 3000 v. Chr., 1400, 2026, 2300: Leib (Größe, Ernährung) und Tracht wandeln sich gesetzlich | P\* je Epoche | Bildreihe 4 Epochen: J ordnet Epoche ≥ 80 %; mittlere Körpergröße folgt realer Kurve ± 5 cm | |
| 6 | fremde Planeten formen fremde Leiber | Schwerkraft, Licht, Atmosphäre ändern Bau, Haut und Tracht | P\* | Planet 2 g: Statur messbar gedrungener; Jury hält Leib und Kultur kohärent ≥ 0,8 | |

### L8 Nah bis fern ohne Bruch — bleibt ein Leib derselbe von 0,5 m bis 2 km? (neu)

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | Bewohner von 2 m bis 50 m | Farbe und Silhouette bleiben beim Stufenwechsel | P\* | Bildreihe Zufahrt: Pixel-Sprung am Wechsel ≤ Rauschen, J sieht 0 Wechsel | |
| 2 | 0,5 m bis 300 m, 10³ im Bild | Nah-Gestalt und Fern-Punkt sind derselbe Leib (heute: 8 Nah-Formen, Fern je eigener Punkt) | P\* | Person aus 300 m herangezoomt: J bestätigt dieselbe ≥ 95 % | |
| 3 | Megastadt-Panorama bis 2 km, 10⁶ im Schirm-Volumen | Menge liest als Menge (Farbe der Tracht, Bewegung), nicht als Textur | P\* | Bildpaar Panorama ↔ Luftaufnahme einer Metropole, J verwechselt ≥ 40 % | |

### L9 Der eigene Leib — kann der Spieler jeden Leib bewohnen und sich darin sehen? (neu)

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | Spieler-Leib in Third | ein Leib, eigene Tracht | P\* | Bild Third | HEUTE |
| 2 | Ego mit Händen und Füßen | Blick nach unten zeigt den eigenen Leib, kein Kamera-Kopf | P\* | Bildreihe Ego: Hände/Füße sichtbar, 0 Durchstich | |
| 3 | jeden Bewohner übernehmen (Kind, Greis, Verletzter) | Kamerahöhe, Gang und Reichweite folgen dem Leib | P\*, Wechsel ≤ 1 s | Wechsel in 10 Zufallsleiber: Augenhöhe = Leibhöhe ± 3 cm, Gang ändert sich | |
| 4 | jeden Leib jeder Epoche und jedes Planeten | Spiegel, Wasser und Schatten zeigen den eigenen Leib | P\* | Bildpaar Spiegel ↔ Third gleicher Leib, J bestätigt ≥ 95 % | |

## Stand heute

- Körper: Genom → Dials → Teile-Baum → SDF-Haut. **Nah (Stufen 0 und 1) teilen sich die Bewohner einer Siedlung 8 Gestalten** (`BEWOHNER.gestalten`, `stamm/siedlung-bewohner.js:232–241`); die Farben trägt jeder aus eigenem Samen, die Menge (Stufen 2 und 3) setzt jeden Bewohner als eigenen Punkt im Leib-Raum der Siedlung (`_bewohnerRaum`). Stufen L0 40 000 · L1 14 000 · L2 1 700 · L3 360 Dreiecke.
- Vielfalt gemessen headless: 50 Bewohner aus 50 Samen, 0 Paare unter 1 px, Höhe 1,625–1,858 m, 132 200 Dreiecke (MEISTERKARTE.md:454); an beiden GPUs ungemessen (REFERENZ-ATLAS.md:181). Nach R2 (echtes Spiel) zählt das als halb.
- Gesicht: vier Genom-Achsen in engen Bereichen (Auge 0,98–1,08, Mund 0,97–1,06, Braue und Haaransatz ±0,012) (`koerper-core.js:4785–4790`); Iris-Rauschen und Lidschlag laufen (`koerper-core.js:4823–4826`), kein Blick-Ziel; mensch-kopf GRÜN im Third auf 6,11 m an der Radeon. Kein Gesichts-Ausdruck.
- Haut: 8 Töne Porzellan bis Ebenholz (`koerper-core.js:752`, geprüft); Haar: 10 Stile mit Kajiya-Kay-Licht.
- Alter: Dial 18–80 Jahre für Haltung, Kopf, Gesicht (`koerper-core.js:120–126`, geprüft); keine Kinder, kein Greisenalter über 80.
- Tracht: neun Epochen-Einträge, **je Siedlung EIN Schnitt** (der Plan trägt `kleidung`, `siedlung-bewohner.js:245–247`), über alle Epochen 6 Schnitt-Kombinationen aus 4 Oberteilen, 2 Hosen, 3 Schuhen; Antike und Fernost 1250 tragen Poncho; Farben 4–8 der 13 Töne (`fachwerk-core.js:3295–3303`, `koerper-core.js:179`, geprüft). Stoff ist aus der Haut extrudiert, starr.
- Bewegung: Froude-Gang für jede Größe, Menge aus 16-Phasen-Pose-Tafel, 1 094 Köpfe in 0,748 ms. **Zehn Bewegungs-Profile** (idle, joy, sad, angry, fear, run, pwalk, slide, fight, showcase, `koerper-core.js:80`) werden an Bewohnern gelesen: Haltung zum Akt des Tags (Arbeit gebeugt, Abend „sad", `tagesHaltung` `koerper-core.js:4972–4979`) und erinnerte Furcht (`_bewohnerGemuet`, `siedlung-bewohner.js:1864`). Keine Gestik, kein Hinken, keine Last, keine Kultur der Körper.
- Narbe, Tätowierung, Schmuck, Wunde am Leib: nichts (Grep leer in `koerper-core.js` und `stamm/siedlung-bewohner.js`).
- Bevölkerung im Bild: Test-Stadt 118 Bewohner, Stadt-Gipfel 197 857 Bewohner-Dreiecke (REFERENZ-ATLAS.md:183). Kein Erbgang, keine Familienähnlichkeit.

## Abhängigkeiten

- **Millionen: Bevölkerung, Masse und Strom** — L1 ab Sprosse 4 und L8 brauchen ihren Rang-/Imposter-Weg; dieses Blatt misst die Verschiedenheit und den Bruch, jenes die Zahl.
- **Physik und Stoff** — L4 braucht ihren Löser; hier wird nur das Ergebnis am Leib gerichtet.
- **Licht, Bild und Horizont** — L2 (Haut-Streuung, Haar-Licht, Neon) hängt am Licht-Gesetz.
- **Menschenzeit: Epochen** und **Kultur, Sprache, Glaube** — L3 und L6 Sprosse 4 erzeugen Tracht und Zeichen, sie liefern Epoche und Kultur als Eingang; L7 Sprosse 5 ist die Zeitreise am Leib.
- **Atmosphäre, Wetter und Klima** — L7 Sprossen 1–2, L4 Sprosse 4.
- **Nahrung, Landwirtschaft** und **Arbeit, Technik und Handel** — L7 Sprosse 3, L6 Sprosse 2, L3 Sprosse 5 (Mode über Handelswege).
- **Der Mensch: Geist, Alltag, Lebenslauf** — liefert λ (Biografie, Gemüt), dieses Blatt macht sie sichtbar (L5, L6). **Sport und Bewegungskönnen** — erweitert L5 um Können; hier nur Alltags-Ausdruck.
- **Leben, Arten, Evolution** — L7 Sprosse 6 und L3 Sprosse 6 (fremde Leiber, fremde Kulturen); der Erbgang (L1 Sprossen 6–7) teilt das Gesetz.
- **Perspektiven und Spieler** — L9 (der eigene Leib).
- **Spur, Verfall und Gedächtnis** — Verletzung und Narbe (L6) sind ihre Klasse am Leib.
- **Ankunft, Geräte** — der Leib-Guss liegt heute auf dem Ankunftspfad (Leib-L0 4,4 s Worker, REFERENZ-ATLAS.md:182); P\* schließt die Ankunft ein.

## Was die alte Karte hier misst

- **mensch.K4** Körper, Vielfalt, Kosten einer Menge (2/2): 50 aus 50 Samen, Höhe ±8 %, Gesicht in MENSCH_SOLL → L1 Sprosse 2 (halb, headless) und L2 Sprosse 1.
- **mensch.K1** Besiedlung (1/2): ≥ 200 Bewohner, ≥ 40 nah animiert → L1 Sprosse 3.
- **haar.K1 · haar.K2** (Haar, Fell, Kleidung) → L2 Sprosse 2 und L4 Sprosse 1.
- **siedlung.K4** Tracht der Epoche → L3 Sprosse 1.
- **leib.K1/K2** (Latenz, Fuß auf Stufen, Fuß 3,1–3,4 cm) → L5 Sprosse 1.
- **M7** (Gesicht an der Third-Kamera nie im Bild) → der Richter von L2 Sprosse 2 braucht eine Begegnungs-Pose.

## Zweifel

- Der Juror J ist die tragende Annahme aller Wahrnehmungs-Richter; ob ein Bild-Modell als Proband gilt, entscheidet seine Eichung, nicht diese Karte.
- Die Größenordnungen der Tracht stützen sich auf den Ethnographic Atlas und Trachtenatlanten; eine Zählung unterscheidbarer Trachten der Menschheit gibt es nicht — deshalb misst L3 jetzt Plausibilität über Zufalls-Eingaben statt einer Zahl.
- L4 Sprosse 1 „keine Haut ragt durch" ist am Code angenommen, nicht gemessen.
- Ob Gesichter „vom Foto nicht unterscheidbar" bei 33 ms auf Laptop-Grafik je erreichbar sind, ist offen; die Sprosse bleibt oben, weil sie die Vision ist.
- L7 Sprosse 2 (Hautton nach Breite) berührt reale Populationsbiologie; der Richter muss Vielfalt plausibel halten, nicht Klischees prüfen.
- L1 Sprosse 7 (10¹⁰ über Generationen) setzt ein Erbgang-Gesetz voraus, das bis heute nicht existiert; ob Familienähnlichkeit mit 10–119 Form-Zahlen wahr wirkt, ist ungeprüft.

## Gegenlese — was sich änderte und was strittig bleibt

- **Stand berichtigt:** nah teilen sich die Bewohner einer Siedlung 8 Gestalten und EINEN Schnitt (`siedlung-bewohner.js:232–247`) — L1 Sprosse 2 war als HEUTE überzeichnet (headless, GPUs ungemessen), jetzt „halb"; L1 Sprosse 1 ebenso. „~5 Garnituren" wurde 6 Schnitt-Kombinationen, je Siedlung einer. „Keine Haltung/Emotion" war falsch: zehn Bewegungs-Profile laufen an Bewohnern (Akt des Tags, Furcht) — L5 Sprosse 2 neu, halb. Hautton 8 und Alter 18–80 stimmen.
- **Gehoben:** L1 bis 10¹⁰ über Generationen mit Erbgang; L3 bis ungesehene Kulturen und Zukünfte (die Megastadt, die Tokio dünn aussehen lässt); L6 bis Kybernetik als Folge des Lebens; L7 um die Zeitreise am selben Ort.
- **Naiv → Kraft:** L3 zählte Trachten (Fleiß) und misst jetzt den plausiblen Anteil über Zufalls-Eingaben; L6 Sprosse 4 nannte Maori-Moko und Seemanns-Anker als Liste und misst jetzt ein Zeichen-System erzeugter Kulturen.
- **Preis:** P\* statt nackter „≤ 33 ms" — gemessen in der Szene der Umfang-Spalte, an beiden GPUs, mit Ankunft und 0 B; Dreiecks-Grenzen als Preis gestrichen (Bauweise).
- **Zusammengelegt:** Wiedererkennung am Gang (alt L5 S5) ging in L1 S5 auf; L7 S1 (Tracht folgt Epoche) war L3 S1 und fiel dort hinein; Regen/Verschleiß (alt L4 S4+S5) sind eine Sprosse.
- **Neu:** L8 Nah bis fern ohne Bruch (heute brechen 8 Nah-Formen gegen eigene Fern-Punkte), L9 Der eigene Leib (jede Perspektive).
- **Strittig:** ob J geeicht genug ist, um Probanden zu ersetzen; ob L9 nicht ins Blatt Perspektiven gehört; ob 10⁵ Stoff-Leiber im Bild (L4 S5) je ein sinnvoller Umfang sind oder 10⁴ die echte Stadion-Grenze ist.
