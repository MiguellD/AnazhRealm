# Menschenzeit: Epochen und Geschichte

## Die Vision hier

Jenseits der Gegenwart heißt hier: Die Zeit ist eine Achse wie der Raum. Der Spieler geht durch Jahrtausende so flüssig wie durch Straßen. An derselben Bucht steht zuerst ein Lager am Feuer, dann ein Fischerdorf, ein antiker Hafen, eine Bischofsstadt, eine Industriestadt, eine Metropole, gegen die Tokio ein Dorf ist, und schließlich Zukünfte, die noch niemand gebaut hat. Jeder Zustand geht aus dem vorigen HERVOR: Die Gassen erinnern sich an Trampelpfade, die Ringstraße an die Mauer, der Ortsname an die Sprache der Gründer, und unter dem Pflaster liegen die Schichten. Die Geschichte selbst steht in keiner Tafel. Sie wächst aus dem Samen als Kausalkette: Boden und Klima tragen Ernten, Ernten tragen Menschen, Menschen erfinden, Erfindungen wandern, Reiche steigen und fallen, Seuchen und Vulkane brechen Kurven. Jede Saat erzählt deshalb eine andere, plausible Geschichte, auch solche, die die Erde nie schrieb, und auch die Geschichten nichtmenschlicher Zivilisationen auf fremden Planeten. In jeder Zeit leben so viele Menschen, wie diese Zeit trug: Rom mit einer Million, Edo mit einer Million, und die erfundenen Hauptstädte fremder Saaten mit zehn- und hundertfach mehr. Jede dieser Geschichten ist bereisbar, und man ist DABEI, wenn sie geschieht: beim Ausbruch, bei der Belagerung, auf dem Markt am Tag der Seuche. Wer fragt, warum diese Stadt hier steht, bekommt die Kette bis zum Samen gezeigt.

## Das Beste der Gegenwart

- **Dwarf Fortress** (Bay 12, Weltgenese): Das Spiel simuliert bis zu 1 050 Jahre Geschichte mit Zivilisationen, Kriegen, Religionen, historischen Figuren und Orten. Der Legenden-Modus macht sie lesbar, und eine Welt mit tausend Jahren erzeugt bis zu 1 GB XML (dwarffortresswiki „World gen", „Legends"). **Grenze:** Die Geschichte ist Text, kein bereisbarer Raum. Die Simulation läuft vor dem Spiel und dauert Minuten, und eine Stadt hat in einem früheren Jahr keine sichtbare Gestalt.
- **Crusader Kings III / Civilization / Humankind** (Paradox, Firaxis, Amplitude): Dynastien über etwa 600 Jahre bzw. ein Technologiebaum von der Steinzeit bis zur Raumfahrt, Reiche steigen und fallen. **Grenze:** Die Karte ist abstrakt, Erfindungen kommen aus einem festen, handgeschriebenen Baum, und keine Stadt ist begehbar.
- **Assassin's Creed** (Ubisoft; Origins, Odyssey, Unity, Discovery Tour): Jedes Spiel baut je eine Epoche an einem Ort von Hand und mit Historikern als Berater; Unity zeigt Paris 1789 mit Menschenmengen von einigen tausend Figuren gleichzeitig. Laut Odyssey-Studie (Cambridge, *Adv. Archaeol. Practice*) ist es „fiktionales Werk in historischem Rahmen". **Grenze:** eine Epoche je Spiel, Gigabytes an Assets, kein Übergang zwischen den Zeiten, die Menge ist Kulisse ohne Leben.
- **Rome Reborn / City Sample** (Frischer et al.; Epic 2021): ein digitales Rom mit Rekonstruktionen über mehrere Jahrhunderte bzw. 7 000 Gebäude aus Regeln. **Grenze:** offline gebacken, zu jeder Zeit ein eigenes Modell, keine Kausalität.
- **Artificial Anasazi** (Dean, Axtell, Epstein et al., PNAS 2002; Replikation Janssen, JASSS 2009): Ein agentenbasiertes Modell rechnet die Bevölkerung des Long House Valley 800–1350 aus Ertrag und Klima nach und trifft Aufstieg, Fall und Wanderung zwischen sechs Habitaten. **Grenze:** Das Verlassen des Tals um 1300 erklärt das Klima allein nicht, und der Erfolg hängt an zwei kalibrierten Parametern.
- **Seshat / Cliodynamik** (Turchin et al., *Cliodynamics* 6, 2015): eine Datenbank von Gemeinwesen über 10 000 Jahre mit Kennzahlen zu Komplexität, Fläche und Zusammenbruch. Sie liefert die Referenz-Verteilungen für Reiche, die ein Richter braucht. **Grenze:** Daten und Regressionen, kein Generator.
- **Die Wirklichkeit:** Troja trägt etwa neun Siedlungsschichten über etwa 3 500 Jahre auf einem Hügel. Wien hat seine Mauer zur Ringstraße gemacht, Ephesos und Brügge verloren ihren Hafen durch Verlandung. Die Ausbreitung des Ackerbaus lief mit etwa 1 km pro Jahr über Europa. Rom um 100 n. Chr., Chang'an um 750 und Edo um 1700 trugen je etwa eine Million Menschen, London um 1900 etwa 6,5 Millionen. So sieht ein „Hervorgehen" aus, das ein Generator treffen muss, und das ist die UNTERE Latte für die Menge.

## Der Same

**Die Geschichte als Funktion f(Same, Ort, Jahr), deren Zustand im Jahr t+1 nur aus dem Zustand im Jahr t und den Gesetzen folgt.** Daraus folgen zwei Dinge. Erstens ist der Zustand jedes Jahres eine Verdichtung der Kette davor (Bevölkerung, Wissen, Grenzen, Bauten). Zweitens darf ein Bereisen in jedes Jahr nie die ganze Kette nachrechnen: Es braucht Checkpoints (Anker) und eine billige Interpolation dazwischen.

Gelöst haben das fremde Branchen:
- die **Videokompression** mit I-Frames und Differenz-Frames: Man springt in jede Sekunde, ohne den Film von vorn zu dekodieren.
- die **Versionskontrolle** mit Commit-Kette und Snapshots: Jeder Stand geht aus dem Vorgänger hervor und ist einzeln abrufbar.
- die **Paläoklimatologie und Stratigrafie**: Eine Schichtfolge ist die gespeicherte Geschichte, und ein Schnitt durch den Boden IST die Zeitachse.

Die Keimzelle steht schon im Code: das JAHRESRING-GESETZ mit seinen Ankern (`chronikAnker`, `chronikJahr`). Der Ort eines früheren Jahrs ist dort der Anfang des jüngeren. Der Same dieses Blatts verallgemeinert das von Häusern auf alles: Wege, Reiche, Wissen, Namen, Menschen und Land. Die Kraft des Samens wird an Stichproben gemessen (N zufällige Saaten × Orte × Jahre), nie an der Länge einer Liste von Epochen, Stilen oder Erfindungen: Eine Tafel mit tausend Einträgen ist Fleiß, ein Gesetz, aus dem tausend Stile fallen, ist Fähigkeit.

## Die Leitern

Preis gilt überall und wird in JEDER Sprosse am selben Ort mitgemessen: 0 Download, Bild ≤ 33 ms p95, Ankunft ≤ 5 s kalt auf dem Standardgerät (Radeon 890M, GTX 1060). „Wechsel" ist die Zeit vom Jahreswunsch bis zum vollständigen Bild am selben Standort. Steht in der Preis-Spalte nur eine Zusatzzahl, gilt der Sockelpreis (diese drei Zahlen) dazu. „Stichprobe" heißt: Saat, Ort und Jahr werden zufällig gezogen, nicht vom Bauenden gewählt.

### Leiter 1 — Die bereisbare Zeitspanne an einem Ort

Diese Leiter misst, über wie viele Jahre der Spieler am selben Standort reisen kann, wie fein die Schritte sind und wie schnell der Wechsel geht.

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | 1 Zustand (Gegenwart) | Ort ohne Jahr | Sockelpreis | Ort steht, trägt kein Jahr, Bild p95 ≤ 33 ms | |
| 2 | Jahr 1–9999 per Satz, 4 gemessene Halte (1320 → 1935) | Baustil, Tracht und Größe je Epoche | Wechsel = Neugründung des Orts (unbemessen) | dieselbe Zelle unter 4 Jahren: Bildpaar je Jahr, das Jahr wird per Satz gewählt; Wechsel-Zeit gemessen | HEUTE |
| 3 | 3 000 J (Eisenzeit → heute), Schritt ≤ 50 J, Regler im Spiel | Bauten, Wege, Menschen, Fahrzeuge der Zeit | Wechsel p95 ≤ 5 s | Regler-Fahrt über 60 Halte am Standort: Halte mit eigenem Bild ≥ 95 %, Wechsel p95 ≤ 5 s, Bild ≤ 33 ms an jedem Halt | |
| 4 | 12 000 J (erstes Lager → heute), Schritt ≤ 10 J | dazu Lager, Dorf ohne Metall, Tell-Hügel | Wechsel p95 ≤ 2 s | 1 200 Halte: Wechsel p95 ≤ 2 s, kein leerer Halt | |
| 5 | 12 000 J + 1 000 J Zukunft, stetig | Zeitraffer: man sieht die Stadt wachsen | Zeitraffer 100 J/s bei 33 ms | Video 130 s Zeitraffer: Frame p95 ≤ 33 ms, Bildsprünge ohne Ursache = 0 | |
| 6 | 300 000 J (Homo sapiens) + 10 000 J Zukunft, jedes Jahr | jede Kultur und jedes Jahr am Ort | Wechsel p95 ≤ 1 s | 1 000 zufällige Jahre: Wechsel p95 ≤ 1 s, Bild steht | |
| 7 | jeder Ort des Planeten × jedes Jahr der Menschenzeit (~5·10^8 km² × 3·10^5 J) | alle Kulturen gleichzeitig konsistent | Wechsel ≤ 1 s, Ankunft ≤ 5 s an jedem (Ort, Jahr) | 1 000 Stichproben (Ort, Jahr): Anteil mit stehendem, plausiblem Bild ≥ 95 % | |
| 8 (Vision) | die ganze Zivilisationszeit jeder Welt: N Planeten × jede Art, die Kultur trägt × 10^6 J inkl. Zukunft | Zeit gehbar wie Raum, auch fremde Zivilisationen anderer Evolutionen | Wechsel p95 ≤ 1 s, Zeitraffer bis 10^4 J/s bei 33 ms | Stichproben (Planet, Art, Ort, Jahr): Anteil mit plausiblem Bild ≥ 95 %, Wechsel p95 ≤ 1 s, Zeitraffer-Frame p95 ≤ 33 ms | |

### Leiter 2 — Hervorgehen: das Jüngere trägt das Ältere (der Palimpsest)

Diese Leiter misst, welcher Anteil des SICHTBAREN eines jüngeren Zustands am selben Ort aus dem älteren stammt — das räumliche Erbe. Das kausale „Warum" misst Leiter 3.

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | Epochen als eigene Pläne | dieselbe Saat, eigener Ortsplan | Sockelpreis | Bildpaar alt/jung, Überdeckung der Hausflächen alt im jung 22–67 % (vor siedlung.K4) | |
| 2 | Häuser-Lose bleiben (Jahresringe), Mauer steht bis 1750 | Kern alt, Rand jung | Ort-Plan aus einer Funktion | Überdeckung je Slot ≥ 0,9 über 1320 → 1935 | HEUTE |
| 3 | + Wege und Mauer erben | Gassen des Kerns bleiben, Mauertrasse wird Straße | Wechsel p95 ≤ 5 s | Luftbild-Paar 1560/1860: Mauertrasse als Straße ≥ 80 %, Kerngassen gleich ≥ 90 % | |
| 4 | Umbau statt Ersatz | Aufstockung, Umnutzung, Spolien, Ruinen stehen | Bild ≤ 33 ms und VRAM unverändert gegen Sprosse 3 am selben Blick | Anteil der Häuser einer Altstadt mit ≥ 2 sichtbaren Bauphasen ≥ 50 % (Foto-Referenz europäischer Altstadt) | |
| 5 | Schichten im Boden | Kulturschichten, der Tell wächst, Grabung zeigt Vorgänger | Grabungsschnitt im Bild ≤ 33 ms | Grabungsschnitt im Spiel: Schichtfolge = gefahrene Zustände des Orts, 100 % | |
| 6 | Namen und Sprache erben | Ortsname wandelt sich lautgesetzlich, Straßennamen tragen Vorgänger | Sockelpreis | 100 Orte über 1 000 J: Name im Jahr t aus Name t−500 durch die Lautregeln der Saat ableitbar ≥ 90 %; blind als „verwandt" erkannt ≥ 80 % | |
| 7 (Vision) | eine planetare Metropole über 10^4 J als Palimpsest, gegen den Rom ein Dorf ist | das Gegenwartsbild trägt sichtbar jede Epoche, die je dort stand | Sockelpreis in der Metropole | 1 000 zufällige Blicke (Ort, Jahr) in Großstädten: Anteil mit ≥ 2 sichtbaren Epochen im Bild ≥ 60 %, und jede sichtbare alte Spur steht im Zustand ihres Jahres am selben Ort, 100 % | |

### Leiter 3 — Die Kausalkette aus dem Samen: Erfindungen und Ereignisse

Diese Leiter misst, ob Geschichte ENTSTEHT statt aus einer Kalender-Tafel gelesen zu werden. Umfang ist die Größe des Ensembles (Saaten × Jahre), deren Kette trägt, nie die Länge einer Erfindungsliste.

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | Epoche = Tafel nach Kalenderjahr | Erdgeschichte abgeschrieben | Sockelpreis | 100 Saaten, je dasselbe Jahr: Varianz der sichtbaren Epoche = 0 | |
| 2 | 1 Ereignis beugt 1 Kurve | Gewalt → Furcht → langsameres Wachstum | deterministisch aus Saat und Akten, Sockelpreis | Zeitraffer im Spiel: Ort ohne Wohlstand wächst sichtbar nicht, Ort nach erlebter Gewalt wächst messbar langsamer (Häuser je Spielminute) | HEUTE |
| 3 | 100 Saaten × 10^3 J, Technik entsteht aus Stoff, Bedarf und Menschenzahl | Reihenfolge entsteht, keine Kalendertafel | Geschichte bis Jahr t in ≤ 1 s | 100 Saaten: Erfindungsjahre streuen (σ ≥ 10 % der Spanne), Ordnungsbrüche (Eisen vor Feuer, Motor vor Rad) = 0 | |
| 4 | Techniken wandern über Land und Meer | Welle sichtbar im Land | Zeitraffer 100 J/s bei 33 ms | Ausbreitungsfront im Zeitraffer: Geschwindigkeit in der Größenordnung der Neolithisierung (0,3–3 km/J), Barrieren (Gebirge, Meer) bremsen sichtbar | |
| 5 | jeder Bruch jeder Kurve hat eine Ursache | „Warum?" ist im Spiel beantwortbar | Kette sichtbar in ≤ 1 s | Spieler fragt an 100 zufälligen Orten „warum hier, warum jetzt?": Kette ≥ 5 Glieder bis zum Samen in ≥ 95 % der Fälle; Brüche der Bevölkerungskurve ohne benannte Ursache ≤ 5 % | |
| 6 | 10^4 Saaten: alternative Menschheitsgeschichten | jede Saat anders, jede plausibel, auch Wege, die die Erde nie ging | Sockelpreis | 100 Saaten: blind beurteilte Plausibilität ≥ 90 %, paarweise verschiedene Pfade ≥ 90 %, Anteil Saaten mit einer Kulturgestalt ohne Erd-Vorbild ≥ 30 % | |
| 7 | Eingriff des Spielers gabelt die Zukunft | Zeitreise mit Folgen | Gabelung neu gerechnet in ≤ 5 s | Eingriff im Jahr X: Gegenwart sichtbar anders (Bildpaar), ohne Eingriff byte-gleich | |
| 8 (Vision) | die Zivilisationszeit vieler Planeten als je EINE Kette (10^6 J, ≥ 10^10 Leben je Planet), auch fremder Arten | jede Erfindung, jedes Reich, jede Stadt, jedes Leben herleitbar | Leiter 1, Sprosse 8 | 1 000 Stichproben (Planet, Ort, Jahr): Kette bis zum Samen vorhanden 100 %, plausibel ≥ 95 %, zwei Planeten blind unterscheidbar ≥ 95 % | |

### Leiter 4 — Reiche: Aufstieg und Fall

Diese Leiter misst Gemeinwesen mit Grenzen über die Zeit und vergleicht ihre Statistik mit der realen Geschichte. Die Mechanik der Herrschaft liefert das Blatt „Macht, Recht und Konflikt"; hier zählt die Zeitgestalt.

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | 1 Ort mit Herrschaftsgebiet | Grenze im Land sichtbar (Grenzstein, Zoll, Tracht), der Herr hat eine Ursache | Sockelpreis | Grenze im Bild am Boden + Karte deckungsgleich; die Burg steht, wo Lage und Reichtum sie tragen, nicht per Münzwurf | |
| 2 | 10 Gemeinwesen auf 32 × 32 km über 1 000 J | Grenzen verschieben sich | Karte in jedem Jahr ≤ 1 s | Zeitraffer-Karte: Grenzänderungen ≥ 1 je Jahrhundert, jede mit Ursache | |
| 3 | 100 Gemeinwesen, Aufstieg und Fall | Hauptstadt wächst und verfällt | Sockelpreis in der Hauptstadt | Lebensdauer-Verteilung gegen Seshat: KS-Test p > 0,05 | |
| 4 | Kontinent: Reich bis 10^6 km² | Straßen, Garnisonen, Münzen der Macht | Ankunft ≤ 5 s an jedem Ort | Maximalfläche über die Zeit folgt der Taagepera-Kurve (Größenordnung je Jahrtausend) | |
| 5 | Planet: 10^3–10^4 Gemeinwesen über 10^4 J | Fall hinterlässt Ruinen, Sprache, Recht | Leiter 1, Sprosse 7 | 1 000 Stichproben (Ort, Jahr): Zugehörigkeit eindeutig, Ruinen gefallener Reiche ≥ 1 je 100 km² | |
| 6 | Reiche über Ozeane | Kolonien, Handelsnetz | Sockelpreis | Anteil Saaten mit überseeischen Reichen nach Erfindung der Hochseeschifffahrt ≥ 50 %, davor 0 | |
| 7 (Vision) | Reiche über Sonnensysteme, 10^5 J, viele Planeten und Arten | fremde Zivilisationen mit fremder Macht-Logik | Ankunft ≤ 5 s je Planet | Stichproben (Planet, Jahr): Statistik je Planet innerlich stimmig und zwischen Planeten blind unterscheidbar ≥ 90 % | |

Stand: **unter der Leiter.** Es gibt ein BURG-GESETZ (`fachwerk-core.js:3705`: städtisch, vor 1700, ≥ 16 Häuser, dann zu 50 % per Zufallszahl) und ein STADTMAUER-GESETZ bis 1750 (`:4495`), aber kein Herrschaftsgebiet und keine Grenze. Das Rang-Größe-Gesetz der Städte (Zipf) ist Siedlung, keine Herrschaft.

### Leiter 5 — Die Gestalt jeder Zeit (Erzeugungskraft der materiellen Kultur)

Diese Leiter misst, wie viele unterscheidbare Kultur-Gestalten das GESETZ hervorbringt und wie wahr jede aussieht. Gezählt wird an Stichproben, nicht an der Länge der Stil-Tafel: 30 handgeschriebene Pools sind die Sprosse 2, nie die Sprosse 4.

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | 1 Gegenwart | eine Gestalt | Sockelpreis | Bild steht | |
| 2 | 9 Epochen × 6 Regionen, 28 Baustil-Pools aus Tafeln, 6 Fahrzeug-Stufen, Tracht aus 3 Schnitten + Farben | Häuser lesen als weiße Kästen, Tracht Poncho/T-Shirt | Stadt 300 Häuser am Marktplatz unter 33 ms nicht für jedes Gerät belegt | Blind-Zuordnung unbemessen | HEUTE (Breite), Tiefe unter Sprosse 2 |
| 3 | 20 blind unterscheidbare Gestalten | Bau, Tracht, Werkzeug, Fahrzeug je Zeit stimmig | Sockelpreis in der Stadt der Zeit | 20 Bildpaare blind: Treffer der Zeit ≥ 70 % (Zufall 5 %) | |
| 4 | 100 unterscheidbare Gestalten aus Gesetz (Klima, Stoff, Technik, Glaube), nicht aus Pool-Tafeln | gegen Rekonstruktion und Foto (ab 1860) | Wechsel ≤ 5 s | 200 Stichproben irdischer Saaten: blinde Bewertung „passt zu Ort und Jahr" ≥ 80 %; Cluster-Zahl unterscheidbarer Gestalten ≥ 100 | |
| 5 | 10^3 Gestalten (Region × Jahrhundert) | ununterscheidbar vom Foto | Sockelpreis | Blind-Test Foto gegen Spiel: Verwechslung ≥ 40 % | |
| 6 | Zukünfte und fremde Kulturen aus Gesetzen (Stoff, Energie, Klima, Körperbau der Art) | stehen statisch, nähren sich, gehen aus dem Vorigen hervor | Sockelpreis | 100 Saaten: Bauten bestehen die Statik ≥ 99 %, blind als „aus dieser Stadt gewachsen" erkannt ≥ 80 % | |
| 7 (Vision) | 10^6 und mehr unterscheidbare Kultur-Gestalten über Planeten, Arten und Zeiten | jede Stichprobe so wahr wie die Wirklichkeit oder darüber hinaus; Cyberpunk 2077 und Assassin's Creed als Untergrenze | Leiter 1, Sprosse 8 | 1 000 Stichproben irdischer Saaten: Verwechslung mit Foto/Rekonstruktion ≥ 50 %; 1 000 Stichproben fremder Saaten: blind „glaubhaft gewachsen" ≥ 90 % und Wiederholung einer Gestalt ≤ 1 % | |

### Leiter 6 — Natur und Geschichte gekoppelt

Diese Leiter misst, wie Land, Klima und Katastrophe die Geschichte beugen und wie der Mensch das Land zurückformt.

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | Ort liest Boden und Wasser (Platzwahl, Gassen auf Höhenlinien) | statisch, ohne Zeit | Sockelpreis | Gassen-Gefälle p95 ≤ 12 % vor dem Erdbau in ≥ 4 Saaten | HEUTE |
| 2 | Ernte aus Klima und Boden trägt die Bevölkerung | Dürrejahr → Schrumpfung | Kurve in ≤ 1 s | Bevölkerungskurve folgt der Tragfähigkeit (Korrelation ≥ 0,7), sichtbar leere Häuser | |
| 3 | Mensch formt Land: Rodung, Felder, Terrassen, Deiche | Waldanteil fällt mit Bevölkerung | Fernsicht ≤ 33 ms | Luftbild-Paar 800/1800: Waldverlust im Umkreis ∝ Bevölkerung, gemessen in Pixeln | |
| 4 | Katastrophe bricht Geschichte (Vulkan, Flut, Seuche) | Aufgabe von Orten, Wanderung | Sockelpreis | 100 Saaten mit Ereignis: Bruch der Kurve messbar ≥ 90 %, die Ruine steht im Bild | |
| 5 | Küste wandert und Häfen sterben (Verlandung, Meeresspiegel) | Hafen wird Binnenort | Leiter 1, Sprosse 4 | Bildpaar über 1 000 J: Küstenlinie verschoben, Hafen-Handel stirbt in derselben Saat | |
| 6 | planetarer Mensch: Anthropozän | Emission → Klima → Rückwirkung auf Städte | Sockelpreis | CO₂-Kurve der Saat: Klimaänderung in der Größenordnung der Erdmessung, Küstenstädte reagieren sichtbar (Deich, Aufgabe, Umzug) | |
| 7 (Vision) | jede Geschichte jedes Planeten mit Geologie, Klima und Leben verwoben | Vulkan → Küste → Stadt → Reich → Verkehr → Klima → Vulkan-Nutzung | Leiter 1, Sprosse 8 | 100 Saaten: Kopplungs-Ketten ≥ 4 Glieder (Natur → Mensch → Natur) im Bild nachweisbar ≥ 90 % | |

### Leiter 7 — NEU: Die Menschen jeder Zeit (Menge und Alltag)

Diese Leiter misst, wie viele Menschen eine historische Szene trägt und ob sie leben, wie ihre Zeit lebte. Die Masse an sich misst „Millionen: Bevölkerung, Masse und Strom"; hier zählt, dass die Menge ZEITGEMÄSS ist.

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | 10^2 Bewohner je Ort | Tracht der Epoche, Tagesgang ohne Zeitbezug | Sockelpreis | Bewohner gezählt im Bild, Tracht wechselt mit dem Jahr | HEUTE (118 in der Test-Stadt) |
| 2 | 10^3 sichtbar in einer historischen Stadt | Arbeit der Zeit: Markt, Handwerk, Feld, Fron | Sockelpreis | 100 zufällige Bewohner, Jahr 1400 vs. 1900: Anteil mit zeitgemäßer Tätigkeit blind ≥ 80 % | |
| 3 | 10^4 in einer Stadt (Hansestadt-Größe) | Stände und Schichten sichtbar (Kleidung, Wohnlage, Weg) | Sockelpreis am Markt | Blind: Stand eines Bewohners aus dem Bild erraten ≥ 60 % (Zufall ≤ 25 %) | |
| 4 | 10^5 (Rom des Augustus im Ausschnitt) | Alltag, Feste, Gottesdienst, Wehrdienst im Kalender der Kultur | Sockelpreis | Zeitraffer eines Tages: Menge folgt dem Kalender der Saat (Markttag, Feiertag) mit Korrelation ≥ 0,8 | |
| 5 | 10^6 (Rom 100 n. Chr., Edo 1700) als lebende Stadt | jeder Mensch mit Haus, Arbeit, Familie | Sockelpreis in der Menge | 1 000 zufällige Bewohner: Haus, Arbeit und Familie auffindbar ≥ 95 %; Bild ≤ 33 ms am dichtesten Platz | |
| 6 | 10^7 in einer erfundenen Hauptstadt einer fremden Saat, die keine Erdstadt je trug | Zeitgestalt der Menge (Verkehrsmittel, Stände, Sprache) stimmig | Sockelpreis | Blind gegen Referenzfotos großer historischer Städte: „glaubhaft belebt" ≥ 80 % | |
| 7 (Vision) | 10^8 und mehr Menschen je Metropole, 10^10 je Planet, in jedem Jahr der Zeitachse | jeder ein Leben in seiner Zeit; Tokio heute ein Dorf dagegen | Leiter 1, Sprosse 8 | 1 000 Stichproben (Planet, Ort, Jahr, Person): Lebenslauf zeitgemäß und herleitbar ≥ 95 %, Bild ≤ 33 ms | |

### Leiter 8 — NEU: Geschichte erleben (dabei sein, wenn sie geschieht)

Diese Leiter misst, ob ein historisches Ereignis als Erlebnis in Echtzeit begehbar ist, nicht nur als Kurve, Karte oder Ruine danach.

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | Ereignis nur als Folge sichtbar | Ort danach anders | Sockelpreis | Bildpaar vorher/nachher | |
| 2 | 1 Ereignisart begehbar (Brand) | Feuer greift von Haus zu Haus, Menschen fliehen, Ort bleibt verändert | Sockelpreis während des Ereignisses | Brand im Spiel: Ausbreitung folgt Bauart und Wind, Fluchtwege der Bewohner ≥ 90 % sinnvoll (blind), Bild ≤ 33 ms | |
| 3 | 10 Ereignisarten (Belagerung, Flut, Seuche, Ausbruch, Fest, Krönung) | Ablauf aus Gesetzen, nicht geskriptet | Sockelpreis | 100 Saaten je Art: Ablauf paarweise verschieden ≥ 90 %, plausibel blind ≥ 85 % | |
| 4 | jedes Ereignis der Kette (Leiter 3) ist anspringbar | der Spieler springt auf den Tag des Ereignisses | Wechsel p95 ≤ 5 s | 100 zufällige Ereignisse aus der Kette einer Saat: anspringbar und im Bild sichtbar ≥ 95 % | |
| 5 | Ereignisse aus jeder Perspektive (Bürger, Soldat, Herrscher, Tier) | dieselbe Stunde aus N Blickwinkeln konsistent | Sockelpreis | 5 Perspektiven derselben Stunde: Weltzustand byte-gleich, Bild ≤ 33 ms | |
| 6 (Vision) | jedes Ereignis jeder Zivilisation jedes Planeten erlebbar, von Pompeji bis zur ersten Landung auf einer fremden Welt | Erlebnis wahrer als jedes handgebaute Spiel | Leiter 1, Sprosse 8 | 1 000 Stichproben (Planet, Ereignis): begehbar ≥ 95 %, blind „wahrer als die beste Referenz-Inszenierung" ≥ 50 % | |

## Stand heute

- **Epochen als Tafel:** `fachwerk-core.js:3294-3304` (EPOCHEN) hat 9 Einträge: antike, mittelalter, hanse, barock, gruenderzeit, alpin, mediterran, fernost, moderne. Jeder trägt Region, Jahr, Spanne, Größe und Tracht. Die Tracht besteht aus 3 Schnitten (top · bottom · shoes) plus Farben, etwa Poncho und Shorts für die Antike, T-Shirt und Sneaker für die Moderne. **Geprüft, stimmt.**
- **Baustile je Zeit:** `fachwerk-core.js:3281-3288` (REGION_HIST) kennt 6 Regionen mit Jahren von −800 bis 1965 und 28 Baustil-Pools. Dazu kommen weitere Regeln nach Kalenderjahr: Bau-Epoche Romanik → Moderne (`:8105`), Gassen-Krümmung (`:4417`), Gaslicht bis 1895/1930 (`:4753`). Eine Zukunft gibt es bei Bauten nicht.
- **Herrschaft im Keim:** BURG-GESETZ (`:3705`, zu 50 % per Zufall, nicht aus Lage oder Macht) und STADTMAUER-GESETZ (`MAUER_BIS = 1750`, `:4495`). Nach 1750 fällt die Mauer aus dem Schnitt, ohne Spur im Straßennetz (keine Ringstraße).
- **Jahresringe:** `fachwerk-core.js:3531-3579` (`chronikAnker`, `chronikJahr`, `gestaltFuer`) und `:3653` (JAHRESRING-GESETZ). Der Ort eines früheren Jahrs ist der Kern des jüngeren. Gemessen sind 0,915 Überdeckung je Slot, mit der Zahl der Welt 0,958; ohne Erbe 0,194 (MEISTERKARTE.md:867).
- **Wachstum aus Bewohnern:** `fachwerk-core.js:3580-3620` (`wachstum`, `WACHSTUM.kraftJeS = 1/1800`). Die Bewohner bringen Kraft je Sekunde × Wohlstand ein, Furcht vor erlebter Gewalt bremst. Gemessen über 1 500 s: Jahr 1412 → 1724, 12 → 19/20 Häuser, die alten bleiben zu 0,917 (MEISTERKARTE.md:867, Radeon und GTX).
- **Fahrzeuge durch die Zeit:** `vehicle-core.js:4725` (EPOCHE_GESETZ) hat 6 Stufen: Schlitten −5000, Ochsenkarren, Kutsche, Motorwagen, heute, Zukunft (`law`-Zeile `:4500`). Das ist die einzige Zukunft im Spiel.
- **Zeitreise im Spiel:** nur per Chat-Satz „dorf 7 300 jahr 1560" oder „dorf 7 300 hanse" (`stamm/feld-leben.js:1173-1197`). **Berichtigt:** Der Satz nimmt nur Jahre 1–9999 (`jahr\s+(\d{1,4})`), kein Jahr vor Christus; die Antike erreicht man nur über den Epochen-Namen (Jahr 80). Jeder Satz gründet den Ort neu. Einen Regler gibt es nicht.
- **Was nicht existiert:** Erfindungen, Technikfolgen, Reiche, Grenzen, Ereignis-Ketten (ausgenommen Gewalt → Furcht → Wachstum), Lager und Vorgeschichte bei Bauten, Bodenschichten, Sprachwandel (Ortsnamen aus festen Silben je Region, `NAMEN`, `:3306`), Stammbäume über Generationen, begehbare Ereignisse. Grep nach Erfindung, Dynastie, Imperium und Herrscher findet in Kernen und `stamm/` nichts; „Stammbaum" trifft nur die Studio-Taxonomie (B8), keine Abstammung.
- **Der Kernbefund:** Die Epoche ist ein Nachschlagen nach dem Kalenderjahr der Erde, an mindestens vier Stellen im Code. Die Geschichte ist abgeschrieben, nicht entstanden. Jede Saat hat deshalb dieselbe Epochenfolge.

## Abhängigkeiten

- **Siedlung und Stadt:** Zuerst muss der Ort als Funktion stehen. Jahresringe, Rang und Mauer liegen dort, dieses Blatt gibt ihnen die Zeitachse.
- **Architektur, Gebäude und Innenräume:** Die Tiefe von Leiter 5 hängt am Bau. Weiße Kästen kann keine Epoche retten.
- **Der Mensch (Leib, Gesicht, Kleidung) und Geist/Alltag/Lebenslauf:** Tracht je Epoche, Generationen, Lebensläufe (Leiter 7).
- **Millionen: Bevölkerung, Masse und Strom:** die Masse an sich; Leiter 7 verlangt ihre Zeitgestalt.
- **Arbeit, Technik und Handel:** liefert die Techniken selbst. Dieses Blatt verlangt ihre Kausalordnung und Ausbreitung in der Zeit (Leiter 3).
- **Macht, Recht und Konflikt:** liefert die Mechanik der Herrschaft. Dieses Blatt verlangt Aufstieg und Fall über Jahrhunderte (Leiter 4).
- **Kultur, Sprache, Glaube und Wissen:** Sprachwandel und Ortsnamen (Leiter 2, Sprosse 6).
- **Nahrung, Landwirtschaft und Kulturlandschaft** sowie **Atmosphäre, Wetter und Klima:** Tragfähigkeit und Ernte (Leiter 6, Sprossen 2–3).
- **Tiefe Zeit: der Planet über seine Äonen:** endet, wo die Zivilisationszeit beginnt. Beide teilen den Mechanismus der Zeitachse (Checkpoints).
- **Spur, Verfall und Gedächtnis der Welt:** Ruinen und Schichten (Leiter 2, Sprosse 5) brauchen das Verfallsgesetz.
- **Kopplung, Kaskade und Katastrophe** sowie **Planet und Geologie:** Vulkan, Flut und Küstenwandel (Leiter 6), begehbare Katastrophen (Leiter 8).
- **Evolution und fremdes Leben:** welche Arten Kultur tragen (Leiter 1, 3, 5 jeweils oberste Sprosse).
- **Der Same: Architektur der Entfaltung** sowie **Ankunft, Geräte und Zugang:** Zeit als Koordinate f(Same, Ort, Jahr) mit Ankern. Ohne sie zerbricht der Preis von Leiter 1 (Wechsel ≤ 1 s).
- **Der Spieler: Perspektive, Rolle und Reise:** die Zeitreise als Reiseform, ihr Bedien-Element, die Perspektiven von Leiter 8, Sprosse 5.

## Was die alte Karte hier misst

- **Siedlung K4 „Durch die Jahrhunderte"** (2/2, MEISTERKARTE.md:867):
  - Staffel 1 (Jahresringe ≥ 80 % unter 1320/1560/1860/1935, Rolle, Bauart und Kleidung je Epoche) wird Leiter 1, Sprosse 2, und Leiter 2, Sprosse 2.
  - Staffel 2 (Wachstum in Spielzeit aus Bewohnern, Wohlstand und Furcht) wird Leiter 3, Sprosse 2.
- **Siedlung 10/10-Satz** („die Jahrhunderte sind ein Parameter, keine neuen Assets", MEISTERKARTE.md:855) wird zum Prinzip von Leiter 1 (Preis-Spalte).
- **Siedlung K3 Gelände-Treue** (Gassen-Gefälle p95 ≤ 12 %) wird Leiter 6, Sprosse 1.
- **Siedlung K2 Rang und Größe** (Zipf ζ 1,022) gehört zur Siedlung. Hier ist sie nur Voraussetzung, keine Herrschaft (Leiter 4 bleibt unter der Leiter).
- **Die Fahrzeug-Epochen** (EPOCHE_GESETZ) misst die alte Karte nicht als eigenes Kriterium. Sie fließen in Leiter 5, Sprosse 2, ein.
- Die alte Karte gibt dieser Domäne in Summe 2/2 Punkte, obwohl die Vision fast ganz offen ist. Nach diesem Blatt steht die Domäne auf 6 von 57 Sprossen, jede davon die zweite oder unterste ihrer Leiter.

## Zweifel

- **Blinde Richter:** Leiter 3, Sprosse 6; Leiter 5, Sprossen 3–7; Leiter 7, Sprossen 2–6; Leiter 8, Sprossen 3 und 6 brauchen menschliche Betrachter oder einen Klassifikator. Ein Klassifikator ist ein Modell, nicht die Wirklichkeit, und Menschenpanels kosten. Bleibt das ungelöst, sind diese Richter nach R6 nur halb tragfähig.
- **Zukunft und Fremdes ohne Referenz:** Die Zukunfts- und Fremd-Sprossen haben kein Foto. Ihr Richter prüft innere Stimmigkeit (Statik, Energie, Herkunft aus dem Vorigen) und blinde Glaubhaftigkeit. Das ist schwächer als ein Bildvergleich.
- **Seshat-Verteilungen sind umstritten** und auf Erd-Daten geeicht. Ein KS-Test gegen sie belohnt Erdähnlichkeit, keine Plausibilität fremder Geschichten (Leiter 4, Sprosse 7).
- **„Wahrer als die beste Inszenierung"** (Leiter 8, Sprosse 6) ist ein Präferenztest, kein Wahrheitstest. Er bleibt, weil der Schöpfer ausdrücklich über die Gegenwart hinaus will, aber er misst Geschmack mit.
- **Größenordnungen:** 10^8 Menschen je Metropole und Wechsel ≤ 1 s für jedes (Planet, Ort, Jahr) sind ungeprüft billig genug. Der Same mit Checkpoints ist dafür eine Hypothese; die Preis-Spalte macht die Behauptung prüfbar, nicht wahr.

## Gegenlese — was sich änderte und was strittig bleibt

- **Gehoben:** Die obersten Sprossen von Leiter 1, 2, 3, 5 tragen jetzt fremde Arten und Planeten statt nur Erd-Menschenzeit; Leiter 2 zielt auf die planetare Metropole als Palimpsest; Leiter 5 auf 10^6 Kultur-Gestalten statt „Millionen Zustände" ohne Zählweise.
- **Preis nachgetragen:** 12 Sprossen trugen „—" in der Preis-Spalte; jede trägt jetzt den Sockelpreis oder eine Zusatzzahl. Zwei Preise schrieben eine Bauweise vor (Dreieckszahl, „Speicher wächst mit dem Schirm") und messen jetzt ms und VRAM am Blick.
- **Fleiß → Fähigkeit:** Leiter 3 zählte 10/100/1 000 Erfindungen bzw. Ereignisarten, Leiter 5 20/100/1 000 Epochen — Listenlängen. Jetzt misst Leiter 3 Ordnungsbrüche, Streuung über Saaten und Ursachen-Abdeckung, Leiter 5 blind unterscheidbare Gestalten an Stichproben.
- **Richter am Ergebnis:** Leiter 3, Sprosse 2 maß eine Code-Mutation („wohl → 0"), jetzt das Wachstum im Zeitraffer; Leiter 4, Sprosse 1 verlangt, dass der Herr eine Ursache hat (heute: Münzwurf).
- **Stand berichtigt:** Tracht hat 3 Teile, nicht 4; der Satz erreicht nur Jahre 1–9999, kein Jahr v. Chr.; BURG- und STADTMAUER-GESETZ existieren (Leiter 4 trotzdem unter der Leiter, Leiter 2 zwischen 2 und 3); EPOCHE_GESETZ steht bei `:4725`.
- **Neu:** Leiter 7 (Menschen jeder Zeit, bis 10^8 je Metropole — die „Millionen" fehlten der Zeitachse ganz) und Leiter 8 (Geschichte erleben, dabei sein).
- **Dublette aufgelöst:** Alte Leiter 2, Sprosse 7 („jede Spur hat einen Vorgänger") und Leiter 3, Sprosse 8 („Kette bis zum Samen") maßen dieselbe Herleitbarkeit; Leiter 2 misst jetzt nur das sichtbare räumliche Erbe, Leiter 3 das kausale Warum. Stammbäume wanderten aus Leiter 2 in Leiter 7.
- **Strittig:** ob Leiter 4 hier oder bei „Macht" steht; ob Leiter 7 eine eigene Leiter oder eine Spalte von „Millionen" ist; ob blinde Panels (in über einem Drittel der Sprossen) je billig genug für eine Karte werden, die je SHA misst.
