# Licht, Bild und Horizont

## Die Vision hier

Das Bild ist kein Effekt über der Welt, sondern ihr Zeuge: dasselbe EINE Licht, das die Sonne durch die Luft schickt, fällt auf Stein, Haut, Glas und Lava, springt zwischen Häuserschluchten, glüht aus Milliarden Fenstern und streut als Glocke über Megastädten, gegen die Tokio ein Dorf ist. Vom Gipfel eines Vulkans sieht der Spieler 500 km weit über Küste, Metropole und Wetterfronten, mit der Krümmung des Planeten, der Brechung der Luft und Regenvorhängen 80 km entfernt — und alles in der Ferne ist dieselbe Welt, die er erreichen kann, keine Kulisse: fliegt er hin, steht dort, was er sah. Aus dem Orbit trägt die Nachtseite das Lichtnetz einer Zivilisation, und am Himmel steht der Nachbarplanet, den man bereisen kann. Reist er durch die Zeit, wechselt das Licht mit: Lagerfeuer unter einer Milchstraße ohne Lichtglocke, Gaslicht, Glühlampe, LED. Er taucht unter Wasser, wo das Rot nach wenigen Metern stirbt, fliegt durch eine Wolke, tritt aus einer Lavaröhre in die Mittagssonne, und das Auge folgt wie ein Auge. Auf fremden Welten gilt dasselbe Gesetz mit anderer Luft: blaue Abende auf einer Staubwelt, orangener Dunst auf einer Methanwelt, zwei Sonnen, zwei Schatten. Und das alles in 33 ms auf einem Laptop, im Browser, ohne Download, also ohne gebackene Lichtkarten und ohne fotografierte Texturen.

## Das Beste der Gegenwart

- **Cyberpunk 2077 RT Overdrive** (Pfadverfolgung mit ReSTIR DI/GI, NVIDIA GDC 2024, Patch 2.1): Night City mit Tausenden emissiven Quellen, die jeweils Licht und Schatten werfen. Grenze: verlangt eine RTX-Oberklasse plus Upscaling und Frame-Generation; eine handgebaute Stadt von wenigen km², Hunderte GB Assets.
- **Unreal Engine 5.5 MegaLights** (Epic, SIGGRAPH Advances 2025): über tausend schattenwerfende Lichter auf PS5, Kosten konstant, Qualität fällt mit der Lichtzahl. Grenze: braucht Hardware-Raytracing und virtuelle Schattenkarten; Inhalte gebaut, nicht gewachsen.
- **Hillaire-Atmosphäre** (Eurographics 2020, in Unreal und Fortnite): Himmel und Luftperspektive vom Boden bis zum Orbit aus vier kleinen Tafeln, etwa 1 ms auf einem iPhone 6s (Sekundärquelle). Stand der Kunst für die Luft. Grenze: Einfachstreuung plus Näherung der Mehrfachstreuung, keine Brechung, Wolken getrennt.
- **Microsoft Flight Simulator 2024**: ein ganzer Planet mit Fernsicht über Hunderte km und Nachtlichtern aus Daten. Grenze: Streaming von Petabytes; die Nachtlichter sind gemalte Punkte, kein Licht.
- **Die Wirklichkeit, Fernsicht**: 493 km längste fotografierte Sichtlinie (Guinness, Dezember 2024), 443 km Pyrenäen → Alpen (2016); Brechung bei Inversion trägt den Blick über den geometrischen Horizont.
- **Die Wirklichkeit, Nacht**: VIIRS Black Marble (seit 2012) und das DMSP-OLS-Archiv (seit 1992) messen Städte aus dem Orbit über drei Jahrzehnte — eine gemessene Referenz für die Nachtseite eines Planeten UND für ihr Wachsen über Epochen. Die Bortle-Skala und Walker's Law koppeln Stadtgröße an Himmelshelligkeit.
- **Die Wirklichkeit, fremde Himmel**: die blaue Abenddämmerung des Mars ist von Rovern fotografiert, Titans Dunst von Huygens — echte Bilder fremder Luft als Richter.
- **Grenze aller**: kein Titel zeigt eine Stadt mit über 10⁶ eigenständigen Lichtern, Vulkanglut, Wetter in der Ferne und Orbit in EINEM Bild, und keiner kann das ohne Gigabytes an Daten.

## Der Same

**Das Licht als Strahlungstransport durch EIN Medium, gespeist nur von Quellen, die die Welt selbst setzt, gesehen durch EIN Auge.** Jede Leuchtdichte im Bild ist ein Integral: Emission (Sonne, Sterne, Magma, Feuer, jedes Fenster, das ein Bewohner einschaltet, jede Lampe ihrer Epoche) × Durchgang durch das Medium (Luft, Wolke, Asche, Wasser, mit seiner Dichte aus Wetter, Geologie und Meer) × Antwort der Fläche (Albedo, Rauheit, Glut aus der Stoff-Zeile, die selbst aus Geologie, Pflanze und Kultur folgt) — und am Ende das Auge, das diese Leuchtdichte belichtet. Weil die Quellen Weltzustand sind und nicht Licht-Objekte, zählt die Stadt ihre Millionen Lichter von selbst. Weil das Medium eines ist, sind Dunst, Regenvorhang, Aschefahne, Unterwasser-Blau und Stadtglocke dasselbe Gesetz bei anderer Dichte. Weil der Stoff aus Gesetzen folgt, gibt es keine Liste von Materialien, sondern einen Raum.

Gelöst haben das fremde Branchen: die **Atmosphärenphysik und Fernerkundung** (Strahlungstransport-Codes wie libRadtran oder MODTRAN), die **Meeresoptik** (Jerlov-Wassertypen, Absorption je Wellenlänge), die **Film-Pfadverfolgung** (kalibrierte Kameras, gemessene BRDFs), die **Lichtplanung und Astronomie** (Walker's Law, Bortle, Tageslichtquotient im Innenraum) und die **Wahrnehmungsphysiologie** (Adaption, Blendung). Die Kunst ist, dieses Integral in 33 ms auf ein Laptop zu bringen: Viele-Lichter-Stichproben für die Nähe, Tafeln für die Luft, und für die Ferne die Statistik der Quellen statt der Quellen selbst.

## Die Leitern

**Der Preis jeder Sprosse** (R3) ist, wo nicht anders genannt, **P = Bild p95 ≤ 33 ms · Ankunft ≤ 5 s kalt · 0 MB Download, an beiden Standardgeräten (Radeon 890M, GTX 1060)** — gemessen in DERSELBEN Pose, in der der Richter urteilt. Eine Sprosse, deren Bild nur bei 50 ms trägt, ist nicht gehalten. Für Sprossen, die Flug oder Reise verlangen, kommt **P+Flug** hinzu: kein Bild > 33 ms über die ganze Fahrt, kein Ladebild.

**Die Stichprobe** (R4): wo „Anteil von N Saaten" steht, zieht der Richter N zufällige Welt-Saaten und je eine zufällige Pose (Ort, Uhr, Wetter, Saison), nie eine gewählte Schau-Pose.

### L1 · Fernsicht: die Ferne ist dieselbe Welt
Misst die größte Entfernung, bis zu der das Bild der Ferne der Welt GLEICHT, die man dort betritt. Der Kern-Richter heißt **Ferne = Nähe**: ein Ziel im Abstand d wird fotografiert, dann wird hingeflogen und dasselbe Ziel aus der Nähe auf die Winkelauflösung des Fernbilds verkleinert; nach Abzug der Luft (Koschmieder je Kanal) müssen beide Bilder gleich sein (Struktur-Ähnlichkeit ≥ 0,8, Mittelwert ΔE ≤ 5). Das misst das Ergebnis — keine Bauweise, keine Ringgröße.

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | 0,2 km | Relief und Bewuchs bis zum Nahrand, Luft wirkt | P | Restkontrast je Kanal gegen Koschmieder bei 0,2 km, T/T_soll 0,8–1,2; Ferne = Nähe ≥ 0,8 an 12 Posen | |
| 2 | 2 km | Relief, Wald und Häuser mit Luft, kein Umschlag beim Näherkommen | P | Gang auf ein Ziel aus 2 km: kein Bildsprung > 5 % Leuchtdichte im Zielfenster über die ganze Annäherung; Ferne = Nähe ≥ 0,8 | |
| 3 | 8 km | Relief bis zum Horizont mit Luft nach Koschmieder, Welt ohne Kante | P | T/T_soll 0,86–1,08, Restkontrast ≤ 1,3 % am Rand; Ferne = Nähe für Relief ≥ 0,8 | **HEUTE** für Relief allein; Wald und Siedlung enden vor 8 km, Ferne = Nähe für sie ungemessen |
| 4 | 25 km | Wald auf Graten, Stadt als Silhouette mit Dachlinie, Flüsse spiegeln, Abendschatten der Grate | P | Ferne = Nähe ≥ 0,8 für Wald- und Stadt-Ziele aus 25 km in 100 Saaten (Anteil ≥ 0,9) | |
| 5 | 100 km | Wetter in der Ferne: Regenvorhang, Gewitterturm, Wolkenschatten auf dem Land — und es regnet dort, wenn man hinfliegt | P + Flug | Anteil von 100 Saaten, in denen das in der Ferne gesehene Wetter bei Ankunft (≤ Flugzeit) dort herrscht ≥ 0,9; 2AFC Fernbild gegen Foto ≤ 60 % | |
| 6 | 500 km | Gipfelblick über Vulkan, Küste und Megastadt mit Erdkrümmung und Brechung, bei Nacht als Lichtteppich | P | Horizontabsenkung ±0,05° gegen Kugelgeometrie mit Standard-Refraktion; Ferne = Nähe ≥ 0,8 für einen 500-km-Zielgipfel; Sichtbarkeit wie bei den Rekordfotos (443/493 km) ja/nein | |
| 7 | Planet | Boden → Orbit ohne Ladebild, Tag/Nacht-Grenze, Wolkenbänder, Stadtnetz; jeder Punkt der Kugel anfliegbar | P + Flug | Ferne = Nähe vom Orbit auf 20 zufällige Landepunkte ≥ 0,8; Blue-/Black-Marble-Statistik (Farbverteilung, Wolkenanteil, Lichtverteilung) KS ≤ 0,1 | |
| 8 | Sonnensystem | der Nachbarplanet und seine Monde am Himmel sind Welten, die man bereist; Phasen, Schatten, Finsternisse stimmen | P + Flug | Ferne = Nähe vom Boden (Fernrohr-Zoom) auf den Nachbarplaneten bei Ankunft ≥ 0,8; Phase und Finsternis-Zeitpunkt gegen Himmelsmechanik der Saat ±1 min | |

### L2 · Nacht: Lichter, die werfen
Misst, wie viele Quellen, die die Welt selbst setzt, gleichzeitig im Bild stehen — und zwar in der Nähe als LICHT (es fällt auf Boden, Wand, Körper und wirft Schatten), in der Ferne als wahre Statistik der Stadt. Ein Leuchtpunkt, der nichts beleuchtet, zählt in der Nähe nicht.

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | 1 Quelle | das nächste Feuer wirft Licht und Schatten, auch vom gehenden Spieler | P | Schatten-Kontrast ≥ 3:1 an einem Pfosten 2 m vom Feuer, Gasse in der Kelvin-Farbe der Quelle ±200 K | **HEUTE darunter**: Licht fällt, Schatten ROT 0,248:1 (Radeon, cec92db1) |
| 2 | 10² | Dorf bei Nacht: jede Quelle im 50-m-Umkreis beleuchtet ihren Boden, Nacht lesbar statt grau | P | Anteil der sichtbaren Quellen im 50-m-Umkreis, deren Bodenfleck ≥ 1 EV über der Umgebung liegt ≥ 0,9; Gassen-Histogramm gegen Fotosatz nächtlicher Gassen, ΔEV-Median ≤ 0,5 | |
| 3 | 10³ | Kleinstadt: Fenster gehen nach dem Leben ihrer Bewohner an und aus, Licht fällt auf die Straße | P | Anteil beleuchteter Fenster im Bild über die Nacht (20 Uhr → 4 Uhr) gegen gemessene Nachtgang-Kurven städtischer Fensterbeleuchtung ±0,1; Straße 5–30 lx im Bild | |
| 4 | 10⁴ | Viertel mit Verkehr: Scheinwerfer, Ampeln, Reklame, Spiegelstreifen auf nassem Asphalt | P | Bild-Statistik (Leuchtdichte-Histogramm, Länge der Spiegelstreifen) gegen Fotosatz nasser Nachtstraßen, ΔEV-Median ≤ 0,5; 2AFC ≤ 65 % | |
| 5 | 10⁵ | Großstadt aus 300 m Höhe: Lichtteppich, Hochhausflanken, Himmelsglocke | P | Himmelshelligkeit am Stadtrand gegen Walker's Law (Einwohner, Abstand) ±30 %, Bortle-Klasse ±1 | |
| 6 | 10⁷ | Tokio-Klasse (~37 Mio. Einwohner) aus dem Flugzeug, jedes Licht ein Weltzustand | P | Radianz je km² gegen VIIRS-Ausschnitte gleicher Siedlungsdichte, KS ≤ 0,1; Ferne = Nähe (L1) beim Sinkflug auf ein Viertel ≥ 0,8 | |
| 7 | 10⁸ | Megaregion größer als jede reale Stadt, dazu Vulkanglut, beides in einem Bild vom Gipfel | P | Anteil von 100 Saaten mit Stadt und Vulkan, deren Nachtbild-Statistik zur Black-Marble-Statistik extrapolierter Dichte passt ≥ 0,8 | |
| 8 | 10⁹–10¹⁰ | die Nachtseite eines Planeten über Epochen: Feuer der Vorzeit, Gas, Glühlampe, Natrium, LED; Milchstraße hell, wo keine Glocke steht | P + Flug | Nachtlicht-Statistik je Epoche gegen das DMSP/VIIRS-Archiv 1992 → heute (Wachstum, Spektral-Wechsel Natrium → LED) KS ≤ 0,1; Bortle-Klasse eines Ortes folgt seiner Epoche ±1 | |

### L3 · Fläche im wahren Licht
Misst, in welcher Szenen-Härte und über welchen Raum von Stoffen jede Fläche im Bild steht wie in der Wirklichkeit: Kontakt, Rückstrahlung, Innenraum, Schlucht, Glut. Stoff und Licht sind eine Leiter, weil das Bild sie nicht trennt (die alte Trennung „Licht" gegen „Stoff" war ein Richter der Bauweise). Die Breite der Stoffe wird nie als Liste gezählt, sondern als Stichprobe aus dem Stoff-Gesetz.

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | Wiese, 10² m² | Sonne und Himmel, Kontaktschatten scharf und weich mit Abstand; die Basis-Stoffe (Gras, Erde, Fels, Holz, Haut) mit Albedo im realen Band | P | Halbschatten-Breite gegen Abstand im Band; Albedo im Bild gegen Tabellenwert ±0,05 für die Basis-Stoffe | **HEUTE darunter**: Kontakt steht, Albedo-Band 0 |
| 2 | Dorf, 10⁴ m² | Schatten ruhig unter laufender Sonne, Boden strahlt zurück, Kontakt-Verdeckung, Nässe nach Regen | P | Flimmer-Anteil der Schattenkante je Bild ≤ 1 % im Gang; Wandunterseite / Sonnenseite gegen gemessene Rückstrahl-Verhältnisse ±20 %; Glanzspitze nach Regen gegen Foto | teilweise (Ruhe 1/2, Rückstrahl 1/2, Kontakt-Verdeckung 0) |
| 3 | Innenraum | Licht fällt durch Tür und Fenster, Raum ohne Lampe lesbar | P | Tageslichtquotient (Innen- / Außen-Beleuchtung) im Bild gegen gemessene Werte gleicher Fenstergröße (1–5 %) ±30 % | |
| 4 | Stadtschlucht, 10⁶ m² | 100 m hohe Fassaden: Mehrfachsprung, farbige Rückstrahlung, Glas spiegelt die Gegenseite | P | Leuchtdichte Schattenfassade / Sonnenfassade gegen Messwerte urbaner Schluchten ±20 %; Spiegelbild im Glas zeigt die Gegenfassade (Lage ±2 px) | |
| 5 | Stoff-Raum | Stoffe AUS dem Gesetz: Gestein aus der Geologie, Holz aus der Pflanze, Putz, Ziegel und Beton aus der Kultur der Epoche, mit Verwitterung | P | 100 zufällig gezogene Stoffe unter Normlicht: Anteil, dessen Albedo und Glanz im Band gemessener Datensätze (Albedo-Tafeln, MERL-Klasse) liegen, ΔE ≤ 5, ≥ 0,9 | |
| 6 | Glut und Asche | Magma nach Temperatur, erkaltende Lava, Aschewolke von unten rot | P | Glutfarbe gegen Schwarzkörper der Temperatur des Geologie-Gesetzes ΔE ≤ 5; Wolkenunterseite gegen Fotos aktiver Vulkane bei Nacht ΔE ≤ 10 | |
| 7 | 10¹⁰ m² × 24 h | Metropole und Landschaft zu jeder Stunde und jedem Wetter | P | Anteil von 288 Zufallsposen (12 Orte × 24 h), deren Bild-Statistik im Band des Fotosatzes gleicher Szene liegt ≥ 0,9 | |
| 8 | jeder Planet | fremde Mineralien und Lebensoberflächen, mehrere Sonnen | P | Anteil zufälliger Planeten-Stoffe mit Albedo und Glanz im physikalisch möglichen Band ≥ 0,95; Doppelschatten in Farbe der Sonnen | |

### L4 · Luft, Tag und Himmel
Misst die Treue des Himmels und der Luftperspektive als Stichprobe über den Zustandsraum Uhr × Wetter × Saison × Breite × Zeitalter × Planet. Umfang ist die Zahl der Achsen, über die gezogen wird — nicht eine Liste gebauter Zustände.

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | Mittag, klar | eine Atmosphäre (Rayleigh, Mie, Ozon) | P | Himmels-Leuchtdichte gegen gemessenen Klarhimmel ±0,3 EV | **HEUTE** (Atmosphäre steht, ungemessen gegen Klarhimmel) |
| 2 | × Uhr | die ganze Tag-Bahn monoton, golden, Nacht lesbar; Wolken mit Körper und Schatten | P | Belichtungskurve über 24 h gegen Referenzkurve, max. Abweichung ≤ 0,3 EV | ROT: +0,94 EV bei Uhr 0,33 (Radeon), −22 % golden (GTX) |
| 3 | × Wetter | Dunst, Nebel, Regen, Gewitter, Schnee als Dichte desselben Mediums, nahtlos | P | Sichtweite im Bild gegen gesetzte Sichtweite des Wetters ±15 %; kein Bildsprung beim Wetterwechsel | |
| 4 | × Saison × Breite | Polarnacht, Mitternachtssonne, Tropen, Wüstendunst | P | Anteil zufälliger (Breite, Tag, Uhr), deren All-Sky-Bild gegen Himmelsfoto-Datensätze ±0,3 EV hält ≥ 0,9 | |
| 5 | × Aerosol | Asche, Rauch, Smog aus Vulkan, Feuer und Stadt im selben Medium; Halo, Regenbogen, Polarlicht | P | Regenbogen bei 42° ±1°, Halo bei 22° ±1°; Abendrot nach einem Ausbruch gegen Beobachtungen nach großen Ausbrüchen (Farbe ΔE ≤ 10) | |
| 6 | × Zeitalter | Himmel früher Erden: dichte CO₂-Luft, junge schwächere Sonne, andere Tageslänge | P + Flug | Himmelsfarbe gegen Strahlungstransport-Referenz derselben Zusammensetzung ±0,3 EV, Anteil von 100 Zeitpunkten ≥ 0,9 | |
| 7 | × Planet | fremde Atmosphären jeder Zusammensetzung, mehrere Sonnen, Ringe, Monde | P + Flug | Mars-Abend gegen Rover-Fotos ±0,3 EV je Kanal (blaue Glocke um die Sonne); Anteil zufälliger Planeten-Saaten gegen Strahlungstransport-Referenz ±0,3 EV ≥ 0,9 | |

### L5 · Das Auge: Belichtung, Dynamik, Ruhe (neu)
Misst, ob das Bild sich verhält wie ein Auge in jeder Perspektive: vom Insekt im Gras bis zum Orbit, aus der Höhle in die Sonne, im Gehen, Fahren und Fliegen. Jede andere Leiter kann an dieser scheitern — eine wahre Welt, die flimmert, überstrahlt oder im Übergang ausbrennt, ist kein wahres Bild.

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | Gehen | kein Flimmern, kein Treppen-Kriechen an Kanten, Laub und Schatten | P | zeitliche Pixel-Varianz in ruhenden Bildbereichen beim Gehen ≤ 1 % der Fläche über Schwelle | teilweise (Schatten-Ruhe 1/2) |
| 2 | Tag ↔ Nacht, drinnen ↔ draußen | Belichtung gleitet wie ein Auge, nie Pumpen | P | Übergang Höhle → Mittagssonne: Anteil ausgebrannter Fläche ≤ 2 % nach 1 s; Hell → Dunkel ohne Belichtungs-Umkehr | Belichtungs-Gesetz mit Gleitung vorhanden (`BELICHTUNG`), ungemessen |
| 3 | 10⁻³ – 10⁵ cd/m² | Sterne, Mond, Laterne und Sonne im selben Lauf lesbar | P | in 20 Szenen über den ganzen Bereich: Anteil geklippter Fläche ≤ 2 %, Tonwertumfang im Band gegen kalibrierte HDR-Fotos | |
| 4 | Blendung | Gegenlicht, Scheinwerfer, Sonne im Wasser blenden wie im Auge, nicht wie ein Filter | P | Panel 2AFC gegen Fotos gleicher Blendsituation ≤ 65 % | |
| 5 | Fahren und Fliegen | 300 km/h im Wagen, 1 000 km/h im Flug, Bewegungsunschärfe nach Belichtungszeit, keine Nachzieh-Geister | P + Flug | Geister-Fläche (Bild gegen Referenz mit 16-fach Zeit-Abtastung) ≤ 1 % bei Vorbeifahrt | |
| 6 | jede Perspektive | Makro (1 cm über dem Boden), Riesenhöhe, Unterwasser, Orbit — dasselbe Auge | P | Anteil von 200 zufälligen Kameraposen über 10 Größenordnungen Höhe ohne sichtbaren Bruch (Panel oder Kanten-Linse) ≥ 0,9 | |

### L6 · Licht im dichten Medium: Wasser, Wolke, Höhle (neu)
Misst, wie wahr das Bild ist, wenn das Auge IN das Medium geht: unter Wasser, durch die Wolke, in die Lavaröhre. „Vom Meer bis zur Wüste" verlangt, dass die Hälfte der Planetenfläche nicht nur von oben glänzt.

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | Wasseroberfläche | Spiegelung nach Winkel, Durchsicht bei steilem Blick, Trübung nach Herkunft | P | Spiegel-Anteil im Bild gegen Fresnel bei 5 Blickwinkeln ±10 % | Spiegelung gebaut, ungemessen |
| 2 | Unterwasser 0–30 m | das Rot stirbt nach wenigen Metern, Blaugrün bleibt, Lichtschächte, Kaustiken am Boden | P | Farb-Abfall je Kanal mit der Tiefe gegen Jerlov-Wassertypen ±0,3 EV | fehlt (die Wasserfläche wird von unten nicht gezeichnet, `bild-sicht.js:1574`) |
| 3 | Wolke durchfliegen | Eintritt, Weiß-Aus, Austritt ohne Bruch; Sichtweite aus Flüssigwasser | P + Flug | Sichtweite im Bild gegen die Formel aus Wolkenwasser-Gehalt ±20 %; kein Bildsprung beim Eintritt | |
| 4 | Höhle, Lavaröhre | nur Glut, Fackel oder Öffnung beleuchten; Dunkel ist dunkel | P | Leuchtdichte-Abfall vom Eingang nach innen gegen gemessene Höhlenprofile ±0,5 EV | |
| 5 | Tiefsee | 1 000 m: Schwärze, Biolumineszenz als Quelle der Welt | P | Anteil sichtbarer Quellen, die Lebewesen der Saat setzen = 1; übriges Bild unter Wahrnehmungsschwelle | |
| 6 | fremde Ozeane | Methan-Meere, Ammoniak, Magma-Meere mit anderer Absorption | P | Anteil zufälliger Ozean-Saaten, deren Farbe gegen Strahlungstransport-Referenz ±0,3 EV hält ≥ 0,9 | |

### L7 · Ein wahres Bild: die Kopplung
Misst, wie viele gekoppelte Phänomene in EINEM Bild konsistent stehen (Vulkan formt Küste, Küste trägt Stadt, Stadt leuchtet, Wetter verschleiert, Meer spiegelt) und ob Menschen es vom Foto unterscheiden.

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | 2 Phänomene | Luft dunstet Relief; Gelände ändert seine Helligkeit nicht, wenn es von nah in fern wechselt | P | Gang über 2 km auf einen Hang: Leuchtdichte des Zielfensters springt an keinem Stufen-Wechsel um > 5 % | **HEUTE** (gleiche Helligkeit über alle Lichtwege gemessen, alte K3 = 1) |
| 2 | 4 | Dorf, Wald, Wasser und Himmel in einem Bild ohne Bruch | P | Panel-2AFC Spiel gegen Foto ähnlicher Landschaft ≤ 75 % | |
| 3 | 8 | Stadt, Küste, Meer, Wetterfront, Abendlicht | P | 2AFC ≤ 65 % | |
| 4 | 16 | Vulkan mit Glut und Fahne, Küstenstadt mit Lichtern, Spiegelung im Meer, Gewitter in der Ferne, bei Nacht | P | 2AFC ≤ 55 % gegen Fotos realer Vulkanküsten bei Nacht | |
| 5 | jede Pose jeder Saat | 100 zufällige Saaten × Pose, Uhr, Wetter, Epoche | P | Anteil der Stichproben, die ein Panel als Foto hält ≥ 0,4 (zufällig = 0,5) | |
| 6 | jenseits der Erde | Bilder fremder Welten | P | 2AFC gegen Sondenfotos (Mars, Titan) ≤ 55 % | |

## Stand heute

- **Atmosphäre**: die EINE Hillaire-Atmosphäre mit Rayleigh, Mie und Ozon (`welt-licht.js:211–265`, `:945`), Wolkenlicht nach τ und Mie-Asymmetrie (`welt-licht.js:859`). Die Tag-Bahn ist ROT: Radeon Uhr 0,33 +0,94 EV über Mittag, GTX Uhr 0,27 −22 % golden (MEISTERKARTE.md, M21).
- **Ferne**: Gelände-Ring bis ±8 km (`stamm/gelaende-fern.js:2123` `aussen: 8000`, geprüft), Koschmieder je Kanal T/T_soll 0,86–1,08, Restkontrast 1,0–1,3 % bei 17–22 km (REFERENZ-ATLAS.md:41–42). Wald-Saum auf Graten bis 8 km: 0. Die Wiese trägt bis ~20 m, Häuser lesen als weiße Kästen (Messung 14.11.). Ferne = Nähe ist nirgends gemessen.
- **Nacht (berichtigt)**: der Licht-Pool hat **4 Plätze im Umkreis von 48 m** (`stamm/stoff-material.js:3849`, `LICHT_POOL`), neu gewählt alle 0,25 s. Es WERFEN also höchstens 4 Quellen Licht zugleich; alle anderen Laternen und Fenster glühen nur. Die frühere Einordnung „10² Quellen HEUTE" stimmt nicht — L2 steht unter Sprosse 1. Der Feuer-Schatten ist GEBAUT (EIN Pool-Platz trägt einen Würfel-Schatten, `stamm/bild-schatten.js:383–391`, `LICHT_WURF`, gerufen in `dirigent-kern.js:1703`), aber gemessen ROT: 0,248:1 statt ≥ 3:1 an cec92db1. ~2 800 Sterne aus der Saat (`stamm/bild-himmel.js:318`, geprüft).
- **Schatten**: Kaskaden mit Bias aus der Texel-Kante (`stamm/bild-schatten.js`), Rückstrahl des Bodens. Kontakt-Verdeckung 0.
- **Stoff**: Material 5/10 (Albedo im realen Band 0, Mikro-Detail 1, Stufen 2, Spiegelung 1, Rauheit 1). Stoffe sind heute eine gebaute Tafel, kein Raum aus Gesetzen.
- **Auge**: ein Belichtungs-Gesetz mit Gleitung und Nacht-Stufe (`BELICHTUNG`, `bild-himmel.js:3292`), gegen keine Adaptions- oder HDR-Referenz gemessen.
- **Wasser**: Fresnel-Spiegelung an der Oberfläche; unter Wasser wird die Fläche nicht gezeichnet (`bild-sicht.js:1574`) — kein Unterwasser-Bild.

Zusammengefasst: das Licht hat das richtige Gesetz (EIN Medium) für einen Ort und einen Planeten, aber nur auf ~8 km Relief, 4 werfende Lichter (ohne haltenden Schatten), eine Stoff-Tafel statt eines Stoff-Raums, ohne Unterwasser. Auf der Vision-Skala (Sonnensystem, 10¹⁰ Lichter über Epochen, jeder Stoff jedes Planeten, jede Perspektive) liegt es 3–9 Größenordnungen darunter, und in drei Leitern (L2, L3, L6) unter der ersten Sprosse.

## Abhängigkeiten

- **Maßstab-Kontinuum** und **Der Same**: L1 ab Sprosse 4 braucht Inhalt in der Ferne aus demselben Gesetz; der Richter Ferne = Nähe macht jede Kulisse sichtbar.
- **Atmosphäre, Wetter und Klima**: liefert die Dichtefelder für L4, L1 Sprosse 5 und L6 Sprosse 3. Das Licht erfindet kein Wetter.
- **Planet und Geologie / Ozean**: Vulkanglut, Aschefahne, Wassertypen und Gestein sind Quellen, Medien und Stoffe für L3 Sprossen 5–6, L6 und L7.
- **Siedlung und Stadt · Millionen: Bevölkerung · Netze und Verkehr · Der Mensch**: jedes Licht in L2 ist ein Zustand dieser Perspektiven. L2 über 10³ steht erst, wenn es so viele Bewohner und Fahrzeuge gibt.
- **Tiefe Zeit und Epochen**: Lampen-Technik je Epoche (L2 Sprosse 8), Luft früher Erden (L4 Sprosse 6), Baustoffe je Kultur (L3 Sprosse 5).
- **Leben und Evolution**: Biolumineszenz (L6 Sprosse 5), Pflanzenoberflächen (L3).
- **Himmel, Sonnensysteme und fremde Welten**: Sonnenzahl, Spektren, Bahnen für L1 Sprosse 8, L4 Sprosse 7.
- **Ankunft, Geräte und Zugang**: der Preis P ist die Spalte, in der jede Sprosse hier scheitern kann. Viele-Lichter ohne Hardware-Raytracing ist die offene Technikfrage.
- **Abgrenzung**: dieses Blatt misst, was das Licht aus Quellen, Medien und Stoffen MACHT und was das Auge daraus sieht. Die Gesetze der Quellen gehören den anderen Blättern, ihre Kopplung im Bild gehört L7.

## Was die alte Karte hier misst

- **Bereich 13 Licht, Himmel, Wolken, Tag-Achse (4/10)**: K1 Tag-Kurve (0) → L4 Sprosse 2 · K2 Licht-Bilanz an einer Kugel (1) → L4 Sprosse 1 · K3 EIN Lichtweg (1) → L7 Sprosse 1 · K4 Wolken mit Körper (1) → L4 Sprosse 2 · K5 Wetter und Nacht im EINEN Medium (1) → L4 Sprosse 3.
- **Bereich 14 Ferne bis zum Horizont (6/10)**: K1 Koschmieder (2) und K2 keine Kante (2) → L1 Sprosse 3 · K3 Wald-Saum bis 8 km (0) und K4 Abendschatten der Grate (1) → L1 Sprosse 4 · K5 Ferne im Wetter (1) → L1 Sprosse 5.
- **Bereich 16 Schatten und indirektes Licht (4/10)**: K1 Kontakt (2) → L3 Sprosse 1 · K2 ruhig unter Bewegung (1) → L3 Sprosse 2 und L5 Sprosse 1 · K3 Kontakt-Verdeckung (0) und K4 Rückstrahl (1) → L3 Sprossen 2–3 · K5 Nachts wirft das Feuer (0) → L2 Sprosse 1.
- **Material-Tiefe (5/10)**: Albedo-Band (0) → L3 Sprosse 1 · Mikro-Detail, Stufen, Spiegelung, Rauheit → L3 Sprosse 2 (die Stoff-Breite wandert nach L3 Sprosse 5 als Stichprobe).
- Die alte Karte reicht damit bis Sprosse 1–4 von L1, L2, L3, L4, L7. L5 (Auge) und L6 (Medium) misst sie nicht; nichts oberhalb von 8 km, 4 werfenden Lichtern oder einem Planeten.

## Zweifel

- **Größter Zweifel**: ob der Richter „Panel-2AFC gegen Foto" (L7, L5 Sprosse 4, L1 Sprosse 5) R2 erfüllt. Er misst das Erlebnis, ist aber teuer und nicht in ≤ 3 min wiederholbar. Vorschlag: das Panel eicht einmal je Sprosse einen gelernten Bildabstand, der danach im Zug urteilt; der Punkt zählt erst mit dem Panel.
- **Ferne = Nähe** verlangt, dass die Welt an der Zielstelle beim Hinfliegen dieselbe ist — das prüft zugleich den Samen (Determinismus) und den Bild-Weg. Ob Verkleinern der Nahaufnahme ein fairer Vergleich ist (Mittelung von Licht ist nicht Mittelung von Stoff), ist offen.
- Die Lichtzahlen von L2 sind Größenordnungen aus Einwohner × Fenster; Tokio mit ~37 Mio. Einwohnern auf 10⁷ zu setzen ist Schätzung, kein Beleg. Die Nachtgang-Kurve der Fenster (L2 Sprosse 3) braucht einen Datensatz, den ich nicht geprüft habe.
- 500 km Fernsicht und eine Planeten-Nachtseite mit 10¹⁰ Quellen in 33 ms auf einem Laptop sind für keine Technik der Gegenwart belegt; ob L1 Sprosse 8 und L2 Sprosse 8 Punkte oder offene Fragen (R6) sind, entscheidet erst ein Spike.
- Die Hillaire-Zeitangabe (1 ms auf iPhone 6s) stammt aus einer Sekundärquelle.

## Gegenlese — was sich änderte und was strittig bleibt

- **Stand berichtigt**: L2 „10² Quellen HEUTE" war falsch — der Licht-Pool trägt 4 Plätze in 48 m (`stoff-material.js:3849`); L2 steht unter Sprosse 1. „Das Feuer wirft nicht" war halb wahr: der Wurf ist gebaut (`LICHT_WURF`), die Messung ist ROT (0,248:1). Ring ±8 km und 2 800 Sterne stimmen. L3 steht wegen Albedo-Band 0 knapp unter Sprosse 1, nicht auf 2.
- **Richter ersetzt, die Bauweise maßen**: „eine Fläche in Karte, Fern-Ring, Feld-Pass gleich hell" (Lichtwege = Bau) → Helligkeits-Sprung im Bild beim Annähern; „Fenster folgen dem Plan des Bewohners" (Simulation) → Fensteranteil im Bild gegen gemessene Nachtgänge; „Pfadverfolgungs-Referenz derselben Saat" (es gibt keinen solchen Renderer) → Tageslichtquotient, Fassaden-Verhältnis, Regenbogen-Winkel, Fresnel, Jerlov — messbare Wirklichkeit.
- **Gehoben**: L1 von „interplanetar" zu Sonnensystem mit Ferne = Nähe (der Nachbarplanet ist bereisbar); L2 auf 10⁷ für Tokio-Klasse und 10⁹–10¹⁰ über Epochen (gemessen am DMSP/VIIRS-Archiv); L4 bekam Zeitalter und Mars-Fotos als echten fremden Himmel.
- **Zusammengelegt**: L3 (Licht auf Flächen) und L4 (Stoff) waren dieselbe Leiter — das Bild trennt sie nicht. Die Stoff-Breite „10² / 10³ / 10⁴ Stoffe" maß Fleiß; jetzt EINE Sprosse als Stichprobe aus dem Stoff-Gesetz.
- **Neu**: L5 Das Auge (Flimmern, Adaption, Dynamik, Blendung, Fahrt, jede Perspektive) und L6 Licht im dichten Medium (Unterwasser, Wolke, Höhle, Tiefsee, fremde Ozeane).
- **Preis**: jede Sprosse trägt jetzt P (33 ms · 5 s · 0 MB, beide Geräte, in der Richter-Pose), Reise-Sprossen zusätzlich P+Flug; zuvor trugen die oberen Sprossen nur „33 ms".
- **Strittig**: das Panel als Richter (teuer, nicht im Zug); ob Ferne = Nähe durch Verkleinern fair ist; ob die obersten Sprossen von L1 und L2 vor einem Spike Punkte oder offene Fragen sind.
