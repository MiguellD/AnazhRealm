# Leben im Wasser

## Die Vision hier

Der Ozean ist der größte Lebensraum des Planeten. Er hält weit über 90 % des bewohnbaren Raums, und das Spiel macht ihn genau so groß, wie er ist: eine durchgehende Wassersäule vom Sonnenlicht bis in 11 km Tiefe auf jedem Planeten des Samens, ohne Ladekante. Ein Bachkolk ist zu wenig. Planktonblüten färben das Meer vom Orbit aus sichtbar grün und milchig-türkis, weil Auftrieb, Licht und Jahreszeit sie dort hinstellen. Korallenriffe wachsen über Jahrtausende Polyp für Polyp zu Atollen, Kelpwälder schwanken in der Dünung, und ein Sardinenzug aus Milliarden Leibern wird von Delfinen, Tölpeln und Walen zugleich gejagt. Ein toter Wal sinkt und nährt 50 Jahre lang eine Gemeinschaft auf dem Meeresboden. An den schwarzen Rauchern lebt alles von Chemie statt von Licht. Der Thunfisch, der Hai und der Ichthyosaurier finden dieselbe Spindelform, weil dasselbe Wasser sie verlangt — und auf fremden Planeten findet ein fremdes Leben sie wieder, unter dem Eis eines Mondes, aus denselben Gesetzen von Licht, Druck, Salz und Strömung. Das Meer ernährt Fischerdörfer und Hafen-Megastädte, und man taucht durch die Meere des Kambriums, der Kreide und der Gegenwart. Millionen Arten je Planet, Billiarden Individuen, jede Tiefe betauchbar: aus EINEM Samen, im Browser, bei 33 ms.

## Das Beste der Gegenwart

- **Abzû** (Giant Squid 2016) zeigt Tausende Fische in Schwärmen mit Räuber und Beute in Echtzeit. Die Grenze: handgebaute Szenen, Arten als Assets, kein Nahrungsnetz, keine Zeit.
- **Subnautica 2** (Unknown Worlds, Early Access Mai 2026) hat laut Fan-Wikis 43–51 Kreatur-Archetypen in handgebauten Biomen mit Nahrungskette und Leviathanen. Die Grenze: eine Karte, Dutzende Arten, Mod-Ökosysteme tragen etwa 50 Tiere mit voller KI ([wikily.gg](https://wikily.gg/subnautica-2/creatures/), [CurseForge Deep Ecosystem](https://www.curseforge.com/subnautica-2/ue4ss-mods/deep-ecosystem)).
- **Endless Ocean Luminous** (Arika/Nintendo 2024) hat einen prozedural variierten Meeresboden und Hunderte Arten aus einem Katalog. Die Grenze: Arten sind Assets, das Verhalten ist dekorativ, ohne Kopplung.
- **Beyond Blue** (E-Line 2020): Wale und Delfine mit Verhalten nach dokumentarischer Vorlage (Blue Planet II). Die Grenze: kleine Gebiete, gescriptet.
- **GPU-Schwarm-Forschung** (Erra, Frola, Scarano & Couzin 2009): ein individuenbasiertes Fischschwarm-Modell mit Millionen Fischen auf der GPU, die Nachbarsuche über ein Gitter. Die Grenze: Forschungslauf ohne Bild und ohne Welt ([Konstanz](https://kops.uni-konstanz.de/entities/publication/f1973214-dc6d-429e-9f85-2438aff54dbe/full)).
- **Korallen-Wachstumsmodelle** (Kaandorp et al.; Chindapol et al. 2013): Akkretion aus Polypen. Die Wuchsform (Ast, Platte, Kugel) entsteht aus Strömung und Nährstoff-Diffusion, die einzige artspezifische Zahl ist die Polypengröße. Eine Bremer Arbeit erzeugt so bis 1000 Korallen in einem immersiven Riff ([PMC3542083](https://pmc.ncbi.nlm.nih.gov/articles/PMC3542083), [Uni Bremen](https://cgvr.cs.uni-bremen.de/theses/finishedtheses/coralreef/index.shtml)).
- **Schwimm-Biomechanik**: die Strouhal-Zahl St = f·A/U (Schlagfrequenz × Ausschlag / Tempo) liegt bei schwimmenden und fliegenden Tieren über Größenordnungen der Körperlänge im Band 0,2–0,4 (Taylor, Nudds & Thomas 2003); die Schwimmweisen (anguilliform bis thunniform, Rückstoß, Flossenflug) folgen der Körperform. Das ist ein Richter, der an jeder erfundenen Art gilt.
- **Die Wirklichkeit**: ca. 230 000–250 000 beschriebene Meeresarten, geschätzt 0,7–2,2 Mio. eukaryotische (Mora et al. 2011: ~91 % unbeschrieben), dazu etwa 2000 Neubeschreibungen im Jahr ([Yale e360](https://e360.yale.edu/digest/as-many-as-80-percent-of-planets-marine-species-still-unknown), [The Conversation](https://theconversation.com/how-many-undiscovered-creatures-are-there-in-the-ocean-86705)). Die Meeres-Ökoregionen der Erde: 12 Reiche, 62 Provinzen, 232 Ökoregionen (Spalding et al. 2007, MEOW). Antarktischer Krill allein zählt in der Größenordnung 10¹⁴ Tiere. Das Phytoplankton trägt etwa die Hälfte der Primärproduktion der Erde. Hydrothermalquellen kennt man seit 1977 (Galápagos-Graben).

## Der Same

**Leben ist eine Funktion des Wasserkörpers: Licht(z) × Nährstoff(Auftrieb, Mündung) × Temperatur × Salz × Druck × Strömung → Primärproduktion → Größenspektrum der Räuber.** Das EINE Prinzip ist das **Größenspektrum** (Sheldon 1972: in jeder logarithmischen Größenklasse vom Plankton bis zum Wal steckt etwa gleich viel Biomasse) über einem **Nischenfeld** aus den Kernen von Ozean und Atmosphäre. Daraus folgen Ort, Dichte, Körpergröße und Räuber-Beute-Paarung jeder Art. Die Art selbst ist ein Punkt im Bauplan-Raum (Körperform aus Hydrodynamik, Farbe aus Lichtklima und Tiefe), ihr Verhalten der Verbands-Zug (Couzin) plus Nahrungs- und Fluchtgradient, ihre Schwimmweise aus Körperform und Reynolds-Zahl.

Gelöst haben das fremde Branchen. Die **Fischerei- und Ozeanmodellierung** (Größenspektrum-Modelle wie mizer, Ecopath/EwE, NPZ-Planktonmodelle in den Klimamodellen der CMIP-Generation) rechnet Ozeane genau so: Biomasse je Größenklasse und Zelle, ohne einzelne Fische. Die **Fernerkundung** (Ozeanfarbe, Chlorophyll aus Satellitendaten) liefert das Bild, an dem der Same gerichtet wird. Die **Computergrafik der Massen** liefert den Übergang vom Fernfeld zum einzelnen Leib vor dem Auge. Der Same verbindet die drei: fern ist das Meer Biomasse je Zelle, nah wird es Individuum, und beides ist dieselbe Zahl.

**Der Preis, einmal definiert (gilt in JEDER Sprosse, R3):** P = Bild p95 ≤ 33 ms · Ankunft ≤ 5 s · 0 B Download, auf Radeon 890M UND GTX 1060, **gemessen im selben Lauf und an derselben Pose wie der Richter der Sprosse** — am dichtesten Ort, den die Sprosse verlangt (Köderball, Riff, Krillwolke), nie an einem leeren Ort daneben. Eine Sprosse, deren Richter grün ist, während P an einer anderen Pose gemessen wurde, steht nicht.

## Die Leitern

### L1 Arten aus dem Samen: wie viele unterscheidbare Wasser-Arten eine Saat hervorbringt, wie viele zugleich im Bild stehen und ob sie den Gesetzen der Ökologie gehorchen

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel, misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 0 | 1 Art (Bachforelle) | Leib als Doppelkeil, Farbe fest | ungemessen (Beleg headless) | Zahl der Wasser-Arten im Bild (Klassen-Maske `tier:fisch`) | HEUTE, Preis offen |
| 1 | 10 Arten je Saat, ≥ 3 zugleich im Bild | Silhouette als Gattung lesbar | P am Bach und an der Küste | Blindtest: 10 Bilder im Spiel, Zuordnung zur Foto-Referenz der Gattung ≥ 80 % | |
| 2 | 100 Arten aus ≥ 5 Stämmen (Fisch, Weichtier, Nesseltier, Krebs, Säuger) | die Form folgt dem Tempo der Lebensweise | P | an 100 Saaten aus den Silhouetten im Bild: Rangkorrelation Schlankheit (Länge/Höhe) ↔ Reisetempo ≥ 0,6; schnelle Hochseejäger im Band 3,5–5,5 | |
| 3 | 1 000 Arten je Planet, ≥ 30 Arten zugleich im Bild am Riff | Farbe und Leuchten folgen dem Lichtklima (Rot in der Tiefe, Gegenschattierung im Freiwasser) | P am Riff mit ≥ 30 Arten im Bild | 50 Bilder je Tiefenzone: ein auf realen Fotos trainierter Klassifikator ordnet die Zone ≥ 80 % richtig zu | |
| 4 | 10⁴ Arten je Planet, ≥ 100 Arten zugleich im Bild am artenreichsten Riff | Häufigkeit gehorcht den Gesetzen: Arten-Fläche S = c·A^z, Rang-Häufigkeit lognormal, Tropen > Pol | P am artenreichsten Riff | Zählung längs Transekten im Spiel: z im Band 0,15–0,4; Breitengradient Rangkorrelation zum realen OBIS-Gradienten ≥ 0,7 | |
| 5 | 10⁵ Arten je Planet, Endemiten je Becken | Konvergenz: getrennte Linien finden dieselbe Lösung (Hai, Thun, Ichthyosaurier, Delfin) | P; Saat-Wechsel ≤ 5 s | 200 Saaten: in ≥ 80 % entsteht die spindelförmige Hochsee-Jägerform in ≥ 2 getrennten Linien; Artenwechsel zwischen getrennten Becken > innerhalb eines Beckens | |
| 6 | 10⁶–10⁷ Arten je Planet (Erd-Maß mit Kleinstleben), ohne Decke über Planeten und Epochen | jede Art mit eigener, lesbarer Lebensweise | P; jede Saat ≤ 5 s | 1000 zufällige Arten je Saat: ein Unterscheider trennt sie paarweise ≥ 95 %; ≥ 90 % zeigen in 60 s Beobachtung eine Lebensweise (Fressen, Fliehen, Schwärmen, Lauern), die ein Beobachter ohne Hilfe benennt | |

### L2 Masse: wie viele Wasser-Lebewesen der Spieler zugleich erlebt

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 0 | ~30 Fische binnen 40 m, Trupps zu 1–4 | einzeln, kein Schwarm | ungemessen (headless) | Fische im Bild am Bach | HEUTE, Preis offen |
| 1 | 300 im Bild, ein Schwarm | ausgerichtet und geschlossen | P mit 300 im Bild | Polarisation ≥ 0,8 und Kohäsion ≥ 0,9, gemessen aus den gezeichneten Leibern | |
| 2 | 3 000 im Bild, ein Köderball | Räuber teilen den Schwarm (Fontäne, Vakuole) | P am Köderball während des Angriffs | Bildvergleich gegen Unterwasser-Film eines Köderballs: Konvexität und Lückenfläche im Band der Referenz | |
| 3 | 30 000 im Bild | die Fluchtwelle läuft mit realer Geschwindigkeit durch den Schwarm | P während der Welle | Laufzeit der Fluchtwelle in m/s, ± 30 % zum Feldmaß | |
| 4 | 300 000 im Sichtkegel (Krill, Sardinen) | keine sichtbare Kante zwischen nahen Leibern und ferner Wolke | P bei Fahrt durch die Wolke | Bild-Flicker an der Sichtgrenze < 1 % der Pixel bei Fahrt; Dichte beim Heranschwimmen ± 10 % | |
| 5 | 3 Mio. im Sichtkegel, ein Zug über 10 km | Jäger aus Luft und Wasser zugleich | P aus 500 m Höhe und im Zug | Draufsicht aus 500 m gegen Luftbild des Sardine Run: Strangform und Fleckigkeit im Band | |
| 6 | Krill-Maß: 10¹⁴ Leiber auf dem Planeten, jeder nah betauchbar | die gezählte Dichte stimmt auf jeder Höhe | P als p95 über die ganze Fahrt | Zoom vom Orbit bis zur Taucherbrille in einer Fahrt: Dichte je Zelle konsistent ± 10 % über alle Stufen, keine Ladepause | |

### L3 Lebensräume: welcher Anteil der Wasser-Lebensräume aus der Physik einer Saat entsteht, ohne benannt zu werden

Die Messliste (15 Klassen): Bach, See, Küstenflachwasser, Ästuar, Kelpwald, Seegraswiese, Mangrove, Korallenriff, offene See, Polarmeer unter Eis, Tiefsee-Ebene, Hydrothermalquelle, Walfall, Höhle und Höhlenwasser, Gezeitenzone.

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 0 | 1 von 15: der Bach-Kolk | Stand am Strömungsschatten (Fausch 1984) | ungemessen | Lebensräume mit eigener Fauna im Spiel zählen | HEUTE, Preis offen |
| 1 | 3 von 15: Bach, See, Küstenflachwasser | See-Fauna ohne Strömung, Ufer-Zonierung | P je Lebensraum | Bildpaar je Lebensraum: Klassifikator erkennt ihn ≥ 80 % | |
| 2 | 7 von 15: dazu Kelpwald, Seegras, Mangrove, Gezeitenzone | sie stehen dort, wo die Physik sie verlangt | P im Kelpwald | 50 Saaten: Kelp auf Küsten < 20 °C mit Auftrieb ≥ 90 %, Mangrove nur in tropischer Gezeitenzone ≥ 90 % | |
| 3 | 11 von 15: dazu Riff, offene See, Polarmeer, Ästuar | das Riff nur, wo es warm, klar und flach ist | P am Riff | 50 Saaten: Fehlplatzierung < 5 % der Riff-Fläche; Klassifikator erkennt das Riff im Bild ≥ 80 % | |
| 4 | 15 von 15, auch die dunklen | Leben ohne Licht von Chemie, Biolumineszenz | P im Abstieg | Abstieg 0 → 4000 m: Faunenwechsel je Zone gegen das Referenz-Profil (Epi-, Meso-, Bathy-, Abyssopelagial) | |
| 5 | Erd-Maß: Provinzen und Ökoregionen | Grenzen folgen Temperatur, Salz, Licht, Tiefe | P | 200 Saaten: Lebensraum-Karte gegen das Nischenfeld, Fehlplatzierung < 5 %; je erdähnlicher Saat 30–100 unterscheidbare Provinzen (Erde 62) | |
| 6 | fremde Ozeane: Methan-Seen, Ozeane unter Eis, Superdruck-Meere | eigene Lebensräume aus fremder Chemie, durch dieselben Gesetze | P je Saat | ≥ 50 % der fremden Saaten mit einem bewohnten Lebensraum, der kein Erd-Lebensraum ist; 0 % bewohnte Zonen ohne Energiequelle (Licht oder Chemie) | |

### L4 Das Bild unter Wasser: wie wahr Licht, Trübe und Leib aussehen

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 0 | Sicht unter Wasser 19,6 m am Bach; 3 Wasserkörper (Bach, See, Fluss) | Absorption und Rückstreuung je Kanal (Gordon 1975); das Meer liest den See-Körper | ungemessen | Sichtweite in m an einer festen Pose | HEUTE, Preis offen |
| 1 | Fischleib als Art lesbar (heute Oktaeder) | Flossen, Schuppenglanz, Seitenlinie | P 1 m vor einem Schwarm | Bildpaar 1 m vor dem Fisch gegen Foto: im Blindtest als Fischart erkannt ≥ 80 % | |
| 2 | Lichtfinger und Kaustik im Flachwasser | sie folgen Welle und Sonnenstand | P bei Seegang | Richtung der Lichtfinger ± 5° zur Sonne; Kontrast-Spektrum der Kaustik im Band des Unterwasser-Fotos bei gleichem Seegang | |
| 3 | Wasserfarbe je Ort: alle 14 Jerlov-Typen (5 ozeanisch, 9 küstennah) | Plankton und Schwebstoff AM ORT färben das Wasser, Mündung trübt | P | Farbmessung im Spiel gegen die Jerlov-Klasse des Orts: ΔE ≤ 10 je Typ | |
| 4 | Tiefe 0 → 1000 m | Rot fällt, dann Grün, dann alles; Biolumineszenz trägt die Dunkelheit | P im Abstieg | Spektrum am Auge je 100 m gegen gemessenes Ozean-Profil, Fehler ≤ 20 % | |
| 5 | Riff und Kelpwald im Nahbild | Tausende Formen und Farben je Bild, Meeresschnee | P am Riff | Bildpaar Riff gegen Referenz-Foto: Panel unterscheidet Spiel und Foto in ≤ 60 % | |
| 6 | jedes Wasserbild jedes Planeten | Fotorealismus unter jeder Sonne und Chemie | P je Szene | erdähnlich: blinder Test Spiel gegen Foto über 100 Szenen, Trefferquote ≤ 55 %; fremd: gegen offline spektrales Path-Tracing derselben Szene ΔE ≤ 5 | |

### L5 Das Nahrungsnetz: wie weit eine Ursache im Wasser durch das Leben läuft

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 0 | 1 Kante: Strömung → Fischstand | eine umgedrehte Strömung dreht die Fische | ungemessen | Ausrichtung gegen die sichtbare Strömung ≥ 0,8, auch nach Umkehr | HEUTE, Preis offen |
| 1 | 2 Kanten: Pegel und Spieler → Fisch | Fische folgen dem Pegel und fliehen | P | Fisch-Hub ≥ 0,8 × Pegel-Hub, Fluchtabstand ≥ 3 m | Umfang und Tiefe gehalten (headless), Preis offen |
| 2 | Licht × Nährstoff → Plankton-Feld | Blüte im Frühjahr, wo Auftrieb oder Mündung Nährstoff bringt | P im Zeitraffer | Chlorophyll-Feld über ein Spieljahr gegen eine Satellitenzeitreihe der Ozeanfarbe: Phasenlage der Blüte ± 1 Monat | |
| 3 | Plankton → Schwarmfisch → Räuber | Fischdichte folgt der Primärproduktion | P | räumliche Korrelation Fischbiomasse zu Plankton-Feld r ≥ 0,6 an N = 50 Orten | |
| 4 | volles Größenspektrum vom Plankton bis zum Wal | Biomasse je logarithmischer Größenklasse etwa gleich (Sheldon) | P | normalisiertes Biomasse-Spektrum (Biomasse je Größen-Intervall über Größe, log-log): Steigung −1 ± 0,2 | |
| 5 | Kaskaden: Seeotter ↔ Seeigel ↔ Kelp, Überfischung → Quallen | eine Störung läuft 3 Glieder weit | P im Zeitraffer | Räuber entfernen: Kelpfläche fällt über Spielzeit nach dem Muster der Feldstudien (Estes & Palmisano 1974) | |
| 6 | Planet: Wal-Pumpe, Walfall, Sauerstoff, CO₂, Nährstoff-Kreislauf | Leben formt die Atmosphäre und die Küste | P im Zeitraffer | Störung an einem Ort (Vulkan, Abfluss, Fang), Messung 5 Glieder weiter in Biomasse, Wasserfarbe und Küstenform: ≥ 4 von 5 ändern sich beobachtbar | |

### L6 Zeit im Wasser: über welche Zeitspannen das Wasserleben wahr wirkt

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 0 | Sekunden: Schwanzschlag, Flucht, Heimkehr nach 8 s | keine Tagesuhr für Fische | ungemessen | Fisch kehrt nach Ruhezeit heim ≥ 60 % | HEUTE, Preis offen |
| 1 | Tag: Vertikalwanderung (die größte tägliche Tierwanderung der Erde) | Zooplankton steigt nachts, sinkt am Tag | P | Tiefe der Streuschicht Mittag gegen Mitternacht, Hub ≥ 200 m wie in Echolot-Profilen | |
| 2 | Jahr: Blüte, Laichzug, Walwanderung | Lachse ziehen flussauf, Wale zwischen Pol und Tropen | P im Zeitraffer | Zeitraffer eines Spieljahrs: Ankunft der Züge in ihrem Monat ± 1 | |
| 3 | Jahrzehnt: Walfall-Sukzession, Riff-Bleiche und Erholung | Sukzession in 3 Stadien am Kadaver | P im Zeitraffer | 3 Stadien in Reihenfolge, Dauer ± 50 % zur Feldbeobachtung | |
| 4 | Jahrtausend: Riff wächst, Atoll entsteht (Saum → Barriere → Atoll) | Riffwachstum mm–cm/Jahr, folgt Meeresspiegel und Senkung | P; Zeitsprung ≤ 5 s | Zeitreise 10 000 Jahre an einer Küste: Riffdicke gegen Akkretionsraten; Rifftyp in Draufsicht gegen Satelliten-Referenz ≥ 75 % richtig | |
| 5 | Äonen: jede Periode seit dem Kambrium (≥ 12) und die Stromatolithen davor, bereisbar | Fauna je Epoche (Trilobiten, Ammoniten, Ichthyosaurier) entsteht aus den Gesetzen der Epoche, nicht aus einem Katalog | P; Zeitsprung ≤ 5 s | Panel ordnet 20 Unterwasserbilder ihrer Epoche ≥ 70 % richtig zu; Artenzahl über die Perioden folgt der Form der Sepkoski-Kurve (Rangkorrelation ≥ 0,6) | |
| 6 | fremde Zeitlinien: Meeresleben fremder Planeten über ihre ganze Geschichte | eigene Radiationen, Massensterben, Neubesiedlung | P; Zeitsprung ≤ 5 s | 100 fremde Saaten über 1 Mrd. Jahre: ≥ 80 % mit sichtbarer Radiation und Aussterbe-Ereignis; Erholungszeit nach dem Sterben im Band der Erde (5–10 Mio. Jahre, ± Faktor 3) | |

### L7 Der Leib in Bewegung: wie wahr Wasserwesen schwimmen (NEU)

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 0 | 1 Leib, starr | der ganze Körper pendelt in der Gier, 2,5 Hz, ± 0,1 rad | ungemessen | Schlagfrequenz im Bild | HEUTE, Preis offen |
| 1 | 1 Schwimmweise (carangiform) | der Leib biegt sich als Welle, die Frequenz folgt dem Tempo | P mit 300 Leibern | aus dem Bild: Strouhal-Zahl St = f·A/U im Band 0,2–0,4 | |
| 2 | 5 Schwimmweisen aus der Körperform: Aal, Barsch, Thun, Rückstoß, Flossenflug | die Weise entsteht aus dem Leib, nicht aus einer Zuweisung | P mit 3 000 Leibern | Blindtest Videos: Beobachter ordnet die Weise ≥ 80 %; St im Band bei ≥ 90 % der Leiber | |
| 3 | Säuger, Vögel, Reptilien im Wasser | Wal-Fluke, Delfin-Sprung, Tölpel-Stoßtauchen, Robbe | P | Sprungbahn ballistisch ± 10 %; St im Band; Stoßtauch-Eintritt gegen Hochgeschwindigkeits-Film im Bildvergleich | |
| 4 | das Wasser antwortet | Bugwelle, Blasen, aufgewirbeltes Sediment, Kelp weicht aus | P am Riff | Bildpaar mit und ohne Tier: die Spur ist sichtbar und folgt der Bahn ± 0,5 m | |
| 5 | 1000 zufällige Arten je Saat | jede schwimmt nach ihrem Leib | P | ≥ 95 % der 1000 Arten mit St im Band und einer Weise, die ihrer Schlankheit entspricht | |
| 6 | 3 Größenordnungen der Körperlänge, fremde Medien (dichtes Methan, Superdruck) | Bewegung skaliert mit der Reynolds-Zahl: Kleinstes kriecht ohne Gleiten, Großes gleitet | P je Saat | Gleitstrecke nach Schlag-Stopp gegen die Re-Theorie ± 30 % über alle Größen und Medien | |

### L8 Meer, Küste und Mensch: wie weit das Wasserleben die Welt der Menschen formt (NEU, R7)

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 0 | keine Kopplung | Fische und Siedlung kennen sich nicht (kein Fischer, kein Hafen in Kern oder Stamm) | — | Kopplungen Meer → Mensch zählen | HEUTE |
| 1 | der Spieler fischt | der Fang folgt der Fischdichte am Ort | P | Fang je Stunde gegen Dichte an 20 Orten r ≥ 0,6 | |
| 2 | Fischerdörfer entstehen | ihre Lage folgt den Fischgründen | P am Dorf | 50 Saaten: ≥ 70 % der Fischerdörfer an den produktivsten Drittel der Küste | |
| 3 | Bewohner leben vom Meer | Boote fahren aus, der Markt trägt den Fang, Menge folgt Bestand | P mit Flotte im Bild | Fangmenge am Markt gegen Bestand des Jahres r ≥ 0,6 | |
| 4 | Überfischung | der Bestand fällt, die Flotte wandert, die Kaskade (L5.5) wird sichtbar | P im Zeitraffer | Eingriff Fangdruck ×3: Bestand und Flottenwege ändern sich in Richtung der Fischerei-Modelle | |
| 5 | Hafen-Megastadt am Meer | Häfen, Aquakultur, Fernhandel; Stadtgröße folgt Ertrag und Lage | P im Hafen | Rangkorrelation Küstenstadt-Größe ↔ Meeres-Ertrag + Hafengunst ≥ 0,6 an 50 Saaten | |
| 6 | alle Epochen und Planeten: Muschelhaufen der Steinzeit bis Tiefsee-Siedlung | Fischerei-Technik je Epoche, fremde Kulturen an fremden Meeren | P; Zeitsprung ≤ 5 s | Zeitreise: Panel ordnet Fischerei und Hafen ihrer Epoche ≥ 70 % richtig zu | |

## Stand heute

- **Eine Art, ein Lebensraum.** `FISCH_GESETZ` ist eine Bachforelle (*Salmo trutta*, 0,3 m) als Doppelkeil (Oktaeder) mit fester Farbe 0x6b6a52 (`tetrapoda-core.js:2668-2690`, nachgeprüft). Stände gibt es nur im fließenden Wasser zwischen 0,05 und 1,6 m/s (`minMs`/`haltMs`, `:2675-2676`). See und Tümpel kennen nur eine Kreisbahn ohne Richtung (`kreisHz`, `:2719`). Der Schwanzschlag ist eine Gier des ganzen Leibs, 2,5 Hz ± 0,1 rad (`:2685-2686`). Gezeichnet wird binnen 48 m (`nahM`) über `_fischTakt` (`stamm/kreatur-fauna.js:461`, nachgeprüft).
- **Gemessen** (MEISTERKARTE.md:532, d3708675, **headless**): Bach mit 1,027 m/s, 28 Fische binnen 40 m, Ausrichtung gegen die Strömung 0,955; Flucht auf ≥ 3 m, 12 heim; Pegel-Folge 0,335 → 0,363 der Säule; unter Wasser Sicht 19,56 m, 9 von 16 Fischen im Bild. **Ein Preis an einer Fisch-Pose auf Radeon oder GTX ist nicht gemessen** — darum steht Sprosse 0 überall nur mit Umfang und Tiefe, der Preis offen. Gemessen auf der GTX ist nur der Vogelschwarm (0,175 ms, 100 Glieder, :534).
- **Schwarm-Gesetz vorhanden, aber nur für Vögel**: `verbandZug` mit Φ 0,967 bei 100 Gliedern (MEISTERKARTE.md:531). Fischschwärme, Köderbälle und Räuber im Wasser: nichts.
- **Das Meer existiert als Höhe und als Wasserkörper, nicht als Lebensraum**: Meeresspiegel bei Basis − 3 m (`gelaende-core.js:33`, `:2682`, nachgeprüft), eine Bathymetrie der Basis-Höhe, ein sanfter Tiefsee-Clamp bei base − 120 m (`:1865`, nachgeprüft). Das Unterwasser-Licht hat Absorption und Rückstreuung je Kanal nach Gordon 1975 (`stamm/bild-sicht.js:217`, nachgeprüft).
- **Berichtigt — Plankton und Wasserfarbe sind nicht ganz null**: der Wasser-Körper kennt drei feste Zeilen `see`, `fluss`, `bach` mit Lichtabfall und Strahl-Schwächung je Kanal, und der Kommentar nennt das Plankton des Sees ausdrücklich als Ursache seiner Trübe (`foundry-core.js:163-172`). Welche Zeile gilt, urteilt `gewaesserArt` — ohne Laufbreite ist es immer `see` (`gelaende-core.js:760-762`), also liest auch das Meer den See-Körper. Das ist eine Konstante je Gewässerart, kein Plankton-Feld am Ort: L4.3 hat einen Keim (3 von 14 Farb-Typen, und keiner davon ozeanisch), L5.2 nicht.
- **Gar nicht vorhanden**: Plankton als Feld, Korallen, Kelp, Seegras, Wale, Tiefsee-Fauna, Hydrothermalquellen, Biolumineszenz, Nahrungsnetz, marine Wanderungen, Körperwelle beim Schwimmen, Fischerei und Häfen (kein Treffer für Fischer, Hafen, Fang im Sinne von Fischfang in Kernen und Stamm). „Korallen" tritt nur als Prüfer-Vergleich für Laub auf (`phyto-core.js:621`).
- **Einordnung**: L1, L2, L3, L5, L6 und L7 stehen auf Sprosse 0, aber ohne gemessenen Preis — nach R3 streng genommen also unter Sprosse 0. L4 steht auf 0 mit einem Keim zu 3. L8 steht auf 0 = nichts. Gegen die Vision (10⁶–10⁷ Arten, 10¹⁴ Individuen, 15 Lebensräume, Äonen, Hafen-Megastädte) ist das in jeder Leiter weniger als ein Millionstel.

## Abhängigkeiten

- **Ozean, Wasser und Eis**: zuerst. Das Leben braucht eine Wassersäule mit Temperatur, Salz, Strömung, Auftrieb und Tiefe. Heute gibt es Strömung nur in Bach und Fluss (`_waterFlowAt`), kein 3D-Ozean. Ohne diese Leiter stehen L3 ab Sprosse 2, L4.3 und L5 ab Sprosse 2 nicht.
- **Atmosphäre, Wetter und Klima**: Licht, Jahreszeit und Wind treiben Blüte und Auftrieb (L5.2, L6.2).
- **Planet und Geologie**: Hydrothermalquellen, Riffsockel und Inselsenkung (L3.4, L6.4).
- **Tiere und Verhalten**: gleiches Verbands-Gesetz, Flucht und Jagd; L7 ist der Wasser-Teil der Fortbewegung.
- **Evolution und fremdes Leben**: der Bauplan-Raum der Arten (L1.5, L1.6, L6.5, L6.6). Dieses Blatt misst die Wasser-Arten, die Evolution ihre Herkunft. Die Konvergenz-Probe (L1.5) gehört beiden.
- **Ökosysteme, Kreisläufe und Zerfall**: L5 ist der Wasser-Teil davon, Walfall und Meeresschnee koppeln an deren Zerfall.
- **Licht, Bild und Horizont**: Kaustik, Spektrum in der Tiefe und Biolumineszenz (L4).
- **Millionen: Bevölkerung, Masse und Strom**: der Übergang Leib ↔ Wolke (L2.4–L2.6) ist dieselbe Aufgabe wie bei Menschenmengen.
- **Städte, Wirtschaft und Kultur**: L8 koppelt Fischgründe an Dörfer, Märkte und Hafenstädte.
- **Der Spieler: Perspektive, Rolle und Reise**: Tauchen, U-Boot, Tiefe ohne Ladekante, Fischen (L8.1). Schwimmen und Tauchen stehen in Leib-H1 der alten Karte.
- **Klang**: Walgesang, Knacken des Riffs, Echolot — der Wasser-Teil von „gesehen = gehört" fehlt hier und gehört ins Klang-Blatt.
- **Tiefe Zeit** und **Menschenzeit**: Zeitreise in die Meere der Epochen (L6.5) und in die Fischerei der Epochen (L8.6).

## Was die alte Karte hier misst

Bereich 12 „Leben in Luft und Wasser", 10/10 (MEISTERKARTE.md:517-538):
- **K3 Fische lesen die Strömung (2/2)** wird L5 Sprosse 0 und 1 sowie L2 Sprosse 0 — gemessen headless, der Preis an der Pose steht offen.
- **K2 Schwärme aus dem Verbands-Gesetz (2/2, Vögel)** wird für Wasser L2 Sprosse 1 (das Gesetz liegt vor, der Wasser-Leser fehlt).
- **K5 Ein Schwarm ist fern EIN Agent (2/2)** ist ein Preis-Beleg für Vögel; für Wasser ist er der Weg zu L2 Sprosse 4, nicht ihr Richter.
- **Gelände K3 / H2 Wasser-Bild an allen 12 Posen** (MEISTERKARTE.md:87, :244) und **Material H3 Spiegel** (:624) tragen die Oberfläche, nicht das Leben darunter. Sie sind die Bühne von L4 Sprosse 2.
- **Leib H1 Schwimmen und Tauchen** (:897) ist der Zugang zu allen Sprossen ab L3.1.

Die alte Karte gab 10/10 für einen Bach mit Forellen. Gegen diese Vision ist das Sprosse 0 von acht Leitern, und auch die nur ohne gemessenen Preis.

## Zweifel

- **Größter Zweifel**: Der Richter von L1.6 („Lebensweise ohne Hilfe benennbar") bleibt ein Urteil. Die Gesetzes-Richter (Arten-Fläche, Rang-Häufigkeit, Konvergenz, Strouhal) prüfen, ob die Arten GESETZEN gehorchen — nicht, ob sie staunen lassen. Das Staunen hat keinen Richter (R6) und steht als offene Frage.
- Die Preisspalte für 3 Mio. Leiber im Sichtkegel (L2.5) und 10¹⁴ auf dem Planeten (L2.6) ist durch nichts belegt. Erra et al. liefern Millionen auf der GPU, aber ohne Bild.
- Die Spielbeispiele sind Fan-Wikis (Subnautica-2-Zählung 43 gegen 51) und Erinnerung (Endless Ocean Luminous, Beyond Blue), nicht frisch belegt.
- Sheldons Größenspektrum als „EIN Same" ist eine Wette. Es erzeugt Biomasse und Größe, aber nicht Gestalt; die Gestalt kommt aus dem Bauplan-Raum, die Bewegung aus der Reynolds-Zahl. Es könnten drei Gesetze sein, die sich ein Nischenfeld teilen.
- Die Grenze zu „Ozean", „Ökosysteme" und „Evolution" ist unscharf: L5 und L6.5/L6.6 könnten dort doppelt zählen.
- L8 ist Kopplung und könnte ganz ins Städte-Blatt wandern; hier steht sie, weil der Täter (der Fischbestand) hier lebt.
- Das Feldmaß der Fluchtwelle (L2.3) und die Erholungszeit nach Massensterben (L6.6) sind als Bänder aus Erinnerung gesetzt und vor dem ersten Messen gegen die Literatur zu schärfen.

## Gegenlese — was sich änderte und was strittig bleibt

- **Preis**: „dto." ersetzt durch EIN definiertes P, gemessen im selben Lauf und an der Pose des Richters (am dichtesten Ort). Sprosse 0 aller Leitern trug „≤ 33 ms" ohne Messung — der Beleg ist headless; jetzt „Preis offen".
- **Stand berichtigt**: Plankton und Wasserfarbe sind nicht null — drei feste Wasserkörper (`foundry-core.js:163-172`), das Meer liest den See-Körper (`gelaende-core.js:760-762`); L4.3 hat einen Keim. Die Zeilen von `FISCH_GESETZ`, `_fischTakt`, Meeresspiegel und Gordon-Licht stimmen.
- **Höher**: L1 oben 10⁶–10⁷ je Planet ohne Decke über Planeten und Epochen; L2 oben Krill-Maß 10¹⁴; L6.5 jede Periode seit dem Kambrium mit Zeitsprung ≤ 5 s; L1.3–L1.4 messen auch die Arten ZUGLEICH im Bild (dort zahlt der Preis, nicht in der Planetenzahl).
- **Richter vom Bauweg befreit**: „Φ aus `verbandZug`", „gegen `_waterFlowAt`", „nah Individuum, fern Biomasse-Feld", „Punkt im Bauplan-Raum" ersetzt durch Messungen am Bild.
- **Fähigkeit statt Fleiß**: L1.2/L1.4/L1.5 richten jetzt über Gesetze, die jede erfundene Fauna erfüllen muss (Schlankheit ↔ Tempo, Arten-Fläche z, Konvergenz in getrennten Linien) statt über Panel-Plausibilität; L3 misst den Anteil der 15 Lebensräume, die aus der Physik entstehen, statt sie aufzuzählen; L4.6 fremd gegen offline Path-Tracing statt gegen ein Foto, das es nicht gibt.
- **Fachfehler**: L5.4 sprach von „log Biomasse über log Größe −1" — bei Sheldon ist die Biomasse je log-Klasse flach; −1 gilt für das normalisierte Spektrum. Berichtigt.
- **Doppelt**: L3.3 (Riffform aus Senkung) und L6.4 (Atoll im Jahrtausend) waren dieselbe Leiter — der Rifftyp lebt jetzt nur in L6.4. L2.0 und L5.0 maßen beide die Rheotaxis — L2.0 zählt jetzt nur Masse.
- **Neu**: L7 Der Leib in Bewegung (Strouhal, Schwimmweisen, Reynolds) und L8 Meer, Küste und Mensch (R7-Kopplung). Klang unter Wasser fehlt weiter und ist ans Klang-Blatt verwiesen.
- **Strittig**: Panel-Richter bleiben in L1.6, L4.5, L6.5, L8.6; ob 15 Lebensraum-Klassen die richtige Messliste sind (statt MEOW-Provinzen) und ob L8 hierher gehört.
