# Klassen der Karte 2: was das Gesetz nicht sicher las

Erzeugt von `node vision/buche-2.cjs --klassen` (jeder Lauf schreibt das Blatt neu, nie von Hand ändern). Entscheid: `klasse` in
`vision/meisterkarte-2.json` setzen und `klasseGrund` auf `hand` — der nächste Lauf lässt sie stehen und zieht die Sprossen darüber nach.

## A · Erste Sprossen aus klasse-offen.json, die Regel 1 löst (4)

| Leiter | Umfang | Klasse | Grund |
| --- | --- | --- | --- |
| planet.geologie.platten | Region 10⁴ km² | Megastadt und Kontinent | zahl:10⁴ km² |
| planet.wetter.wolken | EINE Wolkenschicht 800 m, Karte ≈ 8 km | Stadt | zahl:8 km |
| planet.kosmos.kunstwelten | EIN Drehzylinder, 10 km | Stadt | zahl:10 km |
| erleben.spieler.wegfindung | Landmarke aus 1–3 km sichtbar | Stadt | zahl:3 km |

## B · Erste Sprossen, die leer bleiben (18) — darüber gilt bis zum Entscheid die sichere Lesart als Boden

| Leiter | Umfang | Boden | erben ihn | Grund |
| --- | --- | --- | --- | --- |
| planet.wasser.eis | Schnee einer Region | Ort | S 2 | „Schnee einer Region“ ohne Größe; die Klasse hängt an der Fläche, die der Text nicht nennt |
| planet.erde.gestalt | EINE Region der Erde, 10⁴ km² (ein Golf mit Vulkan) | Megastadt und Kontinent | — | Region 10⁴ km² (wie platten) UND der Erd-Schlüssel ≤ 10 kB: die Spalte Bytes der Zeile Ort verlangt 0 über das Skript, erst Planet und Welten zählt den Erd-Schlüssel mit |
| planet.kosmos.eigengesetz | EINE Welt, EINE Konstante anders (Schwere-Exponent, Stoff-Dichte, Zähigkeit) | Ort | — | EINE fremde Welt mit anderer Konstante: ein Welt-Wechsel; Ort oder Planet und Welten ist am Text nicht ablesbar |
| planet.kosmos.galaxien | EINE Nachbargalaxie als Ziel | Ort | — | Sprung zur Nachbargalaxie: der Umfang ist kosmisch (Planet und Welten), die Pose am Ziel ein Ort — zwei Lesarten |
| leben.evolution.fremde-physik | g 0,3–3 | Ort | S 2 | 50 Saaten je Schwere g 0,3–3: fremde Welten in Folge; ob die Zeile Ort je Saat oder Planet und Welten gilt, sagt der Text nicht |
| mensch.stadt.vertikal | 1 Ebene, Häuser bis 7 Geschosse | Ort | S 2, 3, 4, 5 | Umfang „1 Ebene, Häuser bis 7 Geschosse“ ohne Bauten-Zahl, Preis-Pose „Stadt“: Ort oder Stadt |
| mensch.stadt.breite | 1 Familie, 6 Regionen | Ort | S 2 | „1 Familie, 6 Regionen“, Richter erkennt die Region EINER Stadt, Preis-Pose „Stadt“: Ort oder Stadt |
| mensch.netz.gestalt | 1 Ort, ~10 km, 4 Klassen | Ort | — | „1 Ort, ~10 km“: das Wort sagt Ort, die Spanne Stadt (über 1 km Sicht) |
| mensch.wirtschaft.handel | 1 Ware, 1 Weg mit Fahrer | Ort | S 2, 3, 4, 5 | „1 Weg mit Fahrer“ ohne Länge, Preis-Pose „Stadt“: Ort oder Stadt |
| mensch.macht.grenze | 1 Herrschaftsgebiet | Ort | — | „1 Herrschaftsgebiet“ ohne Größe (Burg, Grenze im Bild = Karte) |
| mensch.kultur.gestalt | U_eff ≥ 10 (auch aus Liste) | Ort | S 2 | 10 Kulturen an Häuser-Bildern, Preis-Pose „Dorf und Stadt“: zwei Zeilen zugleich genannt |
| mensch.kultur.wissen | Technikstand je Ort | Ort | S 2, 3, 4 | „Technikstand je Ort“ über Orte jeder Größe (Bevölkerung × Vernetzung): die Klasse wechselt mit der Stichprobe |
| mensch.zeit.erde | EIN Ort, EINE Zeit (eine römische Stadt um 100) | Stadt | S 2, 3, 4, 5, 6 | „EIN Ort … eine römische Stadt um 100“: das Wort Ort gegen das Wort Stadt, dazu der Erd-Schlüssel ≤ 10 kB (Spalte Bytes) |
| erleben.spieler.nichtleib | EIN Ding der Welt: der Spieler ist ein Fluss | Ort | S 2 | „der Spieler ist ein Fluss“, 10 min entlang der Gefälle-Linie: die Länge des Laufs (und damit die Sicht) nennt der Text nicht |
| erleben.spieler.forscher | EIN Instrument: Fernrohr auf den Mond der Welt | Ort | S 2, 3, 4, 5, 6 | Fernrohr auf den Mond, verglichen mit dem Anflug an dieselbe Stelle: der Anflug ist ein Welt-Sprung (Planet und Welten), das Fernrohr ein Ort |
| planet.kopplung.land-meer-luft | 1 Gebirge | Ort | — | „1 Gebirge“, Luv/Lee an der Kammlinie: ein Gebirgszug misst über die Sicht von 1 km hinaus, Größe ungenannt |
| same.kopplung.erdsaat | 1 Ort, 1 Ereignis-Typ | Ort | S 2, 3, 4, 5, 6 | „1 Ort“ der Erd-Saat (Vesuv am Golf): der Erd-Schlüssel zählt erst in der Zeile Planet und Welten (Spalte Bytes), die Zeile Ort verlangt 0 |
| same.kopplung.terraform | EIN Eingriff, EINE Region: Wetter lenken über einer Stadt | Stadt | — | „EINE Region: Wetter lenken über einer Stadt“, Zielgebiet und Lee: Stadt oder größer |

## C · Unsichere Sprossen (97) — gesetzt ist die sichere Lesart, die andere steht daneben

| Leiter | S | Umfang | gesetzt | andere Lesart | Grund |
| --- | --- | --- | --- | --- | --- |
| planet.wasser.gezeiten | 7 | fremde Monde | Megastadt und Kontinent | Planet und Welten | Welt-Wechsel: „fremde Monde“ ohne Welt-Wort |
| planet.wasser.stroemung | 7 | fremde Ozeane | Megastadt und Kontinent | Planet und Welten | Welt-Wechsel: „fremde Ozeane“ ohne Welt-Wort |
| planet.wasser.tiefsee | 5 | jeder Meeresboden ~3,6·10⁸ km² | Megastadt und Kontinent | Planet und Welten | Planet-Maß: „3,6·10⁸ km²“ erreicht das Erd-Maß der Tafel umfangsKlassen, ohne Welt-Wort |
| planet.wasser.tiefsee | 6 | fremde Ozeane | Megastadt und Kontinent | Planet und Welten | Welt-Wechsel: „fremde Ozeane“ ohne Welt-Wort |
| planet.wetter.wolken | 2 | Himmel bis zum Horizont, drei Stockwerke | Stadt | Megastadt und Kontinent | Horizont: Sicht des Bilds (Zeile Megastadt und Kontinent) oder Reichweite des Gesetzes? |
| planet.wetter.extreme | 2 | Hitze- und Kältewelle, eine Region | Ort | Megastadt und Kontinent | „Region“ ohne Größe |
| planet.erde.gestalt | 2 | ein Kontinent | Megastadt und Kontinent | Planet und Welten | Erd-Schlüssel: die Erde als Saat mit Schlüssel zählt erst die Zeile Planet und Welten (Spalte Bytes) |
| planet.kosmos.sternhimmel | 2 | ~9 000 Sterne bis mag 6, Planeten wandern | Ort | Planet und Welten | Himmel oder Feld vom Boden aus: „Planeten“ neben „Sterne“ — Ding am Himmel oder Umfang? |
| planet.kosmos.sterne | 2 | alle Sterne eines Systems über 10¹⁰ a | Ort | Planet und Welten | Welt-Wechsel: „eines Systems“ ohne Welt-Wort |
| planet.kosmos.sterne | 6 | 10¹¹ Sterne über 10¹⁰ a | Ort | Planet und Welten | Träger Sterne: „10¹¹ Sterne“ — Himmel vom Boden aus oder Reise? |
| leben.pflanzen.jahreslauf | 4 | Region: Höhe und Breite verschieben den Kalender | Ort | Megastadt und Kontinent | „Region“ ohne Größe |
| leben.pflanzen.dichte | 4 | Horizont 10 km, Wald als Wald bis zum Kamm | Stadt | Megastadt und Kontinent | Horizont: Sicht des Bilds (Zeile Megastadt und Kontinent) oder Reichweite des Gesetzes? |
| leben.tiere.bewegung | 8 | fremde Schwere 0,1–5 g, dünne bis dichte Atmosphären, Flüssigkeiten jenseits Wasser | Ort | Planet und Welten | Welt-Wechsel: „fremde Schwere“ ohne Welt-Wort |
| leben.tiere.masse | 4 | 10⁴ | Ort | Stadt | Träger unklar: „10⁴“ zählt die Reihe Glieder (ab S2): Körper, die die Treppe nicht nennt — als Leiber gelesen Stadt |
| leben.tiere.masse | 5 | 10⁵: Gnu-Strom bis zum Horizont, Vogelfelsen, Krillwolke im Sichtkegel | Ort | Megastadt und Kontinent | Träger unklar: „10⁵“ zählt die Reihe Glieder (ab S2): Körper, die die Treppe nicht nennt — als Leiber gelesen Stadt · Horizont: Sicht des Bilds (Zeile Megastadt und Kontinent) oder Reichweite des Gesetzes? |
| leben.tiere.masse | 7 | 10⁹: Heuschreckenschwarm | Stadt | Megastadt und Kontinent | Träger unklar: „10⁹“ zählt die Reihe Glieder (ab S2): Körper, die die Treppe nicht nennt — als Leiber gelesen Megastadt und Kontinent |
| leben.wasser.lebensraeume | 7 | fremde Ozeane: Methan-Seen, Ozeane unter Eis, Superdruck-Meere | Ort | Planet und Welten | Welt-Wechsel: „fremde Ozeane“ ohne Welt-Wort |
| leben.evolution.erbe | 4 | 10⁴ Individuen im Schirm | Ort | Stadt | Träger unklar: „10⁴ Individuen“ zählt Körper, die die Treppe nicht nennt — als Leiber gelesen Stadt |
| leben.evolution.erbe | 5 | 10⁶ in einer Region, beständig | Ort | Megastadt und Kontinent | Träger unklar: „10⁶“ zählt die Reihe Individuen (ab S4): Körper, die die Treppe nicht nennt — als Leiber gelesen Stadt · „Region“ ohne Größe |
| leben.evolution.muster | 6 | 30/30 auf 10 fremden Physiken | Ort | Planet und Welten | Welt-Wechsel: „fremden Physiken“ ohne Welt-Wort |
| leben.evolution.bauplan | 5 | fremd: ≥ 30 % der Stichprobe außerhalb der irdischen Hülle | Ort | Planet und Welten | Welt-Wechsel: „fremd“ ohne Welt-Wort |
| mensch.leib.gesicht | 5 | 10⁴ Gesichter in jedem Licht (Mittag, Kerze, Neon, Regen) | Ort | Stadt | Träger unklar: „10⁴ Gesichter“ zählt Körper, die die Treppe nicht nennt — als Leiber gelesen Stadt |
| mensch.leib.tracht | 6 | jede Epoche × Kultur der Erde | Stadt | Planet und Welten | Erd-Schlüssel: die Erde als Saat mit Schlüssel zählt erst die Zeile Planet und Welten (Spalte Bytes) |
| mensch.leib.tracht | 7 | Zukünfte, ungesehene Kulturen, fremde Völker | Stadt | Planet und Welten | Welt-Wechsel: „fremde Völker“ ohne Welt-Wort |
| mensch.leib.stoff | 6 | 10⁵ im Stadion | Ort | Stadt | Träger unklar: „10⁵“ ohne Nomen, die Reihe nennt zwei Träger (Nahe S4, Stoffe S5) — als Leiber gelesen Stadt |
| mensch.leib.ausdruck | 6 | fremde Leiber und Kulturen | Stadt | Planet und Welten | Welt-Wechsel: „fremde Leiber“ ohne Welt-Wort |
| mensch.sport.regeln | 6 | 10³–10⁴: das Inventar der Erde liegt im Raum der Grammatik | Ort | Planet und Welten | Erd-Schlüssel: die Erde als Saat mit Schlüssel zählt erst die Zeile Planet und Welten (Spalte Bytes) |
| mensch.sport.kunst | 6 | neue Künste fremder Kulturen und Körper | Ort | Planet und Welten | Welt-Wechsel: „fremder Kulturen“ ohne Welt-Wort |
| mensch.geist.netz | 3 | 10⁴ | Ort | Stadt | Träger unklar: „10⁴“ ohne Nomen, die Reihe nennt keinen Träger — als Leiber gelesen Stadt |
| mensch.geist.netz | 4 | 10⁶ | Ort | Stadt | Träger unklar: „10⁶“ ohne Nomen, die Reihe nennt keinen Träger — als Leiber gelesen Stadt |
| mensch.geist.generationen | 4 | 10⁴: Zeitsprung 10 J | Ort | Stadt | Träger unklar: „10⁴“ ohne Nomen, die Reihe nennt keinen Träger — als Leiber gelesen Stadt |
| mensch.geist.generationen | 5 | 10⁵: Erbe | Ort | Stadt | Träger unklar: „10⁵“ ohne Nomen, die Reihe nennt keinen Träger — als Leiber gelesen Stadt |
| mensch.geist.generationen | 6 | 10⁶–10⁷ über 1 000 J | Ort | Megastadt und Kontinent | Träger unklar: „10⁷“ ohne Nomen, die Reihe nennt keinen Träger — als Leiber gelesen Megastadt und Kontinent |
| mensch.geist.generationen | 7 | 10⁹ über die Menschenzeit | Ort | Megastadt und Kontinent | Träger unklar: „10⁹“ ohne Nomen, die Reihe nennt keinen Träger — als Leiber gelesen Megastadt und Kontinent |
| mensch.geist.generationen | 8 | fremde Evolutionen | Ort | Planet und Welten | Welt-Wechsel: „fremde Evolutionen“ ohne Welt-Wort |
| mensch.geist.absicht | 3 | 10⁴ | Ort | Stadt | Träger unklar: „10⁴“ ohne Nomen, die Reihe nennt keinen Träger — als Leiber gelesen Stadt |
| mensch.geist.absicht | 4 | 10⁶ | Ort | Stadt | Träger unklar: „10⁶“ ohne Nomen, die Reihe nennt keinen Träger — als Leiber gelesen Stadt |
| mensch.geist.absicht | 5 | 10⁹, Epochen | Ort | Megastadt und Kontinent | Träger unklar: „10⁹“ ohne Nomen, die Reihe nennt keinen Träger — als Leiber gelesen Megastadt und Kontinent |
| mensch.geist.absicht | 6 | fremde Gesellschaften | Ort | Planet und Welten | Welt-Wechsel: „fremde Gesellschaften“ ohne Welt-Wort |
| mensch.menge.bild | 4 | 10⁴ (Platz, Demonstration) | Ort | Stadt | Träger unklar: „10⁴“ ohne Nomen, die Reihe nennt keinen Träger — als Leiber gelesen Stadt |
| mensch.menge.bild | 5 | 10⁵ (Stadion) | Ort | Stadt | Träger unklar: „10⁵“ ohne Nomen, die Reihe nennt keinen Träger — als Leiber gelesen Stadt |
| mensch.menge.bild | 6 | 10⁶ (Pilgerfest) | Ort | Stadt | Träger unklar: „10⁶“ ohne Nomen, die Reihe nennt keinen Träger — als Leiber gelesen Stadt |
| mensch.stadt.breite | 3 | die Erde: Kulturräume aller Kontinente | Megastadt und Kontinent | Planet und Welten | Erd-Schlüssel: die Erde als Saat mit Schlüssel zählt erst die Zeile Planet und Welten (Spalte Bytes) |
| mensch.stadt.breite | 6 | fremde Städte | Megastadt und Kontinent | Planet und Welten | Welt-Wechsel: „fremde Städte“ ohne Welt-Wort |
| mensch.stadt.habitat | 3 | Kolonie auf Mond oder Mars, 10³ | Stadt | Planet und Welten | Welt-Wechsel: „auf Mond“ ohne Welt-Wort |
| mensch.stadt.habitat | 4 | Asteroiden-Bergwerk und Station im freien Raum, 10⁴ | Stadt | Planet und Welten | Welt-Wechsel: „Asteroiden-Bergwerk“ ohne Welt-Wort |
| mensch.stadt.habitat | 6 | Netz von 10³ Habitaten und Kolonien eines Systems | Stadt | Planet und Welten | Welt-Wechsel: „eines Systems“ ohne Welt-Wort |
| mensch.netz.gestalt | 2 | 10³ Häuser, ~50 km | Stadt | Megastadt und Kontinent | zwei Zeilen zugleich: zahl:10³ Häuser sagt Stadt, zahl:50 km sagt Megastadt und Kontinent |
| mensch.netz.gestalt | 3 | 10⁴ Häuser, ~500 km, Achsen und Ring | Stadt | Megastadt und Kontinent | zwei Zeilen zugleich: zahl:10⁴ Häuser sagt Stadt, zahl:500 km sagt Megastadt und Kontinent |
| mensch.netz.gestalt | 4 | 10⁵ Häuser, ~5 000 km, Kreuze auf 2 Ebenen | Stadt | Megastadt und Kontinent | zwei Zeilen zugleich: zahl:10⁵ Häuser sagt Stadt, zahl:5 000 km sagt Megastadt und Kontinent |
| mensch.bau.innen | 7 | fremde Bauten fremder Leiber | Megastadt und Kontinent | Planet und Welten | Welt-Wechsel: „fremde Bauten“ ohne Welt-Wort |
| mensch.fahrzeug.gestalt | 5 | fremde Evolutionen | Ort | Planet und Welten | Welt-Wechsel: „fremde Evolutionen“ ohne Welt-Wort |
| mensch.fahrzeug.lenker | 6 | fremde Lenker, fremde Medien | Ort | Planet und Welten | Welt-Wechsel: „fremde Lenker“ ohne Welt-Wort |
| mensch.nahrung.tier | 7 | Milliarden Nutztiere, fremde Haustiere | Megastadt und Kontinent | Planet und Welten | Welt-Wechsel: „fremde Haustiere“ ohne Welt-Wort |
| mensch.nahrung.strom | 4 | 10⁴: Hunger und Überfluss | Ort | Stadt | Träger unklar: „10⁴“ ohne Nomen, die Reihe nennt zwei Träger (Bewohner S2, Orte S3) — als Leiber gelesen Stadt |
| mensch.wirtschaft.technik | 7 | fremde Chemie, ≥ 10 Pfade jenseits unserer | Ort | Planet und Welten | Welt-Wechsel: „fremde Chemie“ ohne Welt-Wort |
| mensch.macht.stand | 6 | fremde Ränge | Megastadt und Kontinent | Planet und Welten | Welt-Wechsel: „fremde Ränge“ ohne Welt-Wort |
| mensch.macht.recht | 6 | Verwaltung über 10⁸ | Ort | Megastadt und Kontinent | Träger unklar: „10⁸“ nach „über“ zählt nicht die Reihe (Rechtsordnungen) — als Leiber gelesen Megastadt und Kontinent |
| mensch.macht.megastadt | 4 | 10⁴ im Protest | Ort | Stadt | Träger unklar: „10⁴ im Protest“ nennt eine Menge an einem Ort, die Reihe zählt Machtzentren — als Leiber gelesen Stadt |
| mensch.macht.megastadt | 7 | fremde Megastädte | Megastadt und Kontinent | Planet und Welten | Welt-Wechsel: „fremde Megastädte“ ohne Welt-Wort |
| mensch.kultur.glaube | 4 | U_eff ≥ 10², heilige Landschaft | Stadt | Megastadt und Kontinent | „Landschaft“ ohne Größe |
| mensch.kultur.glaube | 6 | fremdes Heiliges | Stadt | Planet und Welten | Welt-Wechsel: „fremdes Heiliges“ ohne Welt-Wort |
| mensch.kultur.diffusion | 4 | 10² Herkünfte in 10⁷ | Stadt | Megastadt und Kontinent | Träger unklar: „10⁷“ nach „in“ zählt nicht die Reihe (Herkünfte) — als Leiber gelesen Megastadt und Kontinent |
| mensch.kultur.wissen | 6 | Wissenschaft fremder Arten | Stadt | Planet und Welten | Welt-Wechsel: „fremder Arten“ ohne Welt-Wort |
| mensch.zeit.erde | 2 | 10 Orte × 3 Epochen | Stadt | Planet und Welten | Erd-Schlüssel: die Erde als Saat mit Schlüssel zählt erst die Zeile Planet und Welten (Spalte Bytes) |
| mensch.zeit.erde | 4 | die bewohnte Erde in jedem Jahrhundert seit −3000 | Stadt | Planet und Welten | Erd-Schlüssel: die Erde als Saat mit Schlüssel zählt erst die Zeile Planet und Welten (Spalte Bytes) |
| mensch.zeit.erde | 6 | jeder Ort der Erde in jedem Jahr, das ein Mensch erinnert | Stadt | Planet und Welten | Erd-Schlüssel: die Erde als Saat mit Schlüssel zählt erst die Zeile Planet und Welten (Spalte Bytes) |
| mensch.zukunft.medien | 7 | jede Kultur ihre eigenen Medien, auch für fremde Sinne (Duft-Schrift, Infraschall-Funk) | Megastadt und Kontinent | Planet und Welten | Welt-Wechsel: „fremde Sinne“ ohne Welt-Wort |
| erleben.spieler.praesenz | 6 | jeder Leib jeder Art jeder Saat, auch fremde Gliedmaßen | Megastadt und Kontinent | Planet und Welten | Welt-Wechsel: „fremde Gliedmaßen“ ohne Welt-Wort |
| erleben.spieler.hand | 6 | alles, was ein Lebewesen der Welt tun kann — fremde Glieder, fremde Stoffe | Ort | Planet und Welten | Welt-Wechsel: „fremde Glieder“ ohne Welt-Wort |
| erleben.spieler.zeit | 8 | EIN ungeschnittener Raffer vom Magma-Ozean über die Gegenwart bis zur sterbenden Sonne, ein Planet | Ort | Planet und Welten | Himmel oder Feld vom Boden aus: „Planet“ neben „Sonne“ — Ding am Himmel oder Umfang? |
| erleben.spieler.nichtleib | 5 | Planet und Stern sein | Stadt | Planet und Welten | Himmel oder Feld vom Boden aus: „Planet“ neben „Stern“ — Ding am Himmel oder Umfang? |
| erleben.sinn.legenden | 5 | Legenden über 10³ Jahre einer Region mit 10⁶ | Stadt | Megastadt und Kontinent | „Region“ ohne Größe |
| erleben.klang.landschaft | 4 | jedes Biom der Erde (20 Zufallsorte) | Ort | Planet und Welten | Erd-Schlüssel: die Erde als Saat mit Schlüssel zählt erst die Zeile Planet und Welten (Spalte Bytes) |
| erleben.klang.stimme | 5 | 10⁴ Sprachen, 10⁸⁺ Sprecher, fremde Sprechorgane (Pfeif-, Klick-, Infraschall) | Megastadt und Kontinent | Planet und Welten | Welt-Wechsel: „fremde Sprechorgane“ ohne Welt-Wort |
| same.physik.koerper | 5 | 10⁵ | Ort | Stadt | Träger unklar: „10⁵“ zählt die Reihe Körper (ab S1): Körper, die die Treppe nicht nennt — als Leiber gelesen Stadt |
| same.physik.reaktion | 6 | fremde Chemie | Ort | Planet und Welten | Welt-Wechsel: „fremde Chemie“ ohne Welt-Wort |
| same.entfaltung.schirm | 4 | Skyline mit 10⁵ Gebäuden bis 30 km | Stadt | Megastadt und Kontinent | zwei Zeilen zugleich: zahl:10⁵ Gebäuden sagt Stadt, zahl:30 km sagt Megastadt und Kontinent |
| same.entfaltung.reise | 2 | Fahrt 30 km/h, 10 km durchs Dorf | Ort | Stadt | zwei Zeilen zugleich: wort:Dorf sagt Ort, zahl:10 km sagt Stadt |
| same.entfaltung.abwesenheit | 2 | 10⁴ Wesen (Menschen, Tiere, Wuchs), 1 Tag | Ort | Stadt | Träger unklar: „10⁴ Wesen“ zählt Körper, die die Treppe nicht nennt — als Leiber gelesen Stadt |
| same.entfaltung.vielfalt | 3 | 10³ Orte, 10 Regionen einer Welt | Stadt | Megastadt und Kontinent | „Regionen“ ohne Größe |
| same.gedaechtnis.pfad | 4 | 10⁶ Leiber, Region 10⁴ km², 100 Jahre | Stadt | Megastadt und Kontinent | zwei Zeilen zugleich: zahl:10⁶ Leiber sagt Stadt, zahl:10⁴ km² sagt Megastadt und Kontinent |
| same.gedaechtnis.schicht | 3 | jede Siedlung einer Region, 5 000 Jahre | Ort | Megastadt und Kontinent | „Region“ ohne Größe |
| planet.kopplung.siedlungslage | 3 | Siedlungen einer Region | Ort | Megastadt und Kontinent | „Region“ ohne Größe |
| planet.kopplung.siedlungslage | 4 | Verkehr eines Landes | Ort | Megastadt und Kontinent | „Landes“ ohne Größe |
| planet.kopplung.gegenwart | 5 | Erd-Saat, 10³ Orte | Ort | Planet und Welten | Erd-Schlüssel: die Erde als Saat mit Schlüssel zählt erst die Zeile Planet und Welten (Spalte Bytes) |
| leben.kopplung.leben-formt-planet | 4 | eine Landschaft | Ort | Megastadt und Kontinent | „Landschaft“ ohne Größe |
| mensch.kopplung.leben | 3 | 10⁵: Leben formen die Welt | Ort | Stadt | Träger unklar: „10⁵“ ohne Nomen, die Reihe nennt keinen Träger — als Leiber gelesen Stadt |
| mensch.kopplung.leben | 4 | 10⁷: Vulkan, Seuche, Krieg | Ort | Megastadt und Kontinent | Träger unklar: „10⁷“ ohne Nomen, die Reihe nennt keinen Träger — als Leiber gelesen Megastadt und Kontinent |
| mensch.kopplung.antwort | 4 | Region: neue Stadt, gesperrter Hafen | Stadt | Megastadt und Kontinent | „Region“ ohne Größe |
| mensch.kopplung.kreislauf | 3 | 10⁴ | Ort | Stadt | Träger unklar: „10⁴“ ohne Nomen, die Reihe nennt keinen Träger — als Leiber gelesen Stadt |
| mensch.kopplung.kreislauf | 4 | 10⁶ | Ort | Stadt | Träger unklar: „10⁶“ ohne Nomen, die Reihe nennt keinen Träger — als Leiber gelesen Stadt |
| mensch.kopplung.kreislauf | 5 | 10⁸ in EINER Stadt | Stadt | Megastadt und Kontinent | Träger unklar: „10⁸“ ohne Nomen, die Reihe nennt keinen Träger — als Leiber gelesen Megastadt und Kontinent |
| erleben.kopplung.bild | 6 | jenseits der Erde | Ort | Planet und Welten | Erd-Schlüssel: die Erde als Saat mit Schlüssel zählt erst die Zeile Planet und Welten (Spalte Bytes) |
| same.kopplung.aufwaerts | 2 | ein Dorf rodet 10 km² | Ort | Stadt | zwei Zeilen zugleich: wort:Dorf sagt Ort, zahl:10 km² sagt Stadt |
| same.kopplung.kaskade | 6 | Ausbruch → Asche → Dachlast → Einsturz → Lahar → Ernte, eine Region | Stadt | Megastadt und Kontinent | „Region“ ohne Größe |
| same.kopplung.erdsaat | 6 | Erdgeschichte 4,5·10⁹ Jahre | Ort | Planet und Welten | Erd-Schlüssel: die Erde als Saat mit Schlüssel zählt erst die Zeile Planet und Welten (Spalte Bytes) |

## D · Das Gesetz gegen die Hand (3 anders, 3 unsicher, 228 gleich) — die Hand bleibt stehen

| Leiter | S | Umfang | Hand | Gesetz | Grund |
| --- | --- | --- | --- | --- | --- |
| planet.wasser.kreislauf | 1 | Region 2 km | Ort | Stadt | zahl:2 km |
| same.entfaltung.schirm | 1 | Wiese und Genesis, Sicht 8 km | Ort | Stadt | zahl:8 km |
| same.entfaltung.abwesenheit | 1 | 118 Bewohner einer Test-Stadt, ein Tag | Ort | Stadt | wort:Test-Stadt |
| planet.relief.grossform | 1 | 1 Saat, Flussnetz bis zum Horizont | Ort | unsicher | Horizont: Sicht des Bilds (Zeile Megastadt und Kontinent) oder Reichweite des Gesetzes? |
| planet.wasser.stroemung | 1 | Flüsse einer Region | Ort | unsicher | „Region“ ohne Größe |
| planet.kosmos.welten | 1 | Heimat + 1 Fremdwelt | Ort | unsicher | Welt-Wechsel: „Fremdwelt“ ist EIN fremdes Ziel — Umfang kosmisch oder die Pose am Ziel ein Ort? |
