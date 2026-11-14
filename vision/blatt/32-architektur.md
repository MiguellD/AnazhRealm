# Der Same: Architektur der Entfaltung

## Die Vision hier

Eine Zahl, der Same, und ein Satz Gesetze, wenige Megabyte, ergeben eine Galaxie: 10^11 Sonnensysteme, Planeten mit Platten, Meeren, Äonen, Evolutionen, Städten, gegen die Tokio ein Dorf ist, und Welten mit zehn Milliarden Menschen. Jede Frage `welt(Ort, Maßstab, Zeit | Same, Gesetz, Akten)` hat überall und für immer dieselbe Antwort, auf jedem Gerät und bei jedem Mitspieler, ohne dass je ein Byte Welt geladen wird. Die Rechenkosten hängen am Schirm (etwa zwei Millionen Pixel und ein Takt), nie an der Größe der Welt. Ein Planet mit zehn Milliarden Menschen kostet im Bild dasselbe wie eine Wiese. Was niemand ansieht, wird nur statistisch geführt, als Ströme, Bestände und Wahrscheinlichkeiten. Sobald der Blick hinfällt, verdichtet es sich zum einzelnen Menschen mit Namen, Tag und Geschichte, ohne Widerspruch zu dem, was die Statistik vorher zeigte, und es bleibt so, wenn der Blick wiederkehrt. Was ein Spieler tut, wirkt nach oben weiter: ein Damm verschiebt ein Delta, eine Stadt wärmt ihr Tal, ein Ausbruch kühlt einen Kontinent, und gespeichert wird dafür nur die Tat. Von den Millionen Varianten (Arten, Häuser, Wagen, Welten) soll keine wie die zehntausendste Schüssel Haferbrei wirken: jede ist unterscheidbar und plausibel, viele Welten sind fremder als die Erde und trotzdem glaubhaft, und ein Mensch erkennt eine Welt an einem einzigen Bild wieder, auch Jahre und viele Gesetzes-Versionen später.

## Das Beste der Gegenwart

- **No Man's Sky** (Hello Games, GDC 2017, McKendrick, „Continuous World Generation“): 2^64 Planeten aus einem 64-Bit-Samen, über die Kette Voxel → Polygon → Textur → Population → Simulation. *Grenze:* Die Planeten sehen sich ähnlich („10.000 Schüsseln Haferbrei“, K. Compton). Es gibt keine Zivilisation aus Gesetz und keine Geschichte ohne Zuschauer. Große Updates haben die Planeten bekannter Saaten mehrfach umgeworfen: der Same war für immer gleich, das Gesetz nicht.
- **Elite Dangerous, Stellar Forge** (Frontier): eine Milchstraße im Maßstab 1:1 mit ~400 Mrd. Systemen. Davon stammen ~160.000 aus realen Katalogen, der Rest folgt aus Sternentstehungs-Physik (Guinness-Rekord). *Grenze:* Oberflächen ohne Leben und Stadt, die Gesetzestiefe endet am Gestein.
- **Microsoft Flight Simulator 2020/2024**: die ganze Erde in 1:1 bis zum Haus. *Grenze:* Sie ist aus DATEN gebaut (Petabytes Luftbild und Photogrammetrie, gestreamt aus der Cloud) statt aus Gesetzen. Die Städte sind tot, und ohne Netz bleibt die Welt leer.
- **Minecraft** (Mojang): 64-Bit-Same, Weltrand bei ±30 Mio. Blöcken, deterministisch. *Grenze:* Simuliert wird nur in geladenen Chunks (Zufalls-Takte). Was außerhalb liegt, steht still, es gibt also keine Rechnung ohne Zuschauer. Die „Far Lands“ zeigten früh die Grenze der Fließkomma-Genauigkeit. Die Spieler-Bauten werden als volle Chunks gespeichert, der Speicher wächst also mit der besuchten Welt, nicht mit den Taten.
- **Dwarf Fortress** (Bay 12): Die Weltgenese simuliert Jahrhunderte Geschichte, Zivilisationen und Figuren statistisch vor Spielbeginn. *Grenze:* Das läuft nicht in Echtzeit-3D, dauert Minuten und ändert sich nach dem Start nicht mehr in dieser Tiefe.
- **Cities: Skylines II** (Colossal Order): kein fester Agenten-Deckel, jeder Bürger wird einzeln geführt. *Grenze:* Die Kosten hängen an der Weltgröße. Spieler berichten, dass 250.000 Einwohner einen 13700K über 95 % auslasten und eine Stadt mit 500.000 kaum noch läuft (PC Gamer, Steam-Foren). Das ist das Gegenbeispiel zu Gebot 7.
- **Wissenschaft, Zufall ohne Zustand:** Salmon, Moraes, Dror und Shaw, „Parallel Random Numbers: As Easy as 1, 2, 3“ (SC'11, Best Paper, D. E. Shaw Research). Ihr Philox berechnet die n-te Zufallszahl direkt als f(Schlüssel, n), ohne mitgeführten Zustand, und besteht BigCrush. Er läuft heute in NumPy, TensorFlow und Intel oneMKL. *Grenze:* Das ist nur der Zufall. Die Verdichtung (Statistik → Instanz) löst diese Arbeit nicht.
- **Wissenschaft, Verdichtung über Skalen:** Klimaforschung (statistisches Downscaling: aus der groben Modellzelle folgt lokales Wetter, das mit ihrem Mittel verträglich ist), Hashlife (Gosper 1984: ein memoisierter Quadtree springt 2^n Generationen weit) und die Renormierungsgruppe der statistischen Physik. *Grenze:* Keines davon läuft im Takt eines Bildes vor einem Spieler.
- **Wissenschaft, Kopplung nach oben:** Die städtische Wärmeinsel (Großstädte 1–3 K wärmer als ihr Umland, nachts mehr), die Abkühlung nach Pinatubo 1991 (~0,5 K global für etwa ein Jahr) und der Rückzug von Deltas hinter Staudämmen (Nil nach Assuan) sind gemessene Fälle, in denen das Kleine das Große umschreibt. *Grenze:* Kein Spiel führt sie aus Gesetz, alle bekannten Welten-Generatoren rechnen nur von oben nach unten.

## Der Same

**Das EINE Prinzip:** Die Welt ist ein Baum bedingter Stichproben über die Maßstäbe, die Galaxie → System → Planet → Platte → Region → Stadt → Viertel → Haus → Mensch → Tag → Geste. Jeder Knoten trägt zwei Dinge:
1. seinen eigenen zählerbasierten Zufall, `h(Same, Pfad im Baum)` nach der Art von Philox, ohne Zustand, parallel und für immer gleich;
2. eine statistische Zusammenfassung (Momente, Bestände, Ströme), aus der die Kinder bedingt gezogen werden.

Das Kind ist eine Stichprobe UNTER der Bedingung seiner Zusammenfassung. Deshalb ist das Nahbild nie im Widerspruch zum Fernbild, und es muss nichts rückgerechnet werden. Die Zeit ist eine weitere Achse desselben Baums: Zwischen zwei Blicken wird die Zusammenfassung geschlossen fortgeschrieben (Bestand, Strom, Tageslauf `f(Same, t)`) statt Schritt für Schritt simuliert. Der Spieler und die KI schreiben **Akten** an Knoten. Eine Akte ist eine Randbedingung, die alles darunter neu bedingt UND die Zusammenfassung ihres Elternknotens verschiebt (der Damm ändert den Strom der Region, die Region bedingt das Delta neu). So läuft Kopplung in beide Richtungen, und gespeichert wird trotzdem nur die Akte. Die Kosten entstehen nur in Knoten, die der Schirm gerade berührt. Was er nicht berührt, kostet nichts.

Die Bausteine dazu haben fremde Branchen schon gelöst: den zustandslosen Zufall die Molekulardynamik im Höchstleistungsrechnen (Philox, SC'11), die Verdichtung mit Erhaltung des Mittels die Klimaforschung (Downscaling), den Zeitsprung durch Memoisierung die Theorie der Zellularautomaten (Hashlife). Das Spiel muss sie nur zu EINEM Gesetz zusammenführen.

## Die Leitern

**Preis-Band** (gilt für jede Sprosse, zusammen mit Umfang und Tiefe): Frame p95 ≤ 33 ms auf Radeon 890M UND GTX 1060, Ankunft ≤ 5 s kalt, kein Download außer dem Gesetz (heute ~13 MB Skript) und den Akten im Schirm. Wo eine Sprosse mehr verlangt, steht es in der Spalte Preis. Eine Sprosse ohne gemessenen Preis gilt nicht, auch wenn Umfang und Tiefe halten.

**Richter-Regel:** Die Richter messen, was der Spieler sieht (Bild, Bildpaar, Blindtest) oder erlebt (Frame-Zeit, Pause, Zeit bis zum ganzen Bild). Keine Sprosse schreibt eine Bauweise vor (Ringe, Stufen-Ketten, Dreiecke, Ursprungs-Versatz); die stehen höchstens in der Spalte Stand.

### L1 Gleichheit: Was zwei Geräte an derselben Koordinate (Ort, Maßstab, Zeit) sehen, ist dieselbe Welt.

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel; misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | Taten eines Spielers (Bau, Fällen, Graben) | Spieler B sieht die Tat von A an derselben Stelle, auch nach dem Reload | Band | Bildpaar A ↔ B und vor ↔ nach Reload an 10 Taten: Klassen-Masken-Diff ≤ 1 % | (headless: Fusion zweier Welten byte-gleich, 1146 B; nie am Bild) |
| 2 | alle Teil-Simulationen einer Welt (Wetter, Leben, Pegel, Brand), 20 min | ohne Zustands-Nachricht, Reload mitten im Sturm | Band | zwei Clients 20 min Spielzeit: Zellen-Diff = 0, das Netz-Log zeigt nur Akten | HEUTE (headless, nie am Bild) |
| 3 | 100 zufällige Posen der Startwelt (~10 km²) | BILD-gleich auf zwei GPU-Familien | Band | Klassen-Masken-Diff Radeon ↔ GTX je Pose ≤ 1 % der Pixel | |
| 4 | 100 zufällige Saaten × 10 Posen | Bild-gleich, auch zu Nacht, bei Regen und im Winter | Band | wie 3, über die Saaten; Anteil der Posen ≤ 1 % Diff ≥ 99 % | |
| 5 | ein Planet: 1.000 zufällige Koordinaten auf der ganzen Oberfläche | beliebige Uhrzeit und Jahreszeit, zwei Geräte und zwei Peers | Band | Klassen-Diff ≤ 1 % an ≥ 99 % der Stichproben | |
| 6 | ein Ort in 10 Epochen (−10^9 bis +10^3 Jahre) | dieselbe Epoche liefert auf beiden Geräten und nach dem Reload dasselbe Bild | Band | Klassen-Diff ≤ 1 % je Epoche; Zeitreise hin und zurück: Diff = 0 | |
| 7 | eine Galaxie: 10^11 Systeme × Planeten × Äonen; fusionierte Welten | jede Koordinate gleich auf allen Geräten und bei allen Peers, ohne Zustands-Strom | Band | 10.000 zufällige (System, Planet, Ort, Jahr): Klassen-Diff ≤ 1 % an ≥ 99,9 % | |

### L2 Schirm statt Sack: Die Kosten eines Bildes hängen an dem, was der Schirm zeigt, nicht an der Menge Welt dahinter — und das, was er zeigt, hält der Wirklichkeit stand.

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | Wiese und Genesis, Sicht bis 8 km | Wiese trägt bis ~20 m, Häuser lesen als weiße Kästen | GTX stehend p95 16,8 ms | Frame p95 je Gerät an Wiese und Genesis, Ego und Third | HEUTE |
| 2 | 10^3 Häuser im Blick (heute 300 am Marktplatz) | ≥ 50 % der Häuser im Blindtest gegen Fotos echter Altstädte als plausibel gewählt | Band; dieselbe Pose mit Inhalt ×10 kostet ≤ 10 % mehr | p95(×10) ÷ p95(×1) ≤ 1,10; Blindtest Bildpaar Spiel ↔ Foto | |
| 3 | 10^4 Gebäude und 10^4 Menschen im Bild (eine Shibuya-Kreuzung je Ampelphase) | jeder Mensch mit eigenem Leib und Gang | Band, Steigung ≤ 10 % | wie 2; zusätzlich Bildvergleich gegen ein Foto einer Großstadt-Kreuzung (Dichte-Histogramm) | |
| 4 | Skyline mit 10^5 Gebäuden bis zum Horizont (30 km) | Fensterlicht je Wohnung, Dunst und Luft; Silhouette und Nachtlicht-Statistik gegen Fotos von Hongkong, Manhattan, Shanghai | Band; Kosten ≤ 1,1 × leere Ebene derselben Pose | p95 Skyline ÷ p95 leere Ebene ≤ 1,10; Blindtest ≥ 40 % „Foto“ | |
| 5 | Tokio-Maß: 10^6 Gebäude, 4·10^7 Menschen, Blick aus 1 km Höhe und auf der Straße | Ströme sichtbar als Verkehr und Menge; Luftbild im Blindtest gegen Luftfotos von Tokio ≥ 40 % „Foto“ | Band, Steigung ≤ 10 %; Abstieg auf die Straße ohne Kosten-Sprung > 10 % | wie 4 entlang des Abstiegs | |
| 6 | über Tokio hinaus: eine Hyperstadt mit 10^9 Menschen und 10^7 Gebäuden, durchgehend über 1.000 km, Türme bis 2 km, Ebenen übereinander | aus jedem Fenster, jeder Ebene und 5 km Höhe glaubhaft (Blindtest ≥ 40 % gegen die beste Konzept- und Fotoreferenz); keine zwei Viertel gleich (L6 Sprosse 4) | Band; Steigung gegen 10^7 → 10^9 Menschen ≤ 10 % | p95 je Ebene und Höhe; Kosten-Kurve über zwei Größenordnungen flach | |
| 7 | jede Pose einer Galaxie mit 10^11 Systemen und 10^10 Menschen je Welt | was der Spieler sieht, ist so wahr wie Sprosse 6 | Band; Steigung gegen Weltinhalt über 10^0 … 10^9 ≤ 10 % | Kosten-Kurve p95 über neun Größenordnungen Weltinhalt bei fester Pose: flach (≤ 1,10) | |

### L3 Der Raum der Funktion: Wie weit reist der Spieler ohne Bruch (Zittern, Naht, Pause, Lücke)?

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | Sicht 8 km, eine flache Welt | Höhen überall aus dem einen Gelände-Gesetz | Band | Reise-Sonde: Zittern in px bei 1 m Abstand, längste Pause, Lücken-% | HEUTE (Grenze ungemessen) |
| 2 | 100 km am Stück (zu Fuß, Wagen, Flug) | Zittern ≤ 0,5 px, keine Naht | Band; keine Pause > 100 ms | wie 1 entlang einer 100-km-Bahn | |
| 3 | 1.000 km, ein Kontinent | Klimazonen wechseln entlang der Bahn | Band | wie 2; Anteil der Lücken-Bilder ≤ 0,1 % | |
| 4 | 40.000 km: ein Planet, einmal ganz umreist | Krümmung wahr (Horizont aus 1,7 m Augenhöhe ≈ 4,7 km) | Band | Horizont-Distanz im Bild ±5 % gegen die Geometrie; die Reise um den Planeten schließt sich ohne Naht | |
| 5 | Orbit ↔ Straße: 400 km → 1 m ohne Schnitt, Halbkugel mit Städten, Wolken und Nachtlichtern | Atmosphäre und Wolken durchflogen; Orbitbild gegen ISS-Fotos (Farb- und Licht-Statistik) | Band; kein Ladeschirm, längster Frame ≤ 50 ms | p95 und längster Frame entlang des Abstiegs; Lücke ≤ 2 %; ΔE-Histogramm gegen die Referenz | |
| 6 | ein Sonnensystem, 10^10 km | Flug zwischen Planeten, Bahnen nach Kepler | Band | Reise Planet A → B: Zittern, Pause, Lücke wie 2; Bahnlage gegen die analytische Lösung | |
| 7 | eine Galaxie, 10^5 Lichtjahre, 10^11 Systeme erreichbar | jeder Stern ein Ort, an dem man landen kann | Band | 100 zufällige Ziele angeflogen: 100 % ohne Bruch nach den Maßen von 2 | |

### L4 Rechnung ohne Zuschauer: Wer fortgeht und wiederkommt, findet die Welt, wie sie geworden wäre, obwohl in der Abwesenheit fast nichts gerechnet wurde.

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | 118 Bewohner einer Test-Stadt, ein Tag | Tag = f(Same, t); nach der Abwesenheit steht jeder, wo er gestanden hätte | Band | Abwesenheits-Probe: Ort sehen, gehen, nach N h zurück; Lage jedes Bewohners gegen den Lauf mit Zuschauer ≤ 1 m | HEUTE als Gesetz (periodischer 24-h-Tag, die Ankunft spielt nur die letzten 3 h nach; die Probe ist nie gefahren) |
| 2 | 10^4 Wesen (Menschen, Tiere, Wuchs), Abwesenheit 1 Tag | Widersprüche = 0 (niemand an zwei Orten, gefällt bleibt gefällt) | Band; Abwesenheit kostet ≤ 0,5 ms je Frame | Klassen-Statistik (Dichte, Bestand) Rückkehr ↔ Zuschauer-Lauf ≤ 5 %; Widerspruchs-Zähler = 0 | |
| 3 | 10^6: eine Metropole, Abwesenheit 1 Jahr | Ströme, Märkte und Bauten wachsen nach Gesetz | wie 2; Rückkehr-Bild ≤ 5 s | wie 2 an 100 Stichproben; Bildvergleich Stadtteil vorher ↔ nachher zeigt die Veränderung | |
| 4 | 10^8: ein Kontinent, 100 Jahre | Bevölkerung, Wälder und Flüsse verschieben sich gekoppelt | wie 3 | Statistik ≤ 10 % gegen einen Stichproben-Lauf mit Zuschauer; Widersprüche = 0 | |
| 5 | 10^10: ein Planet, Jahrhunderte Geschichte | Städte wachsen und fallen, Kulturen wandern | wie 3 | 100 zufällige Orte nach 300 Jahren: Plausibilität ≥ 90 % gegen historische Muster (Wachstumskurven, Zipf der Städte) | |
| 6 | Äonen: 10^6 bis 10^9 Jahre | Platten, Erosion und Evolution geschlossen verdichtet | Band (die Zeit bis zum Bild richtet L7 Sprosse 6) | Zeitsprung hin und zurück: Diff = 0; Küstenlinie und Biome plausibel an ≥ 90 % von 100 Saaten | |
| 7 | eine Galaxie, jede Welt lebt ohne Zuschauer | Besuch nach beliebiger Zeit ohne Widerspruch | Band | 1.000 Besuche an zufälligen (Welt, Ort, Zeit): Widersprüche = 0, Statistik ≤ 10 % gegen Stichproben-Läufe mit Zuschauer | |

### L5 Verdichtung ohne Widerspruch: Was die Ferne statistisch zeigt, findet der Blick in der Nähe als Einzelnes wieder, und umgekehrt.

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | Wiese und Waldrand, vom Fuß bis 8 km | Stufen-Wechsel sichtbar (alte Karte LOD 3/10) | Band | Pop-Linse am Spieler-Weg: Anteil der Bilder mit Stufen-Sprung | HEUTE |
| 2 | Wald und Dorf, 1 km² | Baum-Zahl im Fernbild = Nahbild ±10 %; Pop ≤ 1 % der Bilder | Band | Zählung Baum-Pixel-Klasse fern ↔ nah an derselben Fläche | |
| 3 | eine Stadt bei Nacht, 10 km entfernt | erleuchtete Fenster aus der Ferne = gezählte Fenster beim Anflug ±10 % | Band | Licht-Summe im Fernbild ↔ Fenster-Zählung im Nahbild, 10 Stadtteile | |
| 4 | die Menge: 10^5 Menschen als Strom aus 500 m | Dichte je Hektar fern = Einzelne nah ±10 %; wer einmal angesehen wurde, ist nach dem Wegsehen derselbe | Band | Dichte-Vergleich fern ↔ nah; Wiedererkennung: dieselbe Person nach 10 min Abwesenheit am erwarteten Ort ≥ 99 % | |
| 5 | ein Planet: Orbit-Farben ↔ Boden | Biome, Wolken und Städte aus dem Orbit = Boden-Statistik ±10 % | Band | 100 Stichproben: Klassen-Anteile Orbitbild ↔ Bodenbilder derselben Zelle | |
| 6 | die Zeit verdichtet: Gesteinsschichten und Fossilien am Boden | die Schichten zeigen die Geschichte, die die Zeitreise zeigt | Band | Abfolge der Schichten in der Felswand ↔ die bereisten Epochen desselben Orts: Reihenfolge übereinstimmend an ≥ 95 % von 100 Orten | |
| 7 | jede Skala vom Korn bis zur Galaxie | kein Widerspruch zwischen Statistik und Instanz | Band | 10.000 Stichproben über alle Skalen-Paare: Abweichung ≤ 10 % an ≥ 99 % | |

### L6 Unterscheidbarkeit und Plausibilität: Wie viele Varianten erzeugt EIN Gesetz, die ein Mensch als verschieden erkennt, und wie viele davon sind glaubhaft?

Gemessen wird je Gesetz, das die Welt erzeugt (nicht je von Hand angelegter Klasse), an zufälligen Saaten. Verschiedenheit zählt nur über Merkmale, die ein Mensch benennen kann (Form, Raumplan, Gang, Nutzung); Rauschen, das nur Pixel ändert, bildet keinen eigenen Cluster.

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | 10 unterscheidbare Varianten je Gesetz (Haus, Baum, Tier, Mensch, Wagen und jedes weitere) | ≥ 80 % plausibel gegen Foto-Referenzen | Band | N = 100 Saaten je Gesetz, gleicher Bildausschnitt; effektive Zahl unterscheidbarer Cluster im Wahrnehmungsraum (festes Bildmodell, Schwelle aus einem Menschen-Blindtest, eingefroren); Plausibilität im Blindtest gegen Fotos | — (HEUTE: unter der Leiter; Häuser lesen als weiße Kästen, nie gemessen) |
| 2 | 10^2 je Gesetz | ≥ 85 % plausibel | Band | wie 1, N = 1.000 | |
| 3 | 10^3 je Gesetz | ≥ 85 %; im Blindtest wird ein Nachbar-Paar in ≥ 75 % unterschieden | Band | wie 1, N = 10.000 | |
| 4 | 10^4: Stadtteile und Biome mit eigenem Charakter | ≥ 90 % plausibel | Band | Stadtteil-Erkennung: aus einem Bild der richtige von 10 Stadtteilen ≥ 80 % | |
| 5 | 10^5 Arten, Gebäude und Fahrzeuge | ≥ 90 % plausibel | Band | wie 1 an 10^5 Stichproben | |
| 6 | 10^6 Arten, Gebäude und Fahrzeuge; Kulturen und Evolutionen je Welt | ≥ 90 % plausibel, gegen Feld-Taxonomie und Architektur-Kataloge | Band | wie 1; Taxonomie-Abstand der Arten hat die Verteilung echter Stammbäume (Kolmogorow-Smirnow, p > 0,05) | |
| 7 | 10^4 Welten verschiedener Saaten, davon ≥ 30 % fremder als jede Erd-Epoche | jede Welt aus einem Bild erkennbar; die fremden im Blindtest trotzdem ≥ 70 % „könnte so sein“ | Band | Welt-Erkennung: aus einem zufälligen Bild die richtige von 10^4 Saaten ≥ 95 %; Anteil außerhalb des Erd-Clusters im Bildmodell | |

### L7 Auswerten statt Laden: Wie schnell steht das ganze Bild an einer Koordinate, die noch nie besucht wurde?

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | Teleport 1 km | Bild ganz, die Welt steht nach 14–45 s | p95 33,8 ms (Radeon) / 49,9 ms (GTX) | Spielgang-Station Sprung: p95, Zeit bis die Welt steht, Lücke | HEUTE |
| 2 | Teleport 1 km | Bild ganz (≤ 2 % Lücke) | p95 ≤ 33 ms; ganz ≤ 5 s | wie 1 an beiden Geräten | |
| 3 | jeder Ort einer Welt (100 km) | Bild ganz | p95 ≤ 33 ms; ganz ≤ 5 s | 20 zufällige Ziele: Median und Maximum der Zeit bis zum ganzen Bild | |
| 4 | eine neue Saat, kalt | die erste Ansicht hält jede sichtbare Klasse im Soll | ganz ≤ 5 s kalt, 0 B Download | 20 zufällige Saaten, leere Platte: t(Kontrolle, Bild ganz) | |
| 5 | ein anderer Planet | Himmel, Schwerkraft und Leben nach seinem Gesetz | ganz ≤ 3 s | 20 zufällige Planeten: wie 4 | |
| 6 | eine andere Zeit desselben Orts, Jahrhunderte bis Äonen | Land, Leben und Siedlung jener Zeit | ganz ≤ 3 s | 10 Epochen (10^2 bis 10^9 Jahre zurück) × 10 Orte: wie 4 | |
| 7 | jede (Galaxie, System, Planet, Ort, Jahr) | Sprung als Ort-Wort oder Satz an die KI | ganz ≤ 1 s, 0 B Download | 100 zufällige Koordinaten: Maximum ≤ 1 s auf beiden Geräten | |

### L8 Gedächtnis: Was Spieler und KI tun, bleibt — für alle, für immer, über jede Gesetzes-Version — und kostet nur nach der Zahl der Taten, nie nach der Größe der Welt.

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | 100 Taten einer Sitzung | nach dem Reload steht jede Tat sichtbar an ihrem Ort | Band; Bytes je Tat gemessen | Bildpaar vor ↔ nach Reload an jeder Tat: Klassen-Diff ≤ 1 %; Speicher ÷ Taten | (Welt-Datei 1041 B, Fusion 1146 B, headless; nie am Bild) |
| 2 | 10^3 Taten: ein Dorf umgebaut | wie 1 | Band; Median ≤ 100 B je Tat; Ankunft ≤ 5 s unverändert | wie 1; Ankunft mit und ohne Taten | |
| 3 | 10^6 Taten: eine Stadt, von 1.000 Spielern geformt | jede Tat sichtbar, keine geht bei gleichzeitigen Taten verloren | Band; Speicher wächst ≤ linear in den Taten, nicht in der besuchten Fläche; geladen werden nur Taten im Schirm | Stichprobe 1.000 Taten: sichtbar 100 %; Bytes-Kurve gegen Taten und gegen Fläche | |
| 4 | eine Gesetzes-Version weiter | die alte Welt bleibt wiedererkennbar, jede Tat sitzt am selben Ort | Band | 100 Saaten, Bild Version N ↔ N+1: Welt-Erkennung (L6 Sprosse 7) ≥ 95 %; Taten-Lage 100 % | |
| 5 | 10^9 Taten auf einem Planeten (Millionen Spieler) | wie 3 | Ankunft ≤ 5 s an jedem Ort | 1.000 zufällige Orte: Ankunft, Sichtbarkeit der Taten | |
| 6 | zehn Jahre Gesetzes-Wandel (≥ 50 Versionen) | die Welt von Jahr 0 ist im Jahr 10 wiedererkennbar, keine Tat verloren | Band | wie 4 über die ganze Versions-Kette | |
| 7 | eine Galaxie: jede Tat jedes Spielers je | an jeder Koordinate | ganz ≤ 1 s; Bytes je Welt ∝ Taten | 10.000 zufällige Taten: sichtbar 100 %, Ankunft ≤ 1 s | |

### L9 Kopplung nach oben: Wirkt das Kleine auf das Große — die Tat auf die Region, die Stadt auf ihr Klima, der Ausbruch auf den Kontinent —, ohne dass ein verborgener Zustand mit der Welt wächst?

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | eine Tat (Damm, Rodung, 1 ha) wirkt bis 1 km | Pegel, Wuchs und Wild ändern sich sichtbar und plausibel | Band; Speicher = nur die Tat | Bildpaar vor ↔ nach an 10 Orten im Umkreis; Speicher-Zuwachs = Bytes der Tat | — (ungemessen) |
| 2 | eine Stadt mit 10^5 Menschen ändert ihr Tal (10 km) | Wärmeinsel 1–3 K, Flussbett, Waldrand weicht | Band | Temperatur Stadt ↔ Umland im Spiel gegen gemessene Wärmeinseln; Bildpaar des Tals vor ↔ nach der Gründung | |
| 3 | ein Damm verschiebt ein Delta 100 km flussab über Jahre | die Küste zieht sich zurück wie hinter echten Dämmen | Band; Rückkehr-Bild ≤ 5 s | Bildpaar Delta vor ↔ nach 10 Jahren; Rückzug gegen die Größenordnung echter Fälle | |
| 4 | ein Ausbruch kühlt einen Kontinent ein Jahr | Ernten, Wanderung und Himmel ändern sich gekoppelt | Band | globale Abkühlung im Spiel gegen Pinatubo (~0,5 K) ±50 %; Bildvergleich Himmel und Felder | |
| 5 | eine Zivilisation formt ihren Planeten über Jahrhunderte | Wälder, Küsten und Klima verschoben, aus dem Orbit sichtbar | Band | Orbitbild vor ↔ nach 300 Jahren an 100 Saaten: Veränderung plausibel ≥ 90 % | |
| 6 | Kopplung durch die Zeit: eine Tat in Epoche X | jede spätere Epoche trägt ihre Folge (Ruine, Schicht, veränderte Linie) | Band | 100 Taten: Folge in allen späteren bereisten Epochen sichtbar, Widersprüche = 0 | |
| 7 | zwischen Welten: eine Tat auf Planet A wird auf Planet B sichtbar (Licht, Signal, Kolonie) | nach der Laufzeit, die das Gesetz verlangt | Band | 100 Taten: Sichtbarkeit auf B zur richtigen Zeit, nie davor | |

## Stand heute

- **Die Welt als Funktion ist Norm, und in Teilen ist sie Code.** `docs/das-feld-zeichnet.md:12-21` legt `welt(x, y, z, seed, t)` und Kosten am Schirm fest. Stufe 3 („auch die Nähe zieht der Schirm“) steht dort ausdrücklich als Forschungskante (`:41-44`).
- **Gleichheit (L1 Sprosse 2) steht headless.** Alle Teil-Simulationen sind ohne Zustands-Nachricht gleich (wetter · leben · pegel · brand, Leben 1189/1189 Zellen), auch über einen Reload mitten im Sturm (`MEISTERKARTE.md:344`). Die Fusion zweier Welten ist byte-gleich, 1146 B (`:964`). Bild-Gleichheit über zwei GPUs ist nie gemessen.
- **Rechnung ohne Zuschauer: der Same des Tags steht, die Abwesenheit nur periodisch.** Der Tag jedes Bewohners ist `f(Same, t)` (`stamm/siedlung-bewohner.js:1881-1887`, `:1926-1932`). Gegengelesen: die Lage folgt `(w − tag.ab) mod 24` (`:1894`), der Tag wiederholt sich also, und die Ankunft spielt nur die letzten `ankunftH: 3` Stunden nach (`:3500`, `:1936`). Wer nach einem Jahr kommt, findet denselben Tag, keine gewachsene Welt; Bestand und Strom über Tage gibt es nicht.
- **Ferne Tiere** rechnen ihre Richtung nur jeden `aiDiv`-ten Frame, in den Bändern 1/1/3/6 bis 518 m (`stamm/dirigent-ankunft.js:1851-1854`, `stamm/kreatur-verhalten.js:3192-3245`). Das senkt Kosten, ist aber keine statistische Führung. Eine Statistik → Instanz-Verdichtung gibt es nirgends.
- **Ruhe ist Null** (`MEISTERKARTE.md:345`): In Ruhe hat jede Simulation 0 Einheiten. Gebot 7 gilt damit für die Zeit, für den Raum ist es ungemessen.
- **Perfekter Cache nach Schlüssel.** `seed|chunk|lod|gesetzVersion` ist Norm (`das-feld-zeichnet.md:58-64`), IDB-Treffer werden gezählt (`stamm/gelaende-chunks.js:881`). Trotzdem dauert die Ankunft kalt 11–17 s. Der Schlüssel trägt `gesetzVersion`: ein Gesetzes-Wechsel verwirft den Cache, was die Welt nach dem Wechsel zeigt, misst niemand (L8 Sprosse 4).
- **Der Same ist nicht EINE Quelle (Gebot 4 verletzt).** Die Rückfall-Saat `"anazh-realm-seed"` steht 45× in 17 Dateien von `stamm/` (gegengelesen; das Blatt sagte 48× in 19), z. B. `stamm/siedlung-ort.js` (6×), `stamm/vegetation-baum.js` (6×), also als stiller Zwilling, wenn `worldMeta.seed` fehlt. Hash-Konstanten (FNV, `Math.imul(h,31|131)`, `0x9e3779b9`) kommen 103× in 28 Dateien vor (nicht gegengelesen). Es gibt keine zentrale, zählerbasierte Pfad-Ableitung `h(Same, Pfad)`.
- **`Math.random()` steht 17× in 5 Dateien von `stamm/`** (gegengelesen): `speicher-welten.js` 7×, `siedlung-bewohner.js` 4× (Rauch-Teilchen, `:94-104`), `netz-p2p.js` 3×, `klang.js` 2×, `feld-leben.js` 1×. Der Treffer in `feld-leben.js` liegt in einem Gesetz, das L1 Sprosse 2 trägt, und ist ungeprüft.
- **Raum (L3):** Ein Ursprungs-Versatz fehlt. Gegengelesen: der einzige Treffer nach Ursprung/origin/rebase in `stamm/` ist ein Kommentar in `netz-p2p.js:2126` über einen Peer, der sichtbar im Weltursprung stand, kein Versatz. Die Welt ist eine Ebene ohne Krümmung, die Ferne reicht 8 km. Wo float32 zu zittern beginnt, ist nie gemessen.
- **Unterscheidbarkeit (L6):** nichts gemessen. R11 der alten Karte verlangt ≥ 8 Seeds nur für Richtungs-Proben (`MEISTERKARTE.md:35`), nie für Vielfalt.
- **Sprung (L7):** Teleport 1 km, p95 33,77 ms (Radeon) und 49,9 ms (GTX), die Welt steht nach 14–45 s (`MEISTERKARTE.md:1022`, Streaming K3 1/2, gegengelesen).
- **Gedächtnis (L8) und Kopplung nach oben (L9):** Welt-Datei 1041 B und Fusion 1146 B belegen kleine Akten headless (`MEISTERKARTE.md:964-965`); Taten im Bild nach dem Reload, Bytes je Tat und das Überleben einer Gesetzes-Version sind nie gemessen. Eine Tat, die ihren Elternknoten verschiebt, gibt es nirgends gemessen.

## Abhängigkeiten

- **Maßstab-Kontinuum: vom Korn zur Galaxie.** Teilt L3 und L5. Dieses Blatt misst die Architektur (Raum, Verdichtung, Kosten), jenes die Erscheinung je Skala.
- **Ankunft, Geräte und Zugang.** L7 Sprossen 2–4 sind dieselbe Zahl wie dort die Ankunft. Hier zählt der Sprung an eine nie besuchte Koordinate, dort Kalt- und Warm-Boot.
- **Millionen: Bevölkerung, Masse und Strom.** Liefert den Inhalt, den L2, L4 und L5 tragen müssen. Hier zählt nur, dass Masse den Schirm nicht teurer macht und ohne Zuschauer widerspruchsfrei bleibt.
- **Städte und Architektur.** L2 Sprossen 5–6 (Tokio-Maß, Hyperstadt) und L6 Sprosse 4 brauchen deren Gesetze; hier zählt nur, dass die Masse den Preis hält und im Blindtest besteht.
- **Tiefe Zeit** und **Menschenzeit:** L4 Sprossen 5–6, L1 Sprosse 6 und L9 Sprosse 6 brauchen deren Gesetze. Hier wird nur die Verdichtung über die Zeit gemessen.
- **Himmel, Sonnensysteme und fremde Welten:** L3 Sprossen 6–7, L7 Sprosse 5, L9 Sprosse 7.
- **Spur, Verfall und Gedächtnis der Welt:** L8 ist die Architektur-Seite davon (Bytes, Dauer, Versionen); jenes Blatt misst, wie die Spur aussieht und verfällt.
- **Kopplung, Kaskade und Katastrophe:** L9 ist die Architektur-Seite davon (Kopplung nach oben ohne wachsenden Zustand); die Kaskaden selbst (Vulkan → Küste → Stadt → Verkehr) richtet jenes Blatt.
- **Licht, Bild und Horizont:** Die Kosten-Steigung von L2 hängt an der Bild-Pipeline. Dieses Blatt richtet die Steigung und den Blindtest gegen Fotos, nicht jeden Bildwert.
- **Evolution und fremdes Leben**, **Architektur**, **Fahrzeuge:** liefern die Gesetze, an denen L6 misst.
- **Innere Reihenfolge:** zuerst EINE Ableitung `h(Same, Pfad)` (der Rückfall-Zwilling fällt, `Math.random` verlässt jedes Gesetz), dann L1 Sprosse 3 (Bild-Gleichheit) und L8 Sprosse 1 (Taten im Bild). Ohne das ist keine Stichprobe von L4 bis L9 reproduzierbar.

## Was die alte Karte hier misst

- **Feld K2, Gleich für alle (2/2)** → L1 Sprossen 1–2 (`MEISTERKARTE.md:344`).
- **Feld K3, Ruhe ist Null (2/2)** → Preis-Achse von L4 (Abwesenheit kostet nichts) (`:345`).
- **Ultiversum K2, Fusion deterministisch (2/2)** → L1 Sprosse 7 (Teilaspekt) und L8 Sprosse 1 (Stand) (`:964`).
- **Ultiversum K3, Bibliothek je Gesetz ≤ 8 KB, Welt 1041 B (2/2)** → Stand von L8 (Bytes der Akten) (`:965`). Die Bibliotheks-Größe ist Bauweise, darum keine eigene Sprosse.
- **Streaming K3, der Sprung hält die Kadenz (1/2)** → L7 Sprossen 1–2 (`:1022`).
- **Streaming K1/K2, Lücke und Bereitschaft vor Bedarf (0/2)** → L3 Lücken-Maß (`:1020-1021`).
- **LOD 17, Kette ohne Pop (3/10)** → L5 Sprossen 1–2 (`:657`).
- **Ankunft K1, kalt ≤ 5 s (0/2)** → L7 Sprosse 4 (`:995`).
- **Mensch K2 Staffel 2, Tag = f(Same, t)** → L4 Sprosse 1 (`stamm/siedlung-bewohner.js:1881`).
- **„Das Feld zeichnet“ Stufe 1, Tri-Zensus ≤ 8M** → wird zu L2. Gemessen wird die Steigung der Kosten gegen den Weltinhalt, nicht die Dreiecke (`das-feld-zeichnet.md:33`).
- **Ohne Kriterium in der alten Karte:** Unterscheidbarkeit (L6), Koordinatenraum (L3), Statistik → Instanz (L5 ab Sprosse 3), Zeitsprung (L4 Sprosse 6), Gedächtnis über Versionen (L8 ab Sprosse 2), Kopplung nach oben (L9).

## Zweifel

- **Der Richter von L6 ist der größte Zweifel.** Die „effektive Zahl unterscheidbarer Cluster“ hängt am gewählten Bildmodell und an der Schwelle aus einem Menschen-Blindtest. Ein anderes Modell ergibt eine andere Zahl. Die Schwelle muss einmal mit Menschen geeicht und dann eingefroren werden, sonst wird das Maß selbst zum Stellhebel. Dasselbe gilt für alle Blindtests „≥ 40 % Foto“ in L2: ohne geeichte, eingefrorene Prüfer-Gruppe sind sie keine Richter.
- **Der Zuschauer-Vergleich in L4 ist ab 10^6 nicht mehr voll fahrbar.** Ein Lauf, in dem jemand eine Metropole ein Jahr lang beobachtet, ist zu teuer. Ab Sprosse 3 gilt er nur an Stichproben und ist darum ein statistisches Urteil, kein exaktes.
- **Die Toleranzen sind geraten:** 10 % in L5, 1 % Klassen-Diff in L1, Kosten-Steigung ≤ 1,10 in L2, ±50 % gegen Pinatubo in L9. Sie folgen keiner Wahrnehmungsforschung.
- **L3 Sprosse 1 ist als HEUTE gesetzt, ohne dass die Grenze gemessen ist.** Der fehlende Ursprungs-Versatz ist nur per Grep belegt. Ob die Welt bei 10 km oder bei 50 km zu zittern beginnt, weiß niemand.
- **Die bedingte Stichprobe als EIN Same ist eine These, L9 ist ihr Prüfstein.** Ob eine Akte ihren Elternknoten verschieben kann, ohne dass der Speicher mit der Welt wächst, ist offen. Wenn nicht, stehen L8 Sprosse 3 und L9 im Widerspruch, und die Karte zeigt es.
- **Einige Belege sind nur gelesen, nicht im Spiel gesehen.** L1 Sprosse 2 und L4 Sprosse 1 stehen in Quelle und alter Karte, aber nicht im Bild. Die Abwesenheits-Probe in L4 ist so nie gefahren worden.

## Gegenlese — was sich änderte und was strittig bleibt

- **Gehoben:** L2 trug als Gipfel der Städte eine Metropole von 10^7 Menschen, also Tokio, nicht „Tokio ein Witz dagegen“. Sprosse 5 ist jetzt das Tokio-Maß, Sprosse 6 eine Hyperstadt mit 10^9 Menschen über 1.000 km. L6 Sprosse 7 verlangt 10^4 Welten, davon ≥ 30 % fremder als jede Erd-Epoche und trotzdem glaubhaft („Planeten, die unsere Vorstellung kaum zu bauen vermag“).
- **Bauweise aus den Richtern:** „Fern-Ring 8 km, Detail 384 m“ (L2/1), „ohne Ursprungs-Versatz“ (L3/1), „Studio-Mesh → Karte → Impostor“ (L5/1) schrieben den Weg vor; sie stehen jetzt als Sicht bzw. im Stand.
- **Tiefe nachgetragen:** L2 Sprossen 2, 4, 5, 6 maßen nur die Kosten-Steigung; jetzt steht daneben ein Blindtest gegen Fotos, sonst gewinnt die leere Stadt.
- **Doppelt:** L2 Sprosse 6 (Orbit → Straße, längster Frame ≤ 50 ms) und L3 Sprosse 5 waren dieselbe Prüfung; sie sind in L3/5 vereint. Der Äonen-Sprung stand mit „≤ 5 s“ in L4/6 und mit „≤ 3 s“ in L7/6 — jetzt richtet nur L7/6.
- **Neu:** L8 Gedächtnis (Bytes je Tat, Überleben über Gesetzes-Versionen — No Man's Sky zeigt, dass „für immer gleich“ am Gesetz bricht, nicht am Samen) und L9 Kopplung nach oben (das Kind verschiebt den Elternknoten; R7 verlangt es, die Zweifel des Blatts nannten es, keine Leiter maß es).
- **Stand berichtigt:** Rückfall-Saat 45× in 17 Dateien statt 48× in 19; der Bewohner-Tag ist periodisch (mod 24) und die Ankunft spielt nur 3 h nach — L4/1 ist Gesetz, keine gewachsene Welt; `Math.random` 17× bestätigt, verteilt auf 5 Dateien, einer davon in `feld-leben.js`.
- **Fleiß statt Fähigkeit:** L6 zählte je von Hand gelisteter Klasse; jetzt je Gesetz, und Rauschen ohne benennbares Merkmal bildet keinen Cluster.
- **Strittig bleibt:** L1 Sprossen 5–7 werden mit der Weltgröße nicht schwerer, wenn `h(Same, Pfad)` rein ist — die eigentliche Schwelle sind GPU-Fließkomma und Gesetzes-Version (L8/4); die Blindtest-Richter brauchen eine geeichte Prüfer-Gruppe, die es nicht gibt; L9 Sprosse 4–7 könnte im Blatt „Kopplung, Kaskade und Katastrophe“ doppelt stehen.
