# MEISTERKARTE 2 — die Karte der Vision

1. **0 von 1 718 Sprossen gebucht — 0,0 % der Vision.** Stand 14.11.2026, nach der Prüfung durch drei Gegner. Dieselbe Welt steht in der alten Karte bei 223 von 330 (68 %) — die alte Karte misst das Spiel, das es gibt; diese misst die Vision.
2. **Im KERN stehen 19 Sprossen in 16 Leitern (gewichtet 0,9 %).** Das ist die zweite Zahl der Karte (Z5): Umfang und Tiefe stehen im echten Spiel an beiden Geräten grün, nur der Preis oder die Fahrt des eigenen Richters fehlt — Pegel nach Sturm, Jahreszeit, Böe, Tempo und Sprung, Tagesplan der Bewohner, Stadt im Siedlungsnetz, Graben mit Wasser, Wachstum des Orts, benutztes Werk, Antwort am Ort, Hall und Stoff-Klang, Reload, die Front in Licht und Nässe, Ankunft unter 60 s.
3. **Warum null:** gebucht wird nur der eigene Richter am Kopf (Z2), und kein Richter dieser Karte ist je gefahren. Die fünf Punkte der vorigen Fassung sind gefallen: die Ausdauer-Messung steht ROT (Heap +185 MB je Minute), der Bild-Takt ist nur an der GTX gemessen, die Bytes sind eine Summe von Dateigrößen statt eines Netz-Mitschnitts, die Ankunft stammt vom 17. und 18.10. und wurde am Kopf nie nachgemessen — sie steht jetzt im Kern.
4. **Was die Zahl nicht mehr verdeckt:** der Preis wächst mit dem Umfang (R8). Eine Sprosse am Ort braucht 33 ms am Standardgerät, aber keine Ankunft in 5 s; erst ab der Stadt gehört die Ankunft zum Preis. So stehen weiße Kästen und Fotohäuser nicht mehr hinter demselben Tor: die Welt, die steht, zeigt sich im Kern, und die Radeon — sie reißt 33 ms im Gehen bei 66 % der Bilder — entscheidet, wann aus Kern Punkte werden.
5. **Was die Karte trägt:** 253 Leitern (220 Kriterien, 33 Kopplungen) in 7 gleich schweren Kapiteln und 42 Perspektiven, von EINEM Ort bis zu jeder Welt jeder Saat; jede Sprosse mit Umfang × Tiefe × Preis und EINEM Richter am Ergebnis. Am Fuß stehen 16 Leitern im Kern, 124 mit einer Messung der alten Karte, die ihren Richter noch nicht trifft, und 113 ohne jede Messung. Die Regeln stehen in `REGELN.md`, die alte Karte in `BRUECKE.md`, die Maschine liest `meisterkarte-2.json`.

| Kapitel | Perspektiven | Leitern | Sprossen | gebucht | Anteil | im Kern | Kern-Anteil |
|---|---:|---:|---:|---:|---:|---:|---:|
| 1 · Der Planet | 6 | 26 | 180 | 0 | 0,0 % | 1 | 0,5 % |
| 2 · Der Kosmos | 1 | 9 | 61 | 0 | 0,0 % | 0 | 0,0 % |
| 3 · Das Leben | 5 | 33 | 223 | 0 | 0,0 % | 2 | 1,1 % |
| 4 · Mensch und Zivilisation | 14 | 84 | 569 | 0 | 0,0 % | 5 | 0,8 % |
| 5 · Erleben und Erschaffen | 6 | 40 | 274 | 0 | 0,0 % | 7 | 2,6 % |
| 6 · Der Same und sein Preis | 5 | 28 | 198 | 0 | 0,0 % | 2 | 0,8 % |
| 7 · Das Zusammenspiel | 5 | 33 | 213 | 0 | 0,0 % | 2 | 0,8 % |
| **Summe** | **42** | **253** | **1 718** | **0** | **0,0 %** | **19** | **0,9 %** |

*Anteil und Kern-Anteil sind gewichtet (Z1): jedes Kapitel wiegt gleich, darin jede Perspektive, darin jede Leiter. Der Kosmos mit 9 Leitern wiegt so viel wie der Mensch mit 84.*

## So liest man die Karte

- **Leiter:** jedes Kriterium ist eine Leiter mit 5–9 Sprossen. Sprosse 1 ist der kleinste Umfang, an dem die Leiter richtbar ist — EIN Ort, EIN Ding; ob es das heute gibt, sagt der Beleg. Die oberste ist die Vision; dazwischen liegt je Sprosse etwa eine Zehnerpotenz Umfang oder eine Stufe Prüfhärte.
- **Sprosse:** Umfang (wie viel, im Spiel gezählt) × Tiefe (wie wahr, gegen die Wirklichkeit und das Beste der Gegenwart) × Preis (P) — und EIN Richter, der im echten Spiel eine Zahl oder ein Bildpaar liefert.
- **HEUTE** `n / N`: die Zahl der gebuchten Sprossen (●) — die höchste, bis zu der jede erreicht ist; in Leitern mit der Marke „Glieder“ jede für sich. **Kern** (◐): Umfang und Tiefe stehen im echten Spiel an beiden Geräten, Preis oder eigener Lauf fehlt — die zweite Zahl, kein Punkt.
- **P** ist die Stufe der Preis-Treppe für den Umfang der Sprosse (R8), am Standardgerät (2026: Radeon 890M und GTX 1060) in derselben Fahrt wie der Richter: Bild p95 ≤ 33 ms ohne Bild über 100 ms, Ton ohne Aussetzer · Speicher unter der Decke der Klasse · 0 Byte über das Skript hinaus · jeder Sprung der Sprosse ≤ 5 s · ab der Klasse Stadt die Ankunft kalt am Ort ≤ 5 s. Die Spalte Preis nennt dazu nur Pose und gefühlte Antwortzeit. Nur die Preis-Leitern (`same.preis.*`) stufen den Preis selbst.
- **Prüfer, Blindpaar, Panel, 2AFC:** der Prüfer-Satz aus R11, gesetzt: ≥ 12 blinde Menschen oder ein an ihnen geeichtes, eingefrorenes Modell; 2AFC 50 % heißt ununterscheidbar. „plausibel“, „stimmig“, „glaubhaft“, „echt“ meinen immer dieses Maß gegen den Referenz-Korpus der Perspektive (er steht über jeder Perspektive in Teil 2).
- **Fremdwelt-Probe (R10):** wo keine Erd-Referenz trägt — Ursache aus dem Bild gelesen (Rang ≥ 0,7), Gegenlauf (Ursache getauscht → Merkmal kippt ≥ 80 %), Neuheit gegen den Korpus bekannter Welten (≥ 30 %).
- **Vergleichstitel:** die vom Schöpfer genannten Messlatten — die Stadt aus Cyberpunk 2077, die jüngste offene Stadt von Rockstar Games — und, sobald ein Titel sie übertrifft, der beste der Gegenwart; gemessen im selben Protokoll wie diese Welt.

## Fünf Leitern, an denen die Vision am stärksten hängt

- **Schirm statt Sack** (`same.entfaltung.schirm`, heute 0 / 7): Der Preis eines Bildes hängt am Schirm, nie an der Welt dahinter — und was er zeigt, hält dem Foto stand. Ohne diese Leiter gibt es weder die Megastadt noch den Planeten bei 33 ms.
- **Rechnung ohne Zuschauer** (`same.entfaltung.abwesenheit`, heute 0 / 7): Die Welt ist eine Funktion von Saat, Ort und Zeit: wer geht und wiederkommt, findet, was geworden wäre, obwohl niemand rechnete. Daran hängen Milliarden Leben, Planeten ohne Zuschauer und jede Zeitreise.
- **Ankunft** (`same.preis.ankunft`, heute 0 / 8, Kern 1): Ab der Klasse Stadt gehört die Ankunft kalt in 5 s zum Preis jeder Sprosse (R8): keine Stadt, keine Megastadt, kein Planet zählt, solange der Klick bis zur ersten Eingabe im ganzen Bild länger braucht — das ist der Abstand zu den Titeln, die erst Gigabyte laden.
- **Jede Saat eine eigene Welt** (`same.entfaltung.vielfalt`, heute 0 / 7): Alles aus EINEM Samen: ob jede Saat eine Welt ergibt, die ein Mensch aus EINEM Bild wiedererkennt und deren Eigenheit eine Ursache hat — im Spiel gezählt, nie im Saat-Raum behauptet. Millionen Arten, Gebäude, Fahrzeuge zählen ihre eigenen Leitern; diese zählt, ob aus ihnen Welten werden.
- **Die gewachsene Kohärenz** (`same.kopplung.kohaerenz`, heute 0 / 7): Platte → Relief → Klima → Wasser → Boden → Biom → Siedlung → Wirtschaft → Verkehr → Kultur: ob die Welt EINE ist, in der jedes Glied aus dem vorigen folgt. Der Vulkan, der die Küste formt, die die Stadt formt.

## Die Worte des Schöpfers in der Karte

Jedes Wort vom 14.11. hat seine Leitern; die rechte Spalte nennt die oberste Sprosse der ersten.

| Wort | Leitern | dort oben steht |
|---|---|---|
| „Planeten“ | `planet.kosmos.welten` · `planet.geologie.platten` · `planet.kosmos.eigengesetz` | 10⁶–10¹¹ Welten im vollen Radius — Mond bis Super-Erde, jede eigen |
| „riesige Städte … Tokio ein Witz dagegen“ | `mensch.stadt.groesse` · `mensch.stadt.messlatte` · `mensch.stadt.vertikal` · `same.entfaltung.schirm` | Jenseits: ≥ 10⁸ Gebäude, ≥ 4·10⁸ Bewohner — zehnmal Tokio in EINER Bebauung — Stadt als Landschaft; alles Gesehene ist betretbar |
| „Cyberpunk 2077 wie ein blasser Abklatsch“ | `mensch.stadt.messlatte` · `mensch.zukunft.medien` · `mensch.zukunft.maschinenwesen` · `mensch.zukunft.leib` · `erleben.bild.nacht` | dieselbe Tiefe in jeder Stadt jeder Epoche, Kultur und Welt — jeder Zufallsort schlägt den besten Schauplatz der Gegenwart |
| „Millionen von Personen“ | `mensch.menge.bevoelkerung` · `mensch.menge.bild` · `mensch.geist.innenleben` | 10¹⁰ je Planet × jedes Jahr × viele Welten — jede Zufallsperson mit Gesicht, Biografie, Ziel |
| „ein Planet, der die Realität zu zeigen vermag“ | `planet.erde.gestalt` · `erleben.kopplung.bild` · `planet.wetter.wolken` · `mensch.bau.huelle` · `mensch.leib.gesicht` · `erleben.spieler.forscher` | jeder Ort, den ein Mensch Heimat nennt — „das ist mein Tal, meine Straße“ |
| „Millionen von Arten“ | `leben.pflanzen.arten` · `leben.tiere.arten` · `leben.evolution.stammbaum` | ≥ 10⁷ Arten aus EINEM Samen, die Erde (~3,9·10⁵ Gefäßpflanzen) darunter — Gestalt, Phänologie und Standort jeder Art folgen aus dem Gesetz |
| „Gebäude“ | `mensch.bau.huelle` · `mensch.bau.innen` · `mensch.stadt.breite` | jedes Bauwerk jedes Planeten — ununterscheidbar vom Foto |
| „Fahrzeuge“ | `mensch.fahrzeug.gestalt` · `mensch.fahrzeug.medium` | 10⁴ Planeten-Saaten — eigene Formensprache je Zivilisation |
| „Pflanzen“ | `leben.pflanzen.dichte` · `leben.pflanzen.lebenslauf` | Planet vom Orbit bis zum Halm, ~10¹⁴ Individuen — Orbitbild gegen Satellit, Nahbild gegen Foto |
| „vom Meer bis zur Wüste“ | `leben.pflanzen.biome` · `planet.wasser.tiefsee` · `planet.wetter.klimazonen` | jeder Planet jeder Saat — ≥ 30 % der fremden Biome ohne irdisches Gegenstück und doch als Lebensraum gelesen |
| „Sonnensysteme“ | `planet.kosmos.systeme` · `same.entfaltung.reise` · `planet.kosmos.galaxien` | 10¹¹ Systeme, keines gespeichert — jedes aus seiner Scheibe |
| „unterschiedlichste Evolutionen“ | `leben.evolution.fremde-physik` · `leben.evolution.muster` | unbegrenzte Welten bis zu Gasriesen-Schwebern — jede Welt mit eigener Geschichte des Lebens, keine eine umgefärbte Erde |
| „alles aus EINEM Samen“ | `same.entfaltung.vielfalt` · `same.entfaltung.gleichheit` | 10⁴ Welten, ≥ 30 % jenseits jeder Erd-Epoche — jede Welt aus einem Bild erkennbar UND aus ihrem Gesetz erklärt |
| „Zeiten bereisen, wie sie unser Planet schrieb“ | `erleben.spieler.zeit` · `mensch.zeit.erde` · `same.kopplung.erdsaat` · `leben.evolution.zeitreise` · `mensch.zeit.spanne` | Millisekunde ↔ 13,8 Ga (≈ 21 Dekaden) stufenlos, Sprung an jedes Datum jedes Planeten — zurück bis zum ersten Licht — dieselbe Saat, dieselbe Geschichte, jedes Mal |
| „Planeten, die unsere Vorstellung kaum zu bauen vermag“ | `planet.kosmos.eigengesetz` · `planet.kosmos.kunstwelten` · `leben.evolution.zivilisation` · `planet.wetter.fremde-atmosphaeren` | jede Saat ein eigenes All: Konstanten, Chemie, Geometrie, Leben, Kultur — Welten, die unsere Vorstellung kaum zu bauen vermag — und doch überall geschlossen |
| „Vulkane, deren Magma fließt und die Oberfläche formt“ | `planet.geologie.vulkan` · `planet.kopplung.kaskade` | Äonen und fremde Welten — Magma-Ozean erstarrt, Flutbasalte, Io-Welten, Kryovulkane; Vulkanhöhe wächst mit sinkender Schwere |
| „Erdplatten“ | `planet.geologie.platten` · `planet.geologie.gebirge` | 10⁶ Saaten von 0,01 bis 10 Erdmassen — Erd-, Deckel-, Venus-, Io- und Eiswelten folgen aus Masse, Wärme und Wasser |
| „Wetterzyklen“ | `planet.wetter.lagen` · `planet.wasser.kreislauf` · `planet.wetter.extreme` | 10⁶ Saaten — bei Erd-Parametern ununterscheidbar von einer Reanalyse |
| „Personen, die sämtliche Sportarten ausführen“ | `mensch.sport.regeln` · `mensch.sport.medium` · `mensch.sport.koerper` · `mensch.sport.arena` | jede Bevölkerung jedes Planeten mit eigener Sportkultur — Kulturen unterscheidbar |
| „jede erdenkliche Perspektive“ | `erleben.spieler.rolle` · `erleben.spieler.nichtleib` · `erleben.spieler.forscher` · `erleben.bild.kamera` · `erleben.sinne.genom` · `same.massstab.spanne` | jedes Lebewesen jedes Planeten jedes Sonnensystems jeder Epoche — die Tiefe jeder Rolle ist die Tiefe ihrer Domäne, nicht flacher |
| „Städte über sämtliche Epochen und Kulturen, tiefer als Rockstar“ | `mensch.stadt.messlatte` · `mensch.zeit.palimpsest` · `mensch.kultur.gestalt` · `mensch.stadt.form` · `mensch.kultur.strassenleben` | dieselbe Tiefe in jeder Stadt jeder Epoche, Kultur und Welt — jeder Zufallsort schlägt den besten Schauplatz der Gegenwart |
| „erst Gigabytes laden, Start bis zu einer Minute“ | `same.preis.ankunft` · `same.preis.bytes` · `same.preis.speicher` | viele Planeten, jede Epoche — wie 6 je (Planet, Epoche) |

**Und mehr, als genannt wurde:** die Unterwelt aus Höhle und Karst, die Tiefsee bis zum Graben, Fossilien, die man ausgräbt und an ihrem Zeitpunkt lebend wiedertrifft, Mikroben und der Anfang des Lebens, Sprachen mit Verwandtschaft, Schrift, Glaube, Recht, Markt und Seuche, Malerei, Bühne und Film, Küche, Mode und Nacht, das Innenleben der Bewohner, Zivilisationen, die keine Menschen sind, Maschinen als Personen, Städte unter Wasser und im All, gebaute Welten und Welten mit eigenem Naturgesetz, fremde Galaxien und das erste Licht, die Sinne von Biene, Hund und Wal, das Instrument des Forschers, der Blick als Fluss, als Stadt, als Stern, Legenden aus wirklich Geschehenem, Klang aus Stoff und Raum, eine Welt, die jede Tat über Zeitalter behält — und der Zugang für jeden Menschen auf jedem Gerät.

---

# Teil 1 — Die Übersicht

## 1 · Der Planet — 0 von 180 Sprossen (0,0 %), 26 Leitern, im Kern 1

Ein Planet, der sich selbst gebaut hat: Platten, die driften, Vulkane, deren Magma fließt und Land macht, Flüsse, die Täler schneiden, Meere mit Gezeiten und Tiefsee, Eis, das kommt und geht, Wetter bis an die Grenze des Chaos. Jede Wand ist ein Archiv, jede Zeit dieses Planeten ist begehbar, von der ersten Kruste bis zur sterbenden Sonne — und die echte Erde ist eine seiner Saaten.

*Heute: EIN Gelände mit Flussnetz und Höhlen-Feld, EINE Wetterfront, EINE Wolkenschicht, EIN Klima — ein Ort, eine Zeit; keine Erd-Saat.*

| Kriterium | Die Vision (oberste Sprosse) | HEUTE | Nächste Sprosse · ihr Richter |
|---|---|---|---|
| **Gestalt aus Platten — Kugel, Kontinente, Drift**<br>`planet.geologie.platten` | 10⁶ Saaten von 0,01 bis 10 Erdmassen — Erd-, Deckel-, Venus-, Io- und Eiswelten folgen aus Masse, Wärme und Wasser | **0 / 9** — Stand 0: ebene Welt, Großform aus drei glatten Rausch-Feldern (gelaende-core.js:361-391), Kontinentalität ohne Ursache; Grep 14.11. ohne Treffer für… | S1: Region 10⁴ km² · *30 Saaten: Gebirgsfläche > 2 km liegt in Gürteln mit Achsen ≥ 4:1 in ≥ 70 %; Blindpaar Schummerung gegen reale Region* |
| **Vulkanismus — Magma, das fließt und Land macht**<br>`planet.geologie.vulkan` | Äonen und fremde Welten — Magma-Ozean erstarrt, Flutbasalte, Io-Welten, Kryovulkane; Vulkanhöhe wächst mit sinkender Schwere | **0 / 7** — Mechanik von Sprosse 1 steht: Lava als Tat-Decke mit Newton-Abkühlung (gelaende-core.js:1787-1831), Bild im Spiel ungemessen. Bild-Preis in der Szene… | S1: Lava als Decke einer Zelle · *Kruste bildet sich und die Glut verlischt im Bild nach der Abkühlkurve gemessener Laven ±30 %; Blindpaar Glutbild gegen Lava-Foto (2AFC ≤ 85 %)* |
| **Gebirge und Bruch — Orogenese, Verwerfung, Beben**<br>`planet.geologie.gebirge` | jede Saat, 10³ Welten — Gipfelhöhe folgt der Schwere | **0 / 7** — Stand 0: keine Faltung, keine Verwerfung, kein Beben (Grep 14.11.); das Schicht-Gesetz T5 (gelaende-core.js:374-375) zählt bei planet.zeit.archiv. | S1: jede Felswand trägt ihre Verformung · *Blindpaar Felswand gegen Foto; in Kollisionszonen ≥ 80 % der Wände verformt, im alten Kraton ≤ 20 %* |
| **Die Unterwelt — Höhle, Karst, Röhre**<br>`planet.geologie.unterwelt` | jede Welt — Lavaröhren weiter bei kleiner Schwere, Eishöhlen, Methan-Karst | **0 / 6** — Mechanik von Sprosse 1 steht im Kern: Rauschfelder Wurm/Kaverne/Halle (gelaende-core.js:6843-6865), Mündungs-Gesetz (gelaende-core.js:2800-2806, 5… | S1: Höhlen-Feld bis ~28 m unter Basis, Mündung im Fels · *Mündungen je km² an 3 Saaten im Band; Mund im Bild an ≥ 90 % im Fels* |
| **Gestein und Lagerstätte — die Kraft, Funde vorherzusagen**<br>`planet.geologie.lagerstaette` | fremde Chemie jeder Saat, 10³ Welten — andere Elementverteilung, andere Lagerstätten | **0 / 6** — Stand 0: die Fels-Genese-Achse liegt im Kern (foundry-core.js:5204 rockPhenotype), wählt aber nur die Sorte eines Brockens; kein Leser bindet sie an… | S1: Gestein je Ort aus seiner Genese · *Jury trennt drei Genesen ≥ 80 %; Genese passt zur Geschichte des Orts ≥ 85 %* |
| **Das Innere spricht — Feld, Wärme, Schalen**<br>`planet.geologie.inneres` | fremde Innere, 10³ Welten — feldlose Welten, Mehrpol-Felder, Monde ohne Kern | **0 / 6** — Stand 0: kein Magnetfeld, kein Wärmefluss, kein Schnitt (Grep 14.11.). | S1: Kompass auf einem Dipol-Planeten, 20 Orte · *Inklination ≤ 5° gegen Dipol an 20 Orten; Deklination ändert sich mit dem Ort* |
| **Einschlag und Krater — die Haut als Uhr**<br>`planet.geologie.einschlag` | jede Welt — Atmosphäre und Kleinkörper-Dichte setzen das Kraterbild | **0 / 7** — Stand 0: „Krater“ im Code sind Grab-Edits des Spielers. | S1: ein Krater als Form · *einfache Krater Tiefe/Durchmesser 1:5 ±20 %; Profil gegen reale Krater ≤ 15 %* |
| **Relief aus Abtrag — die Großform gegen die Erde**<br>`planet.relief.grossform` | 100 Welten beliebiger Konstanten — fremde Agenzien erzeugen stimmige Großformen | **0 / 7** — Mechanik von Sprosse 1 steht HEADLESS: 293/293 Läufe enden in See oder Meer (MEISTERKARTE.md:240, d3708675), im Spiel nie nachgefahren. Bild-Preis in… | S1: 1 Saat, Flussnetz bis zum Horizont · *im Spiel an 20 Orten nachgefahren: 100 % der Läufe enden in See oder Meer* |
| **Formschatz — Land- und Küstenformen aus Prozessen**<br>`planet.relief.formschatz` | 100 fremde Welten — Formen, die die Erde nicht kennt, die Physik aber verlangt (Sublimationsmulden, Methan-Flussnetze, Niedrig-g-Rutschungen) | **0 / 8** — Stand 0: Profil-Gesetze V/Trog und Schichtstufe stehen im Kern (gelaende-core.js:374-375, 387-388), Mäander kinematisch (gelaende-core.js:765-784); k… | S1: 3 Klassen · *Blind-Klassifikation von Ego-Bildern an 20 Saaten ≥ 80 %* |
| **Boden — Gestein wird Boden mit Horizonten**<br>`planet.relief.boden` | Planet × Epoche × fremde Welt — begrabene Paläoböden, Löss der Kaltzeit, Regolith, Perchlorat-Böden | **0 / 6** — Stand 0: keine Horizonte, keine Bodenarten; Erdbodenfarbe aus Rausch-Flecken (stamm/gelaende-boden.js:2459-2556). | S1: Fels und Erdboden eines Orts · *Blindpaar Ego-Bild gegen Foto gleichen Hangs und Klimas (2AFC ≤ 85 %); an 30 Zufallsposen liegt Schutt am Steilen und Moos im Feuchten wie im Foto-Korpus (Anteile ±20 %)* |
| **Lebendige Form — das Relief ändert sich in Spielzeit und über Epochen**<br>`planet.relief.wandel` | 100 Welten × 10 Epochen — jede Welt trägt ihre eigene Abtragsgeschichte | **0 / 7** — Stand 0: ein Spieler-Graben füllt sich mit Wasser (MEISTERKARTE.md:238), das Wasser gräbt aber nicht. | S1: 1 Graben · *Volumen-Bilanz Abtrag = Ablagerung ±10 %, sichtbar in ≤ 10 min Spielzeit* |
| **Seegang — die See, wie ein Seemann sie liest**<br>`planet.wasser.seegang` | fremde Meere — Methan-See, Wasserwelt, Lava-Meer gehorchen ihrer Schwere, Dichte, Zähigkeit | **0 / 8** — Mechanik halb: spiegelTreue 0,73 an EINER von 12 Posen (GTX); Weißkappe aus Monahan im Gesetz auf 3 % (foundry-core.js:160-161), Bild ungemessen. Bil… | S1: eine Wasserfläche, 12 Posen · *spiegelTreue ≥ 0,6 an 12 Posen (Uhr × Wetter) in Ausgabe-Größe* |
| **Gezeiten und Sturmflut — der Spiegel in der Stunde**<br>`planet.wasser.gezeiten` | fremde Monde — Doppelmonde, Gezeitenheizung von Eismonden | **0 / 7** — Stand 0: Meeresspiegel ist eine Konstante, Basis − 3 m (gelaende-core.js:2687); 0 Treffer für Gezeit/Tide/Ebbe. | S1: 1 Küste, 24 h · *Watt fällt sichtbar trocken: benetzte Fläche Ebbe gegen Flut im Bild, Periode ±2 %* |
| **Strömung — das Wasser, das Dinge und Wärme trägt**<br>`planet.wasser.stroemung` | fremde Ozeane — andere Rotation, andere Kontinente, Ozean unter Eis | **0 / 7** — Mechanik von Sprosse 1 steht HEADLESS: 4/4 Fluss-Orte (Strömung WG.wellen.adv, stamm/bild-sicht.js:1224-1228); Ozean ohne Strömung. Bild-Preis in der… | S1: Flüsse einer Region · *Treibgut-Probe an 4 Fluss-Orten > 0,5 m in 90 Takten, im Spiel mit Bild* |
| **Eis — vom Schnee zum Eisschild**<br>`planet.wasser.eis` | Schneeball-Planet und Eismonde — ganzer Planet friert (Albedo-Kippe), Ozean unter 20 km Eis | **0 / 7** — Mechanik halb: See-Eis nach Stefan (gelaende-core.js:1341-1422) trägt headless 1 151 Schritte; Schneedecke mit Tiefe 1/2 (wetter.K4); kein Gletscher… | S1: Schnee einer Region · *Schneegrenze gegen Nullgrad-Höhe ±150 m an 10 Posen × 4 Jahreszeiten; Fuß sinkt ≥ 5 cm* |
| **Der Kreislauf — EINE Bilanz vom Meer bis zum Aquifer**<br>`planet.wasser.kreislauf` | fremde Kreisläufe — Methan-Kreislauf, Wüstenplanet mit Polkappen, Treibhaus-Ozeanverlust | **0 / 6** · Kern 1 — Mechanik von Sprosse 1 steht: Bilanz 1,006 headless, Pegel-Bild an beiden Geräten (wetter.K3 2/2); Regen kommt als Wetter-Stempel, nicht aus Verdunst… | S1: Region 2 km · *Pegel nach Sturm im Bild; Scheitel-Verzug gegen Einzugsgebiet im Erd-Band; Regen × Fläche ↔ ΔVolumen ±10 %* |
| **Unter dem Spiegel — der Raum, der 70 % des Planeten ist**<br>`planet.wasser.tiefsee` | fremde Ozeane — unter 20 km Eis, Methan-See, Hochdruck-Ozean | **0 / 6** — Stand 0: Absorption und Sicht je Wasser-Art als Gesetz (foundry-core.js:163-172), im Bild ungemessen. | S1: See, Fluss 0–10 m · *Rot-Anteil fällt bis 5 m auf ≤ 30 %; Sicht gegen Secchi-Referenz ±30 %* |
| **Wetterlagen — das synoptische Wetter vom Orbit bis zum Ort**<br>`planet.wetter.lagen` | 10⁶ Saaten — bei Erd-Parametern ununterscheidbar von einer Reanalyse | **0 / 7** — Mechanik von Sprosse 1 steht: wetterAt als drei Sinus-Wellen längs der Hauptrichtung (phyto-core.js:4067-4091), wetter.K1 2/2. Bild-Preis in der Szen… | S1: 5 Wetter-Zeilen, Bänder ziehen über wenige km · *Regen an A bei trockenem B ≥ 20 % der Zeit, Lag ±20 %* |
| **Wolken, Niederschlag und Luft im Bild**<br>`planet.wetter.wolken` | 10⁶ Wolken zugleich, jede Saat, jede Epoche — ununterscheidbar von Fotografie | **0 / 7** — Mechanik von Sprosse 1 steht: WOLKEN_SCHICHT (welt-licht.js:850), Licht der Oberseite (welt-licht.js:994-1003). Bild-Preis in der Szene des Richters… | S1: EINE Wolkenschicht 800 m, Karte ≈ 8 km · *Zeitraffer der Schicht gegen Zeitraffer-Film realer Schichtwolken (2AFC ≤ 85 %); Zuggeschwindigkeit der Schatten am Boden im Band realer Wolkenzüge (2–20 m/s) und gleich der Wolke darüber (Versatz ≤ 5 %)* |
| **Klimazonen und Jahreszeiten**<br>`planet.wetter.klimazonen` | 10⁶ Planeten-Klimata — plausibel ohne Erd-Parameter | **0 / 7** — Mechanik von Sprosse 1 steht: EIN Klima 18/−4 °C, 0,11 K/m (gelaende-core.js:1285-1305), wetter.K4 1/2. Bild-Preis in der Szene des Richters an beide… | S1: 1 Klima, Höhe gestaucht · *Temperatur am Meer 18/−4 °C, Schneegrenze folgt der Saison* |
| **Extreme und Wiederkehr**<br>`planet.wetter.extreme` | Katastrophe in der Megastadt, 10⁵ sichtbare Dinge — Hurrikan landet, Sandsturm verschluckt die Stadt | **0 / 6** — Stand 0: keine Extreme jenseits des Sturm-Worts. | S1: Flut über Tage, ein Fluss · *nach 100 mm Starkregen: Überflutung ≥ Aue, Bildpaar* |
| **Der lesbare Himmel — bis an die Grenze des Chaos**<br>`planet.wetter.vorhersage` | 10 Welten — Vorhersagegrenze folgt der Dynamik der Welt | **0 / 6** — Stand 0: das Wetter ist drei Sinus-Wellen, ohne Vorlauf und ohne Chaos. | S1: Stunden · *100 Regenbeginne: Bedeckung stieg in den 60 min davor aus der Windrichtung in ≥ 70 %* |
| **Fremde Atmosphären — dasselbe Gesetz, andere Welten**<br>`planet.wetter.fremde-atmosphaeren` | 10⁶ Planeten, ein Sonnensystem in Reise — jede Saat eine geschlossene Atmosphäre, Wetter läuft während der Reise | **0 / 7** — Mechanik von Sprosse 1 steht: ATMO_GESETZ nach Hillaire (foundry-core.js:283-308); die Fremdwelt „ferne“ tauscht nur die Rayleigh-Tiefe, gesetzt stat… | S1: 1 Atmosphäre (Erde), parametrisch · *Himmelsfarbe Mittag/Abend gegen Foto* |
| **Klima, Eis und Meeresspiegel über die Äonen**<br>`planet.zeit.klimageschichte` | jede Epoche jedes Planeten, nahtlos — Klimageschichte konsistent mit der Geologie | **0 / 9** — Stand 0: das Jahr wiederholt sich ohne Drift; Meeresspiegel fest bei Basis − 3 m. | S1: 10² Jahre · *+100 a bei +2 °C: Schneegrenze +300 m ±30 %; Küste wandert um Δh/Strandneigung ±25 %* |
| **Die Welt als Archiv — Schicht, Wand, lesbare Geschichte**<br>`planet.zeit.archiv` | jede Säule jeder Welt über 4,5 Ga — ein Gesteinsgedächtnis, das sich liest wie ein Feldbuch | **0 / 8** — Mechanik von Sprosse 1 steht: Schicht-Gesetz T5 Pediment → Schutthang → Kliff (gelaende-core.js:374-375, schichtMass :1028), nicht mit eigenem Auge b… | S1: Schicht als Form im Tafelland · *Kliff 60–85° und Schutthang im Bild an Tafelland-Saaten* |
| **Die echte Erde — erkannt und vermessen**<br>`planet.erde.gestalt` | jeder Ort, den ein Mensch Heimat nennt — „das ist mein Tal, meine Straße“ | **0 / 6** — Stand 0: es gibt keine Erd-Saat (siehe same.kopplung.erdsaat). | S1: EINE Region der Erde, 10⁴ km² (ein Golf mit Vulkan) · *Küstenlinie gegen das Höhenmodell: mittlerer Lagefehler ≤ 5 km; Ortskundige wählen die Region aus 10 Kandidaten an 3 Ego-Bildern ≥ 70 %* |

## 2 · Der Kosmos — 0 von 61 Sprossen (0,0 %), 9 Leitern, im Kern 0

Über dem Planeten ein Himmel aus Bahnen, Sterne, die entstehen und vergehen, Sonnensysteme aus ihrer Scheibe und Welten, auf denen man steht — bis zu Welten mit eigenem Naturgesetz, gebauten Welten, fremden Galaxien und zurück zum ersten Licht. Planeten, die unsere Vorstellung kaum zu bauen vermag.

*Heute: 2 800 Sterne an einer Kugel, eine feste Sonnenbahn, zwei gesetzte Welten mit EINER Physik.*

| Kriterium | Die Vision (oberste Sprosse) | HEUTE | Nächste Sprosse · ihr Richter |
|---|---|---|---|
| **Himmelsmechanik am Ort — Tag, Jahr, Mond, Finsternis, Äonen**<br>`planet.kosmos.himmelsmechanik` | jede Welt, jede Zeit, viele Monde und Sonnen — Himmel aus den Bahnen aller Körper | **0 / 8** — Mechanik halb: feste Sonnenbahn ohne Breite (welt-licht.js:696-714), Richter der Tag-Kurve 0/2 (licht.K1); Mond immer voll (welt-licht.js:715-719); d… | S1: 1 Tag-Achse für alle Orte · *Sprung ≤ 0,1 EV je Uhrschritt über die ganze Bahn, Ego und Third, beide Geräte* |
| **Sternhimmel, Galaxie, Universum**<br>`planet.kosmos.sternhimmel` | 10¹¹ Galaxien, 13,8 Ga — kosmisches Netz, Rotverschiebung, Galaxien-Entwicklung | **0 / 7** — Mechanik von Sprosse 1 steht: 2 800 Sterne aus der Saat an einer Kugel von 480 m (stamm/bild-himmel.js:307-421), drei Wandelsterne als feste Punkte.… | S1: ~2 800 Punkte der Saat · *Zahl sichtbarer Sterne je Sonnenhöhe folgt der Grenzgrößen-Tafel* |
| **Das Leben der Sterne — Entstehung bis Überrest**<br>`planet.kosmos.sterne` | Sterne als Generationen — das eigene System aus dem Staub früherer Sterne | **0 / 7** — Stand 0: die Sonne hat kein Alter. | S1: die eigene Sonne über 10⁹ a · *Zeitsprung +5 Ga: Leuchtkraft +~50 % ±10 %, Belichtung am Boden gemessen* |
| **Sonnensysteme aus der Scheibe**<br>`planet.kosmos.systeme` | 10¹¹ Systeme, keines gespeichert — jedes aus seiner Scheibe | **0 / 7** — Stand 0: jahrTage: 365 ist eine Zahl, keine Bahn (gelaende-core.js:1304). | S1: 1 Stern, 1 Planet, 1 Mond · *Bahn am Himmel beobachtet: Planet und Mond stehen über ein Spieljahr gegen die Ephemeride der eigenen Bahn ≤ 0,5°; Mondphase je Woche im Bildpaar* |
| **Fremde Welten begehbar — Schwere, Rotation, Bauart, voller Radius**<br>`planet.kosmos.welten` | 10⁶–10¹¹ Welten im vollen Radius — Mond bis Super-Erde, jede eigen | **0 / 6** — Mechanik halb: zwei gesetzte Welten (stamm/daten.js:68-81), Schwere als Regler mit 5 Lesern, aber Fahrzeug 9,8 (vehicle-core.js:3307) und Lab g = 20… | S1: Heimat + 1 Fremdwelt · *Licht-Bilanz an der Kugel 5–12,5 an beiden Welten; Fremdwelt-Mittag: Zenit nicht blau* |
| **Himmelsereignisse am Boden — Meteor, Komet, Polarlicht**<br>`planet.kosmos.ereignisse` | jede Welt — Ringe, Gürtel, Monde, Stern setzen Rate und Art | **0 / 6** — Stand 0: keine Meteore, Kometen, Polarlichter. | S1: sporadische Meteore jede Nacht · *5–10 je Stunde am dunklen Himmel; Spurlängen gegen Meteor-Kamera-Netze ±30 %* |
| **Welten mit eigenem Naturgesetz**<br>`planet.kosmos.eigengesetz` | jede Saat ein eigenes All: Konstanten, Chemie, Geometrie, Leben, Kultur — Welten, die unsere Vorstellung kaum zu bauen vermag — und doch überall geschlossen | **0 / 7** — Stand 0: EINE Physik; die Schwere ist ein Regler mit 5 Lesern, Fahrzeug und Labor tragen eigene feste Werte (siehe planet.kosmos.welten) — keine Welt… | S1: EINE Welt, EINE Konstante anders (Schwere-Exponent, Stoff-Dichte, Zähigkeit) · *20 Versuche des Spielers (Fall, Wurf, Pendel): Messwerte aus dem Bild folgen dem Gesetz der Welt ±5 % und weichen vom Erd-Gesetz ab* |
| **Gebaute Welten — Ring, Schale, Hohlwelt, Scheibe**<br>`planet.kosmos.kunstwelten` | 10³ gebaute Welten aus Saaten, jede von einer anderen Zivilisation — Bauart folgt Stern, Stoff und Technik der Erbauer | **0 / 6** — Stand 0: der Boden ist eine flache Ebene (siehe same.massstab.spanne); keine gebaute Welt. | S1: EIN Drehzylinder, 10 km · *Wurf-Versuch: die Bahn weicht um die Coriolis-Ablenkung ab ±10 %; der Horizont steigt im Bild* |
| **Galaxien, Haufen und das junge All — als Ziel**<br>`planet.kosmos.galaxien` | die ferne Zukunft des Alls — Galaxien verschmelzen, Sterne verlöschen, der Himmel wird leer | **0 / 7** — 2 800 Sterne an einer Kugel von 480 m (siehe planet.kosmos.sternhimmel); keine Galaxie als Ort, keine Zeit vor dem Planeten. | S1: EINE Nachbargalaxie als Ziel · *am Ziel steht die Heimatgalaxie am Himmel in der richtigen Richtung und Größe ±5 %; Bildpaar Anflug gegen Teleskop-Aufnahme (2AFC ≤ 80 %)* |

## 3 · Das Leben — 0 von 223 Sprossen (0,0 %), 33 Leitern, im Kern 2

Millionen Arten aus EINEM Wachstums- und EINEM Bauplan-Gesetz, jede mit Stammbaum, kein Individuum dem anderen gleich; Herden, Schwärme und Züge bis zum Krill-Maß; Nahrungsnetze, die sich halten und kippen; Riff, Kelpwald und Tiefsee; Evolution, die auf jeder Welt eine andere Geschichte schreibt und im Gestein ihre Spur lässt — bis zu Zivilisationen, die keine Menschen sind.

*Heute: zwölf Baumgestalten und acht Leib-Typen von Hand, vier Säuger in einem Tal, höchstens 20 gezeichnete Leiber; die Wiese trägt bis ~20 m.*

| Kriterium | Die Vision (oberste Sprosse) | HEUTE | Nächste Sprosse · ihr Richter |
|---|---|---|---|
| **Pflanzenarten aus EINEM Wachstumsgesetz**<br>`leben.pflanzen.arten` | ≥ 10⁷ Arten aus EINEM Samen, die Erde (~3,9·10⁵ Gefäßpflanzen) darunter — Gestalt, Phänologie und Standort jeder Art folgen aus dem Gesetz | **0 / 7** — 12 Gestalten von Hand (stamm/vegetation-baum.js SPECIES_TREE_PARAMS) + baum_mammut (phyto-core.js); kein Gesetz erzeugt Arten; der Blindtest von Spro… | S1: 10 Gestalten, je von Hand parametrisiert · *Blindtest 10 Bilder je Gestalt: Gattung ≥ 80 % richtig; Herbar-Bildpaar je Gestalt ≥ 0,7* |
| **Biome folgen aus Klima, Boden und Licht**<br>`leben.pflanzen.biome` | jeder Planet jeder Saat — ≥ 30 % der fremden Biome ohne irdisches Gegenstück und doch als Lebensraum gelesen | **0 / 6** — Waldgrenze unter dem Sommer-Schnee und Feuchte-Arten GRÜN, aber die Palme folgt dem Rauschen `lebendig` (stamm/feld-leben.js) statt Wärme: ROT an Spr… | S1: ein Klima; Mosaik Wald ↔ Lichtung ↔ Ufer ↔ Gipfel · *Bild am Gipfel baumfrei; Stichprobe: Uferarten am Wasser ≥ 90 %, Wärme-Arten außerhalb der Wärme 0* |
| **Keimen, Wachsen, Altern, Sterben — auch ungesehen**<br>`leben.pflanzen.lebenslauf` | jede Pflanze jedes Planeten, auch ungesehen — Zustand an jedem Ort ist eine Funktion der Zeit, nie ein Speicherstand | **0 / 6** — reverse-J-Größen und Selbstastung stehen als statischer Parameter (phyto-core.js:2899); Verjüngung nur im Labor („Host has no pass“); der Ertragstafe… | S1: 1 Bestand: statische Altersverteilung, stehendes Totholz · *Höhenhistogramm aus dem Bild gegen Ertragstafel* |
| **Der Jahreslauf: Austrieb, Blüte, Frucht, Laubfall**<br>`leben.pflanzen.jahreslauf` | fremde Planeten: Jahre von Tagen bis Jahrhunderten, Doppelsterne — der Jahreslauf folgt der Bahn, nicht dem Erdkalender | **0 / 6** · Kern 1 — Alte Vegetation K5 2/2 im echten Bild: Krone Winter 0,037 × Sommer (Radeon), 0,113 (GTX); Wiese niedriger; Mess-Wiese, GTX stehend p95 16,8 ms. | S1: Laubbäume + Wiese, 3 Saisonphasen an einem Ort · *Pixelanteil der Krone im Zeitraffer (Klassen-Maske)* |
| **Dichte und Ferne: vom Halm am Stiefel bis zum Orbit**<br>`leben.pflanzen.dichte` | Planet vom Orbit bis zum Halm, ~10¹⁴ Individuen — Orbitbild gegen Satellit, Nahbild gegen Foto | **0 / 6** — P an der Wiese GRÜN (GTX p95 16,8 ms), Tiefe ROT: Saum springt (alte Vegetation K1 0/2), Wald 24 Stämme/ha gegen 370–900, Unterholz 0,029 gegen 0,25–… | S1: Wiese dicht bis ~20 m, Wald licht · *Ring-Bildanteil gegen Foto; Bildpaar gegen REF real-mischwald* |
| **Pflanze unter Wind, Last und Berührung**<br>`leben.pflanzen.kraft` | jede Pflanze im Blick antwortet auf jede Kraft, Orbit bis Halm, unter fremder Schwere und Luftdichte — Biegung skaliert mit Last, g und Dichte | **0 / 6** · Kern 1 — Alte Vegetation K2 1/2: die Böe nah (0–15 m) an einem Gerät als zeitliche Luma-Varianz über dem Rausch-Boden mit Böen-Laufzeit; Staffel 2 (bis 300 m… | S1: Böe nah 0–15 m · *zeitliche Luma-Varianz über dem Rausch-Boden mit Böen-Laufzeit* |
| **Tierarten aus dem Samen — Land, Luft und Wasser**<br>`leben.tiere.arten` | jeder Same eine eigene Fauna ohne Decke; fremde Baupläne aus fremder Schwere, Atmosphäre und Chemie — fremde Art folgt aus ihrer Welt | **0 / 8** — ≈ 8 Leib-Typen von Hand: Wolf, Fuchs, Bär, Hirsch aus fünf Dials (tetrapoda-core.js:62), Singvogel, Star, Bachforelle als Oktaeder, Hummel als Doppel… | S1: ≈ 10 Leib-Typen von Hand in Land, Luft, Wasser · *Spielgang 1 h an 3 Biomen: ≥ 5 Arten im Bild (Klassen-Maske ≥ 200 px)* |
| **Leib und Fortbewegung über Masse-Dekaden und Medien**<br>`leben.tiere.bewegung` | fremde Schwere 0,1–5 g, dünne bis dichte Atmosphären, Flüssigkeiten jenseits Wasser — Gang ∝ √(g·L); Flug nur, wo Dichte und g ihn tragen | **0 / 8** — Gang aus Froude für 4 Säuger, Schlupf max 0,011 in 25 Läufen — headless (alte Tiere K3), am Gerät halb; der Fisch pendelt als starrer Leib 2,5 Hz (te… | S1: 1 Bauplan, 4 Gattungen, 10–300 kg, laufen · *Fußgleiten und Gangwechsel aus der Third-Aufnahme im Fenster* |
| **Verhalten aus Bedürfnis, Sinn und Leib**<br>`leben.tiere.verhalten` | jede Art jedes Planeten — Verhalten folgt aus Leib, Sinn und Welt, auch unter fremden Sinnen | **0 / 7** — Jagd-Kreislauf, Furcht mit Gedächtnis, Ethogramm aus Bedürfnis-Pegeln (tetrapoda-core.js VERHALTEN): Rudel reißt 18/60, Budget Hirsch ruhen 0,409/0,4… | S1: 4 Gattungen, ≈ 10 Akte, 2 Sinne · *Zeitraffer 24 Spielstunden im Fenster* |
| **Lebenszyklus: Geburt, Aufzucht, Balz, Brut, Tod**<br>`leben.tiere.lebenszyklus` | jedes Tier jedes Planeten, fremde Fortpflanzung (Knospung, Generationswechsel) — der Bestand erneuert sich ohne Skript | **0 / 7** — Geburt und Tod als Zahl je Revier mit Holling-III-Riss und Alterstod (BESTAND_GESETZ, tetrapoda-core.js:2177) — headless; sichtbares Wachstum, Brunft… | S1: Geburt und Tod als Bestand je Revier · *Bestand je Revier über 3 Spielstunden im Band, im Fenster* |
| **Herde, Schwarm, Pulk: die Masse im Bild**<br>`leben.tiere.masse` | Krill-Maß 10¹⁴ Leiber auf dem Planeten, jeder nah betauchbar — die Dichte stimmt auf jeder Höhe | **0 / 8** — Kohäsion fliehend 0,981 headless, Radeon ROT (alte Tiere K1 1/2); Star-Trupp 60–140 gebaut, am Gerät ungemessen; ~30 Fische einzeln, kein Fischschwar… | S1: 10 Glieder: Rudel, Kahlwild · *Herde flieht als EIN Pulk im Bild* |
| **Wanderung und Raum**<br>`leben.tiere.wanderung` | 7·10⁷ m: planetare Wanderung (Küstenseeschwalbe ≈ 70 000 km/Jahr), auf jedem Planeten — Zugrouten verschieben sich mit dem Klima | **0 / 7** — Leine 18 m × Körpergröße (tetrapoda-core.js:225), Wildwechsel zur Tränke aus Durst — headless; Streifgebiet im Fenster nie gemessen; keine Wanderung. | S1: 10 m: Leine um den Geburtsort · *Aufenthaltsfläche eines Individuums über 1 Spieltag im Fenster* |
| **Tier und Spieler: Begegnung, Reittier, Domestikation, Tier-Sein**<br>`leben.tiere.mensch` | jedes Tier jedes Planeten spielbar, fremde Sinne als Perspektive — Leib und Sinn aus dem Samen | **0 / 7** — Fluchtdistanz aus dem Furcht-Gesetz und ein gebundenes Tier folgt 600 s (alte Ökologie K3/K5) — headless; das Rudel pirscht und umstellt den Spieler… | S1: Wildtier reagiert auf den Spieler, 4 Gattungen · *Annäherungs-Probe im Fenster* |
| **Lebensräume im Wasser entstehen aus Physik**<br>`leben.wasser.lebensraeume` | fremde Ozeane: Methan-Seen, Ozeane unter Eis, Superdruck-Meere — eigene Lebensräume aus fremder Chemie durch dieselben Gesetze | **0 / 7** — 1 von 15: der Bach-Kolk mit Forellen am Strömungsschatten — headless, Preis an der Fisch-Pose nie gemessen; Uferflora teils; das Meer ist Höhe und Wa… | S1: 1 von 15: Bach-Kolk mit eigener Fauna · *Lebensräume mit eigener Fauna im Bild zählen* |
| **Das Bild unter Wasser: Licht, Trübe, Leib**<br>`leben.wasser.bild` | jedes Wasserbild jedes Planeten — Fotorealismus unter jeder Sonne und Chemie | **0 / 7** — Sicht 19,6 m am Bach, Absorption und Rückstreuung je Kanal nach Gordon 1975 (stamm/bild-sicht.js:217) — headless; 3 feste Wasserkörper, das Meer lies… | S1: Sicht unter Wasser an Bach, See, Fluss · *Sichtweite in m an fester Pose gegen das Band des Gewässertyps* |
| **Primärproduktion und Größenspektrum im Wasser**<br>`leben.wasser.netz` | jeder Ozean jedes Planeten, fremde Primärproduktion (Chemosynthese, fremdes Licht) — das Größenspektrum hält auch fremd | **0 / 6** — Fische folgen dem Pegel (0,335 → 0,363) und fliehen ≥ 3 m — headless; Plankton nur als Kommentar zur Trübe des See-Körpers (foundry-core.js:163), kei… | S1: Fisch liest Pegel und Spieler · *Hub und Flucht aus dem Bild* |
| **Rhythmen des Wasserlebens: Tag bis Jahrtausend**<br>`leben.wasser.rhythmen` | jeder Rhythmus jedes Ozeans jedes Planeten (Gezeiten fremder Monde, Jahre anderer Bahnen) — der Takt folgt Bahn und Gezeit | **0 / 6** — Sekunden: Schwanzschlag, Flucht, Heimkehr nach 8 s — headless, Preis nie gemessen; keine Tagesuhr für Fische. | S1: Sekunden: Schwanzschlag, Flucht, Heimkehr · *Heimkehr ≥ 60 % im Fenster* |
| **Das Nahrungsnetz: Breite, Stabilität, Wahrheit**<br>`leben.oeko.netz` | 10⁷ Arten je Planet, jeder Planet eines Systems mit eigener Biosphäre, fremde Biochemie — gleich schlüssig wie die Erde | **0 / 7** — 4 Land-Säuger mit Beute nach Masse (beuteMasse 2,0, tetrapoda-core.js:166), Bestand aus Nahrung × Lebensraum (alte Ökologie K2 2/2) — headless, unter… | S1: 4 Säuger-Arten, 3 Ebenen, ein Tal · *8 Saaten im Fenster: jede Art in [⅓×, 3×] des Starts über 6 Spielstunden* |
| **Vielfalt am Ort und ihre Gesetze**<br>`leben.oeko.vielfalt` | jeder Ort jedes Planeten trägt seine Vielfalt, ohne dass der Spieler sie ruft — sie lebt ohne den Spieler weiter | **0 / 8** — Alte Tiere K5 Staffel 1: ≥ 3 Tier-Sichtungen im Ausgabe-Bild je 10 Spielminuten an einem Gerät (Klassen-Maske tier ≥ 200 px); Herde ≥ 20 und 150 Tier… | S1: ≥ 3 Tier-Sichtungen je 10 Spielminuten · *Spielgang 10 min, Tier im Bild ≥ 200 px* |
| **Dynamik: Zyklen, Kaskaden, Ausbrüche, Invasionen**<br>`leben.oeko.dynamik` | jeder Planet, 10⁴ Jahre, alle Dynamiken zugleich — Zyklen, Ausbrüche, Kaskaden emergent und ohne Skript | **0 / 7** — Wölfe weg → Hirsche +0,448 [0,321; 0,536], Jungwuchs −0,279 über 8 Saaten (alte Ökologie K1 2/2) — headless, im Fenster nie. | S1: ein Tal, Spielstunden · *Kaskaden-Richtungen mit Intervall, das 0 nicht schneidet* |
| **Zerfall: Aas, Totholz, Pilz, Boden**<br>`leben.oeko.zerfall` | jeder tote Körper jedes Planeten; der Walfall nährt die Tiefsee Jahrzehnte — Bilanz geschlossen | **0 / 6** — Kadaver wird gewittert, gefressen, sinkt (tetrapoda-core.js:168); gedüngt wird nur ein Tod von Spieler-Hand (stamm/kreatur-leben.js:918); Totholz und… | S1: Säuger-Kadaver · *Kadaver-Masse sinkt mit Fresser-Zahl; Nährstoff steigt nach jedem Tod (Wolf, Alter, Spieler)* |
| **Sukzession: EIN Gesetz für jede Wunde**<br>`leben.oeko.sukzession` | jeder Planet nach jeder Katastrophe — viele Pfade, Rückschläge, nie gleich zweimal | **0 / 7** — Brand → Asche → Gras → Busch → Wald, Halme 477 → 70 → 491, Sämling 0 → 1 (stamm/feld-leben.js) — Mechanik belegt, unter P im Bild ungemessen. | S1: Brand-Zellen um das Dorf · *Halm-, Asche- und Sämling-Zahlen über die Zeit im Fenster* |
| **Stoffkreisläufe: Kohlenstoff, Stickstoff, Sauerstoff, Wasser**<br>`leben.oeko.stoffe` | jeder Planet, jede Chemie: Methan-, Schwefel-, Ammoniak-Biosphären — geschlossene Bilanz, Atmosphäre im Ungleichgewicht | **0 / 7** — EIN Nährstoff-Skalar je Zelle (stamm/feld-leben.js:3736: Fällen −0,3, Ernte −0,02, Brand +0,4, Riss +0,2); Ernte 15× → 1 → 0,7 belegt, Wuchs im Bild… | S1: ein Nährstoff je Zelle · *Ernte 15× → Nährstoff 1 → 0,7, Wuchs sinkt sichtbar im Bildpaar* |
| **Wechselbeziehungen: der Partner verschiebt die Bilanz**<br>`leben.oeko.partner` | 10⁶+ Arten: jede hat Partner, Feinde, Gäste — Verschachtelung wie reale Netze | **0 / 7** — Bestäuber folgen den Blüten, r 0,8 an 9 Orten (alte Leben in Luft und Wasser K4) — headless gerendert, Preis im Fenster nie; Einbahn: die Blüte merkt… | S1: Bestäuber an der Mess-Wiese · *r(Bestäuber, Blüten) ≥ 0,5 aus dem Bild* |
| **Stammbaum: Arten mit Abstammung, lebend und ausgestorben**<br>`leben.evolution.stammbaum` | 10⁹ (Mikroben bis 10¹²) × unbegrenzt viele Planeten-Saaten — Natur-Foto und Spiel-Bild in der Breite nicht zu trennen | **0 / 7** — keine Abstammung: Würfe sind Hash(Saat, Zelle) (stamm/kreatur-fauna.js:125); `STAMMBAUM` ist der Name eines Studios (tetrapoda-core.js:5185); Ankunft… | S1: 10 Arten mit gemeinsamem Ahn · *Gestalt-Baum aus Third-Bildern gegen den Baum des Samens: Robinson-Foulds ≤ 0,3; Mutante „Erbe aus“ → Zufall* |
| **Individuum und Erbe: keines dem anderen gleich**<br>`leben.evolution.erbe` | 10¹⁰⁺ je Planet (Erde ≈ 5·10¹⁰ Vögel allein) — jedes mit Ahnenlinie, die zu seinen Nachbarn passt | **0 / 6** — Bestand als Zahl je Revier, kein Erbe; Individuen einer Gattung bis auf Würfe gleich (GESTALTEN_JE_REZEPT = 1). | S1: 1 Linie über ≥ 10 Generationen · *Morphometrie aus Third-Bildern: Eltern-Kind-Regression 0,2–0,8; Mutante „Erbe aus“ → ≈ 0* |
| **Die Experimente der Natur aus EINEM Gesetz**<br>`leben.evolution.muster` | 30/30 auf 10 fremden Physiken — dieselben Gesetze, andere Erscheinung | **0 / 6** — 0 von 30; die ökologischen Muster (Kaskade, Holling III) zählen in leben.oeko. | S1: 1/30: Antwort auf Selektion · *Räuberdruck auf große Hirsche → Größe sinkt im Bild; Gegenlauf ohne Räuber* |
| **Zeitreise durch die Geschichte des Lebens**<br>`leben.evolution.zeitreise` | jeder Zeitpunkt jedes Planeten, eigene Evolution je Saat — die Gegenwart ist das Ergebnis der Vergangenheit | **0 / 8** — nur Gegenwart, Arten fest; keine Epochen-Flora oder -Fauna; Ankunft 11–17 s. | S1: 10⁴ Jahre zurück, eine Epoche · *Panel ordnet Bildpaare Gegenwart/Epoche ≥ 0,8; Hin- und Rücksprung byte-gleiches Bild* |
| **Bauplan-Raum: wie fremd und vielfältig die Körper werden**<br>`leben.evolution.bauplan` | Millionen Körperformen, keine zwei gleich, mehr Disparität als die Erde — jedes Wesen liest als gewachsen, auch das nie Gesehene | **0 / 6** — 4 Säuger-Gestalten über 5 Dials, gemischt per Gauß-Gewicht (ART_GESTALT, tetrapoda-core.js:3826), dazu je ein Gesetz für Vogel, Fisch, Bestäuber — di… | S1: Volumen ×10 gegen heute · *1 000 Zufalls-Genome: Bewegungs-Anteil ≥ 95 %* |
| **Dieselbe Evolution unter fremdem Stern, Schwere und Chemie**<br>`leben.evolution.fremde-physik` | unbegrenzte Welten bis zu Gasriesen-Schwebern — jede Welt mit eigener Geschichte des Lebens, keine eine umgefärbte Erde | **0 / 7** — ein Planet, g fest, eine Sonne. | S1: g 0,3–3 · *Regression aus 50 Saaten je g aus Bildern: Steigung im Band der Statik* |
| **Bis zur Zivilisation: Verhalten, Kultur, fremde Personen**<br>`leben.evolution.zivilisation` | Milliarden nicht-menschlicher Personen je Planet, Städte jenseits 10⁷ Einwohnern, je Planet eigene Kultur — unterscheidbar und erklärt aus Körper, Sinnen und Geschichte | **0 / 7** — Temperament je Gattung von Hand, Verhalten als Daten, nicht vererbt; die „Evolution“ in stamm/feld-nexus.js mutiert DSL-Programme der KI, nicht Leben. | S1: Verhalten erblich · *Fluchtdistanz Eltern ↔ Kind korreliert; Räuberdruck macht scheuer, Gegenlauf* |
| **Mikroben und Ursprung: die unsichtbare Mehrheit**<br>`leben.evolution.mikroben` | bis 10¹² Mikroben-Arten je Planet, jeder Zoom-Ort jedes Planeten — unsichtbare Mehrheit, sichtbar auf Zuruf | **0 / 6** — kein mikrobielles Leben (0 Treffer). | S1: Matten, Biofilme, Algenbeläge sichtbar · *Bildvergleich der Zonierung gegen Natur-Fotos* |
| **Die Spur: das Leben im Gestein lesen**<br>`leben.evolution.fossil` | jeder Ort jedes Planeten — was gegraben wird, lebt am Zeitpunkt der Schicht in identischer Gestalt | **0 / 6** — keine Fossilien. | S1: Fossil an der Fundstelle · *100 Funde: Anteil im Baum des Samens = 100 %* |

## 4 · Mensch und Zivilisation — 0 von 569 Sprossen (0,0 %), 84 Leitern, im Kern 5

Milliarden Menschen, jeder mit Gesicht, Tag, Beruf, Familie, Absicht und Innenleben; Städte, gegen die Tokio ein Dorf ist, gewachsen über Jahrtausende, geschichtet vom Meeresboden bis in den Orbit, tiefer als die besten Spiel-Städte der Gegenwart; jede Sportart in jedem Medium, jedes Handwerk, jede Kunst, jede Sprache, jeder Glaube, Markt, Recht und Krieg; jede Epoche und jede Kultur der Erde — und die Zivilisation nach uns: Maschinen-Wesen, veränderte Leiber, Städte im All.

*Heute: 118 Bewohner mit Tagesplan in einer Test-Stadt, 300 Häuser in der Stadt des Worts, die als weiße Kästen mit Fenstern lesen; ein Wagen je 15 Häuser, kein Regelspiel, keine Welt-Sprache.*

| Kriterium | Die Vision (oberste Sprosse) | HEUTE | Nächste Sprosse · ihr Richter |
|---|---|---|---|
| **Ein Leib je Mensch**<br>`mensch.leib.verschieden` | 10⁹–10¹⁰ auf einem Planeten über Generationen — Gesichter-Verteilung wie reale Populationen | **0 / 7** — nah teilen sich die Bewohner einer Siedlung 8 Gestalten und EINEN Schnitt (stamm/siedlung-bewohner.js:232–247); 50 aus 50 Samen ohne Paar nur headles… | S1: 10 nah unterscheidbare Leiber je Siedlung · *Bild 10 Bewohner auf 2 m: Prüfer findet 0 gleiche Paare* |
| **Das Gesicht nah**<br>`mensch.leib.gesicht` | jeder Mensch und jedes denkende Wesen, Ego 0,5 m — vom Foto nicht zu unterscheiden | **0 / 6** — mensch-kopf GRÜN im Third auf 6,11 m an der Radeon (a41ce72d), Third-Bild im E-Band (GTX 16,8 ms); kein Ausdruck, kein Blick-Ziel (koerper-core.js:47… | S1: 1 Kopf: Spieler an der Third-Kamera 6 m · *Soll-Tafel mensch-kopf GRÜN an 10 Samen* |
| **Tracht und Gesicht der Menge**<br>`mensch.leib.tracht` | Zukünfte, ungesehene Kulturen, fremde Völker — kohärent, nicht kostümiert, ohne Erd-Vorbild | **0 / 7** — 9 Epochen, 6 Schnitt-Kombinationen, je Siedlung EIN Schnitt, Antike und Fernost tragen Poncho (fachwerk-core.js:3295–3303); Blind-Zuordnung nie gefah… | S1: 1 Platz: Epoche wählt Schnitt und Farbe · *20 Saaten: Prüfer ordnet Epoche ± 1 Jh. ≥ 0,7* |
| **Stoff in Bewegung**<br>`mensch.leib.stoff` | 10⁵ im Stadion — vom Film nicht unterscheidbar | **0 / 6** — Stoff aus der Haut extrudiert, starr; Durchstich nie gemessen | S1: 1 Spieler, Stoff liegt am Leib · *16 Posen × 10 Samen: 0 Durchstiche* |
| **Bewegungs-Ausdruck**<br>`mensch.leib.ausdruck` | fremde Leiber und Kulturen — Ausdruck folgt Bau und Kultur der Art | **0 / 6** — zehn Bewegungs-Profile an Bewohnern (tagesHaltung koerper-core.js:4972, _bewohnerGemuet siedlung-bewohner.js:1864), ungemessen; Fuß gleitet 3,1–3,4 c… | S1: 10 Bewohner: Haltung nach Akt und Gemüt · *Prüfer errät Akt/Gemüt aus der Silhouette ≥ 60 %* |
| **Spur am Leib**<br>`mensch.leib.spur` | jeder Mensch eines Planeten — plausibel, nicht klischeehaft | **0 / 6** — Alters-Dial 18–80 (koerper-core.js:120–126) nie gemessen; Narbe, Tätowierung, Schmuck, Wunde: Grep leer | S1: Alter als Achse 18–80 · *Prüfer-Altersschätzung, Fehler ≤ 15 J* |
| **Regel-Grammatik**<br>`mensch.sport.regeln` | jede Bevölkerung jedes Planeten mit eigener Sportkultur — Kulturen unterscheidbar | **0 / 8** — kein Regelspiel, keine Wertung; Ball nur am Seil im Prüfstand (schmiede-core.js:4627/4630) | S1: 1 Wettkampf (Lauf, Wurf) mit Sieger · *20 Läufe: Rangfolge gegen Leib-Leistung ρ 0,6–0,9* |
| **Körperkönnen**<br>`mensch.sport.koerper` | Weltklasse jeder Disziplin, jedes Körpers, jeder Schwerkraft — Fachtrainer unterscheidet nicht | **0 / 7** · Kern 1 — Gehen, Sprint ~6,8 m/s, Sprung ~0,53 m, Klettern, Schwimmen, 6 Geräte-Verben über EINEN Löser (koerper-core.js:497–556, 5089–5130); Fuß 3,4/3,1 cm RO… | S1: 1 Leib: 5 Verben + 6 Geräte-Verben · *Tempo und Sprunghöhe im Spiel gegen Eichwert ± 10 %* |
| **Talent, Übung und Rekord**<br>`mensch.sport.koennen` | Rekorde über Jahrhunderte — Kurve folgt Teilnehmerzahl, Ernährung, Technik | **0 / 6** — leibWerte (koerper-core.js:5182–5187) rechnet Tempo nur aus der Größe, Sprint fester Faktor 4,5; kein Talent, keine Übung | S1: 10² Bewohner mit Können-Profil · *Variationskoeffizient der 100-m-Zeit 10–20 %, Altersgang gegen Normtafeln* |
| **Mannschaft und Taktik**<br>`mensch.sport.mannschaft` | Weltklasse-Taktik in jeder Art der Grammatik — Analyst unterscheidet nicht | **0 / 7** — 0 Mannschaften; Bewohner folgen nur dem Tagesplan | S1: 1 gegen 1 (Ringen, Fechten) · *Siegquote des Stärkeren 60–80 %, nie 100 %* |
| **Arena, Publikum und Liga**<br>`mensch.sport.arena` | 10⁵–10⁷ Partien an jedem Nachmittag, jedes Feld jedes Planeten — Hinterhof bis fremdes Stadion | **0 / 7** — Prüfstand-Hof 22 Geräte, Spielplatz mit Bänken (fachwerk-core.js:10014); 0 Zuschauer, 0 Ligen | S1: 1 Spielfeld aus dem Ort-Gesetz, 10 Zuschauer · *Blickrichtungen folgen dem Geschehen ≥ 80 %* |
| **Handwerk, Tanz und Kampf als Kunst**<br>`mensch.sport.kunst` | neue Künste fremder Kulturen und Körper — kohärent und unterscheidbar | **0 / 6** — Güte steckt in der Waffe (gueteFaktor schmiede-core.js:4062), nicht in der Hand | S1: 2 Leiber: Meister und Anfänger in 3 Künsten · *Blindtest Anfänger ↔ Meister ≥ 80 %* |
| **Geist-Spiele**<br>`mensch.sport.geistspiel` | jede Kultur jedes Planeten — Spiele folgen Kultur und Wahrnehmung der Art | **0 / 6** — kein Brett-, Karten- oder Würfelspiel (Grep leer) | S1: 1 Brettspiel zwischen 2 Bewohnern · *100 Partien, 0 regelwidrige Züge* |
| **Sport in jedem Medium — Schnee, Brandung, Luft, Motor, Tier**<br>`mensch.sport.medium` | jede Sportart jedes Mediums, auf jeder Welt — Ski bei einem Drittel der Schwere, Segeln auf Methan, Flug in dichter Luft | **0 / 7** — Lauf, Sprung und Fahrt am Boden (siehe mensch.sport.koerper); Schnee mit Einsinken 1/2 (wetter.K4, headless); kein Sport in Schnee, Wasser oder Luft… | S1: EINE Abfahrt auf Schnee · *Schwung-Radius gegen Tempo und Kantwinkel ±15 %; Zeit auf 500 m Höhe im Band realer Abfahrten* |
| **Bedürfnis und Tag**<br>`mensch.geist.tag` | fremde Planeten — Tageslänge, Schlafbedarf, Sinne geben einen anderen Rhythmus | **0 / 8** · Kern 1 — TAGES_GESETZ 6 Akte (koerper-core.js:4919, 5057), Soll-Orte 81/81, Wiederkehr max 1,2 m (mensch.K2, Radeon und GTX); Dorfplatz-Bild an der Radeon 26… | S1: 10² in 1 Siedlung · *Zeitraffer 24 h: Soll-Orte ≥ 0,9; Schmiede 10 Uhr besetzt / 2 Uhr leer* |
| **Gedächtnis und Gespräch**<br>`mensch.geist.gespraech` | 10⁹ über Epochen — Jahrzehnte, Großeltern, Sprache der Epoche | **0 / 7** — Zuwendung 0,267 s, Berührung 0 an der Radeon (mensch.K5), Preis in der Szene unbelegt; Kreaturen-Gedächtnis mit lokalem qwen3:4b (stamm/feld-nexus.js… | S1: 10² Bewohner ohne Wort · *Zuwendung ≤ 0,5 s, Berührung 0* |
| **Freundschaft, Feindschaft, Ruf**<br>`mensch.geist.netz` | fremde Arten — Bindungsform folgt der Biologie (Schwarm, Kaste) | **0 / 6** — Haus mit n Bewohnern ohne Bindung | S1: 10² · *Besuche zu Verwandten/Freunden ≥ 0,6* |
| **Abstammung, Lebenslauf, Demografie**<br>`mensch.geist.generationen` | fremde Evolutionen — Lebensspanne, Brut, Kaste, Teilung | **0 / 8** — der Leib kennt nur 18–80 J, keine Kinder (koerper-core.js:120–126); keine Geburt, kein Tod, keine Verwandtschaft bei Menschen (Grep leer) | S1: 1 Ort, alle Alter · *Altersanteile im Band der Epoche (Mittelalter ≥ 35 % Kinder)* |
| **Absicht und Charakter**<br>`mensch.geist.absicht` | fremde Gesellschaften — Ziele folgen Biologie und Kultur der Art | **0 / 6** — keine Ziele, keine Charakterzüge, die das Handeln ändern | S1: 10² · *20 Personen nach 1 Spieltag ihrem Zug zugeordnet ≥ 0,6* |
| **Innenleben — Gefühl, Bindung, Kindheit, Alter**<br>`mensch.geist.innenleben` | Innenleben jeder Art jeder Welt — fremdes Gefühl aus fremdem Leib und Sinn, doch lesbar | **0 / 7** — Gewalt → Furcht lokal (siehe mensch.kopplung.leben); Trauer +0,3 und Ehrfurcht +0,2 nach dem Tod des Spielers als Feld-Werte (stamm/koerper-seele.js:… | S1: EIN Bewohner, 4 Gefühle in Gesicht und Gang · *Panel nennt das Gefühl aus 5 s Film ≥ 70 %; Gegenlauf ohne Anlass → neutral* |
| **Bevölkerung mit eigenem Plan**<br>`mensch.menge.bevoelkerung` | 10¹⁰ je Planet × jedes Jahr × viele Welten — jede Zufallsperson mit Gesicht, Biografie, Ziel | **0 / 9** — 81/81 Häuser bewohnt, Test-Stadt 118 Bewohner (14.11.); Dorfplatz Radeon 26,9 fps ≈ 37 ms — Preis ROT (mensch.K1) | S1: 10² (ein Dorf) · *Zählung im Bild an 20 Stichproben (Ort × Uhr): Körper am Ort gegen den Soll-Plan ±10 %; niemand fehlt, niemand steht doppelt* |
| **Sichtbare Menge**<br>`mensch.menge.bild` | 10⁷–10⁸ (Turmblick über die Megastadt) — liest auf jedem Abstand als Menschen | **0 / 7** — 18 Menschen am Dorfplatz, 0 gehend, 26,9 fps Radeon; voll lebendig höchstens 4 Leiber im 8-m-Kreis (nahLeiber, siedlung-bewohner.js:1551) | S1: 10¹ im Bild · *≥ 10 Menschen, ≥ 3 gehend* |
| **Massen-Physik**<br>`mensch.menge.dichte` | 10⁷ (Badefest am Fluss) — Kontinuum und Einzelner zugleich wahr | **0 / 7** — Ausweichen ohne Berührung (mensch.K3, headless), Preis unbelegt; kein Fundamentaldiagramm, kein Engpass | S1: Paar · *Berührung 0, kleinster Abstand ≥ Radius* |
| **Ströme und Tagesrhythmus**<br>`mensch.menge.rhythmus` | 10⁸–10⁹/Tag (Planet, jede Epoche) — Fernreisen, Pilgerzüge | **0 / 7** — 5–8 Wege je Tag, Wiederkehr 1,2 m (mensch.K2); Preis in der Szene unbelegt, Takt der Bewohner 1,52–1,82 ms an der Stadt | S1: Wege in 1 Siedlung · *4–10 Wege je Tag, Wiederkehr ≤ 2 m* |
| **Gesundheit, Seuche, Medizin**<br>`mensch.menge.seuche` | 10¹⁰ (Planet) — Welle über das Flugnetz, Mutation, Immunität | **0 / 6** — kein Gesetz für Krankheit bei Menschen (Grep Seuche/krank/Epidem leer) | S1: 1 Person krank · *Bildpaar gesund/krank; Krank-Tag weicht ab* |
| **Kollektiv in Bewegung**<br>`mensch.menge.kollektiv` | 10⁸–10⁹ über Jahrtausende — Ausbreitung einer Art über den Planeten | **0 / 7** — Furcht weitet den Abstand 1,335 → 1,952 m (mensch.K5, Radeon), Preis unbelegt | S1: Umstehende einer Szene · *Abstand nach der Tat > vorher* |
| **Größe einer zusammenhängenden Stadt**<br>`mensch.stadt.groesse` | Jenseits: ≥ 10⁸ Gebäude, ≥ 4·10⁸ Bewohner — zehnmal Tokio in EINER Bebauung — Stadt als Landschaft; alles Gesehene ist betretbar | **0 / 8** — Start-Dorf 12 Häuser in den E-Messorten (GTX 16,8 ms); Stadt des Worts 300 Häuser, 1,08 Mio. Dreiecke, P an der vollen Stadt nie gemessen; GROESSE_WA… | S1: Weiler: 10 Gebäude · *im Bild gezählt ≥ 10 Häuser; Straßenbild gegen Foto eines Weilers: Panel-2AFC ≤ 90 %; Zwillinge im Bild 0* |
| **Stadtform-Wahrheit**<br>`mensch.stadt.form` | 10² Saaten: Umkehr-Wahrheit — die Form trägt Alter, Wohlstand, Klima, Gelände | **0 / 7** — Kern-Verdichtung (fachwerk-core.js:4632), Gewerbe-Hallen am Rand (:3693) im Code, Richter nie gefahren; kein Bodenwert (Grep 0) | S1: 1 Stadt: Kern und Rand · *geschlossene Wand Kern ↔ Rand ≥ 2:1* |
| **Vertikale Stadt**<br>`mensch.stadt.vertikal` | bodenlos: Meeresboden bis Orbit — jede Höhe bewohnt | **0 / 8** — höchster Typ hochhaus mit 7 Geschossen (fachwerk-core.js:1987); keine zweite Ebene, keine Arkologie (Grep 0) | S1: 1 Ebene, Häuser bis 7 Geschosse · *höchstes Gebäude im Bild, begehbare Ebenen = 1* |
| **Stadtgestalt aus Ursache**<br>`mensch.stadt.breite` | ≥ 10⁴ unterscheidbare Stadtformen — jede mit Ursache | **0 / 7** — 9 Epochen, 6 Namens-Regionen, 32 Hausstile (fachwerk-core.js:3294–3312, 2012); Netz nur organisch oder Raster, gesetzt statt verursacht; Blindtest ni… | S1: 1 Familie, 6 Regionen · *Region einer Stadt aus 6 erkannt ≥ 50 %* |
| **Siedlungsnetz**<br>`mensch.stadt.siedlungsnetz` | 10² Planeten-Saaten — Muster folgt Planet und Art | **0 / 6** · Kern 1 — Stadt binnen 2 km in 7/8 Saaten an Radeon und GTX; Zipf ζ 1,022 [0,956; 1,158] über 8 Saaten, Spannweite 6–500 Häuser (siedlung.K2) | S1: Region 32 × 32 km, Weiler bis Kleinstadt · *Stadt binnen 2 km in ≥ 6/8 Spawns; Zipf ζ ∈ [0,8; 1,2]* |
| **Siedeln jenseits der Oberfläche**<br>`mensch.stadt.habitat` | jede Lebensform an jedem Ort jeder Welt (Wolkenstädte, Eis-Ozean, Sternnähe) — Bauart folgt Welt und Leib | **0 / 7** — Stand 0: jede Siedlung steht auf der Oberfläche EINER Welt (siehe mensch.stadt.vertikal: keine zweite Ebene). | S1: EINE Siedlung unter der Erde, 10² Bewohner · *3 Lebenslinien (Luft, Wasser, Licht) im Bild bis zur Quelle verfolgbar; Gegenlauf Schacht verstopft → die Bewohner verlassen den Trakt* |
| **Die Stadt gegen die Besten**<br>`mensch.stadt.messlatte` | dieselbe Tiefe in jeder Stadt jeder Epoche, Kultur und Welt — jeder Zufallsort schlägt den besten Schauplatz der Gegenwart | **0 / 7** — Nie gefahren. Stadt des Worts 300 Häuser, Test-Stadt 35 Häuser mit 118 Bewohnern, Häuser lesen als weiße Kästen mit Fenstern (14.11.). | S1: EINE Straße, 100 m, Tag · *Blindpaar gegen dieselbe Kameralage im Vergleichstitel: das Panel wählt unser Bild in ≥ 20 %; die vier Zählungen sind an beiden gefahren* |
| **Das Netz als Gestalt**<br>`mensch.netz.gestalt` | Planeten, 10⁸–10⁹ km — Netzform folgt Physik und Wesen | **0 / 7** — STRASSENGRAPH-GESETZ (fachwerk-core.js:3810), 4 Klassen; Gefälle nur headless (siedlung.K3), Befahrbarkeit nie gefahren | S1: 1 Ort, ~10 km, 4 Klassen · *Gefälle p95 ≤ 9,5 % über 8 Saaten UND jede Klasse ohne Wand oder Klemmen befahren* |
| **Verkehr mit Anlass**<br>`mensch.netz.verkehr` | 10¹⁰ Reisende über Epochen und Sonnensysteme — jede Fracht mit Herkunft | **0 / 8** — VERKEHR_GESETZ 1 Wagen je 15 Häuser (fachwerk-core.js:4070), Fahrer würfelt eine Wende (_verkehrZielNeu siedlung-verkehr.js:934); pflicht.C 0/3; GTX… | S1: 1 Wagen des Spielers · *2-km-Route 0 Steckenbleiber, Bild p95 ≤ 33 ms während der Fahrt* |
| **Massenverkehr und dritte Dimension**<br>`mensch.netz.massenverkehr` | Planeten, Epochen, fremde Netze — Technik aus Epoche × Physik | **0 / 7** — Schiene, Bahnhof: Grep 0 | S1: 1 Linie, 2 Halte · *Spieler fährt mit; ≥ 10 Bewohner je Stunde* |
| **Stadtstoffwechsel**<br>`mensch.netz.stoffwechsel` | Planeten, fremde Stoffe — Stadt wächst nur an ihrer Ressource | **0 / 7** — Laternen und Brunnen ohne Fluss dahinter; Leitungen Grep 0 | S1: 1 Ort, 1 Netz · *Leitung getrennt: abhängige Lichter dunkel ≤ 1 s, Rest brennt* |
| **Bedarf wird Bauwerk**<br>`mensch.bau.bedarf` | jeder Bedarf jedes Planeten — fremde Funktion lesbar | **0 / 6** — Rollen Kirche der Epoche, Scheune, Schmiede, Turm (fachwerk-core.js:3189, 3697); Funktions-Blindtest nie gefahren; kein Ingenieurbau | S1: Dorf: 4 Funktionen · *50 Bauten blind nach Funktion ≥ 80 %* |
| **Hülle gegen das Foto**<br>`mensch.bau.huelle` | jedes Bauwerk jedes Planeten — ununterscheidbar vom Foto | **0 / 6** — Welt 14.11.: Häuser lesen als weiße Kästen mit Fenstern; Labor ↔ Welt 0,788 (studios.K4); Pop 2,30 px am Labor-Haus | S1: 1 Haus im Spiel · *Paarvergleich Spiel ↔ Foto bei 10 m: „Foto“ ≥ 5 %* |
| **Innenräume**<br>`mensch.bau.innen` | fremde Bauten fremder Leiber — Raum folgt dem Leib | **0 / 7** — Tür → Keller → Dachboden ganz in 1 von 8 Gängen, headless (siedlung.K1); Raumteilung mit Herd (fachwerk-core.js:576–620) | S1: 1 Haus, Tür → Keller → Dachboden · *Gang ohne Sprung > 0,3 m* |
| **Bauen als Vorgang**<br>`mensch.bau.bauen` | fremde Leiber bauen auf fremden Welten — Bautechnik folgt Leib und Stoff | **0 / 6** — Häuser erscheinen ohne Baustelle (12 → 19/20 in 1 500 s); Labor ↔ Welt 0,788 | S1: 1 Spieler-Haus aus der Werkstatt · *Bildpaar Labor ↔ Welt gleiche Kamera: kein Unterschied* |
| **Bewegung in jedem Medium**<br>`mensch.fahrzeug.medium` | zwischen Sonnensystemen — Zeit an Bord ≠ Zeit daheim | **0 / 8** — Bremsweg Gras/Weg 1,63×, nass 1,48–1,72× (fahrzeug.K1); GTX reißt bei 36 km/h (Bild 35,4 ms); fahrWasser/fahrLuft nur Widerstand (vehicle-core.js:361… | S1: Land, 1 Wagen, 50 km/h · *Bremsweg Gras/Weg ≥ 1,5×, nass ≥ 1,3×, Bild ≤ 33 ms während der Fahrt* |
| **Form wird Fahrt**<br>`mensch.fahrzeug.form` | Technik-Evolution über 500 Jahre — Auslese durch Gebrauch | **0 / 6** — Teile-Werk fährt mit seiner Hülle (stamm/koerper-fahrt.js:550), Preis nicht gemessen | S1: 1 Werkstatt-Wagen · *Tempo folgt der Masse* |
| **Gestalt-Breite**<br>`mensch.fahrzeug.gestalt` | 10⁴ Planeten-Saaten — eigene Formensprache je Zivilisation | **0 / 6** — 5 Gattungen, EPOCHE_GESETZ 6 Stufen über EINER Wagen-Vorlage (vehicle-core.js:4523, 4725); Blind-Erkennung nie gefahren | S1: 10² Saaten, 5 Gattungen · *≥ 90 % erkannt* |
| **Lenkerkunst**<br>`mensch.fahrzeug.lenker` | fremde Lenker, fremde Medien — Steuerkunst folgt Leib und Medium | **0 / 6** — kein Bewohner fährt mit Können; pflicht.C offen | S1: 10 Fahrer auf Wegen · *1 h: 0 Kollisionen bei Durchsatz und Reisetempo im Band realer Straßen (Zeitlücke 1–3 s, Reisetempo ≥ 80 % des erlaubten), 0 Stillstände ohne Anlass* |
| **Maschinen, Werkzeug, Fabrik**<br>`mensch.fahrzeug.maschine` | Industrie über Sonnensysteme — Energie aus dem Stern | **0 / 6** — Haspel des Ziehbrunnens als Gestalt ohne Wirkung (fachwerk-core.js:5314) | S1: 1 Werkzeug mit Wirkung · *Haspel hebt Eimer, Hub folgt Kurbelweg* |
| **Die Flur**<br>`mensch.nahrung.flur` | fremde Agrarformen — Flur aus fremder Biologie | **0 / 7** — 1–2 Äcker je Feldweg-Ende (fachwerk-core.js:4699–4714), als Fleck im Boden-Kanal gemalt (stamm/siedlung-wege.js:1621); in jedem Dorfbild sichtbar | S1: 1–2 Äcker je Feldweg-Ende · *≥ 1 Acker als Fläche im Bild am Dorfrand* |
| **Die Frucht und das Jahr**<br>`mensch.nahrung.frucht` | Millionen Kulturformen auf Planeten — fremde Nutzpflanzen, gezüchtet | **0 / 6** — keine Kulturpflanze in der Welt; nur das Studio zeichnet Furchen (worlds/fachwerk/fachwerk.js:361) — Zwilling der Darstellung | S1: 1 Kulturpflanze auf 1 Acker · *Reihen im Bildspektrum ≥ 3σ; Blindurteil ≤ 65 %* |
| **Das Tier im Dienst**<br>`mensch.nahrung.tier` | Milliarden Nutztiere, fremde Haustiere — dasselbe Gesetz | **0 / 7** — gebundenes Tier folgt ≥ 10 min über Hang (oekologie.K5); wilde Herde ohne Hirte | S1: 1 Tier bindet sich an den Spieler · *Abstand p95 ≤ 5 m über Hang* |
| **Wasser und Erdbau**<br>`mensch.nahrung.erdbau` | Terraforming fremder Welten — Erdbau unter fremder Schwere | **0 / 7** · Kern 1 — Graben füllt sich ≤ 2 s, eine Wasserfläche (gelaende.K2); Bewohner bauen keine Gräben | S1: Spieler gräbt, Wasser folgt · *Graben gefüllt ≤ 2 s* |
| **Der Nahrungsstrom**<br>`mensch.nahrung.strom` | Milliarden auf vielen Planeten — Bilanz je Planet | **0 / 6** — Bewohner mit Rolle feld geht zum Acker (koerper-core.js:4907), nichts wird geerntet, niemand isst | S1: 1 Dorf erntet und lagert · *Bildpaar Scheune voll/leer, Sägezahn* |
| **Die Hand am Feld**<br>`mensch.nahrung.hand` | jede Rolle der Nahrung auf jeder Welt — Bauer bis Turmgärtner | **0 / 6** — Nah-Streu: Kraut, Stein, Holz pflücken, Mahd, Nachwachsen (stamm/vegetation-wiese.js:1741, 2710) | S1: Spieler sammelt Wildes · *Pflanze verschwindet, kehrt nach der Nachwuchs-Zeit* |
| **Nahrung jenseits des Ackers**<br>`mensch.nahrung.jenseits` | über Sonnensysteme — Habitat-Kreisläufe koppeln Welten | **0 / 6** — nichts | S1: Gewächshaus und Garten im Ort · *Bildpaar ≤ 65 %; nur in passendem Klima* |
| **Stoffstrom vom Gestein zur Ware**<br>`mensch.wirtschaft.stoffstrom` | 10⁹ über Sonnensysteme — fremde Stoffe, gleiche Gesetze | **0 / 7** — Misch-Regel Bronze (schmiede-core.js:2911) nur im Studio; in der Welt hat keine Ware eine Herkunft | S1: 1 Kette, 3 Waren: Erz → Barren → Werkzeug · *Zeitraffer: Halde kleiner, Barren am Ofen, Werkzeug in der Hand* |
| **Werk und Beruf**<br>`mensch.wirtschaft.beruf` | 10⁸ je Stadt jenseits Tokio, 10¹⁰ über Planeten — Berufe fremder Arten | **0 / 7** — 8 Rollen (koerper-core.js:4928–4943), Schmiede 10/2 Uhr 2/0 (mensch.K2); kein Werkstück ändert sich; Dorf-Bild Radeon ROT | S1: 8 Rollen am Werk · *Schmiede 10 Uhr besetzt / 2 Uhr leer* |
| **Markt und Geld**<br>`mensch.wirtschaft.markt` | 10⁷ über Sonnensysteme — Lichtlaufzeit als Preis | **0 / 6** — Spieler-Inventar 27 Plätze (stamm/dirigent-kern.js:736); Preis/Münze/Geld in stamm/: 0 Treffer | S1: Tausch Spieler ↔ Bewohner · *Bestand sinkt, füllt sich nur aus Herstellung* |
| **Fernhandel, Knoten und Ketten**<br>`mensch.wirtschaft.handel` | Sonnensysteme — Bahnfenster, Startenergie | **0 / 7** — Wagen ohne Ladung (hausJeWagen 15); Hafen, Lager: Grep 0 | S1: 1 Ware, 1 Weg mit Fahrer · *Bildpaar leer/beladen; ohne Lieferung Stand leer binnen Tagesfrist* |
| **Erfindungspfade**<br>`mensch.wirtschaft.technik` | fremde Chemie, ≥ 10 Pfade jenseits unserer — Biotechnik statt Metall | **0 / 7** — Werkstoff-Tafeln im Studio, Epochen-Tafel der Stadt (fachwerk-core.js:3294) — Liste, nicht gewachsen; jede Saat hat dieselbe Epochenfolge | S1: 10 Techniken mit Voraussetzung · *20 Saaten: 0 Techniken ohne Voraussetzung im Bild* |
| **Energie**<br>`mensch.wirtschaft.energie` | Sonnensysteme — Energie bestimmt Reichweite | **0 / 6** — keine Energie-Größe in der Wirtschaft | S1: Muskel und Feuer · *Holzstapel sinkt je Schmelze; ohne Holz kein Barren* |
| **Gemeinwesen, Grenzen, Reiche**<br>`mensch.macht.grenze` | 10²+ Planeten, fremde Arten, Sonnensysteme — Ordnungen, die die Erde nicht kennt | **0 / 8** — BURG-GESETZ zu 50 % per Zufall (fachwerk-core.js:3705), Mauer bis 1750; kein Gemeinwesen, keine Grenze | S1: 1 Herrschaftsgebiet · *Grenze im Bild = Karte; Burg, wo Lage und Reichtum sie tragen* |
| **Spuren der Macht im Stein**<br>`mensch.macht.wehrbau` | fremde Welten — Form folgt fremder Waffe | **0 / 8** — mauerRing 30 Ecken, Tore, Türme (fachwerk-core.js:4481); ummauerte Stadt vom Hügel in 7/8 Saaten an beiden Geräten (siedlung.K2) | S1: 1 Mauerring mit Toren und Türmen · *geschlossener Ring mittags und Dämmerung lesbar, kein Schwebe-Spalt* |
| **Stand, Kaste, Klasse**<br>`mensch.macht.stand` | fremde Ränge — Ordnung folgt Biologie | **0 / 6** — Rollen ohne Stand; „Stände“ im Code sind Marktstände (fachwerk-core.js:4511) | S1: 1 Stadt, 2 Stände · *Gini der Wohnfläche im archäologischen Band; arm/reich erkannt ≥ 80 %* |
| **Gesetz, Verwaltung, Steuer, Strafe**<br>`mensch.macht.recht` | Planet, alle Epochen — Recht wandelt sich | **0 / 7** — Wächter und Nachtwächter stehen 6–20 Uhr und reagieren auf nichts (koerper-core.js:4942) | S1: 1 Wache, die wirkt · *Regelbruch in Sicht → Antwort ≥ 0,8 von 20* |
| **Krieg, Belagerung, Diplomatie**<br>`mensch.macht.krieg` | interplanetare Konflikte — nach Biologie und Technik | **0 / 9** — Hieb-Physik, Treffer am Leib (stamm/kampf.js), an beiden Geräten im Bild (halten.K1); das umringende Rudel (tiere.K2, oekologie.K4) ist Jagd und zähl… | S1: Zweikampf: 2 Bewaffnete · *20 Zweikämpfe im Bild: der Treffer sitzt, wo die Klinge den Leib kreuzt, der Getroffene antwortet; kein Treffer durch die Deckung* |
| **Macht in der Megastadt**<br>`mensch.macht.megastadt` | fremde Megastädte — Ordnungen jenseits der Erde | **0 / 7** — nichts | S1: 1 Wache, Streife · *Antwortzeit ∝ Weg zur Wache ρ ≥ 0,7; niemand erscheint im Sichtfeld* |
| **Sprachen der Welt**<br>`mensch.kultur.sprache` | ≥ 10⁶ über Planeten, fremde Medien — Licht, Duft, Infraschall | **0 / 7** — keine Welt-Sprache; Ortsnamen aus festen Silben je Region (fachwerk-core.js:3306) | S1: 1 Sprache: Orts- und Personennamen · *100 Namen aus 2 Saaten richtig zugeordnet ≥ 90 %* |
| **Die geschriebene Welt**<br>`mensch.kultur.schrift` | jeder lesbare Text ist wahr — Chronik, Grabstein, Karte stimmen | **0 / 6** — die Stele mit Schriftband lebt nicht im Spiel; lesbar nur das Peer-Namensschild (stamm/netz-p2p.js:2232) | S1: 1 Schrift an Sonderbauten · *Sonderbauten mit lesbarem, passendem Schild ≥ 90 %* |
| **Glaube, Ritual, Bestattung**<br>`mensch.kultur.glaube` | fremdes Heiliges — Mythos erklärt die gebaute Welt | **0 / 6** — Rolle kirche als Region-Markbau mit 1 Bewohner (fachwerk-core.js:3696–3700, 8163); kein Ritus, kein Kalender, kein Friedhof | S1: 1 Glaube mit Kalender · *≥ 30 % der Gläubigen im Kultbau; Festtag ≥ 3× Werktag* |
| **Kultur als Stil-Raum**<br>`mensch.kultur.gestalt` | jede Stichprobe so wahr wie die Wirklichkeit — Gegenprobe an nie-irdischen Orten | **0 / 7** — 32 Archetypen per Hash (fachwerk-core.js:2012), 28 Baustil-Pools, 9 Epochen; zwei Epochen 72,3 % andere Leib-Pixel (haar.K4); Häuser-Trennung ungemes… | S1: U_eff ≥ 10 (auch aus Liste) · *10 Kulturen an Häuser-Bildern blind getrennt ≥ 80 %* |
| **Wanderung, Diffusion, Mischung**<br>`mensch.kultur.diffusion` | 10⁸-Stadt mit Herkünften mehrerer Planeten — Kolonien driften | **0 / 6** — Stile lösen sich nur in der Zeit ab (fachwerk-core.js:3281), keine Wanderung im Raum | S1: 2 Kulturen an einer Grenze · *Grenzstreifen ≥ 30 % gemischt, abseits ≤ 5 %* |
| **Wissen und Weitergabe**<br>`mensch.kultur.wissen` | Wissenschaft fremder Arten — ihre Physik stimmt mit ihrer Welt | **0 / 6** — Technikstand nur als Funktion der Jahreszahl (fachwerk-core.js:8105) | S1: Technikstand je Ort · *Stand ↔ Bevölkerung × Vernetzung r ≥ 0,5* |
| **Verständigung**<br>`mensch.kultur.verstaendigung` | nicht-menschliche Sprache — aus Verhalten und Signal | **0 / 6** — keine Welt-Sprache, Bewohner sprechen nicht mit dem Spieler | S1: Grüße und Gesten · *≥ 90 % antworten; Gruß-Form trennbar ≥ 80 %* |
| **Bild, Skulptur, Baukunst**<br>`mensch.kultur.bildkunst` | Kunst jeder Kultur jeder Welt, auch für fremde Sinne (Duft-Bild, Tast-Figur) — Kunst folgt Sinn, Stoff und Glaube der Art | **0 / 7** — Nie gemessen; keine Station der alten Karte misst Kunst am Bau oder im Raum. | S1: EIN Ort, 10 Werke (Wandbild, Figur, Ornament) · *10 Werke: Motiv in der Welt gefunden (das Tier lebt dort, das Ereignis geschah) ≥ 80 %; keine zwei gleich* |
| **Buch, Bühne, Film**<br>`mensch.kultur.erzaehlkunst` | Erzählkunst jeder Kultur jeder Welt, gegen die besten der Gegenwart — Werke, die ein Mensch freiwillig zu Ende liest | **0 / 7** — Nie gemessen; Bewohner sprechen nicht (siehe erleben.klang.stimme). | S1: EINE Bühne oder EIN Erzähler am Abend, 10² Zuhörer · *Stück mit Anfang, Wende, Ende im Bild; Lachen und Stille des Publikums folgen den Stellen des Stücks (r ≥ 0,5)* |
| **Straßenleben — Küche, Mode, Nacht, Vergnügen**<br>`mensch.kultur.strassenleben` | Straßenleben jeder Kultur jeder Epoche jeder Welt — Rom bei Nacht, Edo zur Kirschblüte, eine Stadt, die es nie gab | **0 / 7** — Bewohner tragen einen Tagesplan mit 6 Akten (siehe mensch.geist.tag); Lokal, Mode und Nacht als eigene Orte und Abläufe: nie gemessen. | S1: EINE Gasse am Abend: 3 Lokale, 20 Gäste · *20 Gäste verfolgt: jeder kam nach seinem Tagesplan, isst und geht; Gericht aus Zutaten der Flur (Gegenlauf Zutat fehlt → das Gericht fehlt)* |
| **Die Kultur-Zeit am Ort — datierbar**<br>`mensch.zeit.spanne` | jede Welt, jede Kultur tragende Art, 10⁶ J — Zeit gehbar wie Raum | **0 / 7** — Zeitreise nur per Chat-Satz, Jahre 1–9999, jeder Satz gründet den Ort neu (stamm/feld-leben.js:1173–1197); Wechsel-Zeit nie gemessen, kein Regler | S1: Jahr 1–9999 per Satz, 4 Halte · *dieselbe Zelle unter 4 Jahren: Blind-Datierung bringt die 4 Bilder in die richtige Folge ≥ 80 %* |
| **Hervorgehen: das Jüngere trägt das Ältere**<br>`mensch.zeit.palimpsest` | planetare Metropole über 10⁴ J; fremde Zivilisationen über 10⁶ J — jede Epoche im Gegenwartsbild | **0 / 8** · Kern 1 — Wachstum aus Bewohnern 12 → 19/20 Häuser in 1 500 s, alte 0,917, Radeon und GTX (siedlung.K4); Jahresringe 0,915 nur headless | S1: Ort wächst in Spielzeit · *Häuserzahl über 1 500 s steigt, alte ≥ 0,9 erhalten* |
| **Die Kausalkette aus dem Samen**<br>`mensch.zeit.kausal` | viele Planeten, je EINE Kette über 10⁶ J — jedes Leben herleitbar | **0 / 6** — Gewalt → Furcht → langsameres Wachstum im Spiel gemessen (WACHSTUM fachwerk-core.js:3580, siedlung.K4); Epoche sonst Kalender-Nachschlag an ≥ 4 Stell… | S1: 1 Ereignis beugt 1 Kurve · *Ort nach Gewalt wächst messbar langsamer* |
| **Geschichte erleben**<br>`mensch.zeit.erleben` | jedes Ereignis jeder Zivilisation — Pompeji bis erste Landung | **0 / 6** — keine begehbaren Ereignisse | S1: Ereignis als Folge am Ort · *Bildpaar vorher/nachher am selben Ort* |
| **Orte und Zeiten der echten Menschheit**<br>`mensch.zeit.erde` | jeder Ort der Erde in jedem Jahr, das ein Mensch erinnert — die eigene Stadt im Jahr der Großeltern | **0 / 6** — Stand 0: keine Erd-Saat; die Zeitreise per Satz gründet den Ort neu (siehe mensch.zeit.spanne). | S1: EIN Ort, EINE Zeit (eine römische Stadt um 100) · *Straßenachsen gegen den archäologischen Plan: Deckung ≥ 70 %; Fach-Panel 2AFC Spielbild gegen wissenschaftliche Rekonstruktion ≤ 80 %* |
| **Technik nach uns — Epochen jenseits der Gegenwart**<br>`mensch.zukunft.technik` | jede Saat ihre eigene Zukunft über 10⁴–10⁶ Jahre, auch fremder Arten — Technik-Epochen, die niemand vorhersah, jede aus der vorigen | **0 / 7** — Die Epochen-Tafel der Stadt ist eine Liste, nicht gewachsen (fachwerk-core.js:3294, siehe mensch.wirtschaft.technik); die Zeitreise per Satz bis Jahr… | S1: EINE Stadt, 50 Jahre nach der Gegenwart ihrer Saat · *Bildpaar Jahr 0 / +50 am selben Ort: ≥ 10 neue Dinge im Bild benannt; Gegenlauf: Vorgänger gekappt → das Ding fehlt ≥ 80 %* |
| **Rechner, Netz und die Bildschicht der Stadt**<br>`mensch.zukunft.medien` | jede Kultur ihre eigenen Medien, auch für fremde Sinne (Duft-Schrift, Infraschall-Funk) — das Medium folgt Sinn und Technik der Art | **0 / 7** — Stand 0: Hologramm, Reklame, Werbetafel, Leuchtreklame — 0 Treffer in stamm/ und den Kernen (Grep 14.11.). | S1: EINE Straße mit 10 Bildflächen (Schild, Schirm, Leuchtschrift) · *10 Flächen: der Inhalt stimmt mit der Welt (der Laden steht dort, Uhr und Wetter richtig) 100 %; keine zwei gleich* |
| **Roboter, Androiden, KI-Personen**<br>`mensch.zukunft.maschinenwesen` | Maschinen-Zivilisationen ohne Erbauer, eigene Evolution der Bauarten — Bauart folgt Welt und Geschichte | **0 / 7** — Stand 0: Roboter, Android, Cyborg — 0 Treffer in stamm/ und den Kernen (Grep 14.11.). | S1: EIN Arbeits-Roboter an EINER Aufgabe · *Bewegungs-Kennzahlen aus dem Bild (Schrittfolge, Gelenkgrenzen) passen zum Bau ≥ 90 %; Blindpaar gegen Film realer Roboter ≤ 85 %* |
| **Der veränderte Leib — Implantat, Prothese, Gentechnik**<br>`mensch.zukunft.leib` | Leiber jenseits des Menschen: hochgeladen, verteilt, für andere Welten gebaut — der Leib folgt Welt und Zweck | **0 / 7** — Stand 0: Implantat, Prothese, Gentechnik — 0 Treffer in stamm/ und den Kernen (Grep 14.11.). | S1: EIN Bewohner mit Ersatzglied · *Gang-Kennzahlen (Schrittlänge, Symmetrie) gegen Aufnahmen von Prothesen-Trägern im Band* |

## 5 · Erleben und Erschaffen — 0 von 274 Sprossen (0,0 %), 40 Leitern, im Kern 7

Jede erdenkliche Perspektive: jeder Leib jeder Art und alles, was kein Leib ist — Fluss, Stadt, Maschine, Planet; von der Millisekunde bis zum Äon, mit den Sinnen einer Biene, eines Hundes, eines Wals, mit dem Instrument des Forschers und jeder Kamera; erschaffen mit einer Geste, einem Satz, einem neuen Gesetz — allein, mit der KI, mit anderen in EINER ungeteilten Welt; Ziele, Legenden und Entdeckungen ohne Drehbuch; ein Bild, das dem Foto standhält, ein Klang, der die Welt bezeugt — und Menschen, die bleiben wollen.

*Heute: EIN Leib, EINE Uhr mit Saison per Wort, EIN Satz für EIN Werk (headless gerichtet), Stereo-Klang mit Hall aus der Welt; Taste → Bild an der Radeon 82–235 ms.*

| Kriterium | Die Vision (oberste Sprosse) | HEUTE | Nächste Sprosse · ihr Richter |
|---|---|---|---|
| **Präsenz: der Leib antwortet**<br>`erleben.spieler.praesenz` | jeder Leib jeder Art jeder Saat, auch fremde Gliedmaßen — Präsenz auf Wettkampf-Niveau | **0 / 6** — Fuß p95 0,3–1,4 cm und Third draußen gehalten (§25.K2, §25.K4 Stufe 1); Taste→Pixel ROT: Radeon ego/gehen 235 ms, third 81,6 ms gegen 50 ms (§25.K1 =… | S1: Wiese, gehen und laufen, Ego + Third · *Gang 2 min je Gerät: Taste → erstes Bild mit Leib-Antwort p95 ≤ 50 ms, Fuß p95 ≤ 3 cm, 0 Bilder mit Kamera im Fels* |
| **Die Rolle: jeder Bewohner ist übernehmbar**<br>`erleben.spieler.rolle` | jedes Lebewesen jedes Planeten jedes Sonnensystems jeder Epoche — die Tiefe jeder Rolle ist die Tiefe ihrer Domäne, nicht flacher | **0 / 7** · Kern 1 — Bauen, Aufsitzen (stamm/koerper-fahrt.js:1271), Hieb (stamm/kampf.js), Inventar 27 Plätze (stamm/dirigent-kern.js:739) ändern die Welt; Bewohner trag… | S1: der eigene Leib mit Verben: gehen, bauen, fahren, kämpfen · *15 min je Verb-Gruppe: ≥ 1 sichtbare Weltänderung (Werk steht, Tier flieht, Fahrzeug fährt), Bildpaar vorher/nachher* |
| **Hand und Werk: Wirkung aus dem Stoff**<br>`erleben.spieler.hand` | alles, was ein Lebewesen der Welt tun kann — fremde Glieder, fremde Stoffe — Stoff, Kraft, Geschick aus dem Gesetz der Art | **0 / 6** — Taste→Wirkung p95 81–235 ms (§25.K1 = 0); Halten und Führen (Klinge, Werkzeug, Bogen) 10/10 in der alten Karte, aber nie gegen Real-Foto oder Stoff-S… | S1: setzen und brechen · *Eingabe → erstes Bild mit Wirkung p95 ≤ 50 ms, Trefferpunkt = Zielpunkt ± 1 Zelle, beide Geräte* |
| **Wegfindung ohne Pfeil**<br>`erleben.spieler.wegfindung` | jeder Planet jeder Saat, bis zur Bahn zwischen Planeten — Landmarken, Himmel, Kultur, Bahnmechanik — alles aus dem Samen | **0 / 7** — keine Karte, kein Kompass, kein Wegweiser in stamm/; Landmark-Formationen im Genom (stamm/bau-vorlagen.js:855), nie gegen Wegfindung gemessen. | S1: Landmarke aus 1–3 km sichtbar · *N = 50 Saaten: Anteil Spawn-Orte mit ≥ 1 Landmarke in 1–3 km im Bild, Kontrast ≥ 0,1, ≥ 0,9* |
| **Die Zeit des Spielers: Dehnen, Raffen, Springen**<br>`erleben.spieler.zeit` | Millisekunde ↔ 13,8 Ga (≈ 21 Dekaden) stufenlos, Sprung an jedes Datum jedes Planeten — zurück bis zum ersten Licht — dieselbe Saat, dieselbe Geschichte, jedes Mal | **0 / 9** — Tag-Länge 1–60 min (stamm/daten.js:135-150), Saison per Wort setzbar (stamm/bild-himmel.js:885-929, Sprung, kein Raffer); Ephemeride ungemessen; Raff… | S1: Tag-Länge 1–60 min, Jahreszeit per Spieler-Wort · *Sonnenbahn gegen Ephemeride der Breite ≤ 1°; Saison-Wort ändert Laub und Licht im Bildpaar* |
| **Viele Menschen, EINE Welt**<br>`erleben.spieler.gemeinsam` | 10⁶ auf einem Planeten, verschiedene Zeiten und Rollen — ein Live-Ereignis (Vulkanausbruch) für alle zugleich; eine Geschichte, viele Gegenwarten | **0 / 7** — P2P über RTCPeerConnection (stamm/netz-p2p.js:451), Räume als Map (signaling-server.js:63); gemessen nur zwei Seiten in EINEM Browser, §22.K4 0/2. | S1: 2 Spieler, zwei physische Geräte · *Taste an A → Leib im Bild von B p95 ≤ 150 ms; Welt-Bild an gleicher Kamera ≤ 1 % Pixel-Abweichung (ohne Leiber)* |
| **Sein, was kein Leib ist**<br>`erleben.spieler.nichtleib` | jedes Ding jeder Welt jeder Zeit — die Tiefe jeder Perspektive ist die Tiefe ihrer Domäne | **0 / 7** — Der Spieler ist EIN Leib mit Verben (siehe erleben.spieler.rolle); keine Perspektive ohne Leib. | S1: EIN Ding der Welt: der Spieler ist ein Fluss · *10 min als Fluss: der Weg ist die Gefälle-Linie der Welt (Abweichung ≤ 5 %); ein Eingriff des Spielers (Lauf verlegen) ändert das Ufer im Bildpaar* |
| **Instrument und Ursache — der Blick des Forschers**<br>`erleben.spieler.forscher` | jede Messung jeder Wissenschaft an jeder Welt, auch fremden — das Instrument einer fremden Welt enthüllt deren eigenes Gesetz | **0 / 7** — Stand 0: Mikroskop, Seismograph, Spektrometer — 0 Treffer in stamm/ und den Kernen; „Teleskop“ nur als Form-Signatur eines Bauteils (stamm/bau-teile.… | S1: EIN Instrument: Fernrohr auf den Mond der Welt · *das Fernrohr-Bild zeigt Krater, die beim Anflug an derselben Stelle liegen (Lagefehler ≤ 1 %)* |
| **Der Hebel: Geste, Plan, Gott — Folge im Ego**<br>`erleben.schoepfen.hebel` | ein Sonnensystem je Geste — jeder Maßstab kausal verbunden bis zum Gesicht eines Bewohners | **0 / 9** — 72/72 Werke über echte Ereignisse (Werkstatt, Rezeptbuch, Hotbar je 24/24), Statik, Turm 70 m; Haus als Slot 2/2 (§21); Wille → Bild ≤ 1 s offen (bau… | S1: 1 Werk über ≤ 3 Eingaben · *Konstruktions-Prüfsatz richtig geurteilt mit sichtbarer Folge, Klicks und Zeit am Ereignis-Strom, beide Geräte; Bildvergleich Studio ↔ Welt im Band* |
| **Ein Satz wird Welt**<br>`erleben.schoepfen.satz` | ein Sonnensystem mit Zeitachse über 10⁹ Jahre aus einem Absatz — jeder Planet, jede Epoche bereisbar und kausal verträglich | **0 / 9** — Op spawn_studio (stamm/feld-dsl.js:1072); KI-Korpus 41/41 gegen lokales qwen3:4b, Absicht 100 %, Negativ 9/9, p95 4 998 ms — alles headless, ein Werk… | S1: 1 Werk eines Studios (Eiche, Haus) · *eingefrorener Korpus ≥ 40 Sätze im echten Fenster: gültig ≥ 95 %, Absicht ≥ 85 % am Ausgabebild, 0 Brüche, 0 Hänger > 100 ms* |
| **Gesetz erfinden**<br>`erleben.schoepfen.gesetz` | eine erfundene Evolution über Zeitalter — Stammbäume, Konvergenz, Aussterben | **0 / 6** — Spieler-Regel wirkt und reist, Spieler-Gesetzbuch dockt an (7 822 B, §28.K4) — headless; kein Saaten-Richter, keine KI-Erfindung eines Gesetzes. | S1: 1 Spieler-Regel wirkt in der Welt · *Regel im Spiel geschrieben → Wirkung im Bild bei A und B* |
| **Im Gespräch erschaffen**<br>`erleben.schoepfen.gespraech` | die Welt selbst als dritter Mitspieler schlägt vor — Vorschläge folgen dem Gesetz und dem Geschmack des Spielers | **0 / 6** — Korrektur-Dialoge, Neulings-Schwelle, Gruppe mit KI: nichts gemessen. | S1: 1 Neuling, erste Schöpfung · *20 Neulinge ab 10 Jahren: Anteil, der in 5 min ein eigenes Werk erschafft und teilt ≥ 80 %* |
| **Teilen und offene Bibliothek**<br>`erleben.schoepfen.teilen` | jede Welt des Ultiversums offen nachbaubar — ein Fremder baut aus Quelle + Same nach | **0 / 6** — Welt 1 041 B, Regel 335 B, Bauplan 428 B, signiert, forkbar; Fusion byte-gleich auf zwei Geräten (§28.K2) — headless; fremdes Gerät mit frischem Prof… | S1: 1 Bauplan im selben Profil · *Export/Import: Bildpaar an gleicher Pose gleich* |
| **Schutz, Vertrauen und Moderation**<br>`erleben.schoepfen.schutz` | 10⁶ Spieler, manipulierter Klient — Zustand nicht fälschbar | **0 / 6** — RULE_FORBIDDEN_EFFECT_OPS (stamm/feld-dsl.js:194); 0 von 7 Injektionen erreichen das Modell (§28.K5) — headless, Korpus zu klein für S2. | S1: 1 geteilte Welt mit verbotener Tat · *feindliche Welt geladen: eigene Welt im Bildpaar unverändert, Abweisung im Spiel benannt* |
| **Ziele aus dem Zustand der Welt**<br>`erleben.sinn.ziele` | jeder Bewohner auf 10³ Planeten über 10⁵ Jahre — Ziele erschöpfen sich nie | **0 / 7** · Kern 1 — δ-Wertung antwortet am Ort, beide Geräte, Tag/Nacht, Ego/Third: Tat 1 δ 0,1607 → Tat 10 δ −0,0018, Vogelchor 3,39 dB, Nachbar 0 dB (§10.K1 2/2). Kein… | S1: 1 Signal: die Welt antwortet hörbar am Ort einer Tat · *dieselbe Tat 10×: Antwort am Ort (dB, Licht) fällt von Tat 1 auf Tat 10 auf ≤ 30 %, Nachbarzelle 0* |
| **Legenden aus Bewohnern und Ereignissen**<br>`erleben.sinn.legenden` | 10³ Planeten, 10⁶ Jahre, jede Art mit eigener Überlieferung (Lied, Zeichen, Duft, Bau) — Epen neben den besten geschriebenen | **0 / 7** — journalAppend (stamm/dienst.js:385), entryCap 200; Zeilen journal.bedrohung-bezwungen / journal.fiel-im-kampf (stamm/kreatur-leben.js:898/902) — Gedä… | S1: 1 Tagebuch der Welt, 200 Zeilen · *20 Zufallszeilen des Tagebuchs: der Spieler geht zum genannten Ort und findet die Spur der Tat im Bild (Bildpaar gegen dieselbe Saat ohne die Tat) ≥ 95 %* |
| **Leben und Tod des Spielers**<br>`erleben.sinn.tod` | Leben in jeder Epoche, auf jedem Planeten, als jede Art — Tod ist Wendepunkt, kein Abbruch | **0 / 7** — _playerDeathRespawn (stamm/koerper-seele.js:322-352): Trauer +0,3, Ehrfurcht +0,2, Wunde ~10 min, Lebensspur, Rückkehr am Genesis-Anker — im Code gel… | S1: Tod setzt zurück an den Ankunftsort · *Bildfolge: der Leib fällt, derselbe Leib steht am Ankunftsort; das Gefährt steht im Bild, wo er fiel* |
| **Entdeckung**<br>`erleben.sinn.entdeckung` | Ultiversum aus 10³ Planeten, nach 10⁴ h noch Unentdecktes — jeder Fund wahr in seiner Welt | **0 / 7** — jede dritte Siedlung trägt seed-deterministisch eine Epoche (stamm/siedlung-ort.js:1644) — Gesetz steht, ungefahren. | S1: 1 Ort, der sich aus der Saat vom Nachbarn unterscheidet · *Blind-Agent nennt in 10 min ≥ 1 Ort „anders als der vorige" und begründet es am Bild* |
| **Takt: Dramaturgie ohne Regisseur**<br>`erleben.sinn.takt` | jede Stunde jedes Spielers auf jedem Planeten — der Bogen trägt wie eine Kampagne | **0 / 7** — keine Messung toter Minuten; ungemessen. | S1: 10 min an der Ankunft · *Anteil toter Minuten ≤ 50 %* |
| **Der Sog — bleiben und wiederkommen**<br>`erleben.sinn.sog` | Jahre: eine Welt, in der Menschen leben wollen — wer geht, kommt zurück; wer erzählt, bringt andere | **0 / 7** — Nie gemessen: kein blinder Neuling hat die Welt im Protokoll gespielt; der v1-Pfad ist als Spielgang nur von der Maschine gefahren (spielgang.K1, hea… | S1: die ersten 10 Minuten, 12 blinde Neulinge · *Anteil, der nach 10 min freiwillig weiterspielt ≥ 70 %; Zeit bis zur ersten eigenen Tat ≤ 2 min* |
| **Die erlebte Größe — Staunen und Merken**<br>`erleben.sinn.staunen` | das Ganze gegen das Beste der Gegenwart — „so etwas habe ich nie gesehen“ | **0 / 7** — Nie gemessen: kein blinder Spieler hat die Welt im Protokoll gesehen. | S1: EIN Ort, 30 min · *blinde Spieler nennen nach 30 min ≥ 10 verschiedene Dinge beim Namen oder im Bild; 5 davon finden sie wieder* |
| **Fremde Sicht: das Auge als Leser des Lichts**<br>`erleben.sinne.sicht` | fremde Sterne 2 500–10 000 K und ihre Planeten — Licht am Boden aus Stern × Atmosphäre; Augen der Einheimischen passen dazu | **0 / 6** — keine Sicht außer der menschlichen; Stoffe sind RGB/PBR, kein Spektrum (Grep UV/IR/Polarisation in stamm/ und *-core.js: 0). | S1: eine Wiese, ein Bienen-Auge (UV/B/G) · *Bildpaar Mensch ↔ Biene an derselben Wiese: ≥ 1 Muster nur im Bienenbild (Kontrast ≥ 0,2), an Blüten, die Bienen anfliegen* |
| **Hören jenseits des Menschen**<br>`erleben.sinne.hoeren` | Planet: jeder Ort in jedem Band — Megastadt im Ultraschall, Tiefsee im Sonar — Hörband aus dem Sinnes-Genom | **0 / 6** — Klang nur fürs Menschenohr; kein Echolot, kein Infraschall, kein Hörbereich je Art. | S1: ein Haus, ein Echo-Sinn · *Blind-Lauf (Bild schwarz, nur Echo): Ausgang in ≤ 2× der sehenden Zeit* |
| **Das Geruchs-Feld: Chemie im Wind**<br>`erleben.sinne.geruch` | Planet: Pheromon-Netze, Ameisenstraßen, Lachs riecht seinen Fluss — Duft trägt Information über Tage und 10³ km | **0 / 6** — _scentAt (stamm/koerper-seele.js:1578-1604), Leser stamm/kreatur-verhalten.js:178-275 und tetrapoda-core.js:149-171; Wolf findet Beute (§8.K4). Feld… | S1: ein Tier folgt einer Witterung · *Gegenlauf im Bild: Wolf findet Beute über Witterung; Witterung aus oder Wind gedreht → Suchzeit ≥ 3×* |
| **Feld-Sinne: Magnetismus, Elektrizität, Schwingung**<br>`erleben.sinne.feld` | fremde Planeten: kein Dynamo, Riesenfeld, Gezeitenheizung — Sinne folgen den Feldern des Planeten | **0 / 6** — kein Magnetfeld, kein Elektrosinn („Magnet" nur als Bild in stamm/koerper-bewegung.js:1127). | S1: Dipolfeld des Planeten, schief zur Drehachse · *Polarlicht um den MAGNETISCHEN Pol (60–75° geomagnetisch auf erdähnlichen Saaten); Kompass weist zum selben Pol* |
| **Sinnes-Genom: Breite und Evolution der Umwelten**<br>`erleben.sinne.genom` | 10⁶ Arten × beliebig viele Planeten — Umwelten, die die Erde nicht kennt | **0 / 6** — pirschSichtM 5 (tetrapoda-core.js:162), sichtM 320 (:2310), scentRangeM 50 — Zahlen für Verhalten, keine Organe, keine Kurven. | S1: Tiere mit Sicht- und Witter-Radius je Gattung · *Witterung und Sicht ändern Flucht und Jagd (Gegenlauf)* |
| **Signale: ein Wesen schreibt, ein anderes liest**<br>`erleben.sinne.signale` | Planet: Signale in Kanälen, die nur fremde Sinne tragen (UV, Entladung, Biolumineszenz) — Kanal aus dem Sinnes-Genom von Sender und Empfänger | **0 / 6** — Grep Warnruf/Alarmruf/Duftmarke/Gesang: 0 Treffer. | S1: Warnruf in der Herde · *Fluchtbeginn vor eigener Wahrnehmung ≥ 0,7; Ruf aus → Verluste steigen* |
| **Gesehen werden: Tarnung, Mimikry, Warnfarbe**<br>`erleben.sinne.gesehen` | fremde Planeten: Tarnung im Licht fremder Sterne — Färbung aus Sternspektrum × Jäger-Auge | **0 / 6** — Wild bemerkt den Spieler über Radien, nicht über Farbe. | S1: der Spieler als Beute · *Entdeckungsdistanz bei Spieler in Orange ≈ Grün (±15 %), in Weiß auf Schnee messbar anders* |
| **Fernsicht und Treue über die Stufen: die Ferne ist dieselbe Welt**<br>`erleben.bild.ferne` | Galaxie — Sternhimmel des Dorfs = Sterne der Galaxie-Ansicht | **0 / 9** — Gelände-Ring ±8 km (stamm/gelaende-fern.js:2123), Koschmieder je Kanal T/T_soll 0,86–1,08, Restkontrast 1,0–1,3 % bei 17–22 km (§14.K1/K2 je 2); Wald… | S1: 0,2 km · *Restkontrast je Kanal gegen Koschmieder T/T_soll 0,8–1,2; Ferne = Nähe ≥ 0,8 an 12 Posen* |
| **Nacht: Lichter, die werfen**<br>`erleben.bild.nacht` | 10⁹–10¹⁰: Nachtseite eines Planeten über Epochen — Feuer, Gas, Glühlampe, Natrium, LED; Milchstraße, wo keine Glocke steht | **0 / 8** — Licht-Pool 4 Plätze in 48 m (stamm/stoff-material.js:3849); Feuer-Wurf gebaut (stamm/bild-schatten.js:383-391), gemessen ROT 0,248:1 statt ≥ 3:1 (Rad… | S1: 1 Quelle · *Schatten-Kontrast ≥ 3:1 an einem Pfosten 2 m vom Feuer; Gasse in der Kelvin-Farbe ±200 K* |
| **Fläche im wahren Licht**<br>`erleben.bild.flaeche` | jeder Planet — fremde Mineralien und Lebensoberflächen, mehrere Sonnen | **0 / 8** — Kontaktschatten steht (§16.K1 2), Albedo-Band 0 (§15), Ruhe 1/2, Rückstrahl 1/2, Kontakt-Verdeckung 0; Stoffe eine gebaute Tafel, kein Raum. | S1: Wiese, 10² m² · *Halbschattenbreite gegen Abstand im Band; Albedo im Bild ±0,05 gegen Tabellenwert für Gras, Erde, Fels, Holz, Haut* |
| **Luft, Tag und Himmel**<br>`erleben.bild.himmel` | × Planet — fremde Atmosphären, mehrere Sonnen, Ringe, Monde | **0 / 7** — Hillaire-Atmosphäre mit Rayleigh, Mie, Ozon (welt-licht.js:211-265) — gegen Klarhimmel ungemessen; Tag-Bahn ROT: Radeon +0,94 EV bei Uhr 0,33, GTX −2… | S1: Mittag, klar · *Himmels-Leuchtdichte gegen gemessenen Klarhimmel ±0,3 EV* |
| **Das Auge: Belichtung, Dynamik, Ruhe**<br>`erleben.bild.auge` | jede Perspektive: Makro 1 cm, Riesenhöhe, Unterwasser, Orbit — dasselbe Auge über 10 Größenordnungen Höhe | **0 / 6** — Belichtungs-Gesetz mit Gleitung (BELICHTUNG, stamm/bild-himmel.js:3292), gegen keine Referenz gemessen; Schatten-Ruhe 1/2 (§16.K2). | S1: Gehen · *zeitliche Pixel-Varianz in ruhenden Bildbereichen ≤ 1 % der Fläche über Schwelle* |
| **Jede Kamera — Foto, Kino, Wiederholung, Zuschauen**<br>`erleben.bild.kamera` | Kino: eine Fahrt durch die Megastadt, den Sturm, die Äonen — eine Minute Film ohne Schnitt, die ein Blinder für gedreht hält | **0 / 7** — Spieler-Kameras der gebuchten Stationen sind Ego und Third; Fotomodus 0 Treffer in stamm/ und den Kernen (Grep 14.11.). | S1: freie Kamera und Standbild · *20 Standbilder aus freier Lage: Bild ganz (Lücke ≤ 2 %), Schärfe und Licht wie im Spiel* |
| **Raum, Medium und Hörort**<br>`erleben.klang.raum` | jeder Planet aus 10⁶ Saaten, Gasriese bis Vakuum — Dichte, c, Absorption aus dem Gesetz; im Vakuum nur Körperschall | **0 / 7** · Kern 2 — RT60 Feld 0,283 · Wald 0,649 · Gasse 1,522 · Höhle 3,195 s, Verdeckung Haus −11,2 dB (§32.K3 2/2); Klang-Takt Radeon p95 0,25 ms > 0,2 (§32.K5 1/2)… | S1: 1 Ort, Stereo · *Pegel- und Laufzeitunterschied am Abgriff an 24 Quellenlagen mit richtigem Vorzeichen (100 %)* |
| **Stoff und Ereignis**<br>`erleben.klang.ereignis` | jedes Ereignis jeder Welt, 10⁶ Saaten, fremde Stoffe — plausibel für einen nie gehörten Stoff | **0 / 7** · Kern 2 — schrittKlang (klang-core.js:1532), trefferPaar (:1420), Motor mit Doppler (:1675); Motor r 1,0, Landung r 0,9975 (§32.K4 2/2); Preis Radeon ROT; kein… | S1: Schritt auf 3 Stoffen · *Spektralschwerpunkt je Stoff ≥ 300 Hz getrennt, ≥ 5 Schritte je Stoff* |
| **Klanglandschaft: Natur und Stadt als EINE Population**<br>`erleben.klang.landschaft` | fremde Evolution: 10⁶ Saaten mit eigenen Arten, Medien, Sinnen — Ruf folgt Leib, Rufe in fremden Medien | **0 / 8** · Kern 1 — neun Textur-Gesetze (klang-core.js:668-766), Tier-Ruf f0 ∝ L^−0,9 (:495-497), Wind r 0,81/0,79 (§32.K1, K2 je 2/2); Verkehr K-nah (stamm/klang.js:109… | S1: 1 Biom (Wiese) + Dorf, Feuer, Motor · *Klang-Zensus Pegel je Ort im Soll; Wind Bild ↔ Ohr r ≥ 0,6* |
| **Die Stimme**<br>`erleben.klang.stimme` | 10⁴ Sprachen, 10⁸⁺ Sprecher, fremde Sprechorgane (Pfeif-, Klick-, Infraschall) — fremde Sprache als Sprache erkennbar, nicht als Lärm | **0 / 5** — Bewohner sprechen nicht; der Begleiter spricht über speechSynthesis des Browsers (stamm/werkstatt-hud.js:71-89) — Gerätestimme, nicht aus Gesetz, zäh… | S1: 1 Stimme aus Gesetz, Laute ohne Bedeutung (Murmeln, Rufe) · *F0 und Formanten am Abgriff gegen Peterson-Barney-Tafel ±15 % nach Leibmaßen* |
| **Musik je Kultur und Epoche**<br>`erleben.klang.musik` | 10⁵ Traditionen über Planeten, fremde Ohren und Medien — Musik fremder Arten, die es nie gab | **0 / 7** — 22 Genre-Tafeln (klang-core.js:96-117), 7 Skalen 12-TET (:39-47), 185 Phrasen 0 wiederholt (§10.K5 2/2) — von Hand gestimmt, Fleiß statt Same. | S1: 1 Musik-System der Welt · *Hörer-Blindtest: Stimmung der Szene aus der Musik erkannt ≥ 70 %; am Abgriff keine Wiederholung in 10 min* |
| **Hören im Getümmel**<br>`erleben.klang.getuemmel` | jede Lage jeder Saat — das Wichtige bleibt hörbar, die Menge bleibt da | **0 / 6** — Stimmen-Deckel 7 (klang-core.js:417), Spitzen-Wand, Musik-Duck 8,5–12 dB; Preis Radeon ROT. | S1: 7 Stimmen zugleich, die lautesten gewinnen; Musik tritt unter Stimme · *Spitzen ≤ 0 dBFS über 10 min; Duck 8–12 dB bei Stimme* |

## 6 · Der Same und sein Preis — 0 von 198 Sprossen (0,0 %), 28 Leitern, im Kern 2

EIN Same und ein paar Megabyte Gesetz ergeben eine Galaxie: Physik, die überall wahr ist und nur am Schirm rechnet; ein Maßstab ohne Bruch von 10 µm bis 10²¹ m; eine Welt, die auch ohne Zuschauer weiterlebt und jede Tat über jedes Zeitalter behält — auf dem Laptop eines Menschen, in Sekunden, ohne Download, am Ende auf jedem Gerät der Menschheit.

*Heute: ~13 MB Skript statt Gigabyte, Ankunft kalt 11–17 s, 33 ms nur an der GTX im Stand; die Radeon reißt in Bewegung (gehend 66 %, fahrend 94 % der Bilder über 33 ms), der Heap wächst um 185 MB je Minute.*

| Kriterium | Die Vision (oberste Sprosse) | HEUTE | Nächste Sprosse · ihr Richter |
|---|---|---|---|
| **Freie Körper**<br>`same.physik.koerper` | ≥ 10¹² (jedes lose Ding eines Planeten), Jahrhunderte — bewegt nur, was eine Ursache hatte (Mensch, Flut, Wind, Fäulnis) | **0 / 7** — EIN Starrkörper-Löser für Kiste und Zylinder (stamm/koerper-frei.js:3-35), headless 100 wache Körper 0,4 ms; im echten Spiel an der Stadt kein Bild… | S1: 1 Körper · *Fass fällt vom Dach: Ruhe ≤ 2 s, Zittern ≤ 1 cm, Spalt zum Boden im Bild ≤ 5 cm* |
| **Tragen und Brechen**<br>`same.physik.tragen` | Megastrukturen auf fremden Welten (km, 0,3–3 g) — die Statik setzt Grenze und Silhouette der Stadt | **0 / 7** — Biegung und Euler-Knick je Glied (stamm/bau-buch.js:1823-1892), aber durch knickSicherheit 500 geeicht (:2580-2591): relativ wahr, absolut nicht; Las… | S1: 1 Glied · *Säule realer Schlankheit unter wachsender Last: Versagens-Last gegen Euler ±20 %; halbes E knickt früher* |
| **Flüssigkeit und Gas**<br>`same.physik.fluid` | fremde Fluide auf N Welten — Methan-Meere, Lava-Ozeane, dichte Atmosphären folgen g und Viskosität | **0 / 8** — Zellen-Feld Uint8Array Luft/Wasser/fest je Chunk (stamm/wasser-zellen.js:3), kein Impuls; die gegrabene Grube füllt sich im Code, im Spiel-Bild nie g… | S1: Zellen-Wasser ohne Impuls · *Grube unter dem Pegel gegraben füllt sich im Bild, beide Geräte* |
| **Wärme, Feuer, Phase**<br>`same.physik.feuer` | planetar, Äonen, fremde Welten — O₂ 15–35 % (Karbon), Methan-Seen, Eis-Vulkane; jede Phase nach ihrem Diagramm | **0 / 8** — Rothermel 1972 + Albini + Anderson auf dem Feld (stamm/feld-leben.js:2477-2620), Halt an Fluss und Fels, Asche als Tat; Phasen nur Eis und Wasser (ba… | S1: 1 Zelle · *Fackel an trockenes / nasses Gras: zündet / zündet nicht; Eis trägt den Spieler, y am Spiegel ±5 cm* |
| **Verformung und Weiches**<br>`same.physik.verformung` | Kriechen über Zeitalter — Gletscher fließen, Gestein faltet sich | **0 / 7** — EIN Seil-Löser im Körper-Kern, gelesen vom Flegel. Das Blatt nennt ein Bild im Spiel, die alte Karte bucht physik.K4 aber nur headless (d3708675) — P… | S1: ein Seil · *Flegel schwingt am Leib des Spielers, Seillänge im Bild ±2 %, beide Geräte* |
| **Reaktion und Umwandlung**<br>`same.physik.reaktion` | fremde Chemie — ohne Oxidator kein Brand, in Wasserstoff-Welten andere Flammen | **0 / 6** — Außer Verbrennen nach Rothermel nichts; „phaseChange"/„plastic" je Stoff (bau-buch.js:2624-2626) sind Etiketten des Bauplans, keine Chemie. | S1: 1 Reaktion · *Asche + Rauch-Masse = Holz ±10 %, Rauchmenge sichtbar proportional* |
| **Umströmung und Flug**<br>`same.physik.flug` | fremde Konstanten auf N Welten — g und Luftdichte skalieren Wurf, Sprung, Flug | **0 / 6** — Nichts als Gesetz belegt: kein Widerstand, kein Drall, kein Auftrieb am Körper gesehen. | S1: 1 Wurf · *Stein und Feder: Wurfweiten gegen Rechnung ±10 %, Feder fällt sichtbar langsamer* |
| **Stoff-Vielfalt aus dem Samen**<br>`same.physik.stoffe` | 10⁶+ fremde Stoffe — Stoffe, die die Erde nicht kennt, aber die Physik erlaubt | **0 / 6** — Unter Sprosse 1: 21 SI-Zeilen (stamm/bau-vorlagen.js:1585-1608), ρ über den EINEN Leser _stoffRho, 7 Wirkungen mit 4–5 belegt; die Jury wurde nie gef… | S1: 10 Stoffe · *Blind-Jury sieht und hört einen grauen Gegenstand fallen, brechen, brennen und benennt den Stoff ≥ 70 %* |
| **Gleichheit über Geräte und Peers**<br>`same.entfaltung.gleichheit` | Galaxie: 10¹¹ Systeme × Planeten × Äonen, fusionierte Welten — gleich ohne Zustands-Strom | **0 / 8** — Headless: alle Teil-Simulationen gleich ohne Zustands-Nachricht (Leben 1189/1189, Reload mitten im Sturm), Fusion byte-gleich 1146 B (feld.K2, ultive… | S1: Gelände am Spawn · *Bild G2 ↔ G3 gleiche Pose: Horizont-Linie ≤ 2 px Abweichung* |
| **Schirm statt Sack**<br>`same.entfaltung.schirm` | jede Pose einer Galaxie, 10¹⁰ Menschen je Welt — so wahr wie Sprosse 6 | **0 / 7** — GTX stehend p95 16,8 ms an Wiese und Genesis; das Radeon-ABAB am Kopf fehlt (PFLICHT E), die Wiese trägt bis ~20 m, Häuser lesen als weiße Kästen. Da… | S1: Wiese und Genesis, Sicht 8 km · *Frame p95 je Gerät, Wiese und Genesis, Ego und Third* |
| **Reise ohne Bruch**<br>`same.entfaltung.reise` | eine Galaxie, 10⁵ Lj; Sprung zwischen Planeten und Epochen im Flug — jeder Stern ein Landeort; Ziel ganz ≤ 1 s, kein schwarzes Bild | **0 / 8** — Sicht 8 km auf einer flachen Ebene ohne Krümmung und ohne Ursprungs-Versatz (Grep: nur ein Kommentar in netz-p2p.js:2126); Radeon gehend 66 %, fahren… | S1: Gehen 1 km durch die Wiese · *Gang-Bahn: Anteil ganzer Bilder ≥ 98 %* |
| **Rechnung ohne Zuschauer**<br>`same.entfaltung.abwesenheit` | eine Galaxie, jede Welt lebt ohne Zuschauer — Besuch nach beliebiger Zeit ohne Widerspruch | **0 / 7** — Tag jedes Bewohners = f(Same, t) (siedlung-bewohner.js:1881-1932), aber periodisch (mod 24, :1894), die Ankunft spielt nur 3 h nach (:3500); Ruhe ist… | S1: 118 Bewohner einer Test-Stadt, ein Tag · *Ort sehen, gehen, nach N h zurück: Lage jedes Bewohners gegen den Lauf mit Zuschauer ≤ 1 m* |
| **Jede Saat eine eigene Welt**<br>`same.entfaltung.vielfalt` | 10⁴ Welten, ≥ 30 % jenseits jeder Erd-Epoche — jede Welt aus einem Bild erkennbar UND aus ihrem Gesetz erklärt | **0 / 7** — Nie gemessen; Häuser lesen als weiße Kästen mit Fenstern. | S1: 10 Orte EINER Welt · *aus einem Zufallsbild den richtigen von 10 Orten ≥ 80 % (Panel); der Prüfer nennt das Merkmal, Gegenlauf: Ursache getauscht → Merkmal weg ≥ 80 %* |
| **Die Tat bleibt**<br>`same.entfaltung.akte` | eine Galaxie: jede Tat jedes Spielers je — an jeder Koordinate | **0 / 8** · Kern 1 — Reload im echten Spiel: bild-diff 0,69 % (Radeon) / 0,71 % (GTX) mit Bau, Grube und Wasser im Bild (Speicher K4). 1 000 Edits 86 kB, Peers byte-gleic… | S1: 10² Taten einer Sitzung · *Bildpaar vor ↔ nach Reload ≤ 1 % Diff mit Pflicht-Inhalt, beide Geräte* |
| **Die Spanne ohne Bruch**<br>`same.massstab.spanne` | 31: 10 µm bis 10²⁶ m — andere Galaxien, Haufen, das kosmische Netz — jede Galaxie ein Ziel mit eigenen Sternen und Welten, keine Kulisse | **0 / 9** — Unter Sprosse 1: die Wiese trägt bis ~20 m, der Fern-Saum ist ROT (Kohärenz 0,60, Radeon); der Himmel rechnet eine Kugel (foundry-core.js:284, 6 360… | S1: 3 Größenordnungen: Bildbreite ~1 m bis ~1 km · *N = 20 Saaten × Steigflug 0,5 m → 700 m Auge in 30 s, hin und zurück: alle Bruch-Bedingungen gehalten* |
| **Die Tiefe am kleinen Ende**<br>`same.massstab.nahe` | 10 µm: der Mikroskop-Blick — Zelle, Pollenwand, Milbe — das Leben des Ortes | **0 / 7** — Ungemessen; kleinstes Auge 0,25 m (bild-sicht.js:3861), die Armlänge-Pose der alten Karte prüft Pixel, nicht Spektrum. | S1: 2 m (Blick vor die Füße), N = 100 Orte · *Spektrum gegen Foto der Bodenklasse: Energie über 1/20 der Bildbreite ≥ 50 % der Referenz in ≥ 80 %* |
| **Der Sprung**<br>`same.massstab.sprung` | jeder Ort, Maßstab (10 µm … 10²⁶ m) und Zeit, als Ort-Wort oder Satz an die KI — volles Bild | **0 / 8** — Teleport 1 km: p95 33,8 ms (Radeon) / 49,9 ms (GTX), die Welt steht nach 14–45 s (streaming.K3 1/2) — der Preis von Sprosse 1 reißt an der GTX. | S1: Teleport 1 km · *Spielgang-Station Sprung: p95, t(ganz), Lücke* |
| **Die Physik des Maßstabs**<br>`same.massstab.physik` | 10 µm bis 10⁷ m, jede Größe — EIN Gesetzessatz trägt Staub, Ameise, Mensch, Schiff, Mond | **0 / 6** — Körper- und Fahrt-Physik im Mensch-Maßstab vorhanden, gegen die Formel ungemessen; keine Physik über den Maßstab. | S1: 1 Größenordnung (0,5–5 m: Mensch, Wagen, Kiste) · *Fallzeit aus 10 m gegen √(2h/g) ±5 %; Bremsweg gegen μ ±10 %* |
| **Alter des Gebauten**<br>`same.gedaechtnis.alter` | jeder Planet, fremde Umwelt (Säure, Sand, Vakuum, Methan), 10⁶ Jahre — dieselbe Faltung mit der Dosis des fremden Planeten | **0 / 8** — EIN Alters-Kern (siedlung-satz.js:843-967), 3 alternde Stoffe × 5 Schichten (bau-vorlagen.js:1650), sättigt nach 10–300 Tagen; Tag 30 Δ Albedo 0,038… | S1: 1 Werk, 3 Stoffe, 30 Spieltage · *Bildpaar vor ↔ nach 30 d: Δ Albedo ≥ 0,02, Nord- und Wetterseite verschieden, beide Geräte* |
| **Spur des Gangs**<br>`same.gedaechtnis.pfad` | 10⁹–10¹⁰ Leiber, Planet, 10⁴ Jahre — Handels- und Pilgerrouten aus dem Orbit lesbar | **0 / 6** — Trampelpfad aus dem Tritt der Leiber und Peers (dirigent-takt.js:1163, netz-p2p.js:2938): 100 Gänge → Büschel 13 → 3, daneben 17 → 17 — headless (sto… | S1: 1 Weg, 1 Spieler, 100 Gänge · *Büschel auf / neben dem Weg vor ↔ nach im Bild, beide Geräte* |
| **Kulturschichten**<br>`same.gedaechtnis.schicht` | jeder Planet, Äonen, fremde Zivilisationen — Kulturschicht wird geologische Schicht, fremde Bauweisen fossilisieren nach ihrer Chemie | **0 / 6** — Nichts: Boden ohne Geschichte. | S1: 1 Grube an einem Ort · *Grubenwand: ≥ 3 unterscheidbare Schichten im Bild* |
| **Ankunft**<br>`same.preis.ankunft` | viele Planeten, jede Epoche — wie 6 je (Planet, Epoche) | **0 / 8** · Kern 1 — GTX kalt 16,6 s (16,1–17,0) am 18.10., Zweit-Boot 12,0 s, Haupt-Faden bis zum Bild 97 % belegt; Radeon ≈ 11 s am 17.10.; lokaler Server, nie gedrosse… | S1: eine Wiese am Spawn · *t(Kontrolle) von außen, ≥ 4 Kalt-Boots je Gerät* |
| **Bild-Takt über die Gerätespanne**<br>`same.preis.takt` | Planet von Orbit bis Gras, Stadt jenseits Tokio, jede Epoche — volles Bild an jedem Ort | **0 / 7** — GTX stehend p95 16,8 ms (18.10.); Radeon gehend 66 %, fahrend 94 % der Bilder > 33 ms; das Radeon-ABAB am Kopf steht aus (PFLICHT E). | S1: Wiese, stehend, Ego · *werkbank lauf, 4 Boots je Gerät* |
| **Null Download**<br>`same.preis.bytes` | viele Planeten, Evolutionen, jede Epoche — wie 4 | **0 / 7** — ≈ 12,9 MB roh Stamm + Kerne (64 Dateien 9,1 MB + 10 Kerne 3,75 MB), vendor 2,3 MB — eine Summe von Dateigrößen, kein Netz-Mitschnitt. | S1: eine Welt · *Netz-Mitschnitt des Kalt-Boots an beiden Geräten* |
| **Jedes Verb über jede Eingabe**<br>`same.preis.eingabe` | ein Verb, das es gestern nicht gab — per Satz erschaffenes Verb sofort über alle 5 Eingaben | **0 / 7** — Tastatur/Maus und Gamepad mit Totzone und freier Belegung (koerper-bewegung.js:2413-2434); kein Touch (nur ein pointerdown-Stempel), WebXR und Sprach… | S1: Tastatur + Maus · *v1-Pfad aus aufgenommenen Eingaben, INP* |
| **Zugang mit fehlendem Sinn**<br>`same.preis.zugang` | Planet und Epochen: jede Reise, jeder Sport, jedes Erschaffen, auch eben per Satz Entstandenes — 20 Aufgaben × 5 Sinn-Profile an zufälligen (Same, Planet, Epoche) | **0 / 7** — Untertitel aus dem Klang-Gesetz 39/39, Farbsicht-Modus (Deuteranopie min ΔE 31,8, bild-kosten.js:3928-3931), Komfort-Regler, DE/EN aus EINER Tafel; k… | S1: Text der Oberfläche · *harte UI-Zeilen = 0* |
| **Die Sitzung hält**<br>`same.preis.ausdauer` | Tage, viele Planeten und Epochen — Speicher kehrt nach jedem Sprung zurück (≤ 2 %), Bild an Tag 3 = Tag 1 | **0 / 6** — 1,06 min Spielgang an der Radeon ohne Absturz, aber ROT: Bild-p95 67,2 ms, Heap 290 → 486 MB (+185 MB/min), VRAM nach GC 135,6 → 159,4 MB (profiband.… | S1: 1 min Spielgang · *Spielgang am Stück mit Heap-Kurve* |
| **Speicher, Wärme, Akku**<br>`same.preis.speicher` | viele Planeten und Epochen, Handy-Klasse — wie 5 | **0 / 6** — Heap 290 → 486 MB in 1,06 min (+185 MB/min), VRAM nach GC 135,6 → 159,4 MB an der Radeon (profiband.K5, ROT); GTX stehend VRAM 99,6–111,2 MB (PFLICHT… | S1: Wiese und Dorf · *Heap- und VRAM-Kurve über 5 min Spielgang* |

## 7 · Das Zusammenspiel — 0 von 213 Sprossen (0,0 %), 33 Leitern, im Kern 2

Nichts steht allein: der Vulkan formt die Küste, die Küste die Stadt, die Stadt den Verkehr — und die Stadt formt Klima und Küste zurück. Hier misst die Karte, wie viele Glieder weit eine Ursache durch die Welt läuft, wie viel der Gegenwart aus ihrer Geschichte folgt, wie die Welt auf Störung antwortet und ob EIN Ereignis in jedem Sinn und zu jeder Zeit dasselbe ist.

*Heute: Regen löscht Brand, Wölfe formen den Jungwuchs, die Front dimmt das Licht — fast alles headless belegt, im Bild nur die Front, der Pegel und der Häuser-Ring um das Spielerhaus.*

| Kriterium | Die Vision (oberste Sprosse) | HEUTE | Nächste Sprosse · ihr Richter |
|---|---|---|---|
| **Gelände, Wasser und Gestein tragen Siedlung und Verkehr**<br>`planet.kopplung.siedlungslage` | 100 Saaten × Epochen — Planetengeschichte erklärt Zivilisation | **0 / 7** — Mechanik von Sprosse 1 halb: EIN Spiegel und EINE Boden-Höhe headless an 6/6 Orten (gelaende.K4, gelaende.K5), im Spiel nicht an 50 Punkten. Bild-Pre… | S1: Wasserspiegel + Boden-Höhe, 50 Punkte · *Bildpaar an 50 Punkten: Wasserspiegel um 1 m gehoben → Ufer, Schilf, Steg, Boot und Fuß folgen im Bild (100 % der Leser); Gegenlauf ohne Hebung: kein Leser bewegt sich* |
| **Land, Meer und Luft — EIN Klima**<br>`planet.kopplung.land-meer-luft` | jede Welt — Klimazonen passen zu Relief, Meer und Strömung | **0 / 6** — Stand 0: Regen ist ein Wetter-Stempel, das Meer kein Glied; ein Klima für die ganze Welt. | S1: 1 Gebirge · *Niederschlag Luv/Lee ≥ 2:1 an 30 Saaten; im Bild grün/braun an der Kammlinie getrennt* |
| **Die Bahn formt Klima und Leben**<br>`planet.kopplung.bahn-klima` | 1 000 Welten — Klimazonen passen zur Bahn | **0 / 6** — Mechanik von Sprosse 1 steht: Jahres-Welle jahrTage: 365 (gelaende-core.js:1304,1317), Laub, Schnee, Wasser lesen sie. Bild-Preis in der Szene des Ri… | S1: 1 Welt, 365 Tage · *Schneelinie wandert über das Jahr im Bild* |
| **Eine Front läuft durch die Welt**<br>`planet.kopplung.wetter-welt` | Zivilisation, 100 Orte — Bauform folgt dem Klima | **0 / 6** · Kern 2 — Mechanik von Sprosse 1 und 3 steht (wetter.K2 2/2), Wind-Leser halb (wetter.K5: 6 Leser im Code, Bild-Richter nie gefahren). Bild-Preis in der Szene… | S1: Licht und Himmel · *Bildpaar klar/Sturm an derselben Pose: Richtlicht gedimmt, Himmel grau* |
| **Die Megastadt macht ihr eigenes Wetter**<br>`planet.kopplung.stadtklima` | Städte aller Epochen — Kohlesmog, Neon-Regen | **0 / 6** — Stand 0: kein Stadtklima. | S1: ein Platz, eine Gasse · *Wind folgt der Gasse ±20°; Pfütze trocknet im Schatten später* |
| **Vulkan formt Küste formt Stadt formt Verkehr — die schnelle Kaskade**<br>`planet.kopplung.kaskade` | jede Welt — Ketten aus deren Gesetzen | **0 / 7** — Stand 0: kein Ereignis formt Gelände; die alte Kaskade (Ökologie) liegt im Leben-Kapitel. | S1: 1 Ereignis, 1 Folge · *20 Saaten: Folge tritt ein und ist im Bild sichtbar* |
| **Ereignis und Spur über die Äonen — Ausbruch, Trapp, Einschlag, Sterben**<br>`planet.kopplung.ereignis-spur` | jede Welt über 4,5 Ga — Sauerstoff-Katastrophe, Schneeball, Treibhaus als Ketten | **0 / 6** — Stand 0: keine Ereignisse jenseits des Wetters. | S1: 1 Ausbruch · *Grabung im Umkreis findet die Asche am erwarteten Alter in ≥ 95 %* |
| **Die Gegenwart als Ergebnis der Geschichte**<br>`planet.kopplung.gegenwart` | jede Welt — kein Gesetz der Landform neben der Geschichte | **0 / 6** — Unter der Leiter: Findlinge „Eiszeit-Erratiker“ ohne je ein Eis (stamm/vegetation-baum.js:3246) — der erste Zwilling der Tiefen Zeit; die Landform is… | S1: Relikte, 10³ an 10 Saaten · *1 000 Relikte: Ursache in der Geschichte des Orts = 100 %* |
| **Leben formt Gelände, Wasser und Fels**<br>`leben.kopplung.leben-formt-planet` | jeder Planet: Vulkan → Asche → Pionierflora → Wald → Torf → Kohle; das Leben hält und kippt das Klima — die Spur steht in Fels, Luft und Küste | **0 / 7** — Trampelpfad: 17 → 3 Büschel nach 100 Gängen (alte Stoffe K4) — Zahl belegt, Bildpaar im Fenster fehlt. | S1: ein Weg · *Gras-Dichte auf dem Weg −≥ 60 % gegen daneben im Bildpaar* |
| **Evolution liest den Planeten**<br>`leben.kopplung.evolution-planet` | geschlossener Kreis über Äonen auf jedem Planeten — jede Art erklärt sich aus Ort und Geschichte | **0 / 6** — Gattung wählt Boden-Klasse: 431/431, Gegenprobe 405/405 (alte Tiere K4) — headless, im Bild nie. | S1: Lebensraum aus dem Gelände · *≥ 0,9 der Würfe in der Boden-Klasse der Gattung, im Bild gezählt* |
| **Mensch, Stadt und Meer im Netz des Lebens**<br>`leben.kopplung.stadt-im-netz` | Stadt jenseits Tokio, > 10⁸ Bewohner — die Stadt ernährt sich aus dem Netz ihres Planeten und kippt Biome | **0 / 8** — Alte Vegetation K4 Staffel 1 an einem Gerät: 42 Häuser des Start-Dorfs, 47/51 Boxen im Bild, Halm 0 px, Boden 0 px; Staffel 2 (jedes Haus, jedes Wass… | S1: Siedlungsrand: die Natur-Wand · *Halm- und Büschel-Pixel 0 in jeder Haus-Box (Klassen-Maske)* |
| **Leib folgt dem Planeten**<br>`mensch.kopplung.leib` | fremde Planeten formen fremde Leiber — g, Licht, Atmosphäre | **0 / 6** — Tracht folgt nur der Epoche-Tafel; kein Wetter, kein Klima am Leib | S1: 1 Platz: Kleidung folgt dem Wetter · *Lagen-Anteil steigt im Bildpaar* |
| **Sport sitzt im Leben der Welt**<br>`mensch.kopplung.sport` | volle Kaskade bis zum Heldentum — Vulkan → Küste → Stadt → Arena → Liga | **0 / 6** — tagesPlan kennt keine Freizeit (koerper-core.js:5057–5086) | S1: Abend: Spiel auf dem Platz · *Anteil im Spiel 5–15 %* |
| **Leben und Welt formen sich**<br>`mensch.kopplung.leben` | viele Planeten — Lebensläufe fremder Arten formen ihre Welt | **0 / 6** — nur Gewalt → Furcht lokal; Bauten altern ohne Kopplung an Bewohner (stamm/siedlung-satz.js:858) | S1: 1 Siedlung: Wetter ändert den Tag · *Anteil draußen sinkt ≥ 0,3* |
| **Die Welt antwortet auf Eingriff**<br>`mensch.kopplung.antwort` | jede Tat über alle Perspektiven — Leib, Bau, Markt, Recht, Sprache antworten | **0 / 6** — Ring 8–9 neuer Häuser, Median 22 m um das Spielerhaus, beide Geräte (siedlung.K4) | S1: 1 Spielerhaus wird Keim · *Ring neuer Häuser um das Spielerhaus binnen 1 500 s; Gegenlauf: dieselbe Saat ohne Spielerhaus → kein Ring an diesem Ort* |
| **Kultur folgt der Welt**<br>`mensch.kopplung.kultur` | Planeten und Zeitalter — Kultur folgt fremder Physik | **0 / 7** — metaParams Klima × Epoche → Dach, Stoff, Hof (fachwerk-core.js:8103) liest nur das Studio (worlds/fachwerk/fachwerk.js:621); die Welt zieht die Regio… | S1: Baustoff aus Boden und Klima · *32 Saaten: passender Baustoff ≥ 85 %; Region aus Hausbild ≥ 70 %* |
| **Die Stadt trägt sich**<br>`mensch.kopplung.kreislauf` | Planeten — Bilanz schließt, Hunger hat Ursache | **0 / 6** — keine Ware mit Herkunft, niemand isst; Brunnen und Laternen ohne Fluss | S1: 10² Dorf · *20 Personen: Mahl bis Feld ≥ 90 %* |
| **Emergenz: ungeskriptete Ketten im Blick**<br>`erleben.kopplung.emergenz` | jede Stunde auf jedem von 10³ Planeten trägt eine nie erlebte Geschichte — zwei Saaten erzählen nie dasselbe | **0 / 7** — trophische Kaskade headless über 8 Saaten (Hirsche +0,448, Jungwuchs −0,279, §8.K1 2/2), Emotion → Wetter headless (§10.K2, K3) — im Bild nie gefahre… | S1: 1 Kette in 6 Spielstunden: Wölfe weg → mehr Hirsche → weniger Jungwuchs · *Bildpaar am selben Ort mit/ohne Wölfe nach 6 Spielstunden: Jungwuchs sichtbar dünner über ≥ 8 Saaten* |
| **Wahrnehmung treibt Verhalten und Landschaft**<br>`erleben.kopplung.wahrnehmung` | Planet: Sternlicht → Augen → Blütenfarben → Landschaftsbild — ganze Kette aus einem Samen | **0 / 6** — Wolf findet Beute über Witterung; Gegenlauf in der alten Karte (§8.K4) — headless. | S1: Geruch führt den Jäger zur Beute · *Gegenlauf Witterung aus → Jagderfolg fällt* |
| **Ein wahres Bild**<br>`erleben.kopplung.bild` | jenseits der Erde — Bilder fremder Welten | **0 / 6** — gleiche Helligkeit über alle Lichtwege gemessen (§13.K3 = 1). | S1: 2 Phänomene · *Gang 2 km auf einen Hang: Leuchtdichte des Zielfensters springt an keinem Stufenwechsel > 5 %* |
| **Die Kette ist hörbar**<br>`erleben.kopplung.klang` | fremde Planeten-Geschichten — was dort lebt und weht, klingt — im Vakuum nichts | **0 / 6** — nichts über die Leitern hinaus gekoppelt; Regen nur als Textur am Ort. | S1: Wetter → Stoff: Regen auf jedem Dach nach dessen Stoff · *Regenklang je Dachstoff unterscheidbar; Regenstärke im Bild ↔ Pegel r ≥ 0,9* |
| **Geteilter Sinn: Taten reisen zwischen Spielern**<br>`erleben.kopplung.geteilter-sinn` | Millionen Spieler, 10³ Planeten, eine Geschichte — Taten überdauern ihre Spieler | **0 / 7** — ungemessen; kein Netz-Spiel über zwei Geräte. | S1: 2 Spieler, dieselbe Saat · *Tat von A → Bildpaar am Ort bei B zeigt dieselbe Spur* |
| **Ein Ereignis, alle Sinne, alle Perspektiven**<br>`erleben.kopplung.ein-ereignis` | jedes Ereignis jeder Saat — Konsistenz als Gesetz, nicht als Inszenierung | **0 / 6** — Wind gesehen = gehört r 0,81 (§32.K2) ist ein Zwei-Kanal-Same, aber kein Ereignis; nie über Kanäle gemessen. | S1: Feuer: 2 Kanäle · *20 Feuer: Versatz Bild ↔ Abgriff ≤ 50 ms, Quellort am Abgriff ±10° zur Glut, 100 %* |
| **Die Epoche ist ganz**<br>`erleben.kopplung.epoche-ganz` | jedes Datum jedes Planeten — die Epoche ist eine Funktion der Saat, nie eine Kulisse | **0 / 6** — Uhr treibt Licht und Bewohnertag (§9.K2); Saison per Wort; keine Epochen-Sprünge. | S1: Tageszeit · *24 Zufallsuhren: 0 Widersprüche zwischen Sonnenstand, Klangbild (Chor, Grillen, Verkehr) und Bewohnertag* |
| **Das Kleine schreibt das Große — Tat, Stadt und Zivilisation formen Land, Wasser und Klima**<br>`same.kopplung.aufwaerts` | Fremd-Zivilisationen auf 100 Planeten — Terraforming, Atmosphären-Umbau, Selbstvernichtung oder Gleichgewicht | **0 / 8** — Unter der Leiter: die Siedlung liest Natur nur als Verbot und Kosten (fachwerk-core.js:8623, :3861); keine Tat verschiebt ihren Elternknoten; ein geb… | S1: eine Tat (gebautes Haus, Rodung 1 ha), wirkt bis 1 km · *Haus bauen, aufsteigen: Pixel aus 400 m an seiner Stelle; Bildpaar an 10 Orten im Umkreis* |
| **Die Kette der Stoff-Physik**<br>`same.kopplung.kaskade` | Ketten, die nie als Klasse geschrieben wurden, auf 100 Fremd-Planeten — Methan-Brand, Gletscherlauf unter Vulkan, Säureregen-Einsturz | **0 / 7** — Kette regen → nässe → stoff → brand → licht, Tiefe 4 mit Festhalte-Probe (feld.K1) — headless; Bruch, Fluid mit Impuls und Beben fehlen als Glieder. | S1: 2 Glieder, eine Zelle · *Bildpaar: Brand erlischt im Regen, hält im Trockenen, beide Geräte* |
| **Die gewachsene Kohärenz**<br>`same.kopplung.kohaerenz` | fremde Physik, 10³ Planeten-Typen — die Kette hält, wo die Erde keine Referenz hat | **0 / 7** — Stream-Power-Flüsse und EIN Wasser-Spiegel (gelaende-core.js, gelaende.K4); die Siedlung liest Wasser nur als Verbot und Kosten, nicht als Ursache de… | S1: 2 Glieder, ein Ort · *100 Saaten × 50 Punkte: Wasserläufe bergab in Senke oder Meer ≥ 95 %* |
| **Der Katalog der Gewalt**<br>`same.kopplung.gewalt` | Fremd-Planeten, 10⁹ a — Gefahren ohne Erd-Namen aus Wärmefluss, Masse, Atmosphäre | **0 / 6** — Unter der Leiter: Gefahr nur als Spieler-Tat (Brennglas, lava-Satz), kein Blitz (Grep leer); 100 Spieljahre ohne Zutun = 0 Ereignisse. | S1: 1 Klasse von selbst, 1 km², 100 a · *100 Spieljahre Zeitraffer: Brände je km² und Jahr im Faktor 3 der Real-Rate* |
| **Die Antwort auf die Störung**<br>`same.kopplung.stoerung` | Mutation an der WURZEL, 10⁶–10⁸ Jahre, Planet — Platte gekippt → andere Küste, Städte, Sprachen; Einschlag → Aussterben → Radiation | **0 / 7** — Brand schwärzt, Asche düngt, Sukzession r = 0,825 (stoffe.K5) — Mechanik headless; Tier-, Wasser-, Siedlungs-Antwort fehlt. | S1: 1 Domäne, Stunden · *Bildpaar Zelle vor / nach dem Brand, beide Geräte* |
| **Mitten im Ereignis**<br>`same.kopplung.ereignis` | Planet, 10⁹–10¹⁰ Menschen — Einschlag 10 km: Feuerball, globaler Brand, Impakt-Winter, aus jeder Perspektive | **0 / 7** — Lava-Zelle glüht und erstarrt als Spieler-Tat (gelaende-core.js:1787-1801); Frame-p95 im brennenden Hektar und Flucht der Bewohner nie gemessen. | S1: eine 16-m-Zelle, 0 Menschen · *Bild der Zelle in Glut und erstarrt, beide Geräte* |
| **Die Erde als Saat**<br>`same.kopplung.erdsaat` | Erdgeschichte 4,5·10⁹ Jahre — Schneeball-Erde, Massenaussterben, Deccan-Trapps bereisbar | **0 / 6** — Es gibt keine Erd-Saat. | S1: 1 Ort, 1 Ereignis-Typ · *Bildvergleich gegen Relief-Modell; der Vulkan bricht von selbst aus* |
| **Die Tat zu jeder Zeit**<br>`same.kopplung.zeitreise` | zwischen Welten: Tat auf Planet A sichtbar auf B (Licht, Signal, Kolonie) — nach der Laufzeit, die das Gesetz verlangt, nie davor | **0 / 7** — Lichtung bleibt über Reload, 138/138 Pflanzen nach 1 Spieljahr (feld.K4, stoffe.K5) — headless; rückwärts klemmt _werkAlter die Zeit auf 0: ein Werk… | S1: Lichtung aus 10 Fällungen, 1 Spielstunde · *Baum-Anteil ≤ 30 %, Stümpfe sichtbar, beide Geräte* |
| **Technik formt den Planeten**<br>`same.kopplung.terraform` | 100 Saaten: jede Zivilisation formt anders — die Art des Eingriffs folgt Technik, Welt und Wille | **0 / 6** — Stand 0: der Graben des Spielers füllt sich mit Wasser (gelaende.K2) — die einzige Umformung; keine Technik lenkt Klima oder Welt. | S1: EIN Eingriff, EINE Region: Wetter lenken über einer Stadt · *Bildpaar mit und ohne Eingriff an derselben Saat: Regenmenge im Zielgebiet höher, im Lee tiefer; Bilanz ±10 %* |

# Teil 2 — Die Leitern

## 1 · Der Planet

### Geologie — das Innere und die Kruste

*Referenz-Korpus (R6, R11):* Höhenmodelle (Copernicus DEM, SRTM), geologische Karten, Vulkan-Katalog (Smithsonian GVP), Beben-Kataloge (USGS, ISC), Krater-Datenbank, Feldfotos je Gestein und Form

#### Gestalt aus Platten — Kugel, Kontinente, Drift

`planet.geologie.platten` — **HEUTE 0 / 9**

*misst:* wie groß und wie wahr die Gestalt des Planeten aus EINEM Tektonik-Gesetz folgt, über Raum und über die Zeit

*Beleg:* Stand 0: ebene Welt, Großform aus drei glatten Rausch-Feldern (gelaende-core.js:361-391), Kontinentalität ohne Ursache; Grep 14.11. ohne Treffer für Tektonik.

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Region 10⁴ km² | Gebirge liegen in Gürteln, Gräben an Rissen — die Gestalt hat eine Ursache | P im Überflug | 30 Saaten: Gebirgsfläche > 2 km liegt in Gürteln mit Achsen ≥ 4:1 in ≥ 70 %; Blindpaar Schummerung gegen reale Region |
| 2 | Kontinent 10⁶ km² | bimodale Hypsometrie, Schelf, Tiefseegraben | P im Überflug | 100 Saaten: Höhenhistogramm mit zwei Gipfeln im Abstand 3–6 km in ≥ 90 % |
| 3 | Kugel von Mondgröße 4·10⁷ km², Orbit bis Boden ohne Ladebild | Horizont krümmt sich, Gürtel umspannen die Kugel | P im ganzen Abstieg | Horizont-Senkung im Bild = acos(R/(R+h)) ±0,1° bei 1, 10, 100 km; Blindpaar Orbitbild gegen Relief-Globus |
| 4 | erdgroß 5·10⁸ km² | Hypsometrie wie die Erde, Rücken und Inselbögen bilden EIN Netz, Hochgebirge an Konvergenz | P an 100 Zufallsorten | 100 erdähnliche Saaten: KS ≤ 0,1 gegen Erd-Hypsometrie und geschlossenes Rücken-Netz in ≥ 80 %; Gipfel > 2 km an Konvergenz ≥ 90 % |
| 5 | Drift über 10⁷ Jahre | Ozeane öffnen sich, Gebirge wachsen und vergehen | P, Zeitsprung ≤ 5 s | im Spiel gemessene Plattengeschwindigkeit 1–15 cm/a an 100 Saaten; Bilddifferenz benachbarter Zeiten ≤ Plattenrate |
| 6 | 10⁹ Jahre, Superkontinent-Zyklen | Superkontinente bilden sich und zerbrechen, Kontinente wachsen durch Akkretion | P im Zeitsprung an 20 Zufallsaltern | 100 Saaten: ≥ 1 Superkontinent (≥ 70 % des Landes zusammenhängend) je Ga in ≥ 80 % |
| 7 | die Erd-Saat | Rodinia, Pannotia, Pangäa und die Gegenwart erkennbar | P an jeder Stichzeit · Schlüssel im Byte-Preis | Erd-Saat mit Schlüssel (R4): an 10 Stichzeiten Kontinentlage gegen PALEOMAP, Flächen-Deckung IoU ≥ 0,6; Fach-Panel erkennt „dieselbe Erde“ in ≥ 8 von 10 |
| 8 | 4,5·10⁹ Jahre ab dem Magma-Ozean | Tektonik-Regime wechseln (Deckel → Platten), Hadaikum mit erster Kruste | P im Zeitsprung | 1 000 Saaten: Ursachen-Probe Wärmefluss und Alter aus dem Orbitbild, Rang ≥ 0,7; ≥ 50 % der Saatenpaare mit auffallend verschiedener Geschichte |
| 9 | 10⁶ Saaten von 0,01 bis 10 Erdmassen | Erd-, Deckel-, Venus-, Io- und Eiswelten folgen aus Masse, Wärme und Wasser | P je Saat, auch auf der größten | Ursachen-Probe an 1 000 Saaten Rang ≥ 0,7; 0 Saaten mit Naht oder Loch |

#### Vulkanismus — Magma, das fließt und Land macht

`planet.geologie.vulkan` — **HEUTE 0 / 7**

*misst:* ob Vulkane als Ereignis UND als Landform aus einem Magma-Gesetz entstehen und die Oberfläche bleibend formen

*Beleg:* Mechanik von Sprosse 1 steht: Lava als Tat-Decke mit Newton-Abkühlung (gelaende-core.js:1787-1831), Bild im Spiel ungemessen. Bild-Preis in der Szene des Richters an beiden Geräten nicht gemessen.

*alte Karte:* stoffe.K3

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Lava als Decke einer Zelle | Newton-Abkühlung, Glut über dem Draper-Punkt, erstarrt zu Stein, Dampf am Wasser; fließt nicht | P am Guss | Kruste bildet sich und die Glut verlischt im Bild nach der Abkühlkurve gemessener Laven ±30 %; Blindpaar Glutbild gegen Lava-Foto (2AFC ≤ 85 %) |
| 2 | ein Strom 1 km, ein Ausbruch | Strom fließt, bildet Front und Kruste | P neben dem Strom | Frontgeschwindigkeit auf 10°-Hang 0,01–10 km/h; Blindpaar Clip gegen Ausbruchsfilm |
| 3 | ein Vulkan 10 km wächst aus seinen Ausbrüchen | Schild, Strato, Caldera, Kegel ENTSTEHEN aus der Zähigkeit | P am Kegel | 30 Saaten verschiedener Zähigkeit: Flankenneigung folgt ihr (Schild 2–10°, Strato 25–35°) in ≥ 90 %; Profil gegen reales Gegenstück ≤ 15 % |
| 4 | Ausbruch formt bleibend: neues Land, Röhren | Pāhoehoe/ʻAʻā, begehbare Röhre, Küstenbank | P in der Röhre | nach dem Ausbruch wächst die Landfläche messbar; Röhre ≥ 500 m begehbar; Blindpaar Oberfläche |
| 5 | Vulkanprovinz 10⁵ km² | Hotspot-Kette mit Altersfolge, Bögen über Subduktion | P im Überflug | 30 Saaten: ≥ 90 % der Vulkane an Rändern oder Hotspots; Alter längs der Kette Rang ≥ 0,8 |
| 6 | planetar 10³ aktive Vulkane | Ausbruchsstärke folgt einem Potenzgesetz | P an 100 Zufallsorten | 500–3 000 aktive Vulkane je erdgroßer Saat; je VEI-Stufe etwa zehnmal seltener ±50 % |
| 7 | Äonen und fremde Welten | Magma-Ozean erstarrt, Flutbasalte, Io-Welten, Kryovulkane; Vulkanhöhe wächst mit sinkender Schwere | P je Saat und im Zeitsprung | Ursachen-Probe an 1 000 Saaten: Wärmefluss aus der Vulkanlandschaft Rang ≥ 0,7; höchster Vulkan gegen 1/Schwere Rang ≥ 0,7 |

#### Gebirge und Bruch — Orogenese, Verwerfung, Beben

`planet.geologie.gebirge` — **HEUTE 0 / 7**

*misst:* ob Gebirge aus Kollision wachsen und Beben aus Verwerfungen kommen, sichtbar und fühlbar

*Beleg:* Stand 0: keine Faltung, keine Verwerfung, kein Beben (Grep 14.11.); das Schicht-Gesetz T5 (gelaende-core.js:374-375) zählt bei planet.zeit.archiv.

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | jede Felswand trägt ihre Verformung | gefaltet, gekippt, versetzt nach der Geschichte des Orts | P an der Wand | Blindpaar Felswand gegen Foto; in Kollisionszonen ≥ 80 % der Wände verformt, im alten Kraton ≤ 20 % |
| 2 | ein Orogen 10⁵ km² | Kammhöhe, Breite, Isostasie | P im Überflug | Hypsometrie des Orogens gegen Alpen-/Himalaya-Profil ≤ 20 % |
| 3 | Beben einer Region über ein Spieljahr, fühlbar | Gutenberg-Richter, Herd an Verwerfungen | P im Beben, in der Stadt | b-Wert 0,8–1,2; ≥ 90 % der Epizentren an Verwerfungen; Boden und Häuser bewegen sich mit der Magnitude |
| 4 | Bruch formt bleibend | Versatz wächst mit der Magnitude, Hangrutsch | P im Ereignis | nach M7: Geländestufe 1–5 m, Rutschungen an steilen Hängen; Blindpaar gegen Feldfoto |
| 5 | planetar 10⁴ Beben M ≥ 4 je Jahr | Bebengürtel = Plattenränder | P an 100 Zufallsorten | Epizentren eines Spieljahrs ≥ 85 % an Plattenrändern |
| 6 | Gebirge wachsen und vergehen über 10⁸ Jahre | junge Hochgebirge, alte Rumpfgebirge | P im Zeitsprung | 50 Saaten: Alter erklärt Höhe, Rang ≥ 0,7 |
| 7 | jede Saat, 10³ Welten | Gipfelhöhe folgt der Schwere | P je Saat | 1 000 Saaten: höchster Gipfel gegen 1/Schwere Rang ≥ 0,7 |

#### Die Unterwelt — Höhle, Karst, Röhre

`planet.geologie.unterwelt` — **HEUTE 0 / 6**

*misst:* ob unter dem Boden eine begehbare, geologisch erklärte Welt liegt

*Beleg:* Mechanik von Sprosse 1 steht im Kern: Rauschfelder Wurm/Kaverne/Halle (gelaende-core.js:6843-6865), Mündungs-Gesetz (gelaende-core.js:2800-2806, 5 · 1 · 14 Mündungen/km² an 3 Saaten); im Spiel nie blind gefahren. Bild-Preis in der Szene des Richters an beiden Geräten nicht gemessen.

*alte Karte:* leib.K3

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Höhlen-Feld bis ~28 m unter Basis, Mündung im Fels | Wurm, Kaverne, Halle; Mund nur an der Felsflanke | P beim Betreten und in der Höhle | Mündungen je km² an 3 Saaten im Band; Mund im Bild an ≥ 90 % im Fels |
| 2 | Karsthöhle 1 km | nur in löslichem Gestein; Tropfstein, Quelle am Ausgang, Doline über dem Hohlraum | P in der Höhle | ≥ 90 % der Höhlen in Karbonat; ≥ 80 % entwässern zu einer Quelle; Dolinen- gegen Höhlendichte r ≥ 0,7; Blindpaar Karstfeld |
| 3 | System 10 km | unterirdischer Fluss, Siphon, Einsturzdoline | P ohne Ladebild | 10 km am Stück begehbar; Höhlenplan-Statistik (Verzweigung, Querschnitt) im Band realer Systeme |
| 4 | jede Gesteinsart ihre Unterwelt, 10³ Höhlen | Lavaröhre im Basalt, Gletscherhöhle, Brandungshöhle, Gips-Labyrinth | P je Typ | 1 000 Zufallshöhlen aus 30 Saaten: Typ passt zu Gestein und Lösungsmittel in ≥ 90 % |
| 5 | Systeme 10² km, Hallen 10⁷ m³ | Mammoth- und Son-Doong-Klasse, Halle mit Wald und Wolke | P in der Halle | längstes System ≥ 100 km in ≥ 20 % der Karstsaaten; Blindpaar Halle |
| 6 | jede Welt | Lavaröhren weiter bei kleiner Schwere, Eishöhlen, Methan-Karst | P je Saat | 1 000 Saaten: Röhrenweite gegen 1/Schwere Rang ≥ 0,7; Höhlentyp folgt Gestein in ≥ 80 % |

#### Gestein und Lagerstätte — die Kraft, Funde vorherzusagen

`planet.geologie.lagerstaette` — **HEUTE 0 / 6**

*misst:* ob jede Stelle ein Gestein mit Herkunft trägt und Rohstoffe dort liegen, wo die Geschichte sie hinlegt

*Beleg:* Stand 0: die Fels-Genese-Achse liegt im Kern (foundry-core.js:5204 rockPhenotype), wählt aber nur die Sorte eines Brockens; kein Leser bindet sie an Ort oder Alter; keine Lagerstätte, kein Mineral.

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Gestein je Ort aus seiner Genese | magmatisch, sedimentär, metamorph sichtbar verschieden und passend zum Ort | P an der Wand | Jury trennt drei Genesen ≥ 80 %; Genese passt zur Geschichte des Orts ≥ 85 % |
| 2 | geologische Karte einer Region 10⁴ km² | Gestein folgt Tektonik und Alter | P im Überflug | Blindpaar geologische Karte gegen reale |
| 3 | Lagerstätten eines Kontinents | Kohle, Salz, Kupfer, Seifengold, Öl, Bändereisen entstehen aus Becken- und Erzgeschichte | P beim Suchen | Prospektor-Probe an 30 Saaten: Fundquote nach Zeichen ≥ 5× blindes Bohren |
| 4 | Abbau verändert die Welt bleibend | Grube, Halde, Senkung, Salzstock | P am Abbau | Abbau sichtbar und nach Reload bleibend; Senkung über Kohle messbar |
| 5 | Minerale als Stoff aus Gesetz, 10³ Fundstufen | Kristallsystem × Chemie ergibt Habitus, Farbe, Glanz, Härte | P an der Stufe | 100 Zufallsfunde: Jury nennt das Kristallsystem blind ≥ 80 %; Blindpaar Stufe gegen Mineralfoto |
| 6 | fremde Chemie jeder Saat, 10³ Welten | andere Elementverteilung, andere Lagerstätten | P je Saat | Prospektor-Probe an 1 000 Saaten ≥ 3× blindes Bohren |

#### Das Innere spricht — Feld, Wärme, Schalen

`planet.geologie.inneres` — **HEUTE 0 / 6**

*misst:* ob das unsichtbare Innere an der Oberfläche spürbar und im Schnitt sichtbar wird

*Beleg:* Stand 0: kein Magnetfeld, kein Wärmefluss, kein Schnitt (Grep 14.11.).

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Kompass auf einem Dipol-Planeten, 20 Orte | Deklination und Inklination nach Ort | P (keine Zusatzkosten) | Inklination ≤ 5° gegen Dipol an 20 Orten; Deklination ändert sich mit dem Ort |
| 2 | Umpolung über 10⁶ Jahre | Feldgeschichte im Gestein des Ozeanbodens | P im Messflug | Magnetometer-Flug über den Rücken: Streifen spiegelsymmetrisch in ≥ 90 % der Saaten |
| 3 | Wärme an der Oberfläche, 10² Quellen | Geysire, heiße Quellen, Schwarze Raucher nur über Wärme-Anomalien | P am Geysir | ≥ 95 % der Geysire über Anomalien; Intervalle Minuten bis Stunden |
| 4 | Bohrung und Stollen 10 km | Temperatur 25–30 K/km, Gestein nach Tiefe | P im Stollen, ohne Naht | Bohrloch-Temperatur folgt dem Gradienten ±20 %; Stollen 10 km ohne Naht |
| 5 | der Planet im Schnitt bis zum Kern | Schalen in Dichte-Reihenfolge | P im Abstieg durch den Schnitt | Erd-Saat: Kern-Mantel-Grenze bei 0,5–0,6 Radius; Flug durch den Schnitt ohne Bild > 100 ms |
| 6 | fremde Innere, 10³ Welten | feldlose Welten, Mehrpol-Felder, Monde ohne Kern | P je Saat | Ursachen-Probe an 1 000 Saaten: Feldstärke aus Kern und Rotation; erstarrter Kern → kein Feld in ≥ 95 % |

#### Einschlag und Krater — die Haut als Uhr

`planet.geologie.einschlag` — **HEUTE 0 / 7**

*misst:* ob Einschläge Landschaft machen und ihre Dichte das Alter einer Oberfläche erzählt

*Beleg:* Stand 0: „Krater“ im Code sind Grab-Edits des Spielers.

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | ein Krater als Form | Napf ↔ komplexer Krater mit Zentralberg, Übergang nach der Schwere | P am Kraterrand | einfache Krater Tiefe/Durchmesser 1:5 ±20 %; Profil gegen reale Krater ≤ 15 % |
| 2 | ein Einschlag als Ereignis | Feuerball, Druckwelle, Auswurf, Strahlen | P im Ereignis | Krater-Durchmesser gegen Energie nach Pi-Skalierung ±30 %; Blindpaar gegen Kraterfoto |
| 3 | Kraterfeld einer Region 10⁴ km² | Größen-Häufigkeit nach Potenzgesetz | P im Überflug | N(> D) ∝ D^−2 ±0,5 |
| 4 | Einschlagsrate über 10³ Spieljahre | Rate je Größe aus den Kleinkörpern der Saat | P im Zeitraffer | Rate je Größe gegen die Einschlags-Statistik der Erde ±Faktor 2 |
| 5 | planetar | Hochland gesättigt, junge Ebenen leer, Wetter und Tektonik löschen Krater | P je Saat | 1 000 Saaten: erhaltene Krater je Fläche fallen mit Erosion und Tektonik, Rang ≥ 0,7 |
| 6 | Kraterchronologie 10⁹ Jahre | Kraterdichte jeder Fläche = ihr Alter | P vom Boden einer Mondoberfläche | Kraterdichte im Bild gegen das wahre Alter der Fläche ±Faktor 2, Rang ≥ 0,8 |
| 7 | jede Welt | Atmosphäre und Kleinkörper-Dichte setzen das Kraterbild | P je Saat | 1 000 Welten: Kraterdichte gegen Kleinkörper-Dichte und Atmosphäre Rang ≥ 0,8 |

### Relief — Abtrag, Form und Boden

*Referenz-Korpus (R6, R11):* Höhenmodelle, Flussnetze (HydroSHEDS), Bodenkarten und Referenzprofile (SoilGrids, WRB), Feldfotos je Formklasse

#### Relief aus Abtrag — die Großform gegen die Erde

`planet.relief.grossform` — **HEUTE 0 / 7**

*misst:* ob das Relief über wachsende Fläche die Kennzahlen echter Landschaften trägt, an N Zufallssaaten, im Spiel gefahren

*Beleg:* Mechanik von Sprosse 1 steht HEADLESS: 293/293 Läufe enden in See oder Meer (MEISTERKARTE.md:240, d3708675), im Spiel nie nachgefahren. Bild-Preis in der Szene des Richters an beiden Geräten nicht gemessen.

*alte Karte:* gelaende.K4

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Saat, Flussnetz bis zum Horizont | jeder Lauf endet in See oder Meer | P | im Spiel an 20 Orten nachgefahren: 100 % der Läufe enden in See oder Meer |
| 2 | 10² km², 20 Saaten | Hack-Gesetz L ∝ A^0,5–0,6, Bifurkation 3–5 | P, Fernsicht 10 km | ≥ 80 % der Saaten tragen beide Kennzahlen im sichtbaren Netz |
| 3 | 10⁴ km², 50 Saaten | Hangverteilung und Hypsometrie-Integral wie ein Erd-DEM gleichen Klimas | P, Fernsicht 30 km | Wasserstein-Abstand der Hangverteilung ≤ 3° in ≥ 80 % |
| 4 | 10⁵ km² Küsten und Seen | Küsten-Fraktalität, Seen nach Potenzgesetz | P von Korn- bis Satellitenpose, Kosten nie an Küstenlänge | Box-Counting D ±0,05 gegen Erd-Küsten; Seen je Größenklasse Steigung ±20 % |
| 5 | Kontinent 10⁶–10⁷ km² | Relief = Gleichgewicht Hebung × Abtrag; Abflussregime mit Binnenbecken | P im Flug 2 km hoch, 300 m/s | Blindpaar Luftbild gegen Satellit: Fehlerquote ≥ 35 %; 10 Saaten: endorheische Fläche 10–25 %, größter Strom ≥ 10 % des Abflusses |
| 6 | Planet 5·10⁸ km², 100 Saaten | Anteile der 10 Geomorphon-Klassen wie die Erde | P vom Orbit bis zum Boden an jedem Ort | Geomorphon-Histogramm ±20 % der Erde; Orbit-Blindpaar Fehlerquote ≥ 35 % |
| 7 | 100 Welten beliebiger Konstanten | fremde Agenzien erzeugen stimmige Großformen | P je Planet, Wechsel ≤ 5 s | ≥ 80 % der Welten tragen Kennzahlen in den aus ihren Konstanten vorhergesagten Bändern |

#### Formschatz — Land- und Küstenformen aus Prozessen

`planet.relief.formschatz` — **HEUTE 0 / 8**

*misst:* ob der Same Formen ungerufen hervorbringt, wo die Prozesse am Ort sie verlangen, und dem Klima folgt — nie die Zahl gebauter Typen

*Beleg:* Stand 0: Profil-Gesetze V/Trog und Schichtstufe stehen im Kern (gelaende-core.js:374-375, 387-388), Mäander kinematisch (gelaende-core.js:765-784); kein Delta, Strand, Fjord, keine Düne; nie blind klassifiziert.

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 3 Klassen | V-Tal/Trog, Aue, Schichtstufe aus dem Profil-Gesetz | P | Blind-Klassifikation von Ego-Bildern an 20 Saaten ≥ 80 % |
| 2 | 10 Klassen, Wasser voll; Region 2 km | Mäander mit Prall/Gleithang, Schwemmfächer, Talsee, Wasserfall, Terrasse; das Ufer liest als Ufer | P | Blind-Klassifikation ≥ 80 % je Klasse; plausible Ufer-Bilder an 50 Zufallsorten ≥ 70 % |
| 3 | 30 Klassen, 4 Agenzien, 10 km Küste und Binnenland | Delta, Lagune, Strand, Kliff, Kar, Moräne, Barchan, Badlands — wo Wellenenergie, Tidenhub, Sediment, Gefälle sie verlangen | P | 200 Orte aus 20 Saaten: Bild-Klasse = Klasse, die die Prozessgrößen vorhersagen, ≥ 70 % |
| 4 | ~100 Klassen, 7 Agenzien, 10⁵ km² | Vielfalt emergent: Fjord nur nach Eis, Atoll nur über sinkender Insel, Mangrove nur in den Tropen | P | gegen eine EXTERNE Taxonomie: in 100 Saaten tauchen ≥ 80 % der Klassen ungefragt auf; Fehlplatzierung < 5 % in 1 000 Fundorten |
| 5 | Klima-Antwort an 50 Saaten | dieselbe Saat bei arid, humid, glazial trägt den Formschatz ihres Klimas | P | Klima-Tausch: Klassenverteilung gegen Erd-Referenz gleichen Klimas Rang ≥ 0,8; Foto-Blindpaar Fehler ≥ 35 % |
| 6 | jede Klasse über 4 Größenordnungen | vom 1-m-Rippel bis zur 100-km-Draa, vom Rinnsal-Delta bis zum Ganges-Delta | P | Längen-Breiten-Gesetz je Klasse über 4 Größenordnungen im Bild gehalten |
| 7 | Planet: ~10⁸ Seen, ~10⁶ Flüsse, ~10⁶ km Küste, jede begehbar | jede Form aus Platte, Klima, Gezeit und Meeresspiegel erklärbar | P überall | 1 000 zufällige Gewässer- und Landform-Posen aus 100 Saaten: ≥ 80 % im Blindtest gegen Fotos als echt bewertet |
| 8 | 100 fremde Welten | Formen, die die Erde nicht kennt, die Physik aber verlangt (Sublimationsmulden, Methan-Flussnetze, Niedrig-g-Rutschungen) | P je Planet | Konstanten-Tausch ändert die Formen vorhergesagt; Kanalbreite skaliert mit Schwere und Viskosität ±25 % |

#### Boden — Gestein wird Boden mit Horizonten

`planet.relief.boden` — **HEUTE 0 / 6**

*misst:* ob unter jedem Ort ein gereifter Boden liegt, dessen Typ aus Gestein × Klima × Hang × Leben × Zeit folgt

*Beleg:* Stand 0: keine Horizonte, keine Bodenarten; Erdbodenfarbe aus Rausch-Flecken (stamm/gelaende-boden.js:2459-2556).

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Fels und Erdboden eines Orts | Schutt, Flechte, Moos nach Steile und Feuchte; Erdboden in der Farbe seines Klimas | P | Blindpaar Ego-Bild gegen Foto gleichen Hangs und Klimas (2AFC ≤ 85 %); an 30 Zufallsposen liegt Schutt am Steilen und Moos im Feuchten wie im Foto-Korpus (Anteile ±20 %) |
| 2 | 1 Bodenart-Feld, Planet | Korngröße aus Herkunft (Hang, Aue, Wind) | P | Korngröße im Bild nimmt stromab ab: Rang ≥ 0,7 an 20 Läufen |
| 3 | Horizonte überall | O/A/B/C im Anschnitt, Mächtigkeit aus Bodenproduktion − Abtrag | P, Anschnitt ≤ 2 s nach dem Graben | Graben an 50 Zufallsorten: Horizonte sichtbar; Kuppe dünner als Unterhang in ≥ 90 % |
| 4 | 10 Referenz-Bodengruppen | Podsol, Schwarzerde, Gley, Moor, Rendzina … nach Klima × Gestein | P | Graben an 100 Zufallsorten: Bodentyp aus dem Anschnitt-Bild blind klassiert gegen die WRB-Referenzprofile; Anteile je Klima gegen SoilGrids ±25 % |
| 5 | 32 Referenz-Bodengruppen | Munsell-Farbe und Gefüge im Anschnitt | P | Bildpaar Anschnitt gegen Referenzprofil-Foto: ΔE ≤ 10, Blind-Fehler ≥ 35 % |
| 6 | Planet × Epoche × fremde Welt | begrabene Paläoböden, Löss der Kaltzeit, Regolith, Perchlorat-Böden | P, Zeitsprung ≤ 5 s | Anschnitt zeigt begrabene Böden in richtiger Folge an ≥ 90 % der Stichproben; Regolith-Blindpaar gegen Mond-/Mars-Fotos Fehler ≥ 35 % |

#### Lebendige Form — das Relief ändert sich in Spielzeit und über Epochen

`planet.relief.wandel` — **HEUTE 0 / 7**

*misst:* ob Abtrag und Ablagerung als Ereignis sichtbar werden und die Oberfläche messbar umformen

*Beleg:* Stand 0: ein Spieler-Graben füllt sich mit Wasser (MEISTERKARTE.md:238), das Wasser gräbt aber nicht.

*alte Karte:* gelaende.K2

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Graben | Wasser im Spieler-Graben vertieft ihn, Sediment setzt sich am Fuß ab | P während des Ereignisses | Volumen-Bilanz Abtrag = Ablagerung ±10 %, sichtbar in ≤ 10 min Spielzeit |
| 2 | 1 ha, 1 Starkregen | Rinnen, Schwemmkegel, Hangrutsch an Übersteilung | P während des Regens | Zahl neuer Rinnen wächst mit der Regenmenge, Rang ≥ 0,8 an 10 Läufen; Bildpaar vorher/nachher |
| 3 | 10 km Fluss, 10² Jahre | Mäander wandert, schnürt Altarm ab, Hochwasser legt Auenlehm ab | P im Zeitraffer | Migrationsrate 1–5 % Breite/Jahr; Abschnürung tritt ein; Bildfolge gegen Landsat-Zeitreihe |
| 4 | 10² km², 10³ Jahre | Delta wächst, Düne wandert, Küste verlagert sich | P im Zeitraffer | Delta-Wachstum gegen Sedimentfracht ±30 %; Barchan 10–30 m/a |
| 5 | 10⁴ km², 10⁵ Jahre | Eiszeit-Zyklus schleift Trog, Fjord, Kar, hinterlässt Moräne, Findling, See, Löss | P, Zeitsprung ≤ 5 s | nach dem Zyklus ≥ 8 glaziale Formklassen, ≥ 90 % oberhalb der Kaltzeit-Schneegrenze; ≥ 80 % der Fjorde unter ehemaligem Eis, 0 in nie vereisten Breiten |
| 6 | Planet, 10⁹ Jahre | Gebirge entsteht und wird abgetragen, Rumpfflächen | P, Zeitsprung an jeden Ort und jede Epoche ≤ 5 s | 100 Orte × 10 Epochen: Relief-Kennzahlen in den Bändern von planet.relief.grossform |
| 7 | 100 Welten × 10 Epochen | jede Welt trägt ihre eigene Abtragsgeschichte | P | 100 Welten × 10 Epochen: Fremdwelt-Probe (R10) an der Abtragsgeschichte — Agens und Alter aus dem Bild gelesen Rang ≥ 0,7 |

### Wasser — Ozean, Kreislauf und Eis

*Referenz-Korpus (R6, R11):* Pegel- und Gezeitenreihen, Ozean-Reanalysen, Seegangs-Spektren, Gletscher-Inventar, Unterwasser-Fotos, Secchi-Tiefen

#### Seegang — die See, wie ein Seemann sie liest

`planet.wasser.seegang` — **HEUTE 0 / 8**

*misst:* ob die Wasseroberfläche vom Teich bis zum Orkan und vom Horizont bis zur Brandung aussieht und sich verhält wie die Wirklichkeit

*Beleg:* Mechanik halb: spiegelTreue 0,73 an EINER von 12 Posen (GTX); Weißkappe aus Monahan im Gesetz auf 3 % (foundry-core.js:160-161), Bild ungemessen. Bild-Preis in der Szene des Richters an beiden Geräten nicht gemessen.

*alte Karte:* gelaende.K3 · material.K4 · ankunft.K4

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | eine Wasserfläche, 12 Posen | spiegelt Ufer und Himmel | P an beiden Geräten | spiegelTreue ≥ 0,6 an 12 Posen (Uhr × Wetter) in Ausgabe-Größe |
| 2 | Meer, See, Fluss je eigene Bewegung | Weißkappen-Anteil wächst mit dem Wind | P, beide Geräte | Weißkappen-Anteil im Bild bei 5/10/20 m/s gegen Monahan ±30 % |
| 3 | offene See bis 2 km Sicht | Seegang aus Wind × Fetch, Beaufort 0–12 | P im Sturm | Blindtest 10 Bilder je Beaufort-Stufe, ≥ 70 % richtig zugeordnet |
| 4 | jede Küste einer 10-km-Region | Brandung aus der Tiefe, Brechertyp nach Strandneigung | P am Strand bei Brandung | Brechlinie bei Tiefe 1,3·H ±20 %; Brechertyp gegen Iribarren-Zahl ≥ 80 % an 20 Stränden |
| 5 | Ozean bis 50 km Sicht | Dünung eines fernen Sturms läuft ein, Wellen kreuzen sich, Kelvin-Keil | P mit Sicht 50 km | Sturm 500 km weg gesetzt: Ankunft der Dünung ±15 % der Gruppenlaufzeit; Kelvin-Winkel 19,5° ±2° |
| 6 | Orkan, Kaventsmann, Tsunami | Wellen ≥ 25 m mit realer Häufigkeit; Tsunami läuft mit √(g·h) | P im Orkan und beim Auflaufen | H > 2·Hs in 1 h gegen Rayleigh ±50 %; Tsunami-Laufzeit über 1 000 km ±10 % |
| 7 | ganzer Planet, jede Küste, jede Stunde | jede Welle ist die Fortsetzung desselben Ozean-Felds | P an jeder Pose, Flug Schiff → Strand ohne Bildriss | 100 Küstenposen aus 10 Saaten × 12 Uhr/Wetter: ≥ 80 % im Blindtest nicht sicher von Fotos unterschieden; dieselbe Wellengruppe vom Schiff und vom Strand, Kreuzkorrelation ≥ 0,7 |
| 8 | fremde Meere | Methan-See, Wasserwelt, Lava-Meer gehorchen ihrer Schwere, Dichte, Zähigkeit | P | Wellenlänge-Periode-Paar gegen die Dispersionsrelation mit deren g und ρ ±10 % |

#### Gezeiten und Sturmflut — der Spiegel in der Stunde

`planet.wasser.gezeiten` — **HEUTE 0 / 7**

*misst:* ob der Meeresspiegel eine Funktion der Himmelsmechanik ist, von der Stunde bis zum nahen Mond der Frühzeit

*Beleg:* Stand 0: Meeresspiegel ist eine Konstante, Basis − 3 m (gelaende-core.js:2687); 0 Treffer für Gezeit/Tide/Ebbe.

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Küste, 24 h | halbtägliche Mondgezeit 12 h 25 min | P über 24 h Spielzeit | Watt fällt sichtbar trocken: benetzte Fläche Ebbe gegen Flut im Bild, Periode ±2 % |
| 2 | 30 Tage | Spring- und Nipptide aus Mond und Sonne | P | Pegel über 30 Tage: Spring-Nipp-Takt 14,8 d ±2 % |
| 3 | jede Küste einer Region 10³ km | Tidenhub aus Schelfbreite und Buchtform, amphidromische Punkte | P | 20 Küsten aus 5 Saaten: Hub gegen Resonanz-Vorhersage ±30 %; ≥ 1 Bucht > 8 m je 10⁴ km² Küste |
| 4 | Sturmflut | Windstau + Luftdruck + Gezeit addieren sich, Wasser dringt in Ebenen | P während der Flut | Windstau gegen ∝ U²·Fetch/h ±30 %; überflutete Fläche deckt die Tiefenkarte ≥ 90 % |
| 5 | 10² Saaten mit anderem Mond | Hub aus Mondmasse und Abstand | P | Hub ∝ M/r³ zwischen Saaten ±10 % über 5 Konfigurationen |
| 6 | Äonen: der nahe Mond | früher Mond näher, Hub größer | P im Zeitsprung | Erd-Saat bei −3 Ga: Tidenhub an der Spiel-Küste wächst mit dem Mondabstand wie M/r³ ±20 % |
| 7 | fremde Monde | Doppelmonde, Gezeitenheizung von Eismonden | P | Bild der Gezeit eines Doppelmond-Planeten; Wärmefluss eines Eismonds gegen Exzentrizität Rang ≥ 0,7 |

#### Strömung — das Wasser, das Dinge und Wärme trägt

`planet.wasser.stroemung` — **HEUTE 0 / 7**

*misst:* ob Wasser fließt, wohin die Physik es treibt: Fluss, Küstenstrom, Ozeanwirbel, Umwälzung

*Beleg:* Mechanik von Sprosse 1 steht HEADLESS: 4/4 Fluss-Orte (Strömung WG.wellen.adv, stamm/bild-sicht.js:1224-1228); Ozean ohne Strömung. Bild-Preis in der Szene des Richters an beiden Geräten nicht gemessen.

*alte Karte:* gelaende.K4

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Flüsse einer Region | Strömung längs Gefälle trägt Schwimmer, Boot, Tier | P | Treibgut-Probe an 4 Fluss-Orten > 0,5 m in 90 Takten, im Spiel mit Bild |
| 2 | sichtbares Fließen | Strähnen, Wirbel hinter Steinen, Kehrwasser | P, beide Geräte | optischer Fluss zweier Bilder 0,5 s auseinander: längs/quer ≥ 1,5, Richtung ±20° an 12 Posen |
| 3 | Küste und Mündung, 10 km | Brandungsrückstrom, Küstenlängsstrom, Gezeitenstrom, Salzkeil | P | Rip-Ströme ≥ 1 je 500 m brandender Küste; Treibrichtung gegen Welleneinfall ±20° |
| 4 | Ozeanbecken 10³ km | Wirbel mit verstärkter Westrand-Strömung | P | 100 Treibkörper, 1 Spieljahr: ≥ 70 % folgen dem Wirbel; Westrand ≥ 3× schneller als Ostrand |
| 5 | über Becken hinweg, 10⁴ km | Treibgut und Eisberge kreuzen Ozeane | P | 3 Spieljahre: ≥ 70 % des Treibguts landet an den Küsten, die die Strömung vorhersagt |
| 6 | Strömung in der Zeit | Umwälzung kippt bei Süßwasser-Puls | P, Zeitsprung ≤ 5 s | Süßwasser über Schwelle → Umwälzung −50 %, Küstentemperatur fällt im Bild |
| 7 | fremde Ozeane | andere Rotation, andere Kontinente, Ozean unter Eis | P | Wirbelzahl je Halbkugel folgt der Rotationsrate ±1 über 5 Welten |

#### Eis — vom Schnee zum Eisschild

`planet.wasser.eis` — **HEUTE 0 / 7**

*misst:* wie viel Eis die Welt trägt, wie es entsteht, fließt, kalbt und den Spiegel bewegt

*Beleg:* Mechanik halb: See-Eis nach Stefan (gelaende-core.js:1341-1422) trägt headless 1 151 Schritte; Schneedecke mit Tiefe 1/2 (wetter.K4); kein Gletscher, kein Meereis. Bild-Preis in der Szene des Richters an beiden Geräten nicht gemessen.

*alte Karte:* wetter.K4 · stoffe.K3

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Schnee einer Region | Decke kommt und geht mit Saison und Höhe, trägt und gibt nach | P im Schneefall | Schneegrenze gegen Nullgrad-Höhe ±150 m an 10 Posen × 4 Jahreszeiten; Fuß sinkt ≥ 5 cm |
| 2 | Seen frieren zu | Eis wächst mit Frost, Salz senkt den Gefrierpunkt, trägt erst ab tragender Dicke | P | Spieler geht bei Frost auf dem See, bricht bei Tauwetter ein; Einsetzen gegen Frostgrad-Summe ±20 % |
| 3 | Meereis 10⁶ km² | Packeis, Schollen, Rinnen; Fläche folgt der Saison | P | Verhältnis Winter/Sommer gegen Arktis ±30 %; Blindpaar Scholle |
| 4 | Gletscher | fließt, schneller wo dick und steil; Spalten, Gletschertor | P, Zeitsprung ≤ 5 s | Fließgeschwindigkeit 10–200 m/a; Spalten quer zur Zugspannung ±20° |
| 5 | Eiskappe und Schelfeis | Eisberg kalbt, treibt, schmilzt | P beim Kalben | Kalbungs-Ereignis im Bild; Eisberg treibt ≥ 100 km in 1 Spieljahr |
| 6 | Eisschild 10⁶–10⁷ km², 3 km dick | Eis bindet Meer, Kruste sinkt ein und federt nach | P, Zeitsprung ≤ 5 s | ΔV_Eis / A_Ozean = Δh ±5 % |
| 7 | Schneeball-Planet und Eismonde | ganzer Planet friert (Albedo-Kippe), Ozean unter 20 km Eis | P | Albedo-Kippe unter Strahlungs-Schwelle in 10 Saaten reproduzierbar; Blindpaar Eismond gegen Sondenfoto |

#### Der Kreislauf — EINE Bilanz vom Meer bis zum Aquifer

`planet.wasser.kreislauf` — **HEUTE 0 / 6** · Kern 1

*misst:* ob Verdunstung, Regen, Abfluss, Aquifer und Meer EINE Bilanz sind

*Beleg:* Mechanik von Sprosse 1 steht: Bilanz 1,006 headless, Pegel-Bild an beiden Geräten (wetter.K3 2/2); Regen kommt als Wetter-Stempel, nicht aus Verdunstung. Bild-Preis in der Szene des Richters an beiden Geräten nicht gemessen. — KARTE: Kern 1 — Pegel nach Sturm im Bild an beiden Geräten (wetter.K3), Bilanz als Zahl headless; Bild-Preis nicht gemessen.

*alte Karte:* wetter.K3

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 ◐ | Region 2 km | Sturm hebt den Fluss mit Verzug, Dürre senkt ihn; Bilanz geht auf | P, beide Geräte | Pegel nach Sturm im Bild; Scheitel-Verzug gegen Einzugsgebiet im Erd-Band; Regen × Fläche ↔ ΔVolumen ±10 % |
| 2 | Aquifer als Volumen | Quellen, Brunnen, Feuchtgebiet, wo der Spiegel das Gelände schneidet; Brunnen senkt den Spiegel | P an der Bohrung | Grube unter dem Spiegel füllt sich bis zu ihm ±0,1 m; Quellen ≥ 90 % an Spiegel-Austritten; Entnahme: Absenkungstrichter, Quelle flussab versiegt |
| 3 | Monate | Bodenfeuchte als Gedächtnis | P | nach 60 Tagen ohne Regen: Wiese braun gegen Dürrefoto, Fluss ≥ 50 % Querschnitt verloren |
| 4 | Kontinent | Regen kommt aus Verdunstung über dem Meer | P | markiertes Meerwasser erscheint als Regen im Binnenland; Niederschlag fällt mit dem Meeresabstand, Rang ≥ 0,7 |
| 5 | Planet | Verdunstung = Niederschlag, Verweilzeiten je Speicher | P | markierte Wassermenge folgt der Verweilzeit (Atmosphäre ~9 d, Ozean ~10³ a) ±30 % |
| 6 | fremde Kreisläufe | Methan-Kreislauf, Wüstenplanet mit Polkappen, Treibhaus-Ozeanverlust | P | je Welt Bilanz geschlossen ±1 %; Phasen folgen deren Druck und Temperatur |

#### Unter dem Spiegel — der Raum, der 70 % des Planeten ist

`planet.wasser.tiefsee` — **HEUTE 0 / 6**

*misst:* ob der Spieler abtauchen kann und einen wahren Raum findet bis zur Sohle des tiefsten Grabens. Der RAUM unter dem Spiegel und sein Boden; Licht, Wasserfarbe und Leiber im Bild zählt leben.wasser.bild.

*Beleg:* Stand 0: Absorption und Sicht je Wasser-Art als Gesetz (foundry-core.js:163-172), im Bild ungemessen.

*alte Karte:* leib.K3

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | See, Fluss 0–10 m | Licht verliert je Kanal, Sicht nach Trübung | P unter Wasser | Rot-Anteil fällt bis 5 m auf ≤ 30 %; Sicht gegen Secchi-Referenz ±30 % |
| 2 | Küstenmeer 0–40 m | Kaustik, Sandrippel, Dünung spürbar | P beim Tauchen in Brandung | Blindtest 50 Posen gegen Taucherfotos ≥ 60 %; Rippel-Abstand gegen Wellen-Orbital ±30 % |
| 3 | Schelf bis 200 m | Dämmerung, Sprungschicht, Kälte | P im Abtauchen | Lichtrest bei 200 m ≤ 1 %; Sprungschicht im Temperaturprofil des Tauchgangs |
| 4 | Tiefsee bis 11 km | Ebene, Graben, Rücken mit Schloten; Dunkelheit unter 1 000 m | P, Abtauchen ohne Ladepause | Tiefen-Hypsometrie eines 100-km-Profils gegen Erde ±20 %; Schlote nur an Spreizungsrücken |
| 5 | jeder Meeresboden ~3,6·10⁸ km² | stetig vom Satelliten bis zum Kiesel | P überall | 500 Bodenposen aus 50 Saaten: Blindtest gegen Tiefsee-Fotos ≥ 60 %; 0 Löcher |
| 6 | fremde Ozeane | unter 20 km Eis, Methan-See, Hochdruck-Ozean | P | Licht, Druck und Phasen gegen deren Stoff ±20 % |

### Wetter — Atmosphäre und Klima

*Referenz-Korpus (R6, R11):* Reanalyse (ERA5), Wolkenatlas der WMO, Köppen-Geiger-Karte, Sturm-Kataloge, Himmelsfotos

#### Wetterlagen — das synoptische Wetter vom Orbit bis zum Ort

`planet.wetter.lagen` — **HEUTE 0 / 7**

*misst:* wie wahr das Wetter ist, wenn es sich über wachsende Räume bewegt

*Beleg:* Mechanik von Sprosse 1 steht: wetterAt als drei Sinus-Wellen längs der Hauptrichtung (phyto-core.js:4067-4091), wetter.K1 2/2. Bild-Preis in der Szene des Richters an beiden Geräten nicht gemessen.

*alte Karte:* wetter.K1

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 5 Wetter-Zeilen, Bänder ziehen über wenige km | Wetter wandert | P | Regen an A bei trockenem B ≥ 20 % der Zeit, Lag ±20 % |
| 2 | Region 10² km | Frontpassage in Erd-Abfolge | P | 50 Frontpassagen aus 50 Saaten: Abfolge Cirrus → Nimbostratus → Schauer, Druckfall, Winddrehung stimmt ≥ 80 % |
| 3 | Kontinent 10³ km | Tief mit Lebenslauf 3–7 Tage | P, Draufsicht 400 km | Blindtest 20 Draufsichten gegen Satellitenbild: Trefferquote ≤ 60 % |
| 4 | Planet 10⁴ km | Wolkenbänder, Wüstengürtel, Passat aus Rotation und Neigung | P, Orbit ↔ Boden ohne Bruch | Breitenprofil der Bedeckung r ≥ 0,7; Passatrichtung ±30° in ≥ 70 % von 500 Proben |
| 5 | Planet × Jahr | Monsun, Blockierlagen, Wirbelstürme mit Auge | P auch im Zeitraffer | Wirbelsturm-Zahl und -Bahnen gegen IBTrACS ±30 %, 100 Erd-Saaten |
| 6 | jede Skala zugleich 10⁷ m bis 1 m | Superzelle, Böenfront, Hagel, Blitz, Tornado aus demselben Feld | P unter der Superzelle | Blindtest gegen Sturmfotos ≤ 60 %; Donner-Lag = Abstand/343 m/s ±10 % |
| 7 | 10⁶ Saaten | bei Erd-Parametern ununterscheidbar von einer Reanalyse | P je Saat | 1 000 Saaten: Druck, Wind, Niederschlag im KS-Test ununterscheidbar von ERA5 in ≥ 90 % |

#### Wolken, Niederschlag und Luft im Bild

`planet.wetter.wolken` — **HEUTE 0 / 7**

*misst:* was das Auge vom Boden bis durch die Wolke sieht, und ob es aus dem Zustand am Ort folgt

*Beleg:* Mechanik von Sprosse 1 steht: WOLKEN_SCHICHT (welt-licht.js:850), Licht der Oberseite (welt-licht.js:994-1003). Bild-Preis in der Szene des Richters an beiden Geräten nicht gemessen.

*alte Karte:* licht.K4

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | EINE Wolkenschicht 800 m, Karte ≈ 8 km | Licht aus der Atmosphäre, Schatten ziehen | P | Zeitraffer der Schicht gegen Zeitraffer-Film realer Schichtwolken (2AFC ≤ 85 %); Zuggeschwindigkeit der Schatten am Boden im Band realer Wolkenzüge (2–20 m/s) und gleich der Wolke darüber (Versatz ≤ 5 %) |
| 2 | Himmel bis zum Horizont, drei Stockwerke | Silberrand, dunkle Basis, Gegenlicht | P | Blindtest 20 Himmelsbilder gegen Foto ≤ 70 %; Gattung vom Bildmodell erkannt ≥ 80 % |
| 3 | jede Wolke entsteht und vergeht | Gattung folgt aus Feuchte, Hebung, Stabilität | P | 200 Momente × 20 Saaten: sichtbare Gattung = verlangte ≥ 80 %; Cumulus-Gipfel 14–17 Uhr in ≥ 80 % |
| 4 | Niederschlag sichtbar aus 2–20 km | Phase folgt dem Temperaturprofil | P | Phase am Boden passt zum Profil ≥ 90 %; Regenvorhang auf 5 km Kontrast ≥ 0,1 |
| 5 | die Luft selbst, Sicht 10 m – 200 km | Dunst, Talnebel, Staub, Regenbogen, Halo, Blitz wo die Physik sie verlangt | P | Sichtweite gegen Feuchte und Aerosol ±30 %; 0 Erscheinungen ohne Ursache, ≥ 80 % der Ursachen zeigen ihre |
| 6 | durchfliegbar, Boden bis Orbit | dieselbe Wolke von oben und von unten | P im Flug | Zoom 400 km → 2 m: Positionsfehler ≤ 1 % der Höhe, kein Sprung > 5 % Luma |
| 7 | 10⁶ Wolken zugleich, jede Saat, jede Epoche | ununterscheidbar von Fotografie | P | 100 Himmelsbilder gegen Fotos: Trefferquote ≤ 60 % |

#### Klimazonen und Jahreszeiten

`planet.wetter.klimazonen` — **HEUTE 0 / 7**

*misst:* wie viele Klimata die Welt trägt und wie wahr sie verteilt sind

*Beleg:* Mechanik von Sprosse 1 steht: EIN Klima 18/−4 °C, 0,11 K/m (gelaende-core.js:1285-1305), wetter.K4 1/2. Bild-Preis in der Szene des Richters an beiden Geräten nicht gemessen.

*alte Karte:* wetter.K4

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Klima, Höhe gestaucht | Jahres- und Tagesgang, Schneegrenze | P | Temperatur am Meer 18/−4 °C, Schneegrenze folgt der Saison |
| 2 | 1 Gebirge in Erd-Höhe | Höhenstufen wie auf der Erde | P | Baum- und Schneegrenze im Bild auf Erd-Höhe ihrer Breite ±20 % |
| 3 | 3 Klimata in einer Welt | Kontinentalität: Jahresamplitude wächst mit der Meeresferne | P | Jahresamplitude gegen Meeresabstand Rang ≥ 0,7 an 30 Orten |
| 4 | Jahreszeit-Typen nach Breite | Polarnacht, Monsun, Regen- und Trockenzeit | P | Bildpaar Juli/Januar an 3 Breiten: Tageslänge, Sonnenhöhe, Laub, Eis ändern sich in die richtige Richtung |
| 5 | Klimaraum eines Planeten | Köppen-Klasse aus Breite, Meer, Höhe | P | 50 Zufallsorte: Klasse aus Spieldaten = Klasse aus Lage ≥ 80 %; Flächenanteile über 100 Saaten ±50 % der Erde |
| 6 | ganzer Planet im Orbitbild | Farbe des Landes folgt dem Klima | P | Farbverteilung je Breite r ≥ 0,7 gegen Blue-Marble-Mosaik |
| 7 | 10⁶ Planeten-Klimata | plausibel ohne Erd-Parameter | P je Planet | 1 000 Saaten × 50 Orte: kein sichtbarer Widerspruch in ≥ 95 % |

#### Extreme und Wiederkehr

`planet.wetter.extreme` — **HEUTE 0 / 6**

*misst:* ob Flut, Hitze, Sturm in Stärke und Häufigkeit der Statistik der Erde folgen

*Beleg:* Stand 0: keine Extreme jenseits des Sturm-Worts.

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Flut über Tage, ein Fluss | Fluss verlässt das Bett | P | nach 100 mm Starkregen: Überflutung ≥ Aue, Bildpaar |
| 2 | Hitze- und Kältewelle, eine Region | Welle aus Blockierlage | P | Dauer und Amplitude gegen Erd-Statistik gleichen Klimas ±50 % |
| 3 | Wiederkehr über 10² Jahre | Jahrhundertflut, Jahrhundert-Hitze | P, Zeitsprung 100 a ≤ 5 s | GEV-Anpassung der Jahresmaxima: 100-a-Wert innerhalb Faktor 2 der Erd-Erwartung |
| 4 | Schwankung über Jahrzehnte, 5 000 km | Telekonnektion: Ozean warm hier → Dürre dort | P | Index ↔ Regen 5 000 km entfernt ∣r∣ ≥ 0,3 über 100 Saaten |
| 5 | Extreme jeder Klimazone | Sandsturm, Blizzard, Monsunflut, Wirbelsturm-Landfall | P im Sturm | Sicht im Sandsturm < 100 m; Blindtest gegen Sturmfotos ≤ 60 % |
| 6 | Katastrophe in der Megastadt, 10⁵ sichtbare Dinge | Hurrikan landet, Sandsturm verschluckt die Stadt | P über die ganze Durchfahrt | p95 ≤ 33 ms über die Durchfahrt; Blindtest ≤ 60 % |

#### Der lesbare Himmel — bis an die Grenze des Chaos

`planet.wetter.vorhersage` — **HEUTE 0 / 6**

*misst:* ob sich das Wetter ankündigt und ehrlich unvorhersagbar wird, wo die Erde es wird

*Beleg:* Stand 0: das Wetter ist drei Sinus-Wellen, ohne Vorlauf und ohne Chaos.

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Stunden | Regen kommt aus der Windrichtung | P | 100 Regenbeginne: Bedeckung stieg in den 60 min davor aus der Windrichtung in ≥ 70 % |
| 2 | ein Tag | Zeichen der Front 6–24 h vorher | P | Bildmodell, das NUR den Himmel sieht: Regen in 12 h mit Skill ≥ 0,3 über Persistenz |
| 3 | Tage | Druck und Wind am Ort lesbar | P | Vorhersage aus Spiel-Beobachtung: Skill ≥ 0,2 über Klimatologie bei 3 Tagen |
| 4 | Wochen | ehrliches Chaos | P | winzige Störung: Skill fällt bis 14 Tage auf ≈ 0 |
| 5 | Planet | Sturmbahnen vom Orbit lesbar | P | Bahn-Vorhersage 48 h aus dem Orbitbild: Fehler ≤ 300 km |
| 6 | 10 Welten | Vorhersagegrenze folgt der Dynamik der Welt | P je Welt | Zeit bis Skill ≈ 0 gegen Fehlerwachstum aus Rotation und Wärmegefälle ±50 % |

#### Fremde Atmosphären — dasselbe Gesetz, andere Welten

`planet.wetter.fremde-atmosphaeren` — **HEUTE 0 / 7**

*misst:* ob Himmel, Zirkulation und Wetter fremder Welten aus Gas, Masse, Stern und Rotation folgen

*Beleg:* Mechanik von Sprosse 1 steht: ATMO_GESETZ nach Hillaire (foundry-core.js:283-308); die Fremdwelt „ferne“ tauscht nur die Rayleigh-Tiefe, gesetzt statt gefolgert (stamm/daten.js:68-81). Bild-Preis in der Szene des Richters an beiden Geräten nicht gemessen.

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Atmosphäre (Erde), parametrisch | Rayleigh, Aerosol, Ozon | P | Himmelsfarbe Mittag/Abend gegen Foto |
| 2 | Gas, Druck, Stern als Zufallsparameter | Himmelsfarbe folgt aus ihnen | P | Mars-Parameter: blaue Dämmerung, butterfarbener Tag gegen Rover-Fotos; Titan: oranger Dunst gegen Huygens, Farbton ±10° |
| 3 | 10³ Welten: was eine Welt hält | Atmosphäre aus Fluchtgeschwindigkeit und Einstrahlung | P | 1 000 Welten: Atmosphäre gegen die Zahnle-Catling-Grenze richtig eingeordnet ≥ 90 % |
| 4 | Zirkulation aus Rotation | Zahl der Zellen folgt der Rotation | P | Rotation ×0,1 / ×1 / ×5: Bänder je Halbkugel 1 / 3 / ≥ 4 im Orbitbild |
| 5 | gebundene und dichte Welten | Superrotation, Tag-Nacht-Grenze | P | Venus-Parameter: Wolkendecke umläuft ≈ 60× schneller als der Boden |
| 6 | Gasriesen von außen und innen | Bänder, langlebige Wirbel, Abstieg bis zur Zerstörung | P im ganzen Abstieg | Bänderzahl nach Rhines-Skala ±30 %; Wirbel lebt ≥ 100 Spieljahre; Blindtest gegen Juno/Cassini ≤ 70 % |
| 7 | 10⁶ Planeten, ein Sonnensystem in Reise | jede Saat eine geschlossene Atmosphäre, Wetter läuft während der Reise | P je Ankunft | 1 000 Planeten × 20 Orte ohne sichtbaren Widerspruch ≥ 95 %; Wolke über dem Landeplatz steht, wo man sie vom Orbit sah (≤ 1 %) |

### Tiefe Zeit — der Planet über seine Äonen

*Referenz-Korpus (R6, R11):* Paläokarten (PALEOMAP), Meeresspiegel- und Temperaturkurven, stratigraphische Tafel, Fotos von Felswänden

#### Klima, Eis und Meeresspiegel über die Äonen

`planet.zeit.klimageschichte` — **HEUTE 0 / 9**

*misst:* ob die Klimageschichte am Ort erlebbar ist: Drift, Eiszeiten, Treibhaus, Schneeball, Meeresspiegel als Küstenlinie

*Beleg:* Stand 0: das Jahr wiederholt sich ohne Drift; Meeresspiegel fest bei Basis − 3 m.

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 10² Jahre | Treibhaus-Drift verschiebt Schneegrenze und Küste | P, Sprung ≤ 5 s | +100 a bei +2 °C: Schneegrenze +300 m ±30 %; Küste wandert um Δh/Strandneigung ±25 % |
| 2 | 10⁴ Jahre | Eiszeit: Meer −120 m, Landbrücken, Eisrand | P, Sprung ≤ 5 s | Erd-Saat −21 ka: Meer −120 ±10 m, Landbrücke begehbar, Eisrand gegen LGM-Rekonstruktion, global −6 ±2 °C |
| 3 | 10⁶ Jahre | Glazialtakt 41/100 ka | P | Spektrum der im Spiel gemessenen Eisbedeckung über 3 Ma: Gipfel bei 41 ±5 und 100 ±15 ka; Eis gegen Meeresspiegel r ≤ −0,8 |
| 4 | 10⁷ Jahre | Becken trocknet aus und flutet, Meer +70 m ohne Eis | P, Ereignis abspielbar | Becken mit negativer Bilanz fällt in V/(E−P) ±30 % trocken, Salzschicht sichtbar |
| 5 | 10⁸ Jahre | Treibhaus und Eishaus aus Kontinentlage und CO₂ | P | Erd-Saat über 540 Ma: Mitteltemperatur im Band der Scotese-Kurve ±3 °C; Kreide-Hochstand flutet 20–40 % des Kontinents; Pangäa-Inneres Wüste |
| 6 | 10⁹ Jahre | Schneeball-Episoden und Ausstieg | P im Eis | Schneeball ≥ 90 % Eisfläche im Bild; in ≥ 30 % der fähigen Saaten tritt eine Episode auf und endet aus dem Gesetz |
| 7 | 4,5·10⁹ Jahre | schwache junge Sonne, Dunst-Himmel des Archaikums, Ozeanverlust der Zukunft | P | Erd-Saat: flüssiges Wasser ≥ 90 % der Zeit seit 4 Ga bei 70–100 % Leuchtkraft; Ozeanverlust zwischen +0,5 und +2 Ga; Himmel bei −4 Ga gegen Strahlungsrechnung |
| 8 | die ferne Zukunft: +250 Ma, +1 Ga, +5 Ga | nächster Superkontinent, hellere Sonne, Ozeane verdampfen, die Biosphäre schwindet, Roter Riese | P, Sprung ≤ 5 s | drei Halte im Bild: Land zu ≥ 70 % zusammenhängend um +250 Ma (±100 Ma); Ozeanfläche → 0 zwischen +0,5 und +2 Ga; Sonnenscheibe bei +5 Ga ≥ 100× Fläche — die Zeitpunkte folgen aus der Saat (Saat-Tausch verschiebt sie) |
| 9 | jede Epoche jedes Planeten, nahtlos | Klimageschichte konsistent mit der Geologie | P je Sprung | heute → Eiszeit → heute: Moränen liegen am Eisrand der Eiszeit (Lagefehler ≤ 5 %), 100 Saaten; 1 000 Planeten: Fremdwelt-Probe (R10) an Eisrand, Meeresspiegel und Klimazonen |

#### Die Welt als Archiv — Schicht, Wand, lesbare Geschichte

`planet.zeit.archiv` — **HEUTE 0 / 8**

*misst:* ob jede Wand, jeder Graben und jede Landform die Geschichte trägt, die die Zeitreise zeigt — und ein Kundiger sie liest

*Beleg:* Mechanik von Sprosse 1 steht: Schicht-Gesetz T5 Pediment → Schutthang → Kliff (gelaende-core.js:374-375, schichtMass :1028), nicht mit eigenem Auge belegt; Lagen ohne Alter und Stoff. Bild-Preis in der Szene des Richters an beiden Geräten nicht gemessen.

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Schicht als Form im Tafelland | harte und weiche Bank: Kliff, Schutthang am Ruhewinkel | P am Kliff | Kliff 60–85° und Schutthang im Bild an Tafelland-Saaten |
| 2 | Schichten mit Gesteinsart, 1 Wand | Farbe und Korn je Lage aus dem Ablagerungsmilieu | P an der Wand | Bildvergleich gegen Fotos des Colorado-Plateaus (Farbbänder, Rhythmus) |
| 3 | Schichten mit Alter, 10⁴ a am Ort | Absetzrate, Warven; Grenzen setzen sich stetig fort | P beim Graben | Grabung 3 m: Lagen = Ablagerungs-Episoden der bereisten Geschichte ±10 %; Grenzen stetig über ≥ 100 m |
| 4 | Diskordanz, Faltung, Verwerfung, 10³ Säulen | Lücken, wo Erosion fraß | P | 1 000 Zufallssäulen: jede Lücke = eine Hebungs- oder Abtragsphase der Geschichte (100 %) |
| 5 | jede Säule bis 10 km, 10⁸ a | marin wo Meer war, Evaporit wo Wüste, Kohle wo Sumpf | P beim Bohren, Ergebnis ≤ 1 s | Zeitreise an den Ort → Milieu; Bohrung → Gestein der Lage jenes Alters stimmt ≥ 95 % |
| 6 | Kilometer-Wände aus der Ferne | Canyon, Kliffküste: 10⁹ a in einer Wand | P an der Fernsicht-Pose | Spiel-Wand aus 2 km gegen Grand-Canyon-Fotos: Fachleute ordnen ≥ 80 % der Lagen dem richtigen Milieu zu |
| 7 | der Spieler als Geologe, 50 Orte | Agens, Abfolge und Alter von Wand UND Landform lesbar | P | Fachjury bestimmt aus 50 Ego-Bildern das Agens ≥ 70 % (Zufall 25 %), die Abfolge ≥ 60 %, das Alter Rang ≥ 0,6 |
| 8 | jede Säule jeder Welt über 4,5 Ga | ein Gesteinsgedächtnis, das sich liest wie ein Feldbuch | P je Saat | 100 Welten: aus 5 Aufschlüssen die Geschichte (Meer/Land/Eis/Vulkan je Epoche) ≥ 80 % getroffen |

### Die echte Erde

*Referenz-Korpus (R6, R11):* Höhenmodell und Satellitenmosaik der Erde, Ortsverzeichnis (GeoNames), Köppen-Geiger-Karte, Stadtpläne (OpenStreetMap)

#### Die echte Erde — erkannt und vermessen

`planet.erde.gestalt` — **HEUTE 0 / 6**

*misst:* wie genau die Erd-Saat die echte Erde trifft — Küste, Relief, Klima, Orte — und was ihr Schlüssel wiegt. Die Erde ist die eine Saat mit Schlüssel (R4): er zählt als Bytes, und jede Sprosse nennt seine Decke. Die Erdgeschichte zählen planet.geologie.platten, planet.zeit.klimageschichte und same.kopplung.erdsaat, die Orte der Menschheit mensch.zeit.erde.

*Beleg:* Stand 0: es gibt keine Erd-Saat (siehe same.kopplung.erdsaat).

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | EINE Region der Erde, 10⁴ km² (ein Golf mit Vulkan) | Küste, Hauptgipfel, Hauptfluss liegen, wo sie liegen | P · Schlüssel ≤ 10 kB | Küstenlinie gegen das Höhenmodell: mittlerer Lagefehler ≤ 5 km; Ortskundige wählen die Region aus 10 Kandidaten an 3 Ego-Bildern ≥ 70 % |
| 2 | ein Kontinent | Gebirgsgürtel, Ströme, Wüsten, Klimazonen an ihrem Ort | P · Schlüssel ≤ 100 kB | Lagefehler der 100 größten Formen ≤ 50 km; Köppen-Klasse an 1 000 Punkten richtig ≥ 80 % |
| 3 | die ganze Erde heute, Orbit bis Boden | Kontinente, Meere, Eis, Biome | P · Schlüssel ≤ 1 MB | Orbitbild gegen Satellitenmosaik: Panel-2AFC ≤ 70 %; Küstenlinie p90 ≤ 20 km |
| 4 | 10⁴ benannte Orte (Gipfel, Seen, Pässe, Mündungen) | jeder ≤ 1 km neben seinem Ort, die Form wahr im Typ | P · Schlüssel ≤ 5 MB | 1 000 Zufallsorte aus dem Ortsverzeichnis: Lagefehler p90 ≤ 1 km; Ego-Blindpaar gegen ein Foto des Orts ≤ 70 % |
| 5 | die Erde der Menschen heute: 10⁴ Städte an ihrem Ort | Größe, Lage am Wasser und Netz-Typ jeder Stadt | P · Schlüssel ≤ 10 MB | 100 Zufallsstädte: Lage ≤ 2 km, Einwohner ±30 %, Orientierungs-Entropie und Blockgröße ±20 % gegen den realen Plan |
| 6 | jeder Ort, den ein Mensch Heimat nennt | „das ist mein Tal, meine Straße“ | P · Schlüssel je besuchtem km² ≤ 50 kB, am Ort geladen und gezählt | Heimat-Probe: 100 Menschen suchen ihren Wohnort — Tal, Flusslauf und Straßenzug erkannt ≥ 80 %; 2AFC Ego-Bild gegen eigenes Foto ≤ 75 % |

## 2 · Der Kosmos

### Kosmos — Himmel, Sterne, fremde Welten

*Referenz-Korpus (R6, R11):* Sternkataloge (Gaia, Hipparcos), Exoplaneten-Archiv, Ephemeriden (JPL), Sondenfotos von Mond, Mars, Io, Europa, Titan, Tiefenfeld-Aufnahmen; für eigene Gesetze und gebaute Welten: die Fremdwelt-Probe (R10)

#### Himmelsmechanik am Ort — Tag, Jahr, Mond, Finsternis, Äonen

`planet.kosmos.himmelsmechanik` — **HEUTE 0 / 8**

*misst:* ob der Himmel über dem Spieler aus den Bahnen folgt und an jedem Ort zu jeder Zeit stimmt

*Beleg:* Mechanik halb: feste Sonnenbahn ohne Breite (welt-licht.js:696-714), Richter der Tag-Kurve 0/2 (licht.K1); Mond immer voll (welt-licht.js:715-719); die Meeus-Bahn fiel am Tag-Achsen-Gate. Bild-Preis in der Szene des Richters an beiden Geräten nicht gemessen.

*alte Karte:* licht.K1

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Tag-Achse für alle Orte | Tag-Kurve stetig, Sterne nach Grenzgröße | P, Uhr-Lauf ohne Bildsprung | Sprung ≤ 0,1 EV je Uhrschritt über die ganze Bahn, Ego und Third, beide Geräte |
| 2 | jede Breite × 365 Tage | Mittagshöhe, Auf-/Untergang, Tageslänge | P, Datumswechsel ohne Sprung > 0,1 EV | Sonnenhöhe aus der Schattenlänge an 3 Breiten × 4 Daten gegen Meeus ±0,5°; Polartag bei 80° N im Juni |
| 3 | 1 Mond, 29,53 d | Phase, Terminator, Erdschein | P | Terminator-Winkel ±3°; Mondaufgang ±10 min; Neumond-Nacht ≥ 2 EV dunkler als Vollmond |
| 4 | Finsternisse über 10² Jahre | Saros-Folge, Korona, Kernschatten | P, auch in der Totalität | Saros-Periode ±1 d; Bildpaar Totalität gegen Foto; Kernschatten-Geschwindigkeit ±10 % |
| 5 | Präzession ±26 000 Jahre | Polarstern wandert | P, Zeitsprung ≤ 5 s | Nordhimmel bei −12 000 gegen Planetariums-Referenz, Pol ±1° |
| 6 | ±5·10⁶ Jahre | Neigung 41 ka, Exzentrizität 100/405 ka, Präzession 23 ka | P, Zeitsprung ≤ 5 s | Mittagshöhe zur Sommerwende folgt der Neigung nach Laskar ±0,1°; Perihel-Datum ±2 d — im Bild |
| 7 | Äonen 10⁹ Jahre | Gezeitenreibung dehnt den Tag, der Mond war näher | P, Zeitsprung ≤ 5 s | Erd-Saat −620 Ma: Tag 21,9 ±0,5 h; −3 Ga: Mondscheibe ≥ 1,3× heute |
| 8 | jede Welt, jede Zeit, viele Monde und Sonnen | Himmel aus den Bahnen aller Körper | P an jeder Welt | 1 000 Saaten × Orte × Zeiten: Sonnen-/Mondstand gegen unabhängige N-Körper-Rechnung ±1° in ≥ 99 % |

#### Sternhimmel, Galaxie, Universum

`planet.kosmos.sternhimmel` — **HEUTE 0 / 7**

*misst:* wie viele Sterne der Spieler sieht und erreichen kann, und wie wahr ihr Himmel ist

*Beleg:* Mechanik von Sprosse 1 steht: 2 800 Sterne aus der Saat an einer Kugel von 480 m (stamm/bild-himmel.js:307-421), drei Wandelsterne als feste Punkte. Bild-Preis in der Szene des Richters an beiden Geräten nicht gemessen.

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | ~2 800 Punkte der Saat | Größenklasse −4,2…+6, Farbe, Grenzgröße mit der Dämmerung | P | Zahl sichtbarer Sterne je Sonnenhöhe folgt der Grenzgrößen-Tafel |
| 2 | ~9 000 Sterne bis mag 6, Planeten wandern | Zählkurve log N(m), Farb-Helligkeit wie das Sonnenumfeld | P | Zählkurve aus dem Bild ±10 % gegen Bright-Star-Katalog; ein Planet läuft sichtbar rückläufig |
| 3 | 1 Galaxie von innen | Milchstraßenband, Staubbahnen, Zodiakallicht | P, Nacht | Bildpaar Bortle 1 gegen Weitwinkel-Foto: Histogramm ±10 %, Band ±5° |
| 4 | 10⁶ Sterne in 3D, reisbar | Parallaxe, Eigenbewegung | P, Sprung zwischen Sternen ≤ 5 s | aus 10 pc verschiebt sich jedes nahe Sternbild wie die Katalog-Projektion ±0,5° |
| 5 | 10⁹ Sterne, jeder ansteuerbar | Spiralarme, Populationen, Metallizitätsgradient | P an jedem Stern | 1 000 Ziele: Spektralklasse und Umgebung passen zur galaktischen Lage ≥ 95 % |
| 6 | 10¹¹ Sterne, Satelliten, Andromeda | Rotation der Galaxie | P, Blick von außen ohne Nachladen | Galaxie von außen gegen Sb–Sc-Fotos; flache Rotationskurve ±10 % über 5–20 kpc |
| 7 | 10¹¹ Galaxien, 13,8 Ga | kosmisches Netz, Rotverschiebung, Galaxien-Entwicklung | P, jede Galaxie ≤ 5 s | tiefes Feld gegen Hubble-Deep-Field: Galaxien je Bogenminute² ±20 % |

#### Das Leben der Sterne — Entstehung bis Überrest

`planet.kosmos.sterne` — **HEUTE 0 / 7**

*misst:* ob Sterne als Prozess über die Zeit erlebbar sind

*Beleg:* Stand 0: die Sonne hat kein Alter.

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | die eigene Sonne über 10⁹ a | Leuchtkraft, Farbe, Radius nach Isochronen | P, Zeitsprung ≤ 5 s | Zeitsprung +5 Ga: Leuchtkraft +~50 % ±10 %, Belichtung am Boden gemessen |
| 2 | alle Sterne eines Systems über 10¹⁰ a | Roter Riese verschluckt innere Bahnen, Weißer Zwerg | P | Sonne als Riese füllt ≥ 20° des Himmels bei 1 AE, Himmelsfarbe kippt |
| 3 | Geburt im Nebel, Haufen 10³ Sterne | Kollaps, Protostern, Jets, Emissionsnebel | P, auch im Nebel | Bildvergleich Emissionsnebel gegen Teleskop-Foto; Haufen-Massen folgen der IMF (KS p > 0,05) |
| 4 | Tod als Ereignis | Nova, Supernova, Planetarischer Nebel | P, auch im Ereignis | Lichtkurve über 300 Tage ±0,3 mag; Überrest dehnt sich ±20 % |
| 5 | kompakte Überreste | Neutronenstern, Schwarzes Loch, Akkretion | P in der Nähe | Bildpaar gegen Ray-Tracing-Referenz: Einsteinring, Photonensphäre ±5 % |
| 6 | 10¹¹ Sterne über 10¹⁰ a | Sternentstehung, chemische Anreicherung | P, Zeitsprung ≤ 5 s | Metallizität von 1 000 Zufallssternen folgt Alter und Ort ±0,2 dex |
| 7 | Sterne als Generationen | das eigene System aus dem Staub früherer Sterne | P | Zeitreise zur Geburt des eigenen Sterns zeigt den Geburtsnebel am selben Ort; Gesteinsplaneten-Anteil steigt mit der Metallizität ±20 % |

#### Sonnensysteme aus der Scheibe

`planet.kosmos.systeme` — **HEUTE 0 / 7**

*misst:* ob die Systeme einer Saat in ihrer Verteilung wie die gemessenen Systeme der Wirklichkeit sind — gezählt an den angeflogenen, nie im Saat-Raum

*Beleg:* Stand 0: jahrTage: 365 ist eine Zahl, keine Bahn (gelaende-core.js:1304).

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Stern, 1 Planet, 1 Mond | Kepler-Bahnen, Jahr folgt der Bahn | P | Bahn am Himmel beobachtet: Planet und Mond stehen über ein Spieljahr gegen die Ephemeride der eigenen Bahn ≤ 0,5°; Mondphase je Woche im Bildpaar |
| 2 | 1 System, 3–12 Planeten | Schneegrenze trennt Gestein und Riesen, Bahnen stabil | P, Systemansicht ohne Nachladen | 1 000 Saaten: über 10⁹ a dieselben Planeten am Himmel in ≥ 95 % |
| 3 | 10–100 Monde je Riese, Ringe | Roche-Grenze, Resonanzen | P vom Orbit | Ringe nur innerhalb der Roche-Grenze (100 %); Resonanzketten in ≥ 10 % der Riesen-Systeme |
| 4 | 10³ Systeme | Masse-Perioden-Ebene, heiße Jupiter, Super-Erden, kompakte Ketten | P, Systemwahl ≤ 5 s | KS-Test Masse und Periode gegen das Exoplaneten-Archiv nach Beobachtungs-Bias p > 0,05 |
| 5 | 10⁶ Systeme — in EINER Galaxie anfliegbar | Doppel- und Mehrfachsterne, Schurkenplaneten | P | Zufallsflug zu 1 000 Sternen: angetroffener Mehrfach-Anteil je Spektralklasse gegen Duchêne & Kraus ±10 %; die Akkumulationskurve der System-Typen (Wahrnehmungs-Cluster) flacht bis 1 000 nicht ab |
| 6 | jedes System über 10⁹ a | spätes Bombardement, Mond aus Einschlag | P, Zeitsprung ≤ 5 s | Zeitreise zeigt Bombardement und Mondgeburt; Mondbahn weitet sich nach Gezeitenrechnung ±20 % |
| 7 | 10¹¹ Systeme, keines gespeichert | jedes aus seiner Scheibe | P | 1 000 Zufallssterne angeflogen: das System hält die Prüfungen der Sprossen 2–6 in ≥ 95 %; effektive Zahl der System-Typen (Chao1 aus den Flügen) ≥ 10⁴ |

#### Fremde Welten begehbar — Schwere, Rotation, Bauart, voller Radius

`planet.kosmos.welten` — **HEUTE 0 / 6**

*misst:* ob man auf anderen Welten steht und sie anders erlebt, weil ihre Gesetze aus Masse, Abstand und Alter folgen

*Beleg:* Mechanik halb: zwei gesetzte Welten (stamm/daten.js:68-81), Schwere als Regler mit 5 Lesern, aber Fahrzeug 9,8 (vehicle-core.js:3307) und Lab g = 20 (fachwerk-core.js:9506) als Zwillinge; Preis der Fremdwelt nie gemessen. Bild-Preis in der Szene des Richters an beiden Geräten nicht gemessen.

*alte Karte:* licht.K2 · tore.K1 · tore.K3 · ultiversum.K1

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Heimat + 1 Fremdwelt | eigene Schwere, eigener Himmel | P an BEIDEN Welten | Licht-Bilanz an der Kugel 5–12,5 an beiden Welten; Fremdwelt-Mittag: Zenit nicht blau |
| 2 | jede Welt g 0,1–3 | Gang, Sprung, Fall, Wurf, Fahrzeug, Wasser skalieren mit g | P | Fallzeit aus 10 m = √(20/g) ±2 % für Leib UND Fahrzeug UND Wurf; Sprunghöhe ∝ 1/g ±5 % |
| 3 | Tag 4 h bis gebunden | Sonnenlauf folgt der Rotation | P | gebundene Welt: Sonne steht still; Tageslänge im Bild = Rotation ±1 % |
| 4 | 10³ Welten: Bauart aus der Lage | Io-, Europa-, Titan-Typen aus Gezeitenheizung, Abstand, Masse | P am Boden | Saat-Tausch: Abstand des Monds ändern → Typ wechselt wie vorhergesagt in ≥ 90 %; Blindtest gegen Sondenfoto ≥ 40 % verwechselt |
| 5 | Doppelsonnen, fremde Jahre | zwei Schatten, Jahreszeit aus Exzentrizität, extreme Neigung | P | zwei Schatten im Winkel der Sonnen ±1°; 98° Neigung: Polartag ein halbes Jahr ±2 % |
| 6 | 10⁶–10¹¹ Welten im vollen Radius | Mond bis Super-Erde, jede eigen | P an jeder Welt, Boden ↔ Orbit ohne Nachladen | 1 000 Welten: Horizont-Senkung aus 10 km = acos(R/(R+h)) ±0,1°; Bild-Abstand je Paar größer als Erde–Mars in ≥ 90 % |

#### Himmelsereignisse am Boden — Meteor, Komet, Polarlicht

`planet.kosmos.ereignisse` — **HEUTE 0 / 6**

*misst:* ob die Ereignisse des Himmels aus denselben Bahnen und Feldern folgen und am Boden fühlbar sind

*Beleg:* Stand 0: keine Meteore, Kometen, Polarlichter.

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | sporadische Meteore jede Nacht | Leuchtspur, Dauer, Häufigkeit | P | 5–10 je Stunde am dunklen Himmel; Spurlängen gegen Meteor-Kamera-Netze ±30 % |
| 2 | jährliche Ströme | Radiant, Datum, Rate aus dem Mutterkometen | P | Erd-Saat: Maximum an festem Datum ±1 d, ~100/h, ein Radiant ±2° |
| 3 | periodische Kometen | Schweif von der Sonne weg, Wachstum am Perihel | P | Schweif antisolar ±5°; Wiederkehr nach der Bahnperiode ±1 % |
| 4 | Polarlicht aus Sonne × Feld | Oval nach magnetischer Breite, Farbe aus der Luft, Sonnenzyklus | P unter dem Polarlicht | Oval bei 65–70° ±3°; grün 557,7 nm dominiert; Häufigkeit über 11 a r ≥ 0,7 gegen Kp; ohne Feld kein Oval |
| 5 | Feuerball und Meteoritenfall | Bolide zerbricht, Bruchstücke liegen im Streufeld | P im Ereignis | Fundorte im Streufeld längs der Bahn ≥ 90 %; Fallrate je Masse gegen Erd-Statistik ±Faktor 2 |
| 6 | jede Welt | Ringe, Gürtel, Monde, Stern setzen Rate und Art | P | 1 000 Welten: Meteorrate gegen Kleinkörper-Dichte Rang ≥ 0,8 |

#### Welten mit eigenem Naturgesetz

`planet.kosmos.eigengesetz` — **HEUTE 0 / 7**

*misst:* ob eine Welt, deren Konstanten und Gesetze nicht die der Erde sind, unter IHREM Gesetz geschlossen ist — der Spieler findet das Gesetz durch Versuch heraus und kann sich darauf verlassen. Richter ist die Fremdwelt-Probe (R10), nie „könnte so sein“.

*Beleg:* Stand 0: EINE Physik; die Schwere ist ein Regler mit 5 Lesern, Fahrzeug und Labor tragen eigene feste Werte (siehe planet.kosmos.welten) — keine Welt mit eigenem Gesetz.

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | EINE Welt, EINE Konstante anders (Schwere-Exponent, Stoff-Dichte, Zähigkeit) | Fall, Wurf, Bahn und Flüssigkeit folgen dem geänderten Gesetz, nicht dem der Erde | P | 20 Versuche des Spielers (Fall, Wurf, Pendel): Messwerte aus dem Bild folgen dem Gesetz der Welt ±5 % und weichen vom Erd-Gesetz ab |
| 2 | 10 Welten, je 3 Konstanten anders | Landschaft, Wetter und Himmel sind Folgen der Konstanten | P | Ursachen-Probe: der Leser sagt aus Ego-Bildern die geänderte Konstante voraus, Rang ≥ 0,7; Gegenlauf: Konstante zurück → das Merkmal ist weg ≥ 80 % |
| 3 | 10² Welten mit anderer Chemie (Lösungsmittel, Phasen, Bindung) | Gestein, Meer, Wolke, Eis nach dem eigenen Phasendiagramm | P | je Welt: Phasengrenzen im Bild (was schmilzt, was regnet, was gefriert) gegen das Diagramm der Welt richtig ≥ 90 % |
| 4 | 10³ Welten mit Leben unter dem eigenen Gesetz | Körper, Größe, Tempo folgen der Welt | P | Skalengesetze aus Bildern (Bein-Querschnitt, Gangtempo, Flug) folgen den Konstanten der Welt, Rang ≥ 0,7 |
| 5 | Welten mit anderer Geometrie von Raum oder Zeit (gekrümmt, geschlossen, Zeit ortsabhängig) | Wege, Horizonte, Uhren verhalten sich danach, überall gleich | P | Schleifen-Probe: Winkelsumme, Rückkehr-Ort und Uhren-Abgleich zweier Wege gegen die Geometrie der Welt ±5 %; 0 Nähte |
| 6 | 10⁴ Welten, deren Gesetz der Spieler nicht kennt | er findet es heraus: die Vorhersage aus eigenen Versuchen trifft | P je Welt | blinde Spieler sagen nach 30 min Versuchen den Ausgang eines neuen Versuchs voraus ≥ 70 %; Neuheit gegen den Korpus bekannter Welten (R10) bei ≥ 50 % |
| 7 | jede Saat ein eigenes All: Konstanten, Chemie, Geometrie, Leben, Kultur | Welten, die unsere Vorstellung kaum zu bauen vermag — und doch überall geschlossen | P | 1 000 Welten: Fremdwelt-Probe ganz (Ursache Rang ≥ 0,7, Gegenlauf ≥ 80 %, Neuheit ≥ 30 %); 0 Widerspruch zwischen zwei Versuchen derselben Welt |

#### Gebaute Welten — Ring, Schale, Hohlwelt, Scheibe

`planet.kosmos.kunstwelten` — **HEUTE 0 / 6**

*misst:* ob Welten, die jemand gebaut hat, begehbar sind und ihre eigene Physik zeigen: Schwere aus Drehung, ein Horizont, der sich hebt, Tag aus Blenden. Gerichtet wird, was der Spieler am Boden misst und sieht.

*Beleg:* Stand 0: der Boden ist eine flache Ebene (siehe same.massstab.spanne); keine gebaute Welt.

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | EIN Drehzylinder, 10 km | Schwere aus Drehung, der Boden wölbt sich nach oben | P | Wurf-Versuch: die Bahn weicht um die Coriolis-Ablenkung ab ±10 %; der Horizont steigt im Bild |
| 2 | Hohlwelt oder Zylinder 10³ km mit Land, Meer, Wetter | Wolken, Flüsse, Wind folgen der Drehung | P | Flussläufe und Wolkenzug gegen die Rechnung für Dreh-Schwere; der Blick nach oben zeigt das Land gegenüber, Bildpaar gegen Rechen-Referenz |
| 3 | Ringwelt, 10⁸ km Umfang | Bogen am Himmel, Tag und Nacht aus Blenden, Randmauern | P · am Boden und im Aufstieg | Bogen-Winkel am Himmel = Geometrie ±0,5°; Tageslänge = Blendenfolge ±1 % |
| 4 | Schale um einen Stern, Scheibe, Schwarm aus Habitaten | Licht, Schwere, Klima je Bauart | P | je Bauart 3 Messungen des Spielers (Schwere, Tag, Horizont) gegen die Bauart ±5 % |
| 5 | gebaute Welten mit Geschichte: Erbauer, Verfall, Reparatur, Bewohner, die den Bau vergessen haben | Spuren des Baus im Boden, Kultur aus der Bauart | P · Sprung ≤ 5 s | Grabung trifft die Bau-Schicht; Kultur der Bewohner gegen die Bauart: Ursachen-Probe Rang ≥ 0,7 |
| 6 | 10³ gebaute Welten aus Saaten, jede von einer anderen Zivilisation | Bauart folgt Stern, Stoff und Technik der Erbauer | P | Fremdwelt-Probe (R10): Bauart aus Stern und Technik vorhergesagt Rang ≥ 0,7; Neuheit ≥ 30 % |

#### Galaxien, Haufen und das junge All — als Ziel

`planet.kosmos.galaxien` — **HEUTE 0 / 7**

*misst:* ob der Kosmos jenseits der eigenen Galaxie ein Reiseziel ist — andere Galaxien mit eigenen Sternen und Welten, Haufen, das Netz — und ob seine Geschichte vom ersten Licht bis in die ferne Zukunft bereisbar ist. Was man vom Boden am Himmel sieht, zählt planet.kosmos.sternhimmel; den Flug ohne Bruch same.massstab.spanne.

*Beleg:* 2 800 Sterne an einer Kugel von 480 m (siehe planet.kosmos.sternhimmel); keine Galaxie als Ort, keine Zeit vor dem Planeten.

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | EINE Nachbargalaxie als Ziel | aus der Ferne ein Nebelfleck, im Anflug Sterne, am Ziel ein Himmel mit der Heimatgalaxie darin | P · Sprung ≤ 5 s | am Ziel steht die Heimatgalaxie am Himmel in der richtigen Richtung und Größe ±5 %; Bildpaar Anflug gegen Teleskop-Aufnahme (2AFC ≤ 80 %) |
| 2 | 10² Galaxien, Typen aus ihrer Geschichte | Spirale, Ellipse, Zwerg aus Masse, Drehung, Verschmelzung | P | Typ-Anteile der angeflogenen gegen Durchmusterung ±20 %; Farbe ↔ Sternbildung im Band |
| 3 | 10⁴ Galaxien: Gruppen und Haufen | Dichte bestimmt den Typ, Verschmelzungen im Zeitraffer | P · Zeitsprung ≤ 5 s | Zwei-Punkt-Korrelation der im Flug gezählten Galaxien gegen Durchmusterungs-Karten im Band |
| 4 | das Netz: 10⁶ Galaxien, Fäden und Leerräume | jede davon anfliegbar bis zum Boden einer Welt | P | 20 Zufallsgalaxien: Landung auf einem Planeten dort; Größe der Leerräume im Band 10–100 Mpc |
| 5 | Zeitreise bis zum ersten Licht | dunkles Zeitalter, erste Sterne, junge Galaxien, glühender Himmel der Frühzeit | P · Sprung ≤ 5 s | Halte 13,8 · 13,5 · 13 · 10 Ga zurück: Himmelsbild gegen Rechen-Referenz (Sternzahl, Farbe, Temperatur des Himmels ±10 %) |
| 6 | 10¹¹ Galaxien über 13,8 Ga, keine gespeichert | Sterne als Generationen: schwere Elemente erst nach den ersten Sternen, darum Felswelten erst später | P | 1 000 (Galaxie, Zeit): der Anteil der Felswelten wächst mit der Zeit wie die Metallizität; frühe Halte ohne Felswelten ≥ 95 % |
| 7 | die ferne Zukunft des Alls | Galaxien verschmelzen, Sterne verlöschen, der Himmel wird leer | P · Sprung ≤ 5 s | Halte +5 Ga, +100 Ga, +10¹² a: die Heimatgalaxie verschmilzt sichtbar mit der Nachbarin; die Sternzahl am Himmel fällt nach der Rechnung |

## 3 · Das Leben

### Pflanzen und Biome

*Referenz-Korpus (R6, R11):* Herbar- und Feldfotos, Merkmals-Datenbank (TRY), Ertragstafeln, Phänologie-Reihen, Vegetations-Index aus dem Satelliten

#### Pflanzenarten aus EINEM Wachstumsgesetz

`leben.pflanzen.arten` — **HEUTE 0 / 7**

*misst:* Wie viele unterscheidbare Pflanzenarten eine Welt im Spiel trägt — gezählt an den Angetroffenen (Akkumulationskurve, Chao1), nie im Saat-Raum — und wie viele davon ein Bild zugleich zeigt.

*Beleg:* 12 Gestalten von Hand (stamm/vegetation-baum.js SPECIES_TREE_PARAMS) + baum_mammut (phyto-core.js); kein Gesetz erzeugt Arten; der Blindtest von Sprosse 1 wurde nie gefahren.

*alte Karte:* material.K1

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 10 Gestalten, je von Hand parametrisiert | Gattung an der Silhouette lesbar; Rinde und Blatt nah gegen Herbarfoto | P · Waldrand | Blindtest 10 Bilder je Gestalt: Gattung ≥ 80 % richtig; Herbar-Bildpaar je Gestalt ≥ 0,7 |
| 2 | 10² Arten, gezogen aus EINEM Merkmalsraum (Saat → Art), keine Tabelle | ≥ 90 % als echte Wuchsform erkannt (Baum, Strauch, Gras, Kletterer, Sukkulente, Farn, Moos) | P | 100 Saaten → Wuchsform-Blindtest; Silhouetten-Paare unterscheidbar ≥ 95 % |
| 3 | 10³ Arten je Planet, ≥ 50 zugleich im Bild | Merkmalsverteilung (Höhe, Blattgröße, Holzdichte) im Band der Erde (TRY, Díaz 2016) | P · artenreichste Szene | Histogramm-Distanz Spiel ↔ Erde ≤ 0,2 aus Bild-Morphometrie; Artenzahl im Bild per Blindbenennung |
| 4 | 10⁴ Arten; Tropen-Hektar mit ~300 Baumarten im Blick | Nahbild jeder Stichprobe vom Foto kaum zu trennen | P · Regenwald-Hektar | Blindtest Foto ↔ Spiel, 200 Paare: Trefferquote ≤ 60 % |
| 5 | 10⁵ Arten je Planet, ≥ 10⁴ davon im Spielgang angetroffen | Schwesterarten derselben Gattung im Nahbild trennbar, nicht bloß umgefärbt | P | Zufallsgänge über den Planeten: Akkumulationskurve der angetroffenen Arten (Wahrnehmungs-Cluster) → Chao1 ≥ 10⁵; 1 000 angetroffene: Schwesterarten trennbar ≥ 95 % in Gestalt UND Standort |
| 6 | 10⁶ Arten über alle Planeten, fremde ohne irdisches Vorbild | fremde Arten folgen aus ihrer Welt | P · fremder Planet | wie 5, Chao1 ≥ 10⁶ über die Planeten einer Saat; 500 fremde Arten: Fremdwelt-Probe (R10); paarweise unterscheidbar ≥ 95 % |
| 7 | ≥ 10⁷ Arten aus EINEM Samen, die Erde (~3,9·10⁵ Gefäßpflanzen) darunter | Gestalt, Phänologie und Standort jeder Art folgen aus dem Gesetz | P an jedem Ort jeder Saat, 0 Byte je Art | Zufallsgänge auf 1 000 Saaten: Chao1 je Planet im Erd-Maß, über alle ≥ 10⁷; jede angetroffene Art steht in ihrer Nische (Standort aus Klima und Boden vorhergesagt ≥ 90 %); im Bild ununterscheidbare Duplikate ≤ 1 % |

#### Biome folgen aus Klima, Boden und Licht

`leben.pflanzen.biome` — **HEUTE 0 / 6**

*misst:* Wie viel des Klimaraums die Vegetationsdecke auf wachsender Fläche richtig besetzt, ohne dass ein Biom gesetzt wird.

*Beleg:* Waldgrenze unter dem Sommer-Schnee und Feuchte-Arten GRÜN, aber die Palme folgt dem Rauschen `lebendig` (stamm/feld-leben.js) statt Wärme: ROT an Sprosse 1; ein Klimafeld Temperatur × Niederschlag fehlt.

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | ein Klima; Mosaik Wald ↔ Lichtung ↔ Ufer ↔ Gipfel | Waldgrenze unter dem Sommer-Schnee; Uferarten am Wasser; Wärme-Arten nur im Warmen | P · Gipfel und Ufer | Bild am Gipfel baumfrei; Stichprobe: Uferarten am Wasser ≥ 90 %, Wärme-Arten außerhalb der Wärme 0 |
| 2 | Region 10² km² mit Höhen- und Luv/Lee-Gradient | Höhenstufen kollin → alpin in richtiger Folge, Ökoton statt Kante | P · Flug über die Region | 50 Hänge: Stufenfolge richtig ≥ 90 %; scharfe Biom-Kanten im Luftbild ≤ 10 % |
| 3 | Kontinent 10⁶ km² | Biome folgen Temperatur × Niederschlag; ≥ 80 % des Whittaker-Raums besetzt | P · 20 Zufallsorte | Kappa ≥ 0,6 zwischen Biom-Bild und Klima-Zuordnung (Whittaker/Köppen) |
| 4 | ein Planet ~10⁸ km², mit Mangrove, Moor, Küstenwüste | Kontinentalgefälle, Regenschatten | P · Orbit | 1 000 Punkte: Biom passt zum lokalen Klima ≥ 90 %; Orbitbild ↔ Satellitenmosaik ≥ 0,7 |
| 5 | 10² Planeten mit fremden Klimata (Stern, Achse, Atmosphäre) | Biome ohne irdisches Vorbild, doch klimakonsistent | P je Planet | Anteil Planeten, deren Biom-Verteilung aus ihrem Klima vorhersagbar ist ≥ 90 % |
| 6 | jeder Planet jeder Saat | ≥ 30 % der fremden Biome ohne irdisches Gegenstück und doch als Lebensraum gelesen | P an jedem Punkt jeder Welt | 1 000 Saaten × 10 Punkte: Konsistenz ≥ 95 %, Blindbewertung „lebendige Welt“ ≥ 80 % |

#### Keimen, Wachsen, Altern, Sterben — auch ungesehen

`leben.pflanzen.lebenslauf` — **HEUTE 0 / 6**

*misst:* Ob der Spieler Pflanze und Bestand wachsen und sterben sieht und bei der Rückkehr den gewachsenen, nicht den alten Wald findet.

*Beleg:* reverse-J-Größen und Selbstastung stehen als statischer Parameter (phyto-core.js:2899); Verjüngung nur im Labor („Host has no pass“); der Ertragstafel-Richter wurde nie gefahren.

*alte Karte:* vegetation.K3

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Bestand: statische Altersverteilung, stehendes Totholz | reverse-J-Größen, Selbstastung | P · im Wald | Höhenhistogramm aus dem Bild gegen Ertragstafel |
| 2 | 1 Pflanze im Zeitraffer vom Keimling zum Altbaum | Formwechsel jung → alt (Kronenform, Borke) | P · Zeitraffer | Bildreihe 0/10/50/150 Jahre gegen Fotoreihe derselben Art |
| 3 | 1 ha über 10² Jahre | Lückendynamik: Tod → Lichtschacht → Verjüngung | P · Jahrhundert in ≤ 60 s Wanduhr | Stämme/ha und Basalfläche über die Zeit gegen Ertragstafel ±20 % |
| 4 | 10² km² leben ungesehen weiter | wer nach 50 Jahren zurückkehrt, findet den gewachsenen Wald | P · Flug | Rückkehr an 20 Orte nach 50 Spieljahren: Stammzahl, Höhen und Totholz im Band der Ertragstafel für 50 Jahre später (±20 %) an ≥ 90 % |
| 5 | Kontinent: Zeitskalen vom Tag (Blüte öffnet) bis zum Jahrtausend (Grannenkiefer) | Lebensdauer je Wuchsform im Band (Kraut 1 Jahr bis Baum 10³ Jahre) | P | 1 000 Pflanzen: Alter-Größe-Beziehung je Wuchsform im Band der Literatur |
| 6 | jede Pflanze jedes Planeten, auch ungesehen | Zustand an jedem Ort ist eine Funktion der Zeit, nie ein Speicherstand | P; Kosten am Schirm, nie an der Weltgröße | 100 Orte × 5 Zeitabstände: Bestand im Band der Chronosequenz des Bioms ≥ 90 %; fremde Planeten mit Fremdwelt-Probe (R10) |

#### Der Jahreslauf: Austrieb, Blüte, Frucht, Laubfall

`leben.pflanzen.jahreslauf` — **HEUTE 0 / 6** · Kern 1

*misst:* Ob die Jahreszeit die Gestalt der Pflanzen ändert, je Art gestaffelt, aus dem Klima und auf fremden Bahnen.

*Beleg:* Alte Vegetation K5 2/2 im echten Bild: Krone Winter 0,037 × Sommer (Radeon), 0,113 (GTX); Wiese niedriger; Mess-Wiese, GTX stehend p95 16,8 ms. — KARTE: Kern 1 — Richter an beiden Geräten grün (vegetation.K5); Bild-Preis nur an der GTX belegt, die Radeon fehlt.

*alte Karte:* vegetation.K5

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 ◐ | Laubbäume + Wiese, 3 Saisonphasen an einem Ort | Kronendeckung Winter ≤ 0,3 × Sommer, Wiese Winter ≤ 0,5 × Sommer | P · Mess-Wiese | Pixelanteil der Krone im Zeitraffer (Klassen-Maske) |
| 2 | 10 Arten, Phänologie je Art gestaffelt | Reihenfolge gegen Phänologie-Netz (Hasel vor Buche) | P | Kalender des Spiels gegen Beobachtungsreihe: Rangkorrelation ≥ 0,8 |
| 3 | Blüte und Frucht als Ereignis (Wiesenblüte, Kirschblüte, Mast) an 10² Arten | Farbe und Deckung im Wochentakt | P · in der Blüte | 12-Wochen-Bildreihe gegen Webcam-Zeitreihe |
| 4 | Region: Höhe und Breite verschieben den Kalender | Grünwelle 3–4 Tage je 100 m Höhe | P | Austriebsdatum über Höhe und Breite gegen Satelliten-NDVI |
| 5 | Planet: Hemisphären, Trockenzeit, Monsun-Grün | NDVI-Jahreskurve je Biom | P · Orbit | Orbit-Zeitraffer gegen MODIS-NDVI, r ≥ 0,8 |
| 6 | fremde Planeten: Jahre von Tagen bis Jahrhunderten, Doppelsterne | der Jahreslauf folgt der Bahn, nicht dem Erdkalender | P | 100 Planeten: Phänologie folgt der Einstrahlung, r ≥ 0,8 |

#### Dichte und Ferne: vom Halm am Stiefel bis zum Orbit

`leben.pflanzen.dichte` — **HEUTE 0 / 6**

*misst:* Wie viel Pflanze der Spieler auf einmal sieht und wie wahr sie wirkt — gemessen am Bild und an der Bildzeit, nie an Dreiecken.

*Beleg:* P an der Wiese GRÜN (GTX p95 16,8 ms), Tiefe ROT: Saum springt (alte Vegetation K1 0/2), Wald 24 Stämme/ha gegen 370–900, Unterholz 0,029 gegen 0,25–0,78 (K3 0/2), Laub-Kante 0,2635 > 0,22 (PFLICHT-OFFEN A).

*alte Karte:* vegetation.K1 · vegetation.K3 · lod.K1 · pflicht.A · ankunft.K4

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Wiese dicht bis ~20 m, Wald licht | Boden-Sicht-Anteil je Ring 2–5/5–10/10–20 m wie im Wiesenfoto; Laub-Kante im Band | P · stehend an der Wiese | Ring-Bildanteil gegen Foto; Bildpaar gegen REF real-mischwald |
| 2 | Wiese 0–40 m ohne Saum; Wald von innen (370–900 Stämme/ha, Unterholz 0,25–0,78) | Lichtflecken wandern mit der Sonne | P · im Wald-Innern, gehend | Bildpaar Wald-innen gegen REF; Ring-Bildanteil 20–40 m wie 0–20 m |
| 3 | jede Pflanze bis 1 km ohne Sprung | Waldrand und Hang auf 1 km gegen Foto ≥ 0,7 | P · gehend und fahrend | Pop-Zähler unter Bewegung = 0 (Bild-Differenz ohne Kamera-Anteil); Bildpaar 1 km |
| 4 | Horizont 10 km, Wald als Wald bis zum Kamm | Textur und Farbe am Hang wie im Landschaftsfoto | P · Flug | Blindtest Landschaftsfoto ↔ Spiel: Trefferquote ≤ 70 % |
| 5 | Kontinent, ~10¹¹ Pflanzen, jede adressierbar | jede angeflogene Pflanze steht dort, wo man sie aus der Ferne sah | P · Anflug | Anflug 10 km → 1 m: Lage- und Farbabweichung der Ziel-Pflanze 0 |
| 6 | Planet vom Orbit bis zum Halm, ~10¹⁴ Individuen | Orbitbild gegen Satellit, Nahbild gegen Foto | P im durchgehenden Flug Orbit → Halm | Frame p95 ≤ 33 ms über den ganzen Flug; Bildvergleich je Maßstab ≥ 0,7 |

#### Pflanze unter Wind, Last und Berührung

`leben.pflanzen.kraft` — **HEUTE 0 / 6** · Kern 1

*misst:* Ob Pflanzen auf Wind, Schnee und Körper sichtbar antworten — vom Halm am Stiefel bis zum Sturmfeld über 10 km.

*Beleg:* Alte Vegetation K2 1/2: die Böe nah (0–15 m) an einem Gerät als zeitliche Luma-Varianz über dem Rausch-Boden mit Böen-Laufzeit; Staffel 2 (bis 300 m, Gras ↔ Krone, beide Geräte) offen. — KARTE: Kern 1 — die nahe Böe an beiden Geräten grün (vegetation.K2); Bild-Preis an der Radeon fehlt.

*alte Karte:* vegetation.K2

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 ◐ | Böe nah 0–15 m | Böe als wandernde Front, nicht als gleiches Schwingen | P · Mess-Wiese | zeitliche Luma-Varianz über dem Rausch-Boden mit Böen-Laufzeit |
| 2 | Böe über jeden Ring bis 300 m, Gras und Krone gekoppelt | Gras ↔ Krone r ≥ 0,6 längs der Windrichtung; Ruhe → Sturm hebt die Varianz ≥ 3× | P · Ego und Third | Kreuzkorrelation Gras ↔ Krone mit Laufzeit ±20 % |
| 3 | Halme und Sträucher weichen dem Körper und richten sich auf; Schnee beugt Äste | Rückstellzeit und Spur wie im Video | P · gehend durch Wiese und Gebüsch | Bildreihe Durchgang gegen Video derselben Lage |
| 4 | Sturm über 1 km²: Astbruch, Windwurf, fliegendes Laub | Windwurf folgt Windstärke und Wurzelboden | P · im Sturm | Anteil geworfener Bäume über Windstärke gegen Sturm-Statistik |
| 5 | Sturmfeld über 10 km lesbar | Front und Böenwalzen über Wald und Feld | P · Flug im Sturm | Blindtest Sturm-Video ↔ Spiel: Trefferquote ≤ 60 % |
| 6 | jede Pflanze im Blick antwortet auf jede Kraft, Orbit bis Halm, unter fremder Schwere und Luftdichte | Biegung skaliert mit Last, g und Dichte | P über den ganzen Sturm | gleiche Art auf 3 Planeten: Biegung ∝ Last ±20 %; Frame p95 über den Sturm |

### Tiere — Leib, Verhalten, Masse

*Referenz-Korpus (R6, R11):* Foto- und Film-Korpora je Klasse, Masse- und Gangdaten, Ethogramme, Wander-Telemetrie (Movebank)

#### Tierarten aus dem Samen — Land, Luft und Wasser

`leben.tiere.arten` — **HEUTE 0 / 8**

*misst:* Wie viele unterscheidbare Tierarten ein Same in allen Medien hervorbringt — gezählt an den im Spielgang Angetroffenen (Chao1), jede in ihrer Nische — und dass kein Individuum dem anderen gleicht.

*Beleg:* ≈ 8 Leib-Typen von Hand: Wolf, Fuchs, Bär, Hirsch aus fünf Dials (tetrapoda-core.js:62), Singvogel, Star, Bachforelle als Oktaeder, Hummel als Doppelkeil; Individuen byte-gleich (GESTALTEN_JE_REZEPT = 1); der Richter von Sprosse 1 wurde im Fenster nie gefahren.

*alte Karte:* tiere.K4 · haar.K1 · haar.K5 · luftwasser.K1

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | ≈ 10 Leib-Typen von Hand in Land, Luft, Wasser | Art passt zum Lebensraum | P | Spielgang 1 h an 3 Biomen: ≥ 5 Arten im Bild (Klassen-Maske ≥ 200 px) |
| 2 | 10² Arten aus dem Samen, ein Bauplan je Medium; jedes Individuum eigen (Alter, Geschlecht, Fell, Narbe) | Fell, Schuppe, Proportion aus 10 m glaubhaft | P · Herde von 20 im Bild | 1 000 Saaten: Blind-Panel „echt möglich“ ≥ 0,7; Herde: kein Paar im Bild-Embedding näher als zwei Fotos desselben realen Tiers |
| 3 | 10³ Arten, alle Wirbeltier-Klassen | Haut, Feder, Schuppe je Klasse; die Form folgt der Lebensweise | P · Riff mit ≥ 30 Arten im Bild | je Klasse Panel ≥ 0,7; aus Silhouetten: Schlankheit ↔ Reisetempo Rangkorrelation ≥ 0,6 |
| 4 | 10⁴ Arten, + Gliederfüßer, Weichtiere, Nesseltiere | Chitin, Facettenauge, Tentakel im Makrobild; Farbe folgt dem Lichtklima (Gegenschattierung, Rot in der Tiefe) | P · Makro 0,2 m | Makro-Bildpaar gegen Foto-Korpus Panel ≥ 0,7; Klassifikator ordnet Tiefenzone ≥ 80 % |
| 5 | 10⁵ Arten, alle großen Stämme in allen Medien — ≥ 10⁴ im Spielgang angetroffen | Größenverteilung je Klade wie die Erde (viele kleine, wenige große) | P | Zufallsgänge durch alle Medien: Chao1 der angetroffenen Arten ≥ 10⁵; Häufigkeit je Massen-Dekade der Angetroffenen gegen die reale Verteilung ≤ Faktor 2 |
| 6 | 10⁶ Arten je Planet | jede Art mit Nische, in der der Spieler sie antrifft; Lebensweise in 60 s benennbar | P | Zufallsgänge: Chao1 ≥ 10⁶; 1 000 angetroffene Arten: 2AFC gegen den Foto-Korpus ≤ 70 %, in ihrer Nische angetroffen ≥ 0,9, paarweise trennbar ≥ 95 % |
| 7 | 10⁷ Arten je Planet (Erd-Maß ≈ 7,8·10⁶ Tierarten) | Faunen verschiedener Planeten verschieden UND je für sich glaubhaft | P | 100 Saaten: Chao1 je Planet ≥ 10⁷ aus Zufallsgängen; Faunen paarweise im Bild-Embedding trennbar ≥ 0,95 |
| 8 | jeder Same eine eigene Fauna ohne Decke; fremde Baupläne aus fremder Schwere, Atmosphäre und Chemie | fremde Art folgt aus ihrer Welt | P an jedem Ort | 100 fremde Saaten: Fremdwelt-Probe (R10) an den angetroffenen Arten; im Bild ununterscheidbare Duplikate ≤ 1 % |

#### Leib und Fortbewegung über Masse-Dekaden und Medien

`leben.tiere.bewegung` — **HEUTE 0 / 8**

*misst:* Über wie viele Größenordnungen der Körpermasse und wie viele Medien ein Tier physikalisch wahr läuft, fliegt, schwimmt, gräbt, klettert.

*Beleg:* Gang aus Froude für 4 Säuger, Schlupf max 0,011 in 25 Läufen — headless (alte Tiere K3), am Gerät halb; der Fisch pendelt als starrer Leib 2,5 Hz (tetrapoda-core.js:2685).

*alte Karte:* tiere.K3

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Bauplan, 4 Gattungen, 10–300 kg, laufen | Fuß steht (Gleiten ≤ 5 % der Schrittlänge), Gangwechsel bei der Froude-Zahl der Natur ±10 % | P · Third aus 10 m | Fußgleiten und Gangwechsel aus der Third-Aufnahme im Fenster |
| 2 | 3 Dekaden 1–10³ kg: Vierbeiner, Laufvogel, Fisch mit Körperwelle | Fußfall gegen Muybridge ±0,05; Strouhal 0,2–0,4 | P · Schwarm von 300 im Bild | Fußfall-Diagramm und St = f·A/U aus dem Ausgabe-Bild |
| 3 | + Fliegen und 5 Schwimmweisen (Aal, Barsch, Thun, Rückstoß, Flossenflug) aus der Körperform | Schlagfrequenz ±20 % zur Allometrie; die Weise folgt dem Leib, nicht einer Zuweisung | P · Trupp oder Schwarm von 3 000 | 100 Stichproben-Arten: Frequenz gegen Pennycuick; Blindtest Schwimmweise ≥ 80 % |
| 4 | + Kriechen, Springen, Klettern, Graben; Säuger und Vögel im Wasser (Fluke, Stoßtauchen) | Sprungbahn ballistisch ±10 %; das Medium antwortet (Bugwelle, Staub, Sediment) | P | je Medium 10 Arten im Band ≥ 0,8; Spur folgt der Bahn ±0,5 m |
| 5 | 6 Dekaden 1 g – 1 t, Insekt bis Bär | Tripod-Gang, Flügelschlag 100–200 Hz als Unschärfe | P · Makro-Zeitlupe | Panel gegen Hochgeschwindigkeits-Referenz ≥ 0,7 |
| 6 | 11 Dekaden 1 mg – 70 t, alle Medien und Gelände (Hang, Fels, Schnee, Schlamm, Strömung) | ohne Durchdringung, Gang im Band | P | 1 000 Arten × 5 Gelände: Anteil ohne Durchdringung, Gleiten ≤ 5 %, Gang im Band ≥ 0,95 |
| 7 | 10³ Zufalls-Arten je Saat, jede bewegt sich nach ihrem Leib | Reynolds-Skalierung: Kleinstes kriecht ohne Gleiten, Großes gleitet | P | Gleitstrecke nach Schlag-Stopp ±30 % zur Re-Theorie; St im Band bei ≥ 95 % |
| 8 | fremde Schwere 0,1–5 g, dünne bis dichte Atmosphären, Flüssigkeiten jenseits Wasser | Gang ∝ √(g·L); Flug nur, wo Dichte und g ihn tragen | P | gleiche Art auf 3 Planeten: Gangwechsel-Tempo ±10 %; Gegenprobe: in dünner Luft bleibt sie am Boden |

#### Verhalten aus Bedürfnis, Sinn und Leib

`leben.tiere.verhalten` — **HEUTE 0 / 7**

*misst:* Ob das Verhalten einer BELIEBIGEN Art aus ihrem Leib, ihren Sinnen und ihrer Welt folgt — an Stichproben-Arten, nie an Akt-Listen.

*Beleg:* Jagd-Kreislauf, Furcht mit Gedächtnis, Ethogramm aus Bedürfnis-Pegeln (tetrapoda-core.js VERHALTEN): Rudel reißt 18/60, Budget Hirsch ruhen 0,409/0,4 — headless, im Fenster nie gemessen.

*alte Karte:* tiere.K1 · tiere.K2 · tiere.K4 · oekologie.K3

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 4 Gattungen, ≈ 10 Akte, 2 Sinne | Zeitbudget ±20 % am Ethogramm; Riss-Quote Rudel gegen Hirsch 20–40 % (MacNulty) | P · Wolfsrevier | Zeitraffer 24 Spielstunden im Fenster |
| 2 | eine Art mit vollem Ethogramm (≥ 30 Akte: sichern, Alarmruf, Spiel, Komfort, Markieren, Drohen) | Alarm-Kette ≤ 1 s, Fluchtdistanz nach Feldmaß | P · Herde im Bild | 1 h Beobachtung: Häufigkeiten gegen Feld-Ethogramm, Rangkorrelation ≥ 0,7 |
| 3 | 10² Stichproben-Arten aus dem Samen | Räuber pirscht, Beute sichert, Aasfresser kreist — ohne Zuweisung von Hand | P | 100 Saaten, je 1 h: Ethologe ordnet die Lebensweise blind zu ≥ 0,8 |
| 4 | 5 Sinne: Richtungsgehör, Geruch im Wind, Vibration, Wärme, Sicht | Tiere hören den Spieler, wittern gegen den Wind | P | Anschleich-Probe: Entdeckungsdistanz mit Wind / gegen Wind ≥ 3 |
| 5 | Gedächtnis über Wochen: Orte, Individuen, Gefahr | ein bedrohtes Tier meidet Ort und Spieler | P | nach 7 Spieltagen: Meidequote ≥ 0,8 beim Individuum, ≤ 0,2 bei Fremden |
| 6 | 10⁴ Stichproben-Arten; Sinne jenseits des Menschen (UV, Magnetfeld, Echo, Elektro) | Fledermaus jagt im Dunkeln, Zugvogel hält Kurs bei Bewölkung | P | Fang-Quote der Echo-Jäger bei 0 lux = Tag ±20 %; blinde Zuordnung an 10⁴ Saaten ≥ 0,8 |
| 7 | jede Art jedes Planeten | Verhalten folgt aus Leib, Sinn und Welt, auch unter fremden Sinnen | P | 100 fremde Saaten: Lebensweise blind benannt ≥ 0,8; Gegenprobe Sinn aus → Verhalten bricht |

#### Lebenszyklus: Geburt, Aufzucht, Balz, Brut, Tod

`leben.tiere.lebenszyklus` — **HEUTE 0 / 7**

*misst:* Ob der Spieler Brunft, Balz, Brut, Aufwachsen und Altern SIEHT — von einer Art bis zu den Lebenszyklen aller Klassen.

*Beleg:* Geburt und Tod als Zahl je Revier mit Holling-III-Riss und Alterstod (BESTAND_GESETZ, tetrapoda-core.js:2177) — headless; sichtbares Wachstum, Brunft, Nest: nichts.

*alte Karte:* oekologie.K2

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Geburt und Tod als Bestand je Revier | Bilanz mit Holling-III-Riss, Alterstod | P | Bestand je Revier über 3 Spielstunden im Band, im Fenster |
| 2 | sichtbares Jungtier, das wächst | Proportion jung ↔ alt allometrisch (großer Kopf, lange Beine beim Kitz) | P | Bildpaar Kitz/Hirsch Panel ≥ 0,7; Jungtiere ≥ 10 % einer Herde im Frühsommer |
| 3 | Brunft, Balz, Revierkampf zur Jahreszeit der Art | Röhren im Herbst, Balzflug im Frühling | P · Jahres-Zeitraffer | Ereignisse im Bild je Monat, Gipfel im Monat der Natur ±1 |
| 4 | Nest, Bau, Brut, Laich, Brutpflege | Nest aus Stoffen des Orts, Eltern füttern | P | 10 Spielstunden Frühling: Brutpaare mit sichtbarem Nest ≥ 0,8, Fütterungsflüge je Stunde im Band |
| 5 | Lebenszyklen aller Klassen an 10² Stichproben-Arten: Metamorphose, Larve, Laichzug | Stadien in Reihenfolge, Dauer ±50 % | P | Stadienfolge im Bild gegen die beschriebene Entwicklung der Klasse (Ei → Larve → Puppe → Imago) richtig ≥ 0,9 |
| 6 | 10⁴ Stichproben-Arten, Fortpflanzungs-Strategie aus dem Genom | viele kleine ↔ wenige große Junge folgt Masse und Umwelt | P | Wurfgröße und Brutpflege über Körpermasse im Band der realen Allometrie |
| 7 | jedes Tier jedes Planeten, fremde Fortpflanzung (Knospung, Generationswechsel) | der Bestand erneuert sich ohne Skript | P | 100 fremde Saaten: Bestand über 100 Generationen getragen; Gegenprobe Fortpflanzung aus → Aussterben |

#### Herde, Schwarm, Pulk: die Masse im Bild

`leben.tiere.masse` — **HEUTE 0 / 8**

*misst:* Wie viele einzeln lebende Glieder ein Kollektiv im Bild trägt und wie wahr seine Form ist — an Land, in der Luft und im Wasser; die EINZIGE Leiter für Leiber im Bild.

*Beleg:* Kohäsion fliehend 0,981 headless, Radeon ROT (alte Tiere K1 1/2); Star-Trupp 60–140 gebaut, am Gerät ungemessen; ~30 Fische einzeln, kein Fischschwarm; höchstens 20 gezeichnete Leiber (dirigent-kern.js maxCreatures).

*alte Karte:* tiere.K1 · tiere.K5 · luftwasser.K2 · luftwasser.K5

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 10 Glieder: Rudel, Kahlwild | Kohäsion wandernd ≥ 0,9, Flucht ≥ 0,8, Ausrichtung Φ ≥ 0,8 | P · Ego auf 40 m | Herde flieht als EIN Pulk im Bild |
| 2 | 10² Glieder: Star-Trupp, Fischschwarm | Dichte-Welle, Leittier, kein Glied im anderen | P · der Trupp im Bild | Φ und Kohäsion aus den gezeichneten Leibern; Silhouette gegen Murmuration-Film |
| 3 | 10³: Köderball, Gnu-Herde am Fluss | Räuber teilen den Schwarm (Fontäne, Vakuole); topologisch 6–7 Nachbarn | P · Angriff im Bild | Konvexität und Lückenfläche gegen Unterwasser-Film; Nachbarzahl im Band Ballerini |
| 4 | 10⁴ | Korrelationslänge wächst mit der Schwarmgröße; Fluchtwelle mit realem Tempo | P · während der Welle | Korrelationslänge/Größe konstant ±20 % über 10²–10⁴ (Cavagna); Wellentempo ±30 % |
| 5 | 10⁵: Gnu-Strom bis zum Horizont, Vogelfelsen, Krillwolke im Sichtkegel | keine Kante zwischen nahen Leibern und ferner Wolke; die Masse frisst sichtbar | P · Fahrt durch die Wolke | Bild-Flicker an der Sichtgrenze < 1 % der Pixel; Grashöhe nach Durchzug sinkt messbar |
| 6 | 10⁶: Murmuration über dem Ried, Sardinenzug über 10 km | Dichtewellen 20–40 m/s, der Falke reißt ein Loch, das sich schließt | P · die ganze Wolke im Bild | Zoom-Probe an 10 Stellen: Einzeltier mit eigenem Schlag; Draufsicht gegen Luftbild des Sardinenzugs |
| 7 | 10⁹: Heuschreckenschwarm | die Front frisst messbar | P · die Front im Bild | Kahlfraß je Stunde im Band der FAO-Werte; Horizont-Bild Panel ≥ 0,7 |
| 8 | Krill-Maß 10¹⁴ Leiber auf dem Planeten, jeder nah betauchbar | die Dichte stimmt auf jeder Höhe | P als p95 über die ganze Fahrt | Zoom Orbit → Taucherbrille: Dichte je Zelle ±10 % über alle Stufen, keine Ladepause |

#### Wanderung und Raum

`leben.tiere.wanderung` — **HEUTE 0 / 7**

*misst:* Über welche Strecken ein Tier im Spiel zieht, ob die Route aus Futter und Wetter folgt und ob es heimfindet.

*Beleg:* Leine 18 m × Körpergröße (tetrapoda-core.js:225), Wildwechsel zur Tränke aus Durst — headless; Streifgebiet im Fenster nie gemessen; keine Wanderung.

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 10 m: Leine um den Geburtsort | Aufenthalt folgt dem Lebensraum | P | Aufenthaltsfläche eines Individuums über 1 Spieltag im Fenster |
| 2 | 10² m: Revier, Fluchtstrecke, Wildwechsel zur Tränke | Weg aus Durst | P | Streifgebiet eines Individuums über 1 Spieltag |
| 3 | 10³ m: Streifgebiet nach Feldmaß (Rothirsch 1–10 km²) | Wildwechsel als Pfad im Boden sichtbar | P | Spur über 7 Spieltage: Streifgebiet im Band der Telemetrie ±Faktor 2 |
| 4 | 10⁴ m: Sommer- ↔ Wintereinstand | Höhenwanderung folgt dem Schnee | P · Jahres-Zeitraffer | Höhen-Median der Art Winter vs. Sommer im Band |
| 5 | 10⁵ m: Gnu-Zug folgt dem Regen, Lachs zieht stromauf | Route aus Gras und Regen, nie aus Skript | P | Regen verlegt → Zugroute verlegt sich (Gegenprobe); Lachs findet den Geburtsbach ≥ 0,9 |
| 6 | 10⁶–10⁷ m: Vogelzug über Kontinente | Kurs aus Magnet-, Sternen- und Sonnenkompass, Rast an Feuchtgebieten | P · Ankunft an jedem Ort der Route | Individuum über 1 Spieljahr: Strecke, Rastplätze, Ankunft im Brutgebiet ±7 Spieltage |
| 7 | 7·10⁷ m: planetare Wanderung (Küstenseeschwalbe ≈ 70 000 km/Jahr), auf jedem Planeten | Zugrouten verschieben sich mit dem Klima | P | Klima-Zeitraffer: Zugscheide verschiebt sich mit der Isotherme |

#### Tier und Spieler: Begegnung, Reittier, Domestikation, Tier-Sein

`leben.tiere.mensch` — **HEUTE 0 / 7**

*misst:* Wie tief der Spieler mit Tieren umgehen kann — bis dahin, dass er jedes Tier einer Stichprobe mit dessen Leib und Sinnen SPIELT. Die Bindung EINES Tiers zählt mensch.nahrung.tier; hier zählt der Spieler mit und als Tier.

*Beleg:* Fluchtdistanz aus dem Furcht-Gesetz und ein gebundenes Tier folgt 600 s (alte Ökologie K3/K5) — headless; das Rudel pirscht und umstellt den Spieler im Bild an beiden Geräten (oekologie.K4), die Annäherungs-Probe von Sprosse 1 ist ungefahren; Reit-, Haus-, Spiel-Tiere: nichts.

*alte Karte:* oekologie.K3 · oekologie.K4 · oekologie.K5

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Wildtier reagiert auf den Spieler, 4 Gattungen | Fluchtdistanz je Art im Feldband ±50 % | P | Annäherungs-Probe im Fenster |
| 2 | Fährte, Losung, Beobachten, Jagd | Spur und Losung führen zum Tier | P | einer frischen Spur folgen → Tier in ≤ 10 min ≥ 0,8 |
| 3 | Haus- und Reittier: Hund folgt, Pferd reitbar | Gang des Reittiers aus seinem Leib, nicht als Fahrzeug | P · Reiter in Bewegung | Fußfall des Pferds unter Reiter ±0,05; Hund kehrt auf Ruf ≥ 0,9 |
| 4 | Domestikation aus der Wildform über Generationen | Hund aus Wolf, Rind aus Ur sichtbar abgeleitet | P · Zeitraffer | Bild-Embedding: Haustier liegt näher an seiner Wildform als an jeder anderen Art ≥ 0,9 |
| 5 | der Spieler WIRD ein Tier (10 Arten) | Steuerung, Tempo, Sprung aus dessen Leib | P · Wechsel ohne Ladepause | Tempo und Sprung ±10 % zum wilden Artgenossen |
| 6 | 10² Stichproben-Arten spielbar mit ihren Sinnen (Adler sieht scharf, Hund riecht, Maulwurf tastet) | die Wahrnehmung ist die des Tiers | P | Blind-Panel erkennt die Art an der Ego-Aufnahme ≥ 0,7 |
| 7 | jedes Tier jedes Planeten spielbar, fremde Sinne als Perspektive | Leib und Sinn aus dem Samen | P | 100 fremde Saaten: jede Art spielbar, Tempo ±10 %, Panel ≥ 0,7 |

### Leben im Wasser

*Referenz-Korpus (R6, R11):* Unterwasser-Fotos und -Film, Riff- und Plankton-Erhebungen, Größenspektren

#### Lebensräume im Wasser entstehen aus Physik

`leben.wasser.lebensraeume` — **HEUTE 0 / 7**

*misst:* Welcher Anteil der Wasser-Lebensräume (Messliste 15: Bach, See, Küstenflachwasser, Ästuar, Kelp, Seegras, Mangrove, Riff, offene See, Polarmeer, Tiefsee-Ebene, Hydrothermalquelle, Walfall, Höhle, Gezeitenzone) aus der Physik einer Saat entsteht, samt seiner Flora.

*Beleg:* 1 von 15: der Bach-Kolk mit Forellen am Strömungsschatten — headless, Preis an der Fisch-Pose nie gemessen; Uferflora teils; das Meer ist Höhe und Wasserkörper, kein Lebensraum.

*alte Karte:* luftwasser.K3

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 von 15: Bach-Kolk mit eigener Fauna | Stand am Strömungsschatten (Fausch 1984) | P · am Bach | Lebensräume mit eigener Fauna im Bild zählen |
| 2 | 3 von 15: Bach, See, Küstenflachwasser mit Uferflora (Schilf, Erle, Weide) | See-Fauna ohne Strömung; Ufer-Zonierung; Landarten im Wasser 0 | P je Lebensraum | Klassifikator erkennt den Lebensraum ≥ 80 %; Ufer-Stichprobe ≥ 90 % |
| 3 | 7 von 15: + Kelpwald, Seegras, Mangrove, Gezeitenzone | sie stehen, wo die Physik sie verlangt (Kelp kalt mit Auftrieb, Seegras nach Lichttiefe) | P · im Kelpwald | 50 Saaten: Lage gegen Meeresklima ≥ 90 %; Tauchbild gegen Unterwasserfoto ≥ 0,7 |
| 4 | 11 von 15: + Riff, offene See, Polarmeer, Ästuar | das Riff nur, wo es warm, klar und flach ist | P · am Riff | 50 Saaten: Fehlplatzierung < 5 % der Riff-Fläche; Klassifikator erkennt das Riff ≥ 80 % |
| 5 | 15 von 15, auch die dunklen | Leben ohne Licht von Chemie, Biolumineszenz | P · im Abstieg 0 → 4 000 m | Faunenwechsel je Zone gegen das Referenz-Profil (Epi- bis Bathypelagial) |
| 6 | Erd-Maß: 30–100 unterscheidbare Provinzen je erdähnlicher Saat (Erde 62) | Grenzen folgen Temperatur, Salz, Licht, Tiefe | P | 200 Saaten: Lebensraum-Karte gegen das Nischenfeld, Fehlplatzierung < 5 % |
| 7 | fremde Ozeane: Methan-Seen, Ozeane unter Eis, Superdruck-Meere | eigene Lebensräume aus fremder Chemie durch dieselben Gesetze | P je Saat | ≥ 50 % der fremden Saaten mit bewohntem Lebensraum ohne Erd-Gegenstück; 0 % bewohnte Zonen ohne Energiequelle |

#### Das Bild unter Wasser: Licht, Trübe, Leib

`leben.wasser.bild` — **HEUTE 0 / 7**

*misst:* Wie wahr Licht, Wasserfarbe und Lebewesen unter Wasser aussehen, von der Bachforelle bis zur Tiefsee fremder Planeten.

*Beleg:* Sicht 19,6 m am Bach, Absorption und Rückstreuung je Kanal nach Gordon 1975 (stamm/bild-sicht.js:217) — headless; 3 feste Wasserkörper, das Meer liest den See-Körper; Fischleib ein Oktaeder.

*alte Karte:* gelaende.K3 · leib.K3

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Sicht unter Wasser an Bach, See, Fluss | Absorption und Rückstreuung je Kanal | P | Sichtweite in m an fester Pose gegen das Band des Gewässertyps |
| 2 | Fischleib als Art lesbar | Flossen, Schuppenglanz, Seitenlinie | P · 1 m vor einem Schwarm | Bildpaar 1 m vor dem Fisch: Blindtest erkennt die Art ≥ 80 % |
| 3 | Lichtfinger und Kaustik im Flachwasser | folgen Welle und Sonnenstand | P · bei Seegang | Richtung der Lichtfinger ±5° zur Sonne; Kaustik-Kontrast im Band des Fotos |
| 4 | Wasserfarbe je Ort: alle 14 Jerlov-Typen | Plankton und Schwebstoff AM ORT färben, die Mündung trübt | P | Farbmessung gegen die Jerlov-Klasse des Orts: ΔE ≤ 10 je Typ |
| 5 | Tiefe 0 → 1 000 m | Rot fällt, dann Grün, dann alles; Biolumineszenz trägt das Dunkel | P · im Abstieg | Spektrum am Auge je 100 m gegen Ozean-Profil, Fehler ≤ 20 % |
| 6 | Riff und Kelpwald im Nahbild: Tausende Formen je Bild, Meeresschnee | kaum vom Foto zu trennen | P · am Riff | Panel unterscheidet Spiel und Foto in ≤ 60 % |
| 7 | jedes Wasserbild jedes Planeten | Fotorealismus unter jeder Sonne und Chemie | P je Szene | erdähnlich: Blindtest 100 Szenen ≤ 55 %; fremd: gegen offline spektrales Path-Tracing ΔE ≤ 5 |

#### Primärproduktion und Größenspektrum im Wasser

`leben.wasser.netz` — **HEUTE 0 / 6**

*misst:* Ob Licht und Nährstoff das Plankton tragen, das Plankton die Fische und die Fische die Räuber — bis zum Größenspektrum vom Plankton zum Wal.

*Beleg:* Fische folgen dem Pegel (0,335 → 0,363) und fliehen ≥ 3 m — headless; Plankton nur als Kommentar zur Trübe des See-Körpers (foundry-core.js:163), kein Feld.

*alte Karte:* luftwasser.K3

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Fisch liest Pegel und Spieler | Fisch-Hub ≥ 0,8 × Pegel-Hub, Fluchtabstand ≥ 3 m | P · am Bach | Hub und Flucht aus dem Bild |
| 2 | Licht × Nährstoff → Plankton-Feld | Blüte im Frühjahr, wo Auftrieb oder Mündung Nährstoff bringt | P · Zeitraffer | Chlorophyll-Feld über ein Spieljahr gegen Ozeanfarben-Zeitreihe: Phase der Blüte ±1 Monat |
| 3 | Plankton → Schwarmfisch → Räuber | Fischdichte folgt der Primärproduktion | P | räumliche Korrelation Fischbiomasse ↔ Plankton r ≥ 0,6 an 50 Orten |
| 4 | volles Größenspektrum vom Plankton bis zum Wal | Biomasse je logarithmischer Größenklasse etwa gleich (Sheldon) | P | normalisiertes Biomasse-Spektrum log-log: Steigung −1 ±0,2 |
| 5 | Planet: Planktonblüten im Orbitbild | Blüten folgen Nährstoff und Licht | P · Orbit | Orbit-Zeitraffer gegen Satelliten-Chlorophyll-Karten, r ≥ 0,7 |
| 6 | jeder Ozean jedes Planeten, fremde Primärproduktion (Chemosynthese, fremdes Licht) | das Größenspektrum hält auch fremd | P | 100 fremde Saaten: Spektrum-Steigung −1 ±0,3; Leben nur, wo Energie fließt |

#### Rhythmen des Wasserlebens: Tag bis Jahrtausend

`leben.wasser.rhythmen` — **HEUTE 0 / 6**

*misst:* Über welche Zeitspannen das Wasserleben wahr wirkt — von der Flucht in Sekunden bis zu Bestands-Regimen über Jahrzehnte.

*Beleg:* Sekunden: Schwanzschlag, Flucht, Heimkehr nach 8 s — headless, Preis nie gemessen; keine Tagesuhr für Fische.

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Sekunden: Schwanzschlag, Flucht, Heimkehr | Fisch kehrt nach Ruhezeit heim | P | Heimkehr ≥ 60 % im Fenster |
| 2 | Tag: Vertikalwanderung (die größte tägliche Tierwanderung der Erde) | Zooplankton steigt nachts, sinkt am Tag | P | Tiefe der Streuschicht Mittag gegen Mitternacht, Hub ≥ 200 m |
| 3 | Jahr: Blüte, Laichzug, Walwanderung | Lachse ziehen flussauf, Wale zwischen Pol und Tropen | P · Zeitraffer | Ankunft der Züge in ihrem Monat ±1 |
| 4 | Jahrzehnt: Riff-Bleiche und Erholung | Erholung über 10–15 Jahre, wenn die Wärme weicht | P · Zeitraffer | Korallendeckung über die Zeit gegen Feld-Zeitreihen ±50 % |
| 5 | Jahrhundert: Bestands-Regime wechseln (Sardine ↔ Sardelle) | Wechsel mit Wassertemperatur, ohne Skript | P · Zeitraffer | Periode des Regimewechsels 40–80 Spieljahre; Gegenprobe ohne Temperatur-Schwankung kein Wechsel |
| 6 | jeder Rhythmus jedes Ozeans jedes Planeten (Gezeiten fremder Monde, Jahre anderer Bahnen) | der Takt folgt Bahn und Gezeit | P | 100 Planeten: Wanderung und Blüte folgen Einstrahlung und Gezeit r ≥ 0,8 |

### Ökosysteme, Kreisläufe, Zerfall

*Referenz-Korpus (R6, R11):* publizierte Nahrungsnetze, Arten-Areal- und Rang-Häufigkeits-Kurven, Chronosequenzen der Sukzession, Stoffbilanzen

#### Das Nahrungsnetz: Breite, Stabilität, Wahrheit

`leben.oeko.netz` — **HEUTE 0 / 7**

*misst:* Wie viele Arten aus Saaten ein Netz bilden, das sich hält, wie nah seine Kennzahlen an realen Netzen liegen und ob die Arten in Gestalt UND Rolle verschieden sind.

*Beleg:* 4 Land-Säuger mit Beute nach Masse (beuteMasse 2,0, tetrapoda-core.js:166), Bestand aus Nahrung × Lebensraum (alte Ökologie K2 2/2) — headless, unter P im Fenster nie gefahren.

*alte Karte:* oekologie.K2

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 4 Säuger-Arten, 3 Ebenen, ein Tal | Bestand aus Nahrung × Lebensraum | P · Tal mit allen 4 Arten im Bild | 8 Saaten im Fenster: jede Art in [⅓×, 3×] des Starts über 6 Spielstunden |
| 2 | 10¹ Arten, 4 Ebenen, ein Biom | Fressen und Gefressenwerden im Bild; das Netz hält | P · Waldrand, ≥ 5 Arten im Bild | Transekt im Spielgang, 32 Saaten × 100 Spieljahre im Raffer: jede Art wird am Ende wieder angetroffen in ≥ 80 % der Saaten; beobachtete Fraß-Paare je Art im Band realer Wald-Netze |
| 3 | 10² Arten je Biom aus der Saat | Ebenen, Omnivorie, Räuber-Beute-Massenverhältnis im Band | P | Transekt-Zählung an 32 Saaten: aus angetroffenen Arten und beobachteten Fraß-Ereignissen die Kennzahlen des Netzes (Ebenen, Omnivorie, Massenverhältnis) im 90-%-Band von ≥ 20 realen Netzen UND 50 Zufallspaare in Gestalt UND Rolle trennbar ≥ 90 % |
| 4 | 10³ Arten, mehrere Biome eines Kontinents, Wanderer verbinden sie | sichtbares Fressen und Gefressenwerden | P · Zufallsort | 10 Spielminuten am Zufallsort: ≥ 30 sichtbar verschiedene Arten, die fressen oder gefressen werden |
| 5 | 10⁴ Arten, Meer und Land gekoppelt (Lachs düngt Wald, Seevögel düngen Inseln) | Stoff fließt über die Grenze | P | Gegenlauf ohne Lachszug: Wuchs am Ufer sinkt, Intervall ohne 0 |
| 6 | 10⁶ Arten, ein Planet, vom Tiefseegraben bis zur Wüste | das Netz hält über 1 000 Spieljahre | P an jedem Ort | 64 Saaten: kein Kollaps; Paarprobe ≥ 95 % |
| 7 | 10⁷ Arten je Planet, jeder Planet eines Systems mit eigener Biosphäre, fremde Biochemie | gleich schlüssig wie die Erde | P · Ankunft auf jedem Planeten | 64 Saaten × 3 Planetentypen: Fremdwelt-Probe (R10) am beobachteten Netz; Kennzahl-Tafeln aus dem Transekt trennen Fachleute nicht über Zufall von realen |

#### Vielfalt am Ort und ihre Gesetze

`leben.oeko.vielfalt` — **HEUTE 0 / 8**

*misst:* Wie viele Arten der Spieler an einem Ort je Zeit antrifft und ob die Verteilung den Gesetzen der Natur gehorcht (Arten-Areal, Breitengradient, Rang-Häufigkeit, Biomasse-Anteile).

*Beleg:* Alte Tiere K5 Staffel 1: ≥ 3 Tier-Sichtungen im Ausgabe-Bild je 10 Spielminuten an einem Gerät (Klassen-Maske tier ≥ 200 px); Herde ≥ 20 und 150 Tiere im Ring offen. — KARTE: 0 — Sichtungen nur an einem Gerät gebucht (tiere.K5).

*alte Karte:* tiere.K5

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | ≥ 3 Tier-Sichtungen je 10 Spielminuten | Art passt zum Lebensraum (Hirsch Wiese, Bär Fluss) | P | Spielgang 10 min, Tier im Bild ≥ 200 px |
| 2 | 10¹ Arten je Hektar mit Vögeln, Insekten, Pflanzen; 150 Tiere im 500-m-Ring | Fauna wechselt mit Biom und Uhr | P · Ego und Third | Arten je ha in 10 min gegen Feldkartierung ±Faktor 2 |
| 3 | 10² Arten je Hektar; ≥ 50 Pflanzenarten zugleich im Bild | Tag ≠ Nacht, Sommer ≠ Winter | P | Arten-Akkumulationskurve gegen Feldkurve; Jaccard Tag/Nacht und Sommer/Winter ±0,15 |
| 4 | 10³ Arten je Hektar Regenwald, Kronendach anders als Boden | Gliederfüßer tragen die Masse der Arten | P · Regenwald-Hektar | Zählung je Hektar gegen Regenwald-Inventur ±Faktor 2 |
| 5 | Flächen 1 ha … 10⁴ km² | Arten-Areal S = c·A^z (Land z 0,15–0,35, Meer 0,15–0,4); Rang-Häufigkeit lognormal | P · Flug über die Flächen | z aus Zählungen im Spiel, im Band bei ≥ 80 % der Saaten |
| 6 | Planet längs eines Meridians, Land und Meer | Breitengradient Tropen ÷ Tundra ≥ 10; Biomasse Pflanzen ~80 %, Tiere < 1 % | P · Flug längs des Meridians | Arten je Fläche über die Breite; Biomasse-Anteile gegen Bar-On 2018 |
| 7 | Endemiten-Zentren: Inseln, Täler, Becken | Artenwechsel zwischen getrennten Räumen größer als innerhalb | P | 200 Saaten: Beta-Diversität getrennt > verbunden; Endemiten-Anteil Insel > Festland |
| 8 | jeder Ort jedes Planeten trägt seine Vielfalt, ohne dass der Spieler sie ruft | sie lebt ohne den Spieler weiter | P · Ankunft an beliebigem Ort | Rückkehr nach 1 Spieljahr an 100 Orte: Bestand verändert nach Saison und Jagd, nie zurückgesetzt |

#### Dynamik: Zyklen, Kaskaden, Ausbrüche, Invasionen

`leben.oeko.dynamik` — **HEUTE 0 / 7**

*misst:* Ob das Netz in der Zeit lebt — Schwingungen, Kaskaden und Ausbrüche entstehen aus der Bilanz, nie aus einem Zeitplan.

*Beleg:* Wölfe weg → Hirsche +0,448 [0,321; 0,536], Jungwuchs −0,279 über 8 Saaten (alte Ökologie K1 2/2) — headless, im Fenster nie.

*alte Karte:* oekologie.K1

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | ein Tal, Spielstunden | Wölfe weg → Hirsche hinauf, Jungwuchs hinab | P · Zeitraffer im Fenster | Kaskaden-Richtungen mit Intervall, das 0 nicht schneidet |
| 2 | ein Tal, 10 Spieljahre, sichtbar | die Kaskade im Bild: Jungwuchs am Fluss | P · Zeitraffer | Bildpaar gleicher Kamera vor/nach 10 Spieljahren ohne Wölfe: Jungwuchs-Deckung −≥ 20 % gegen Gegenlauf |
| 3 | ein Biom, 10² Spieljahre | Räuber-Beute-Schwingung mit Phasenversatz | P · 100 Spieljahre in ≤ 60 s Wanduhr | Periode 8–11 Jahre, Räuber hinkt 1–2 Jahre nach (Hudson-Bay-Reihen) |
| 4 | Landschaft 10³ km² | Massenvermehrung bricht aus und zusammen | P · mitten im Ausbruch | Ausbruch in ≥ 1 von 8 Saaten je 50 Spieljahre; braune Waldfläche gegen Luftbild-Reihe eines Borkenkäfer-Ausbruchs |
| 5 | Küste und Meer: Kaskade Otter ↔ Seeigel ↔ Kelp, Überfischung → Quallen | eine Störung läuft 3 Glieder weit | P · Zeitraffer | Räuber entfernt: Kelpfläche fällt nach dem Muster der Feldstudien (Estes & Palmisano 1974) |
| 6 | Kontinent, 10³ Jahre | eingeschleppte Art breitet sich als Front aus und baut das Netz um | P | Front-Tempo im Band realer Invasionen (10–60 km/Jahr) |
| 7 | jeder Planet, 10⁴ Jahre, alle Dynamiken zugleich | Zyklen, Ausbrüche, Kaskaden emergent und ohne Skript | P · Zeitsprung ≤ 5 s | 64 Saaten: Bestandsreihen schwingen nur, wo Räuber-Beute-Paare es tragen (Gegenprobe Paar entfernt → Zyklus weg) |

#### Zerfall: Aas, Totholz, Pilz, Boden

`leben.oeko.zerfall` — **HEUTE 0 / 6**

*misst:* Ob alles Tote sichtbar, in der Zeit und stofflich in den Kreislauf zurückkehrt.

*Beleg:* Kadaver wird gewittert, gefressen, sinkt (tetrapoda-core.js:168); gedüngt wird nur ein Tod von Spieler-Hand (stamm/kreatur-leben.js:918); Totholz und Konsolen-Pilze als zeitlose Gestalt (foundry-core.js:5155).

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Säuger-Kadaver | gewittert, gefressen, sinkt in die Erde; JEDER Tod düngt die Zelle | P · Kadaver mit Fressern im Bild | Kadaver-Masse sinkt mit Fresser-Zahl; Nährstoff steigt nach jedem Tod (Wolf, Alter, Spieler) |
| 2 | 10 Kadaver jeder Größe zugleich | Verwesungsstufen; Ankunftsfolge der Aasfresser emergent aus Witterung und Anflug | P · 10 Kadaver im Bild | Bildreihe 0/3/10/30 Tage gegen forensische Referenz; Gilde-Folge im Band von Kamerafallen-Studien |
| 3 | Totholz eines Waldes über Jahrzehnte | Zerfallsklasse WÄCHST, Moos, Konsolen-Pilz, Ammenstamm mit Sämlingen | P · Altwald im Bild | Bildreihe 0/10/40 Spieljahre am selben Stamm; Totholz 10–30 % der Biomasse |
| 4 | Pilze eines Bioms | Fruchtkörper nach Regen × Temperatur, Hexenringe | P | Pilzdichte 3–10 Tage nach Regen ≥ 5× Trockenzeit |
| 5 | Boden jeder Zelle eines Kontinents | Streu → Humus → Profil, Tempo nach Klima | P | Streu-Halbwertzeit Tropen < 1 Jahr, Boreal > 5 Jahre |
| 6 | jeder tote Körper jedes Planeten; der Walfall nährt die Tiefsee Jahrzehnte | Bilanz geschlossen | P | Stoffbilanz eines Bioms über 100 Spieljahre: Fehlbetrag ≤ 1 %; Walfall-Gemeinschaft über 50 Spieljahre in der Bildreihe |

#### Sukzession: EIN Gesetz für jede Wunde

`leben.oeko.sukzession` — **HEUTE 0 / 7**

*misst:* Ob das Leben jede Störung durch DASSELBE Gesetz zurückerobert — wachsend in Fläche, Zeit und Zahl der Störungsarten, bis zur verlassenen Metropole.

*Beleg:* Brand → Asche → Gras → Busch → Wald, Halme 477 → 70 → 491, Sämling 0 → 1 (stamm/feld-leben.js) — Mechanik belegt, unter P im Bild ungemessen.

*alte Karte:* stoffe.K5

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Brand-Zellen um das Dorf | Brand → Asche → Gras → Busch → Wald, Asche düngt | P · Brandfläche im Bild | Halm-, Asche- und Sämling-Zahlen über die Zeit im Fenster |
| 2 | 1 km² Waldbrand aus Brennstoff und Wind | Mosaik mit Überlebenden-Inseln; Feuer-Regime je Biom | P · Überflug | Bildpaar nach 1/5/25 Spieljahren gegen die Yellowstone-1988-Fotoreihe |
| 3 | ein Tal, 5 Störungsarten (Brand, Rodung, Flut, Lawine, Verlassen), auch frei ausgelöst | der Pfad hängt an der Ausgangslage: Boden, Samenbank, Überlebende | P | 5 Arten × 8 Saaten: Deckungs-Kurven im Band realer Chronosequenzen ≥ 80 % |
| 4 | Primärsukzession auf nacktem Fels über 10³ Jahre: Lava, Gletschervorfeld | Flechte → Moos → Farn → Strauch → Wald | P · 1 000 Spieljahre in ≤ 60 s | Deckung nach 10/100/1 000 Jahren im Band der Hawaii-Chronosequenz |
| 5 | verlassene Metropole ≥ 10⁴ Gebäude | Pflanzen sprengen Asphalt, Dächer fallen, Wald schließt sich | P · die Stadt im Bild | Bildpaar 0/30/100 Jahre gegen Fotoreihen verlassener Städte; Kronendeckung steigt |
| 6 | neue Insel, Kontinent nach der Eiszeit, 10⁴ Jahre | Insel-Biogeographie; Rückwanderung der Wälder | P · Zeitraffer 10⁴ Jahre | Artenzahl folgt Zuzug × Aussterben nach Größe und Abstand; Wald-Front 100–1 000 m/Jahr gegen Pollen-Profile |
| 7 | jeder Planet nach jeder Katastrophe | viele Pfade, Rückschläge, nie gleich zweimal | P · Zeitsprung ≤ 5 s | 16 Saaten × 4 Störungen: ≥ 90 % im Band realer Chronosequenzen UND paarweise verschieden |

#### Stoffkreisläufe: Kohlenstoff, Stickstoff, Sauerstoff, Wasser

`leben.oeko.stoffe` — **HEUTE 0 / 7**

*misst:* Ob das Leben die Chemie seines Planeten trägt und ändert — vom Nährstoff einer Zelle bis zur Biosignatur fremder Atmosphären.

*Beleg:* EIN Nährstoff-Skalar je Zelle (stamm/feld-leben.js:3736: Fällen −0,3, Ernte −0,02, Brand +0,4, Riss +0,2); Ernte 15× → 1 → 0,7 belegt, Wuchs im Bild ungemessen; kein ökologischer C, N, O.

*alte Karte:* stoffe.K5

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | ein Nährstoff je Zelle | Ernte und Fällen nehmen, Asche und Leichnam geben | P · Acker im Bild | Ernte 15× → Nährstoff 1 → 0,7, Wuchs sinkt sichtbar im Bildpaar |
| 2 | N und P getrennt je Zelle | Leguminosen und Erle binden N, P aus Gestein | P · beide Wiesen im Bild | Bildpaar Wiese mit Klee neben Wiese ohne nach 5 Spieljahren: Wuchs-Unterschied |
| 3 | Kohlenstoff eines Bioms | Biomasse + Boden-C als Bilanz; Brand gibt frei, Moor speichert | P | C-Vorrat je ha im Band (Tropenwald ~200 t C, Steppe ~10 t) |
| 4 | Kontinent, ein Jahr | saisonale CO₂-Säge emergent aus dem Laub-Jahr | P · Zeitraffer 1 Jahr | Amplitude nördlich > südlich, Phase mit dem Frühling gegen die Mauna-Loa-Kurve |
| 5 | Planet, Jahrhunderte | Wald macht Regen, Rodung trocknet das Lee | P | Niederschlag im Lee eines gerodeten Großwalds sinkt gegen Gegenlauf, Intervall ohne 0 |
| 6 | Planet, Äonen | O₂ steigt aus Photosynthese, verzögert durch Eisen und Methan | P · Zeitsprung ≤ 5 s | Sauerstoff-Sprung im Fenster 2,5–2,0 Mrd. Jahre in ≥ 70 % erdähnlicher Saaten; Bändereisen im Gestein sichtbar |
| 7 | jeder Planet, jede Chemie: Methan-, Schwefel-, Ammoniak-Biosphären | geschlossene Bilanz, Atmosphäre im Ungleichgewicht | P | 32 fremde Saaten: Biosignatur, die ohne Leben verschwände; Bilanzfehler ≤ 1 % |

#### Wechselbeziehungen: der Partner verschiebt die Bilanz

`leben.oeko.partner` — **HEUTE 0 / 7**

*misst:* Ob Arten einander brauchen und schaden — Bestäubung, Pilzpartner, Seuche, Ko-Evolution — geprüft stets durch denselben Richter: den Partner entfernen, die Folge sehen.

*Beleg:* Bestäuber folgen den Blüten, r 0,8 an 9 Orten (alte Leben in Luft und Wasser K4) — headless gerendert, Preis im Fenster nie; Einbahn: die Blüte merkt den Besuch nicht.

*alte Karte:* feld.K5 · luftwasser.K4

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Bestäuber an der Mess-Wiese | Dichte folgt Blüten, Pflege und Uhr (Einbahn) | P · Wiese im Bild | r(Bestäuber, Blüten) ≥ 0,5 aus dem Bild |
| 2 | eine Wiese, beide Richtungen | der Besuch entscheidet den Samenansatz | P | Gegenlauf ohne Bestäuber: Blüten-Dichte im Folgejahr −≥ 30 % im Bildpaar |
| 3 | ein Wald | Pilz-Partner der Bäume; Schatten-Sämlinge zehren vom Netz | P | Gegenlauf ohne Pilz: Sämlinge im Schatten −≥ 30 % Wuchs |
| 4 | ein Biom: Parasit, Erreger, Seuche | Ausbruch nur über einer Dichte-Schwelle; Bestand und Verhalten antworten | P · erkrankte Herde im Bild | 8 Saaten beidseits der Schwelle; Ausbruchskurve mit R₀ im Band, Gegenlauf ohne Kontakt |
| 5 | Kontinent: Ko-Evolution | Blüte ↔ Bestäuber in Form und Farbe, Räuber ↔ Beute im Wettrüsten | P · Zeitraffer ≤ 60 s | Rüssellänge ↔ Kronröhre r ≥ 0,7; Laufgeschwindigkeit beider steigt korreliert |
| 6 | Planet: Lebensräume auf Symbiose (Riff, Flechte) kippen als Ganzes | Kipp-Punkt sichtbar | P · Riff im Bild | Wärme-Gegenlauf: Korallenfarbe kippt im Bildpaar, Fischarten −≥ 50 % |
| 7 | 10⁶+ Arten: jede hat Partner, Feinde, Gäste | Verschachtelung wie reale Netze | P | 64 Saaten: ≥ 50 % der Arten mit ≥ 1 Mutualist; 20 Zufallsarten entfernt → Ko-Aussterben im Band der Literatur |

### Evolution und fremdes Leben

*Referenz-Korpus (R6, R11):* Fossil-Datenbank (PBDB), Stammbäume (Open Tree of Life), Morphoraum-Datensätze, Vielfalts-Kurve nach Sepkoski

#### Stammbaum: Arten mit Abstammung, lebend und ausgestorben

`leben.evolution.stammbaum` — **HEUTE 0 / 7**

*misst:* Ob die Arten eines Samens einen Baum bilden, dessen Verwandtschaft im Bild SICHTBAR ist, und ob jedes Blatt — auch ein ausgestorbenes — als Körper besuchbar ist.

*Beleg:* keine Abstammung: Würfe sind Hash(Saat, Zelle) (stamm/kreatur-fauna.js:125); `STAMMBAUM` ist der Name eines Studios (tetrapoda-core.js:5185); Ankunft 11–17 s.

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 10 Arten mit gemeinsamem Ahn | Verwandtschaft ist sichtbar | P | Gestalt-Baum aus Third-Bildern gegen den Baum des Samens: Robinson-Foulds ≤ 0,3; Mutante „Erbe aus“ → Zufall |
| 2 | 10² Arten | Baumgestalt wie reale Kladen (Colless-Unbalance im Band) | P · Baum-Blick öffnet ≤ 1 s | Colless aus 100 Saaten gegen reale Kladen |
| 3 | 10³ Arten | jedes Blatt hat Ort und Nische | P · Blatt → Körper ≤ 2 s | 100 Zufallsblätter: als laufender Körper im Lebensraum, den Klima und Bauplan vorhersagen, ≥ 90 % |
| 4 | 10⁴ Arten | Gestalt-Abstand wächst mit Baum-Abstand | P | Mantel-Korrelation Bild-Deskriptoren ↔ Baum-Distanz r ≥ 0,5 |
| 5 | 10⁶ lebende Arten je Planet | Stichprobe plausibel (bewegt sich, frisst, passt zur Nische) | P | Zufallsstichprobe 1 000 ≥ 95 %; Ankunft-ABAB 10⁶ ↔ 10³ |
| 6 | 10⁹ Arten über die Zeit (> 99 % ausgestorben) | jede je gelebte Art an ihrem Ort in ihrer Epoche | P · Sprung ≤ 5 s | 100 Zufallsblätter der ganzen Geschichte: nach Sprung als Körper in der Epoche ≥ 95 % |
| 7 | 10⁹ (Mikroben bis 10¹²) × unbegrenzt viele Planeten-Saaten | Natur-Foto und Spiel-Bild in der Breite nicht zu trennen | P | 1 000 Blätter aus 10 Saaten, Kladen-gewichtet: Blindtest ≤ 60 % |

#### Individuum und Erbe: keines dem anderen gleich

`leben.evolution.erbe` — **HEUTE 0 / 6**

*misst:* Ob Kinder ihren Eltern sichtbar gleichen, jedes Individuum wiedererkennbar und beständig ist — bis zu Milliarden je Planet mit Ahnenlinie.

*Beleg:* Bestand als Zahl je Revier, kein Erbe; Individuen einer Gattung bis auf Würfe gleich (GESTALTEN_JE_REZEPT = 1).

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Linie über ≥ 10 Generationen | Kind gleicht Eltern im Bild | P | Morphometrie aus Third-Bildern: Eltern-Kind-Regression 0,2–0,8; Mutante „Erbe aus“ → ≈ 0 |
| 2 | 10² Individuen einer Herde | jedes wiedererkennbar an Muster, Größe, Narbe, Gang | P | ein Individuum nach 1 Spieltag aus 100 wiedererkannt ≥ 90 % |
| 3 | der Spieler züchtet über 10 Generationen | Antwort auf Selektion R = h²·S ±20 % | P · Zeitraffer ≤ 60 s | Merkmalsmittel vorher ↔ nachher im Bild der Herde |
| 4 | 10⁴ Individuen im Schirm | Merkmals-Streuung wie in der Natur | P mit 10⁴ im Bild | Variationskoeffizient der Körpermaße aus dem Bild im Band |
| 5 | 10⁶ in einer Region, beständig | dasselbe Tier morgen am selben Ort, mit Spuren seines Lebens | P · Bildzeit bei 10⁶ vs. 10³ ≤ 10 % | 100 markierte Tiere nach Abreise und Rückkehr wiedergefunden ≥ 99 %, Verbleib (Tod, Zug, Nachwuchs) im Band der Sterbe- und Zugraten der Art ≥ 90 % |
| 6 | 10¹⁰⁺ je Planet (Erde ≈ 5·10¹⁰ Vögel allein) | jedes mit Ahnenlinie, die zu seinen Nachbarn passt | P | 100 Zufallsindividuen: Ahnenlinie zurück bis zur Klade; Verwandte im Revier gleichen ihm messbar mehr als Fremde |

#### Die Experimente der Natur aus EINEM Gesetz

`leben.evolution.muster` — **HEUTE 0 / 6**

*misst:* Den Anteil eines VOR dem Bau eingefrorenen Kanons K30 von 30 evolutiven Mustern (Selektion, Drift, Artbildung, Bergmann, Insel-Regel, Radiation, Konvergenz, Rote Königin, Mimikry, Neuheit, Kontingenz …), die mit Gegenlauf in 100 Saaten erscheinen.

*Beleg:* 0 von 30; die ökologischen Muster (Kaskade, Holling III) zählen in leben.oeko.

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1/30: Antwort auf Selektion | Steigung im Band der Natur | P · Zeitraffer 10³ Generationen ≤ 60 s | Räuberdruck auf große Hirsche → Größe sinkt im Bild; Gegenlauf ohne Räuber |
| 2 | 3/30: + Drift, Isolation → Art | Varianz ∝ 1/N; nach Trennung Paarungs-Anteil < 5 % | P · Zeitraffer 10⁵ Generationen ≤ 60 s | Insel N = 20 vs. 2 000; getrennte Bestände im Bild-Embedding trennbar ≥ 0,9 |
| 3 | 10/30 | jedes im Band der Literatur | P | Statistik aus 100 Saaten, je Muster mit Gegenlauf |
| 4 | 20/30 mit Konvergenz und Neuheit | Spindelform in ≥ 2 getrennten Linien; Merkmal, das nicht im Start-Bauplan stand | P | Konvergenz in ≥ 80 % der Saaten; Anteil Saaten mit neuer Funktion |
| 5 | 30/30 + Kontingenz | gleicher Same, andere Mutations-Folge → andere Neuheit | P | Wiederholungs-Paare: gleiche Folge → byte-gleiches Bild, andere Folge → anderes |
| 6 | 30/30 auf 10 fremden Physiken | dieselben Gesetze, andere Erscheinung | P | K30 auf 10 Planeten-Saaten mit g, Licht, Lösungsmittel außerhalb der Erde |

#### Zeitreise durch die Geschichte des Lebens

`leben.evolution.zeitreise` — **HEUTE 0 / 8**

*misst:* Ob der Spieler an jeden Punkt der Geschichte DESSELBEN Planeten reisen und dort Flora und Fauna antreffen kann, die dessen Evolution damals trug — und ob die Kurve der Vielfalt stimmt.

*Beleg:* nur Gegenwart, Arten fest; keine Epochen-Flora oder -Fauna; Ankunft 11–17 s.

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 10⁴ Jahre zurück, eine Epoche | Flora und Fauna unterscheidbar von heute und verwandt mit heute | P · Zeitsprung | Panel ordnet Bildpaare Gegenwart/Epoche ≥ 0,8; Hin- und Rücksprung byte-gleiches Bild |
| 2 | 10⁵ Jahre: Eiszeit | Megafauna, Tundra-Flora, Wälder in Refugien | P · Sprung ≤ 10 s | Körpermassen-Median über dem der Gegenwart; Biom-Anteile gegen Paläo-Rekonstruktion ±20 % |
| 3 | 10⁶ Jahre | Ahnen und Schwestern der heutigen Arten | P · Sprung ≤ 5 s | 20 Arten am Zielpunkt: Ahn oder Schwester einer heutigen = 100 % |
| 4 | 10⁷ Jahre: andere Ordnungen, Grasland breitet sich aus | Linien verfolgbar | P | 100 heutige Arten: Vorfahr auffindbar und im Bild-Embedding näher als jede andere Art ≥ 0,8 |
| 5 | 10⁸ Jahre: andere Ära, Riesen bis 70 t, Steinkohlewald ohne Blüte und Gras | Organe nur nach ihrem Erfinden (keine Blüte vor Samen) | P · Riesen im Bild | Blind-Sortierung von Bildern aus 10 Epochen nach Alter ≥ 90 % |
| 6 | 5·10⁸ Jahre: Kambrium-Meer, Landeroberung im Devon | wenige Baupläne, schnelle Radiation | P | Baupläne je Epoche steigen früh steil und flachen ab wie im Fossilbericht; Panel ordnet 20 Unterwasserbilder ≥ 70 % |
| 7 | 4·10⁹ Jahre durchgehend: Einzeller → Vielzeller → Land → Luft | Vielfaltskurve mit Einbrüchen ≥ 50 % und Erholung über 5–10 Mio. Jahre | P · Sprung ≤ 5 s | Diversität an 50 Zeitpunkten gegen die Gestalt der Sepkoski-Kurve, Rangkorrelation ≥ 0,6 |
| 8 | jeder Zeitpunkt jedes Planeten, eigene Evolution je Saat | die Gegenwart ist das Ergebnis der Vergangenheit | P · jeder Sprung ≤ 5 s | Ereignis der Vergangenheit verlegt → Gegenwart ändert sich, sonst byte-gleich; 100 Saaten × 10 Epochen konsistent ≥ 95 % |

#### Bauplan-Raum: wie fremd und vielfältig die Körper werden

`leben.evolution.bauplan` — **HEUTE 0 / 6**

*misst:* Das Volumen des Morphoraums aus Silhouetten- und Bewegungs-Deskriptoren von 1 000 Zufalls-Wesen gegen heute und gegen Natur-Bildsätze (Disparität).

*Beleg:* 4 Säuger-Gestalten über 5 Dials, gemischt per Gauß-Gewicht (ART_GESTALT, tetrapoda-core.js:3826), dazu je ein Gesetz für Vogel, Fisch, Bestäuber — die Punkte setzt der Mensch.

*alte Karte:* tiere.K3

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Volumen ×10 gegen heute | jede Form bewegt sich ohne Schlupf, ohne Durchdringung | P | 1 000 Zufalls-Genome: Bewegungs-Anteil ≥ 95 % |
| 2 | ×10²: Laufen, Schwimmen, Fliegen, Schlängeln ENTSTEHEN | Abdeckung des irdischen Tetrapoden-Morphoraums ≥ 50 % | P | Deskriptoren gegen Natur-Bildsatz der Tetrapoden |
| 3 | ×10³ über Stämme (Gliederfüßer, Weichtiere, Pflanzen-Wuchsformen) | Abdeckung irdischer Tier- und Pflanzen-Morphoräume ≥ 50 % | P | wie Sprosse 2, über alle Natur-Bildsätze |
| 4 | Bewegung lebendig | gewachsen, nicht Bausatz | P | Blindtest Spiel-Video ↔ Natur-Video in Bewegung ≤ 60 % |
| 5 | fremd: ≥ 30 % der Stichprobe außerhalb der irdischen Hülle | davon ≥ 90 % physikalisch tragend (Statik, Gang, Atmung) | P | Hüllen-Abstand + Physik-Proben im Spiel |
| 6 | Millionen Körperformen, keine zwei gleich, mehr Disparität als die Erde | jedes Wesen liest als gewachsen, auch das nie Gesehene | P | 1 000 Wesen aus 10 Planeten: Morphoraum-Volumen > Erde; Fremdwelt-Probe (R10): Lebensweise aus dem Körper gelesen Rang ≥ 0,7 |

#### Dieselbe Evolution unter fremdem Stern, Schwere und Chemie

`leben.evolution.fremde-physik` — **HEUTE 0 / 7**

*misst:* Ob Leben unter anderer Schwerkraft, Luftdichte, Strahlung und anderem Lösungsmittel den Gesetzen folgt — oder ob seine Leere erklärt ist.

*Beleg:* ein Planet, g fest, eine Sonne.

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | g 0,3–3 | Bein-Querschnitt folgt Masse·g | P | Regression aus 50 Saaten je g aus Bildern: Steigung im Band der Statik |
| 2 | Luftdichte 0,1–10 bar | Flieger-Anteil steigt mit Dichte/g | P | Anteil fliegender Arten über 20 Saaten, Kurve monoton |
| 3 | Stern M bis F, Doppelsterne, gezeitengebundene Welten | Pflanzenfarbe folgt dem Licht; Leben sammelt sich an der Dämmerzone | P | Laubfarbe gegen Absorptions-Optimum; Biomasse-Profil über die Terminator-Linie |
| 4 | Lösungsmittel und Temperatur: Wasser, Ammoniak, Methan-Kälte, Eis-Ozean | Lebenstempo folgt der Temperatur (Q10) | P | Bewegungs- und Lebensdauer-Tempo gegen Arrhenius |
| 5 | 10³ Planeten-Saaten | Biosphäre passt zur Physik, oder Leere ist erklärt | P je Planet | Prüfliste aus Sprossen 1–4 auf 1 000 Saaten ≥ 95 % |
| 6 | Bewohnbarkeits-Rand | Leben dünn am Rand, reich im Optimum | P | Artenzahl gegen Energiefluss je Planet: Korrelation positiv, Intervall ohne 0 |
| 7 | unbegrenzte Welten bis zu Gasriesen-Schwebern | jede Welt mit eigener Geschichte des Lebens, keine eine umgefärbte Erde | P | 100 Welten: Prüfliste ≥ 95 %; Fremdwelt-Probe (R10): Morphoraum-Abstand zur Erde über dem 95. Perzentil der Erd-internen Abstände bei ≥ 50 %, Ursache aus dem Körper gelesen Rang ≥ 0,7 |

#### Bis zur Zivilisation: Verhalten, Kultur, fremde Personen

`leben.evolution.zivilisation` — **HEUTE 0 / 7**

*misst:* Ob Verhalten, Tradition und Kultur als Ergebnis der Evolution entstehen — bis zu nicht-menschlichen Zivilisationen, deren Bauten aus Körper und Geschichte folgen.

*Beleg:* Temperament je Gattung von Hand, Verhalten als Daten, nicht vererbt; die „Evolution“ in stamm/feld-nexus.js mutiert DSL-Programme der KI, nicht Leben.

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Verhalten erblich | Kinder scheuer Eltern sind scheu | P | Fluchtdistanz Eltern ↔ Kind korreliert; Räuberdruck macht scheuer, Gegenlauf |
| 2 | Sozialität evolviert | Herde oder Einzelgänger aus Selektion | P · Zeitraffer ≤ 60 s | Gruppengröße steigt mit Räuberdichte über 100 Saaten |
| 3 | Tradition wird weitergegeben: Gesangs-Dialekte, Zugrouten, Werkzeug | Dialekt-Grenzen zwischen Populationen | P | Gesang zweier Populationen im Spektrum trennbar ≥ 0,9, innerhalb nicht; Werkzeug in ≥ 10 % der Saaten im Bild |
| 4 | kumulative Kultur | Werkzeuge werden schneller besser, als Gene es könnten | P · Zeitraffer ≤ 60 s | Werkzeug-Komplexität über Generationen, Gegenlauf ohne Weitergabe |
| 5 | erste nicht-menschliche Siedlung | Bau folgt dem Körper (Türhöhe ∝ Körper, Flieger ohne Treppen, Wasserwesen unter Wasser) | P | Bau-Maße gegen Körper-Maße der Erbauer im Band |
| 6 | Zivilisation mit Epochen | Technik aus ihrer Welt (kein Metall ohne Erz, kein Feuer unter Wasser) | P · Sprung zwischen Epochen ≤ 5 s | Ursachen-Probe mit Gegenlauf an 100 Saaten: Saat ohne Erz → 0 Metallwerkzeuge im Bild, mit Erz ≥ 1 in ≥ 80 %; Wasserwesen: 0 offene Feuer im Bild |
| 7 | Milliarden nicht-menschlicher Personen je Planet, Städte jenseits 10⁷ Einwohnern, je Planet eigene Kultur | unterscheidbar und erklärt aus Körper, Sinnen und Geschichte | P | 10 Zivilisationen aus 10 Saaten: Blind-Sortierung nach Herkunft ≥ 90 %; Fremdwelt-Probe (R10): Bau-Maße aus dem Körper der Erbauer vorhergesagt Rang ≥ 0,7, Abstand der Bauten zur menschlichen Architektur über deren 95. Perzentil bei ≥ 50 % |

#### Mikroben und Ursprung: die unsichtbare Mehrheit

`leben.evolution.mikroben` — **HEUTE 0 / 6**

*misst:* Ob die mikrobielle Welt sichtbar ist (Matten, Zoom bis zur Kolonie), die Kreisläufe trägt und ob Leben dort entsteht, wo Energie und Chemie es erlauben.

*Beleg:* kein mikrobielles Leben (0 Treffer).

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Matten, Biofilme, Algenbeläge sichtbar | Farbzonen folgen Temperatur und Licht (heiße Quelle, Watt, Fels) | P | Bildvergleich der Zonierung gegen Natur-Fotos |
| 2 | Zoom 1 m → 1 mm: Pilzfäden, Milben, Kolonien | Dichte im Band (~10⁹ Zellen je g Boden, sichtbar als Kolonien) | P · Zoom ohne Ladebalken | Bildvergleich am Ende des Zooms gegen Mikroskop-Aufnahmen |
| 3 | Zoom auf 10⁻⁵ m an jedem Ort | die Gemeinschaft passt zum Milieu | P · Zoom ≤ 1 s | 100 Zufallsorte: 2AFC Zoom-Bild gegen Lichtmikroskopie desselben Lebensraums ≤ 75 %; Formen passen zum Lebensraum (Teich, Boden, Darm) ≥ 90 % |
| 4 | 10⁶ Mikroben-Arten je Planet als Funktion | Mikroben tragen die Kreisläufe | P | Mutante „Mikroben aus“ → Streu bleibt liegen, Kreisläufe brechen sichtbar |
| 5 | Ursprung: Leben entsteht in einem Teil der Saaten | abhängig von Energie und Chemie | P · Sprung ≤ 5 s | Anteil Planeten-Saaten mit Leben steigt monoton mit dem Energiefluss |
| 6 | bis 10¹² Mikroben-Arten je Planet, jeder Zoom-Ort jedes Planeten | unsichtbare Mehrheit, sichtbar auf Zuruf | P | Zoom-Stichprobe 1 000 Orte auf 10 Planeten ≥ 95 % |

#### Die Spur: das Leben im Gestein lesen

`leben.evolution.fossil` — **HEUTE 0 / 6**

*misst:* Ob der Spieler im Gestein Fossilien findet, die Arten des Baums sind, in richtiger Schichtfolge — und sie an ihrem Zeitpunkt lebend wiedertrifft.

*Beleg:* keine Fossilien.

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Fossil an der Fundstelle | Funde sind ausgestorbene Arten des Baums | P | 100 Funde: Anteil im Baum des Samens = 100 % |
| 2 | Schichtfolge | tiefere Schicht trägt ältere Formen, Leitfossilien | P | 100 Aufschlüsse: Superposition ≥ 99 % |
| 3 | Spurenfossilien: Fährten, Bauten, Koprolithen | die Fährte passt zum Gang der Art | P | Schrittlänge und Fußfall der Fährte ±10 % zum lebenden Gang derselben Art |
| 4 | über Kontinente | dieselbe Schicht trägt beidseits eines Ozeans dieselben Leitfossilien | P | Paar-Aufschlüsse an getrennten Küsten |
| 5 | lückenhafter Bericht wie die Natur | Hartteile über-, Weichkörper unterrepräsentiert | P | Erhaltungs-Anteile je Bauplan gegen die Natur |
| 6 | jeder Ort jedes Planeten | was gegraben wird, lebt am Zeitpunkt der Schicht in identischer Gestalt | P · Sprung ≤ 5 s | 100 Funde, dann Sprung an ihren Zeitpunkt: Fossil ↔ lebender Körper deckungsgleich ≥ 95 % |

## 4 · Mensch und Zivilisation

### Leib, Gesicht, Kleidung

*Referenz-Korpus (R6, R11):* Körpermaß-Tabellen (ANSUR), Gesichts- und Trachten-Fotokorpora, Bewegungsaufnahmen

#### Ein Leib je Mensch

`mensch.leib.verschieden` — **HEUTE 0 / 7**

*misst:* wie viele Menschen zugleich verschieden sind und wiedererkannt werden (Gesicht, Gang, Tracht zusammen).

*Beleg:* nah teilen sich die Bewohner einer Siedlung 8 Gestalten und EINEN Schnitt (stamm/siedlung-bewohner.js:232–247); 50 aus 50 Samen ohne Paar nur headless (mensch.K4#2)

*alte Karte:* mensch.K4

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 10 nah unterscheidbare Leiber je Siedlung | Höhe, Bau, Gesicht, Schnitt verschieden | P · Dorfplatz Third | Bild 10 Bewohner auf 2 m: Prüfer findet 0 gleiche Paare |
| 2 | 10² Personen nah, je eigener Leib | keine zwei unter 1 px Gestalt-Distanz | P · Test-Stadt (118) | Zensus 100 Bewohner im Third an beiden GPUs: 0 Paare unter 1 px |
| 3 | 10³ eigene Leiber in einer Stadt | gezeigte Person unter 100 der Szene wiedergefunden | P · Stadtplatz | Prüfer-Wiedererkennung ≥ 90 % |
| 4 | 10⁴ im Bild (Platz, Stadion) | ab 30 m keine sichtbaren Klone | P · Stadion voll | Bild-Hash-Klonsuche über 10⁴ Silhouetten: 0 Paare |
| 5 | 10⁵–10⁶ in einer Megastadt am Tag | Person nach 1 h Spielzeit an Gesicht, Gang, Tracht wiedererkannt | P · Megastadt-Platz | Wiedererkennung ≥ 95 %, Gang allein ≥ 60 % aus 10 Kandidaten |
| 6 | 10⁷ auf einem Kontinent | regionale Züge lesbar, ohne Klischee | P · Ankunft an Zufallsort | N = 200 Zufallsorte: Prüfer ordnet Gesicht ↔ Region ≥ 2× Basisrate, 0 Klone |
| 7 | 10⁹–10¹⁰ auf einem Planeten über Generationen | Gesichter-Verteilung wie reale Populationen | P · Zeitsprung ≤ 5 s | 1 000 Zufallssamen weltweit: 0 Kollisionen; Gesichtsmaße im Band realer Populationsdaten |

#### Das Gesicht nah

`mensch.leib.gesicht` — **HEUTE 0 / 6**

*misst:* wie wahr ein Gesicht auf 0,5–6 m dem Foto standhält, in jedem Alter, Ausdruck und Licht.

*Beleg:* mensch-kopf GRÜN im Third auf 6,11 m an der Radeon (a41ce72d), Third-Bild im E-Band (GTX 16,8 ms); kein Ausdruck, kein Blick-Ziel (koerper-core.js:4785–4826) — KARTE: 0 — der Kopf ist nur an der Radeon gebucht (mensch.K4), an der GTX ungemessen.

*alte Karte:* mensch.K4 · haar.K2 · haar.K5

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Kopf: Spieler an der Third-Kamera 6 m | Augen, Lippe, Höhle, Haar-Deckung lesen als Kopf | P · Third Wiese | Soll-Tafel mensch-kopf GRÜN an 10 Samen |
| 2 | 10 Bewohner in Begegnung auf 2 m | Blick, Lidschlag, Haut ohne Wachs, Haar ohne Helm | P · Gasthaus-Begegnung | Bildpaar gegen Porträtfoto gleicher Beleuchtung: Prüfer „lebt“ ≥ 50 % |
| 3 | 10² Gesichter, 0–100 Jahre, alle Populationen | Säugling bis Greis: Proportion, Falten, Poren, Zähne | P · Markt | Altersschätzung des Prüfers über 100 Zufallssamen, Fehler ≤ 5 Jahre |
| 4 | 10³ Gesichter im Gespräch und unter Last | Freude, Furcht, Schmerz, Ekel als Muskelspiel | P · Markt mit Gesprächen | Prüfer erkennt die Basis-Emotion ≥ 80 % (Foto-Niveau) |
| 5 | 10⁴ Gesichter in jedem Licht (Mittag, Kerze, Neon, Regen) | Haut streut, Haar glänzt, nass wirkt nass | P · Megastadt bei Nacht | Bildpaar je Licht gegen Foto: Prüfer-Verwechslung ≥ 30 % |
| 6 | jeder Mensch und jedes denkende Wesen, Ego 0,5 m | vom Foto nicht zu unterscheiden | P · beliebige Begegnung | Blindtest Render ↔ Foto 50 ± 5 %; fremde Arten: Fremdwelt-Probe (R10) an der Anatomie |

#### Tracht und Gesicht der Menge

`mensch.leib.tracht` — **HEUTE 0 / 7**

*misst:* ob das Gesetz glaubhafte Tracht für jede Welt erzeugt und eine Menge Epoche, Kultur und Stand am Leib trägt (Leib L3 + Menge L8).

*Beleg:* 9 Epochen, 6 Schnitt-Kombinationen, je Siedlung EIN Schnitt, Antike und Fernost tragen Poncho (fachwerk-core.js:3295–3303); Blind-Zuordnung nie gefahren

*alte Karte:* haar.K4 · siedlung.K4

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Platz: Epoche wählt Schnitt und Farbe | Antike vs. Moderne unterscheidbar | P · Dorfplatz | 20 Saaten: Prüfer ordnet Epoche ± 1 Jh. ≥ 0,7 |
| 2 | 10 Silhouetten-Familien (Rock, Mantel, Tunika, Kimono, Sari, Kopfbedeckung) | Region lesbar | P · Platz | 50 Zufalls-Eingaben: Prüfer ordnet Bild ↔ Epoche/Region ≥ 60 % |
| 3 | 10² Personen: Stand und Rolle lesbar | Bauer, Händler, Adel, Soldat, Priester | P · Markt aus 20 m | Stand-Rateaufgabe an 50 Zufallspersonen ≥ 70 % |
| 4 | 10³ Gesellschaften (Ethnographic-Atlas-Maß) | Lagen nach Klima, Stoff der Epoche | P · Ankunft je Saat | N = 200 Saaten: plausibel gegen Trachtenatlas ≥ 0,9; Epochenfehler ≤ 100 J bei ≥ 80 % |
| 5 | 10⁴ Personen ohne gleiche Garnitur, Mode wandert | Schmuck, Abzeichen, Prestige-Farbe; Moden über Handelswege | P · Platz mit 10⁴ | 0 identische Garnituren; Zeitraffer 300 J: Mode-Front folgt Handelswegen |
| 6 | jede Epoche × Kultur der Erde | N = 100 zufällige (Ort, Jahr) | P · Zeitsprung ≤ 5 s | Blind-Zuordnung ≥ 0,7; keine zwei Saaten mit verwechselbarer Menge |
| 7 | Zukünfte, ungesehene Kulturen, fremde Völker | kohärent, nicht kostümiert, ohne Erd-Vorbild | P · fremder Planet | 100 Welten ohne Erd-Kultur: kohärent ≥ 0,8, ≥ 20 Stile; Person → Volk ≥ 0,8 |

#### Stoff in Bewegung

`mensch.leib.stoff` — **HEUTE 0 / 6**

*misst:* ob Kleidung als Stoff fällt, schwingt, nass wird und verschleißt.

*Beleg:* Stoff aus der Haut extrudiert, starr; Durchstich nie gemessen

*alte Karte:* physik.K4 · haar.K3 · haar.K4

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Spieler, Stoff liegt am Leib | Webart als Rauheit, keine Haut ragt durch | P · Third Wiese | 16 Posen × 10 Samen: 0 Durchstiche |
| 2 | 1 Spieler: Saum, Ärmel, Mantel schwingen | Fall nach Gewicht des Stoffs | P · Lauf Third | Bildreihe Lauf: Saum folgt mit Verzug, Durchdringung 0 |
| 3 | 10 Nahe mit Lagen | Hemd unter Mantel unter Umhang, Wind sichtbar | P · Dorf bei Sturm | Video gegen Referenz-Aufnahme: Prüfer „echt“ ≥ 60 % |
| 4 | 10² Nahe tragen Wetter und Arbeit | nass dunkel und klebend, Staub, Verschleiß, Flicken | P · Test-Stadt bei Regen | Bildpaar Regen vor/nach am selben Bewohner; Verschleiß Bauer ↔ Adel erkannt ≥ 80 % |
| 5 | 10³–10⁴ Stoffe im Bild | Menge im Wind liest als Stoff | P · Platz bei Wind | Video Platz ↔ Referenz: Prüfer-Verwechslung ≥ 40 % |
| 6 | 10⁵ im Stadion | vom Film nicht unterscheidbar | P · Stadion | Blindtest Video ↔ Render 50 ± 5 % |

#### Bewegungs-Ausdruck

`mensch.leib.ausdruck` — **HEUTE 0 / 6**

*misst:* ob Haltung, Gang und Gestik Alter, Last, Verletzung, Gemüt und Kultur lesen lassen.

*Beleg:* zehn Bewegungs-Profile an Bewohnern (tagesHaltung koerper-core.js:4972, _bewohnerGemuet siedlung-bewohner.js:1864), ungemessen; Fuß gleitet 3,1–3,4 cm (leib.K2 ROT)

*alte Karte:* leib.K2

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 10 Bewohner: Haltung nach Akt und Gemüt | gebeugt bei der Arbeit, müde am Abend, Furcht nach Bedrohung | P · Dorfplatz | Prüfer errät Akt/Gemüt aus der Silhouette ≥ 60 % |
| 2 | 10²: Gang nach Alter, Bau, Last, Verletzung | Greis langsam, Kind hüpft, Sack, Hinken | P · Markt | Lichtpunkt-Gang: Alter ± 15 J; „verletzt/beladen“ ≥ 80 % |
| 3 | 10³: Gestik im Gespräch | Gruß, Zeigen, Streit, Gebet, Verbeugung | P · Markt mit Gesprächen | Prüfer erkennt Gemüt aus dem Ganzkörper ≥ 70 % |
| 4 | 10⁴: Gestik und Abstand je Kultur | Körper-Kultur einer Stadt (Tempo, Distanz) | P · Platz | Kultur aus Gestik ≥ 50 %; Abstand Fremder gegen Proxemik-Daten (Sorokowska 2017) ≤ 20 % |
| 5 | 10⁵ mit eigenem Gang und Gestus | Platz wie Feldaufnahme gleicher Kultur | P · Megastadt-Platz | Prüfer-Verwechslung Video ↔ Feldaufnahme ≥ 50 % |
| 6 | fremde Leiber und Kulturen | Ausdruck folgt Bau und Kultur der Art | P · fremder Planet | N = 100 Arten: Gemüt gelesen ≥ 60 %, Gestik kohärent ≥ 0,8 |

#### Spur am Leib

`mensch.leib.spur` — **HEUTE 0 / 6**

*misst:* ob man den Lebenslauf an Haut, Schmuck und Ersatzteil liest.

*Beleg:* Alters-Dial 18–80 (koerper-core.js:120–126) nie gemessen; Narbe, Tätowierung, Schmuck, Wunde: Grep leer

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Alter als Achse 18–80 | sichtbar | P · Third | Prüfer-Altersschätzung, Fehler ≤ 15 J |
| 2 | Arbeit am Leib, 10 Berufe | Bauer gebräunt, Schmied rußig, Arbeitshände | P · Markt 5 m | Beruf-Rateaufgabe ≥ 50 % |
| 3 | Verletzung live | Wunde → Verband → Narbe über Tage | P · Dorf | Bildreihe Tag 0/3/30 am selben Bewohner |
| 4 | Zeichen-System, 10² Kulturen | Schmuck, Tätowierung, Bemalung, Implantat folgen Stand und Glaube | P · Platz | N = 100 Zufallskulturen: Leib ↔ Kultur ≥ 60 % |
| 5 | Biografie im Leib bis zur Kybernetik | Brüche, Pocken, Narben, Prothese, Chrom als Folge des Lebens | P · Begegnung | aus dem Bild ≥ 3 von 5 Fakten des Datensatzes geschätzt |
| 6 | jeder Mensch eines Planeten | plausibel, nicht klischeehaft | P · beliebiger Ort | N = 500 Saaten: Spuren plausibel ≥ 0,9 |

### Sport, Spiel, Bewegungskönnen

*Referenz-Korpus (R6, R11):* Regelwerke, Rekordtafeln und Ergebnislisten, Spielaufzeichnungen, Bewegungsaufnahmen

#### Regel-Grammatik

`mensch.sport.regeln` — **HEUTE 0 / 8**

*misst:* wie viel Spiel-Vielfalt die Welt aus EINER Grammatik hervorbringt, und wie wahr und spielbar sie ist.

*Beleg:* kein Regelspiel, keine Wertung; Ball nur am Seil im Prüfstand (schmiede-core.js:4627/4630)

*alte Karte:* pflicht.F

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Wettkampf (Lauf, Wurf) mit Sieger | Sieger folgt aus Leib und Tagesform | P · 8 Läufer nah | 20 Läufe: Rangfolge gegen Leib-Leistung ρ 0,6–0,9 |
| 2 | 1 Ballspiel mit Gegner und Pfiff | Schiedsrichter-Urteil = Regeltext | P · 10 Leiber + Ball | 20 Partien: richtige Pfiffe ≥ 90 % |
| 3 | 10 reale Sportarten aus EINER Grammatik | erkennbar ohne Beschriftung | P · 22 Leiber + Ball | 30-s-Clip je Art: ≥ 8 von 10 von Fremden benannt |
| 4 | 10² Saaten wählen ihre Art | Art passt zu Klima, Stoff, Epoche | P · Partie einer neuen Saat | N = 200 Saaten: Regelwerk im Blindpaar gegen reale Regelwerke (2AFC ≤ 75 %); ein Spiel läuft bis zum Sieger ≥ 80 % |
| 5 | 10² neue Arten aus Saat oder Satz | spielbar: keine dominante Strategie | P · Partie nah | N = 100: keine Strategie > 70 % Sieg, Start-Seite 40–60 %, Partielänge < Faktor 3 |
| 6 | 10³–10⁴: das Inventar der Erde liegt im Raum der Grammatik | Ausdruckskraft, nicht Fleiß | P · jede Arena | 100 Zufallseinträge eines ethnographischen Inventars: ≥ 90 % als „dieses Spiel“ erkannt |
| 7 | fremde Physik auf 10 Welten | 0,3-g-Hochsprung, Flossen-Ballspiel | P · Partie auf fremdem Planeten | N = 1 000 Saaten: ≥ 80 % spielbar bis zum Sieger; Kennzahlen des Spiels (Dauer, Punktefolge, Führungswechsel) im Band realer Sportarten |
| 8 | jede Bevölkerung jedes Planeten mit eigener Sportkultur | Kulturen unterscheidbar | P · Zufall Ort × Epoche × Planet | N = 1 000: Regel-Abstand zwischen Kulturen > innerhalb; Fremdwelt-Probe (R10): Sportart aus Körper und Schwere der Spieler vorhergesagt Rang ≥ 0,7 |

#### Körperkönnen

`mensch.sport.koerper` — **HEUTE 0 / 7** · Kern 1

*misst:* wie wahr ein Leib aus Kraft und Gleichgewicht sich bewegt, gegen echte Athleten.

*Beleg:* Gehen, Sprint ~6,8 m/s, Sprung ~0,53 m, Klettern, Schwimmen, 6 Geräte-Verben über EINEN Löser (koerper-core.js:497–556, 5089–5130); Fuß 3,4/3,1 cm ROT (leib.K2) — KARTE: Kern 1 — Tempo und Sprung an beiden Geräten gebucht (leib.K2); Bild-Preis in Bewegung an der Radeon ROT (gehend 66 % der Bilder über 33 ms).

*alte Karte:* physik.K5 · leib.K2 · pflicht.F

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 ◐ | 1 Leib: 5 Verben + 6 Geräte-Verben | Tempo und Sprung geeicht | P · Ego/Third Wiese | Tempo und Sprunghöhe im Spiel gegen Eichwert ± 10 % |
| 2 | dieselben Verben auf Stufe, Hang, Gerät | Fuß hält, wo er steht | P · Ego und Third | Fuß-Gleiten ≤ 2 cm |
| 3 | 10 Leiber: Kraft statt Konstante | Kraft-Geschwindigkeit, Ermüdung | P · 10 Leiber nah | 400 m verliert 5–12 % auf der zweiten Hälfte; Wurfweite wächst mit Leib-Kraft |
| 4 | 10² Bewegungsaufgaben (Werfen, Treten, Drehen, Schwimmstile, Stoß) | Pose gegen Referenz | P · 22 Leiber | MPJPE ≤ 60 mm gegen Referenzbewegung; Leib fängt sich nach Stoß |
| 5 | 10³ Kontakte zweier Leiber bei Spieltempo | kein Durchdringen, Masse zählt | P · Gedränge | 0 Durchdringungen in 1 000 Kontakten; Bildvergleich gegen Referenzvideo |
| 6 | 10² Baupläne treiben Sport | Gangart und Froude je Bauplan | P · gemischtes Feld | N = 100 Baupläne: ≥ 80 % stimmige Gangart gegen Tierreferenz |
| 7 | Weltklasse jeder Disziplin, jedes Körpers, jeder Schwerkraft | Fachtrainer unterscheidet nicht | P · 100 Leiber im Bild | Zweiwahl-Blindtest Spiel ↔ Video ≤ 60 % |

#### Talent, Übung und Rekord

`mensch.sport.koennen` — **HEUTE 0 / 6**

*misst:* wie Können in einer Bevölkerung entsteht, wächst, altert und Weltrekorde hervorbringt — EIN Gesetz für Sport, Handwerk, Tanz.

*Beleg:* leibWerte (koerper-core.js:5182–5187) rechnet Tempo nur aus der Größe, Sprint fester Faktor 4,5; kein Talent, keine Übung

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 10² Bewohner mit Können-Profil | Streuung wie echt | P · 20 nah | Variationskoeffizient der 100-m-Zeit 10–20 %, Altersgang gegen Normtafeln |
| 2 | 1 Bewohner über 10² Übungsstunden | Potenzgesetz der Übung in Sport, Handwerk, Tanz | P · nah über Spielstunden | Güte über 100 h gegen Potenzgesetz R² ≥ 0,8 |
| 3 | 10⁴ Bevölkerung | Bestwert wächst mit log N | P · Stadt im Bild | Wettkampf im Bild bei N = 10², 10³, 10⁴: Bestleistung wächst mit der Zahl der Teilnehmer UND ihrer Übung; Gegenlauf: Teilnehmer ÷ 10 oder Übung gekappt → der Bestwert sinkt um die Extremwert-Erwartung ±5 % |
| 4 | 10⁶: Altersklassen, Vereine, Meister | Verteilung je Altersklasse realistisch | P | Meisterschaft je Altersklasse im Bild gefahren: Siegerzeiten gegen Masters- und Landes-Rekordtafeln KS p ≥ 0,05 |
| 5 | 10⁹: Weltrekorde emergieren | 100 m 9,4–9,9 s, Hochsprung 2,30–2,50 m, Marathon 2:00–2:06 h, unter fremder g skaliert | P | Weltmeisterschaft im Bild gefahren: Siegerleistung je Disziplin im Band; Gegenlauf: Teilnehmer ÷ 10 → Rekord sinkt; ohne Übung kein Eintrag im Band |
| 6 | Rekorde über Jahrhunderte | Kurve folgt Teilnehmerzahl, Ernährung, Technik | P · Zeitsprung ≤ 5 s | 100-m-Rekordkurve gegen 1900–2009 ≤ 3 % je Jahrzehnt |

#### Mannschaft und Taktik

`mensch.sport.mannschaft` — **HEUTE 0 / 7**

*misst:* wie viele Spieler zugleich regelgerecht und klug zusammen- und gegeneinander spielen.

*Beleg:* 0 Mannschaften; Bewohner folgen nur dem Tagesplan

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 gegen 1 (Ringen, Fechten) | Finte, Abwehr, Reaktion | P · 2 Leiber nah | Siegquote des Stärkeren 60–80 %, nie 100 % |
| 2 | 5 gegen 5 | Raum öffnen, Pass vor Lauf | P · 10 Leiber + Ball | Passquote und Ballbesitzkette gegen Amateur-Statistik ± 20 % |
| 3 | 11 gegen 11 mit Schiedsrichter | Formation, Pressing, Abseits | P · 23 Leiber + Ball | Tore je Spiel 2–3,5, Pässe 700–1 100 |
| 4 | 10² Vereine: Stile | Taktik lernt, Trainer prägen | P · 1 Partie im Bild | Clustering der Passnetze trennt ≥ 4 Stile |
| 5 | 10³–10⁴ Leiber (Volksfußball, Marathon) | Strom und Stau im Feld | P · 10⁴ Läufer im Bild | Dichte-Tempo-Kurve des Marathons ± 15 % |
| 6 | Taktik der Epochen | Formationen folgen Regel und Zeit | P · Partie je Epoche | Formation je Jahrzehnt (2-3-5 → 4-4-2 → 4-3-3) im Fachurteil ≥ 80 % |
| 7 | Weltklasse-Taktik in jeder Art der Grammatik | Analyst unterscheidet nicht | P · 23 Leiber + Stadion | Tracking-Blindtest Spiel ↔ Liga ≤ 60 % |

#### Arena, Publikum und Liga

`mensch.sport.arena` — **HEUTE 0 / 7**

*misst:* wie viele Zuschauer, Spielstätten und Wettbewerbe aus Stadt und Bevölkerung wachsen.

*Beleg:* Prüfstand-Hof 22 Geräte, Spielplatz mit Bänken (fachwerk-core.js:10014); 0 Zuschauer, 0 Ligen

*alte Karte:* pflicht.F

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Spielfeld aus dem Ort-Gesetz, 10 Zuschauer | Zuschauer schauen dem Ball nach | P · Feld + 10 nah | Blickrichtungen folgen dem Geschehen ≥ 80 % |
| 2 | 10² Zuschauer, Jubel | Laut und Bewegung folgen dem Spielstand | P · Tribüne nah | Lautstärke-Spitze ≤ 0,5 s nach dem Tor |
| 3 | Stadion mit 10⁴ Zuschauern aus Epoche und Bau-Gesetz | liest wie ein echtes Stadion seines Typs | P · volles Haus | Bildvergleich gegen Fotos des Typs; ≥ 1 000 Zuschauer nah sichtbar bewegt |
| 4 | Liga: 20 Vereine aus 20 Städten | Heimvorteil, Tabelle realistisch | P · Tabelle bei Ankunft | Punkteverteilung gegen reale Ligen KS p ≥ 0,05 |
| 5 | 10⁵ Zuschauer, Welle, Fanmarsch | Fanmarsch koppelt an Verkehr | P · Stadion + Stadtverkehr | Welle 10–15 m/s; Bild im Preis |
| 6 | 10⁴ Ligen über Epochen, Weltmeisterschaften | Ruhm und Rivalität über Jahrzehnte | P · Zeitreise ≤ 5 s | 100 Jahre zurück: andere Sieger, Arten, Bauten |
| 7 | 10⁵–10⁷ Partien an jedem Nachmittag, jedes Feld jedes Planeten | Hinterhof bis fremdes Stadion | P · Zufallsort, Zufallsstunde | Partie in Sichtweite in ≥ 30 % der Stadt-Stichproben am Nachmittag |

#### Handwerk, Tanz und Kampf als Kunst

`mensch.sport.kunst` — **HEUTE 0 / 6**

*misst:* ob man Stil, Meisterschaft und Kultur in der Bewegung sieht.

*Beleg:* Güte steckt in der Waffe (gueteFaktor schmiede-core.js:4062), nicht in der Hand

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 2 Leiber: Meister und Anfänger in 3 Künsten | Anfänger sichtbar ungeschickt | P · 2 Leiber nah | Blindtest Anfänger ↔ Meister ≥ 80 % |
| 2 | die Hand prägt das Werk (10 Werkstücke) | Meister-Topf, Meister-Klinge messbar besser | P · Werkstatt nah | Werk-Güte gegen Können-Profil R² ≥ 0,7 |
| 3 | 20 Tänzer zur Musik, Paar und Gruppe | Takt und Partner synchron | P · 20 nah | Schritt-Takt-Abstand ≤ 50 ms |
| 4 | 10² Stile je Kultur aus der Grammatik | Kampfstil und Tanz erkennbar | P · Fest auf dem Platz | Fremde ordnen 10 Stile ihrer Kultur ≥ 70 % |
| 5 | Lehrerkette über 3 Generationen | Stil wandert mit Meister und Schüler | P · Zeitreise | Stil-Abstand Schüler ↔ Meister < Schüler ↔ Fremder |
| 6 | neue Künste fremder Kulturen und Körper | kohärent und unterscheidbar | P · fremder Planet | N = 100 Saaten: ≥ 70 % kohärent, paarweise unterscheidbar |

#### Geist-Spiele

`mensch.sport.geistspiel` — **HEUTE 0 / 6**

*misst:* ob Bewohner Brett-, Karten-, Würfel- und Rätselspiele am Tisch spielen, und wie viele davon das Gesetz erzeugt.

*Beleg:* kein Brett-, Karten- oder Würfelspiel (Grep leer)

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Brettspiel zwischen 2 Bewohnern | Hand setzt den Stein, Brett als Gerät | P · Tisch nah | 100 Partien, 0 regelwidrige Züge |
| 2 | 10 Tische, Spielstärke streut | Elo-Spreizung wie Vereinsschach | P · Wirtshaus | Elo 800–2 000, Rang ↔ Übung ρ ≥ 0,6 |
| 3 | 10² historische Spiele aus EINER Grammatik | Ausdruckskraft | P · Ankunft am Tisch | 100 Zufallsspiele eines Archivs: ≥ 90 % reproduziert |
| 4 | 10² neue Spiele aus der Saat | ausgewogen, entscheidbar, nicht trivial | P · Tisch nah | N = 100: ≥ 70 % bestehen Qualitätsmaße (Siegquote 40–60 %) |
| 5 | Spiele wandern über Handelswege (10³ Städte) | Senet → Backgammon, Chaturanga → Schach | P · Zeitreise ≤ 5 s | Verwandtschaft ↔ Handelskontakt ρ ≥ 0,5 |
| 6 | jede Kultur jedes Planeten | Spiele folgen Kultur und Wahrnehmung der Art | P · Tisch auf fremdem Planeten | N = 100 Saaten: ≥ 70 % bestehen Qualitätsmaße, paarweise unterscheidbar ≥ 90 % |

#### Sport in jedem Medium — Schnee, Brandung, Luft, Motor, Tier

`mensch.sport.medium` — **HEUTE 0 / 7**

*misst:* ob Sport dort wahr ist, wo das Medium die Leistung macht: Kante im Schnee, Kufe auf Eis, Brett auf der Welle, Schirm im Aufwind, Reifen an der Haftgrenze, Pferd unter dem Reiter — dazu Sport mit anderem Leib (Rollstuhl, Prothese) und das Wettspiel am Bildschirm.

*Beleg:* Lauf, Sprung und Fahrt am Boden (siehe mensch.sport.koerper); Schnee mit Einsinken 1/2 (wetter.K4, headless); kein Sport in Schnee, Wasser oder Luft gemessen.

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | EINE Abfahrt auf Schnee | die Kante greift, der Schwung trägt, Sturz bei zu viel Tempo | P · Hang | Schwung-Radius gegen Tempo und Kantwinkel ±15 %; Zeit auf 500 m Höhe im Band realer Abfahrten |
| 2 | Eis und Brandung | die Kufe gleitet und schneidet; die Welle trägt das Brett nur auf ihrer Schulter | P | Gleitweg auf Eis gegen den Reibwert ±15 %; Wellenritt nur bei Wellenhöhe und Winkel im Band, Gegenlauf flaches Wasser |
| 3 | Luft: Gleitschirm, Fallschirm, Segelflug | Aufwind am Hang und unter der Wolke trägt; ohne ihn sinkt man | P · Flug | Gleitzahl ±10 %; Steigen nur über Hang-Aufwind und Thermik des EINEN Wetters (Gegenlauf Wind aus) |
| 4 | Motor: Rennen auf 20 Strecken | Haftung, Windschatten, Haushalt von Reifen und Kraftstoff | P | Bestzeit gegen die Rekordklasse ±5 %; Überholen im Windschatten tritt auf |
| 5 | Tier im Sport: Rennen, Springen, Schlitten | Leistung aus Leib und Tagesform des Tiers, Bindung an den Reiter | P | Siegerzeit über 2 400 m im Band; Gegenlauf fremder Reiter → die Leistung sinkt |
| 6 | Sport mit anderem Leib und am Bildschirm | Rollstuhl-Sport und Lauf mit Prothese nach deren Physik; Wettspiel als Spiel im Spiel mit Publikum | P | Zeiten im Band der Klassen-Rekorde; das Bildschirm-Spiel ist spielbar und hat einen Sieger |
| 7 | jede Sportart jedes Mediums, auf jeder Welt | Ski bei einem Drittel der Schwere, Segeln auf Methan, Flug in dichter Luft | P | 100 Saaten: Leistung skaliert mit Schwere und Dichte der Welt nach dem Gesetz, Rang ≥ 0,7 |

### Geist, Alltag, Lebenslauf

*Referenz-Korpus (R6, R11):* Zeitverwendungs-Erhebungen (ATUS, HETUS), Sterbetafeln, Netzwerk-Studien, Gesprächs- und Mimik-Korpora

#### Bedürfnis und Tag

`mensch.geist.tag` — **HEUTE 0 / 8** · Kern 1

*misst:* ob eine zufällig angetroffene Person einen Tag lebt, der statistisch wie ein echter aussieht.

*Beleg:* TAGES_GESETZ 6 Akte (koerper-core.js:4919, 5057), Soll-Orte 81/81, Wiederkehr max 1,2 m (mensch.K2, Radeon und GTX); Dorfplatz-Bild an der Radeon 26,9 fps ≈ 37 ms — Preis ROT — KARTE: Kern 1 — Soll-Orte an beiden Geräten grün (mensch.K2); der Bild-Preis reißt am Dorfplatz (Radeon ≈ 37 ms).

*alte Karte:* mensch.K2

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 ◐ | 10² in 1 Siedlung | 6 Akte, Ortswahl nach 5 statischen Bedürfnissen | P · Dorfplatz | Zeitraffer 24 h: Soll-Orte ≥ 0,9; Schmiede 10 Uhr besetzt / 2 Uhr leer |
| 2 | 10³, 1 Stadt | ≥ 12 Akte, Wochentag ≠ Feiertag, Kind und Alter anders | P · Stadtplatz | 7 Tage: Akte je Stunde gegen ATUS-Profil ≤ 20 % je Hauptkategorie |
| 3 | 10⁴ | Bedürfnisse als Pegel, 17 Hauptkategorien | P · Stadt | 100 gefolgte Personen: Tagesprofil gegen die Zeitverwendungs-Erhebung ≤ 20 % je Hauptkategorie bei ≥ 0,9; Abweichung vom Vortag bei ≥ 0,3 mit benennbarem Anlass |
| 4 | 10⁵ | ~100 Tätigkeiten, Haushalt teilt Pflichten | P · Straße 7:45 | Bildpaar gegen Berufsverkehrs-Foto: Prüfer trennt ≤ 0,65; Pflichten-Verteilung ≤ 15 % |
| 5 | 10⁶ | ~400 Tätigkeiten (ATUS-Tiefe), Lebensphase und Kultur färben | P · Großstadt | 1 000 Saaten × Personen: Zeitbudget ≤ 10 % gegen Statistik der Epoche bei ≥ 0,95 |
| 6 | 10⁷–10⁸, Megastadt bis jenseits Tokio | Schicht, Nachtleben, Pendeln > 50 km | P · Kosten an Schirm | Wiederkehr nach 1 h ± 2 m in ≥ 0,99 von 10⁴; Fenster-Belegung je Uhrzeit ≤ 15 % |
| 7 | 10⁹, Planet × Epochen | Bauer 1300, Arbeiter 1900, Büro 2020, Nomaden, Fischer; zeitgemäße Tätigkeit | P · Zeitreise ≤ 5 s | 5 Epochen × 5 Kulturen: Zeitbudget ≤ 10 % gegen historische Quellen bei ≥ 0,95 |
| 8 | fremde Planeten | Tageslänge, Schlafbedarf, Sinne geben einen anderen Rhythmus | P · fremder Planet | N = 100 Welten: Rhythmus ↔ Tageslänge r ≥ 0,9; Fremdwelt-Probe (R10) |

#### Gedächtnis und Gespräch

`mensch.geist.gespraech` — **HEUTE 0 / 7**

*misst:* ob eine zufällig angesprochene Person wahr erinnert und spricht.

*Beleg:* Zuwendung 0,267 s, Berührung 0 an der Radeon (mensch.K5), Preis in der Szene unbelegt; Kreaturen-Gedächtnis mit lokalem qwen3:4b (stamm/feld-nexus.js:1281) bricht 0 Download

*alte Karte:* mensch.K5 · ki.K3

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 10² Bewohner ohne Wort | Kopf-Zuwendung, Ausweichen, Furcht-Abstand | P · Begegnung 3 m | Zuwendung ≤ 0,5 s, Berührung 0 |
| 2 | 10 Personen sprechen | Antwort zitiert ≥ 2 wahre Fakten ihres Lebens | P · Antwort p95 ≤ 3 s, ≤ 10 kB je Antwort | Faktentreue ≥ 0,95; Bezug auf die vorige Begegnung |
| 3 | jede Person im Blick (10²–10³) | erinnert jede Begegnung über Sitzungen | P · Antwort p95 ≤ 3 s, ≤ 10 kB je Antwort | neue Sitzung: letzte Begegnung korrekt genannt ≥ 0,95 |
| 4 | 10⁴ | Lebensereignisse (Lehre, Heirat, Verlust) | P · Antwort p95 ≤ 3 s, ≤ 10 kB je Antwort | 100 Befragte: widerspruchsfrei zur Welt ≥ 0,95, Erfindungen ≤ 0,02 |
| 5 | 10⁵ | Gerücht und Wissen wandern, verfälscht mit Abstand | P | Tat am Markt: Kenntnis in 1 km nach 1 Tag im Diffusions-Band |
| 6 | 10⁶ | Charakter und Stimmung färben die Rede | P · Antwort p95 ≤ 3 s, ≤ 10 kB je Antwort | Prüfer unterscheidet 2 Personen gleicher Rolle ≥ 0,9; 2AFC Gespräch gegen menschliche Rollenspieler ≤ 70 % |
| 7 | 10⁹ über Epochen | Jahrzehnte, Großeltern, Sprache der Epoche | P · Antwort p95 ≤ 3 s am Gerät allein, 0 Byte | Zeitreise 1300 ↔ 2020: Anachronismen ≤ 0,01, Faktentreue ≥ 0,95 über 1 000 |

#### Freundschaft, Feindschaft, Ruf

`mensch.geist.netz` — **HEUTE 0 / 6**

*misst:* ob eine zufällige Person in einem wahren sozialen Netz steht (synchron).

*Beleg:* Haus mit n Bewohnern ohne Bindung

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 10² | Haushalt als Familie, Besuch folgt dem Netz | P · Dorf | Besuche zu Verwandten/Freunden ≥ 0,6 |
| 2 | 10³ | Freund, Feind, Rivale, Liebe an Gruß und Meiden | P · Markt | Prüfer sagt aus Gesten Freund/Feind/fremd ≥ 0,7 |
| 3 | 10⁴ | Ruf: Taten ändern die Behandlung | P · Stadt | nach Tat meiden Bekannte des Opfers den Täter ≥ 0,3 öfter als Fremde |
| 4 | 10⁶ | Netz-Statistik einer echten Gesellschaft | P · fern 0 ms | 1 000 Paare befragt: Pfadlänge ~4–7, Antwort bei Wiederholung gleich |
| 5 | 10⁹, Planet × Kulturen | Clan, Zunft, Heiratsregeln je Kultur | P · Ankunft je Kultur | N Saaten × 5 Kulturen: Heiratsregeln konsistent ≥ 0,9 |
| 6 | fremde Arten | Bindungsform folgt der Biologie (Schwarm, Kaste) | P · fremder Planet | N = 100 Welten: Fremdwelt-Probe (R10) — Netzform aus Lebensweise und Sinnen der Art vorhergesagt Rang ≥ 0,7 |

#### Abstammung, Lebenslauf, Demografie

`mensch.geist.generationen` — **HEUTE 0 / 8**

*misst:* ob eine Bevölkerung wahr geboren wird, altert, erbt und stirbt — und die Zeitreise dieselben Familien findet (Geist L5 + Menge L5).

*Beleg:* der Leib kennt nur 18–80 J, keine Kinder (koerper-core.js:120–126); keine Geburt, kein Tod, keine Verwandtschaft bei Menschen (Grep leer)

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Ort, alle Alter | Säugling bis Greis sichtbar verschieden | P · Dorfplatz | Altersanteile im Band der Epoche (Mittelalter ≥ 35 % Kinder) |
| 2 | 10² über Lebensphasen | Kinder ähneln Eltern, Kind spielt, Alter geht langsamer | P · Dorf | Prüfer ordnet Kinder den Eltern ≥ 0,7; Gang je Altersgruppe ≤ 15 % |
| 3 | 10³ über 100 Jahre | Geburt, Tod (Gompertz), Hochzeit, Begräbnis | P · Zeitraffer ohne Bruch | Sterbetafel: Lebenserwartung ± 3 J gegen Epochen-Referenz |
| 4 | 10⁴: Zeitsprung 10 J | dieselbe Person gealtert, verheiratet oder tot | P · Sprung ≤ 5 s | dieselbe Person erkannt ≥ 0,9, Fremde ≤ 0,1 |
| 5 | 10⁵: Erbe | Haus, Werkstatt, Beruf, Name gehen an Kinder | P · Sprung ≤ 5 s | Sprung 50 J: Häuser mit Nachfahren im Band; Beruf Vater → Kind ≥ Erwartung |
| 6 | 10⁶–10⁷ über 1 000 J | demografischer Übergang, Migration, 30 Generationen | P · Zeitreise ≤ 5 s | Pyramiden 1300/1800/2000 gegen Referenz; Ahnenreihe bei Wiederholung gleich |
| 7 | 10⁹ über die Menschenzeit | 10⁶ (Jungsteinzeit) bis 10¹⁰ | P · Zeitreise ≤ 5 s | Weltbevölkerung je Jahrtausend log-Fehler ≤ 0,3; Enkelin des getroffenen Kindes auffindbar und ähnlich ≥ 0,7 |
| 8 | fremde Evolutionen | Lebensspanne, Brut, Kaste, Teilung | P · fremder Planet | N = 20 Saaten: stabile Populationen ≥ 0,8; Pyramide folgt der Lebensspanne |

#### Absicht und Charakter

`mensch.geist.absicht` — **HEUTE 0 / 6**

*misst:* ob Personen eigene Ziele über Jahre verfolgen und daraus ungeschriebene Geschichten fallen.

*Beleg:* keine Ziele, keine Charakterzüge, die das Handeln ändern

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 10² | Charakterzüge ändern den Tag | P · Dorf | 20 Personen nach 1 Spieltag ihrem Zug zugeordnet ≥ 0,6 |
| 2 | 10³ | Ziele über Monate (sparen, werben, lernen) | P · Stadt | 100 Befragte, 1 Spieljahr später: Fortschritt sichtbar ≥ 0,5 |
| 3 | 10⁴ | Ziele über Jahre ändern die Welt (Haus, Werkstatt, Umzug) | P · Sprung ≤ 5 s | Sprung 10 J: erklärte Ziele in der Welt ≥ 0,3, je auf eine Person rückführbar |
| 4 | 10⁶ | Ziele kreuzen sich (Rivalen, Allianz, Verrat) | P · Großstadt | 100 Saaten: Geschichten „erzählenswert und folgerichtig“ ≥ 0,5 |
| 5 | 10⁹, Epochen | Lebensentwürfe je Epoche und Kultur | P · Zeitreise | anachronistische Ziele ≤ 0,01; Verteilung im historischen Band |
| 6 | fremde Gesellschaften | Ziele folgen Biologie und Kultur der Art | P · fremder Planet | N = 100 Welten: Fremdwelt-Probe (R10) — Lebensentwurf aus Leib, Welt und Gesellschaft der Art vorhergesagt Rang ≥ 0,7 |

#### Innenleben — Gefühl, Bindung, Kindheit, Alter

`mensch.geist.innenleben` — **HEUTE 0 / 7**

*misst:* ob Bewohner ein Innenleben haben, das man ihnen ansieht und das ihr Handeln ändert: Freude, Trauer, Zorn, Liebe, Humor, Angst; Kinder, die spielen; Alte, die langsamer werden; Träume und seelische Not.

*Beleg:* Gewalt → Furcht lokal (siehe mensch.kopplung.leben); Trauer +0,3 und Ehrfurcht +0,2 nach dem Tod des Spielers als Feld-Werte (stamm/koerper-seele.js:322-352, siehe erleben.sinn.tod) — im Gesicht und im Tag der Bewohner nie gemessen.

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | EIN Bewohner, 4 Gefühle in Gesicht und Gang | jedes mit Anlass in der Welt (Verlust, Fest, Gefahr) | P · nah 3 m | Panel nennt das Gefühl aus 5 s Film ≥ 70 %; Gegenlauf ohne Anlass → neutral |
| 2 | 10² Bewohner: das Gefühl ändert den Tag | wer trauert, bleibt daheim; wer sich freut, sucht Gesellschaft | P | Todesfall ausgelöst: das Tagesprofil der Angehörigen ändert sich über Tage und kehrt zurück; die Kontrollgruppe bleibt gleich |
| 3 | Kinder und Alte, 10³ | Kinder spielen miteinander nach eigenen Regeln; Alte gehen langsam, erzählen, werden versorgt | P · Platz | Spiel der Kinder im Bild erkannt (Fangen, Ball, Verstecken) ≥ 70 %; Gangtempo je Alter gegen Normtafeln ±15 % |
| 4 | Bindung: Liebe, Freundschaft, Streit, 10⁴ | Paare finden sich und trennen sich; Nähe im Raum zeigt die Bindung | P | Abstand und Blickdauer zweier Personen ↔ ihre Bindung r ≥ 0,6; 100 Paare über 1 Spieljahr: jede Wende hat einen Anlass |
| 5 | Humor, Traum, seelische Not, 10⁵ | der Scherz wird belacht; wer Schlimmes sah, schläft schlecht und meidet den Ort | P | Zeugen eines Unglücks meiden den Ort messbar über Wochen, Gegenlauf ohne Unglück; Lachen folgt dem Scherz in der Menge |
| 6 | ein Leben von innen: der Spieler in einer Rolle spürt deren Gefühl | Sicht, Tempo, Wahl färben sich (Angst verengt, Freude öffnet) | P | blinde Spieler nennen nach 5 min in der Rolle deren Gefühl ≥ 70 % |
| 7 | Innenleben jeder Art jeder Welt | fremdes Gefühl aus fremdem Leib und Sinn, doch lesbar | P | Fremdwelt-Probe (R10): der Anlass aus dem Verhalten gelesen Rang ≥ 0,7 |

### Millionen — Bevölkerung, Masse, Strom

*Referenz-Korpus (R6, R11):* Zensus, Fundamentaldiagramme für Fußgänger, Zählreihen, Luft- und Videoaufnahmen realer Mengen

#### Bevölkerung mit eigenem Plan

`mensch.menge.bevoelkerung` — **HEUTE 0 / 9**

*misst:* wie viele Menschen die Welt zugleich führt, jeder mit Plan f(Same, t), am Soll-Ort ± 2 m, in jedem Jahr (Menge L1 + Geschichte L7).

*Beleg:* 81/81 Häuser bewohnt, Test-Stadt 118 Bewohner (14.11.); Dorfplatz Radeon 26,9 fps ≈ 37 ms — Preis ROT (mensch.K1)

*alte Karte:* mensch.K1

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 10² (ein Dorf) | Tag als Funktion der Uhr, 4–10 Wege | P · Dorfplatz | Zählung im Bild an 20 Stichproben (Ort × Uhr): Körper am Ort gegen den Soll-Plan ±10 %; niemand fehlt, niemand steht doppelt |
| 2 | 10³ (Stadt, 300 Häuser) | Wohnort ≠ Arbeitsort | P · Stadt des Worts | 20 Stichproben-Personen ± 2 m angetroffen |
| 3 | 10⁴ | Haushalte, Alter 0–100, Rollen aus Zensus-Randverteilungen | P · Stadt | Alters- und Haushaltsverteilung gegen Zensus der Epoche KS ≤ 0,1 in ≥ 0,9 von 20 Saaten |
| 4 | 10⁵ (Großstadt) | Sprung an beliebigen Ort ohne Bruch | P · beliebiger Ort | 100 Teleports: ≥ 0,95 der Angetroffenen am Plan-Ort |
| 5 | 10⁶ (Metropole; Rom 100, Edo 1700) | Ganglinien emergent; jeder mit Haus, Arbeit, Familie | P, Bildkosten 10⁶ ↔ 10³ ≤ + 10 % | wie 4 bei 10⁶; 1 000 Zufallsbewohner: Haus, Arbeit, Familie ≥ 0,95 |
| 6 | 10⁷–4·10⁷ (Megastadt bis Tokio-Maß) | Region aus Städten, Fernpendeln | P | wie 4 über 10⁷; Alters- und Haushaltsverteilung gegen Zensus KS ≤ 0,1 in ≥ 0,9 von 20 Saaten |
| 7 | ≥ 4·10⁸ in EINER Bebauung (Jenseits) | die Stadt trägt sich | P | 100 Teleports ≥ 0,95; 1 000 Personen mit Wohnung, Werk, Versorgung ≥ 0,99 |
| 8 | 10⁹–10¹⁰ (Planet) | Nationen, Epochen-Demografie | P | Dichte aus dem Orbit gegen Nachtlicht-Muster Rang-r ≥ 0,7 in ≥ 0,8 von 20 Saaten |
| 9 | 10¹⁰ je Planet × jedes Jahr × viele Welten | jede Zufallsperson mit Gesicht, Biografie, Ziel | P, Zeitreise ≤ 5 s | 1 000 Proben: Lebenslauf konsistent ≥ 0,99; dieselbe Person in t und t + 20 gealtert dieselbe |

#### Sichtbare Menge

`mensch.menge.bild` — **HEUTE 0 / 7**

*misst:* wie viele Menschen der Spieler in EINEM Bild sieht, lebendig, ohne Zwillinge und Attrappen. Die Menge in der Ferne ist die Summe der Einzelnen: Anflug-Probe — N = 100 Punkte der Menge angeflogen, dort steht ein Einzelner, der dasselbe tut (Ort ±2 m, Richtung, Tätigkeit); die EINZIGE Leiter für Menschen in einem Blick.

*Beleg:* 18 Menschen am Dorfplatz, 0 gehend, 26,9 fps Radeon; voll lebendig höchstens 4 Leiber im 8-m-Kreis (nahLeiber, siedlung-bewohner.js:1551)

*alte Karte:* mensch.K1 · mensch.K4

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 10¹ im Bild | die Gehenden gehen | P · Dorfplatz 8 Uhr | ≥ 10 Menschen, ≥ 3 gehend |
| 2 | 10² | keine zwei gleich, ≥ 40 % gehend | P · Markt | ≥ 100 Menschen, ≥ 40 gehend; Zwillingssuche 0 |
| 3 | 10³ (Markt, Bahnsteig) | Nahring 20 m voll lebendig | P · Bahnsteig | Bildpaar gegen Foto eines vollen Bahnsteigs: Dichte ± 20 %, Zwillinge 0 |
| 4 | 10⁴ (Platz, Demonstration) | fern Dichte, nah Leiber, kein Sprung | P · Kamerafahrt Rand → Mitte | 0 Ploppen am Übergang; Zählung ≥ 10⁴ |
| 5 | 10⁵ (Stadion) | Phänomene ohne Skript (La-Ola) | P · Stadion | Welle 10–15 m/s, Breite 6–12 m; ≥ 5 Startorte in 10 Läufen |
| 6 | 10⁶ (Pilgerfest) | aus der Höhe Struktur, im Herabfliegen Gesichter | P · Flug | Orbit → Gesicht ≤ 10 s ohne Bruch; Zählung im Kegel ≥ 10⁶ |
| 7 | 10⁷–10⁸ (Turmblick über die Megastadt) | liest auf jedem Abstand als Menschen | P · Turm | Bildpaare 10 m bis 10 km gegen Fotos realer Großstädte; Zählung ≥ 10⁷ |

#### Massen-Physik

`mensch.menge.dichte` — **HEUTE 0 / 7**

*misst:* ob Mengen sich wie wirkliche verhalten: Spurbildung, Fundamentaldiagramm, Engpass, Gedränge.

*Beleg:* Ausweichen ohne Berührung (mensch.K3, headless), Preis unbelegt; kein Fundamentaldiagramm, kein Engpass

*alte Karte:* mensch.K3

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Paar | Ausweichen ohne Berührung | P · Gasse | Berührung 0, kleinster Abstand ≥ Radius |
| 2 | 10² im Gang | Spurbildung im Gegenstrom | P · Korridor | Spuren in ≤ 30 s, Ordnungsparameter ≥ 0,7 |
| 3 | 10³ | Fundamentaldiagramm v(ρ) | P · Messfeld | v(ρ) ± 15 % der Weidmann-Kurve, 0,5–4 P/m² |
| 4 | 10³–10⁴ am Engpass | Bogenbildung, faster-is-slower | P · Tür-Räumung | spezifischer Fluss 1,2–1,9 P/(m·s) |
| 5 | 10⁴ | Stop-and-go, Turbulenz | P · dichter Strom | Wellenperiode und -tempo ± 25 % gegen Aufnahmen |
| 6 | 10⁵ | Gedränge nur, wo die Topologie es erzwingt | P · Fest | Gedränge-Zellen > 5 P/m² an den erzwungenen Stellen; breiterer Ausgang ⇒ 0 |
| 7 | 10⁷ (Badefest am Fluss) | Kontinuum und Einzelner zugleich wahr | P · Festplatz | 20 Zufallsfestplätze: Gedränge an erzwungenen Stellen ≥ 0,9 |

#### Ströme und Tagesrhythmus

`mensch.menge.rhythmus` — **HEUTE 0 / 7**

*misst:* wer wann von wo nach wo geht — Ganglinie, Pendeln, Wochen- und Saisonrhythmus.

*Beleg:* 5–8 Wege je Tag, Wiederkehr 1,2 m (mensch.K2); Preis in der Szene unbelegt, Takt der Bewohner 1,52–1,82 ms an der Stadt — KARTE: 0 — die Messung mensch.K2 hebt den Kern von mensch.geist.tag (R9); der eigene Lauf (Wege je Tag im Bild gezählt) fehlt.

*alte Karte:* mensch.K2

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Wege in 1 Siedlung | Heim, Platz, Werk, Mahl, Abend, Besuch | P · Dorf | 4–10 Wege je Tag, Wiederkehr ≤ 2 m |
| 2 | 10³ Wege/h (Stadt) | Morgen- und Abendspitze emergent | P · Platz | zwei Spitzen, Spitze/Tal ≥ 3 |
| 3 | 10⁴ Wege/h | Pendelmatrix nach Gravitationsmodell | P · Stadt | Pendeldistanz gegen Zensus KS ≤ 0,15 in ≥ 0,8 von 20 Saaten |
| 4 | 10⁵/Tag an einem Knoten | Bahnhof als Schleuse | P · Bahnsteig 8 Uhr | Dichte 8 Uhr 2–4 P/m², 3 Uhr < 0,05 |
| 5 | 10⁶/Tag | Netz von Knoten, Umstieg | P · Großknoten | Durchgänge ≥ 10⁶, Ganglinie gegen reale Form |
| 6 | 10⁷/Tag (Megaregion) | Woche, Feiertag, Saison | P | Sonntag/Werktag und Ferien/Schule im Band realer Zählungen |
| 7 | 10⁸–10⁹/Tag (Planet, jede Epoche) | Fernreisen, Pilgerzüge | P, Zeitreise ≤ 5 s | Flüsse aus dem Orbit gegen reale Netze der Epoche |

#### Gesundheit, Seuche, Medizin

`mensch.menge.seuche` — **HEUTE 0 / 6**

*misst:* ob Krankheit und Heilung aus den Kontakten der Menge entstehen — EIN Erreger-Parametersatz.

*Beleg:* kein Gesetz für Krankheit bei Menschen (Grep Seuche/krank/Epidem leer)

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Person krank | Haltung, Husten, bleibt daheim | P · Dorf | Bildpaar gesund/krank; Krank-Tag weicht ab |
| 2 | 10² Dorf-Ausbruch | Ansteckung aus echten Kontakten | P · Dorf | Kurve S-I-R, R0 im Band des Erregers |
| 3 | 10⁴ Stadt | Pendlerwege tragen, Quarantäne wirkt | P · Stadt | Markt geschlossen ⇒ Spitze ≥ 30 % niedriger |
| 4 | 10⁶ Region | über Handelswege | P | Ankunft je Stadt ↔ Netzabstand r ≥ 0,7 |
| 5 | 10⁸ über Epochen | Erreger und Medizin der Epoche | P, Zeitreise ≤ 5 s | 20 Erreger im Band historischer Ausbrüche ≥ 0,8; Lebenserwartung 1800 → 2000 + ≥ 30 J |
| 6 | 10¹⁰ (Planet) | Welle über das Flugnetz, Mutation, Immunität | P | Wellenzahl und -abstand im Band realer Pandemien; jede Infektionskette verfolgbar |

#### Kollektiv in Bewegung

`mensch.menge.kollektiv` — **HEUTE 0 / 7**

*misst:* ob ganze Mengen aus EINEM Antwort-Gesetz auf Ereignisse reagieren — von der Flucht bis zur Völkerwanderung.

*Beleg:* Furcht weitet den Abstand 1,335 → 1,952 m (mensch.K5, Radeon), Preis unbelegt

*alte Karte:* mensch.K5

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Umstehende einer Szene | nach Gewalt fliehen sie | P · Platz | Abstand nach der Tat > vorher |
| 2 | 10² | Schreck über Sicht und Klang | P · Markt | Schreck-Front 3–8 m/s, Flucht weg ≥ 0,9 |
| 3 | 10³–10⁴ (Demonstration) | Zug mit Ziel, Ruf, Kordon | P · Demo | Kopf 0,5–1 m/s, Länge × Dichte = Teilnehmer ± 10 % |
| 4 | 10⁵ (Räumung einer Stadt) | Gefahr ⇒ Räumung über Brücken | P · Stadt | 20 Zufallsgefahren: Räumungszeit ± 25 %, Stau an Engstellen ≥ 0,8 |
| 5 | 10⁶ (Flucht über Land) | Lager, Grenzen, Sterblichkeit | P · Lager | Tagesstrecke 10–30 km; Lagerdichte gegen Luftbild |
| 6 | 10⁷ über Jahrzehnte (Völkerwanderung) | Volk gründet Städte, Sprache wandert mit | P, Zeitreise ≤ 5 s | Siedlungen entlang der Route ≥ 0,6; ungesetzte Wanderungen aus Mangel ≥ 0,8 |
| 7 | 10⁸–10⁹ über Jahrtausende | Ausbreitung einer Art über den Planeten | P, Zeitreise ≤ 5 s | Besiedlungsfront je Jahrtausend log-Fehler ≤ 0,3 |

### Siedlung und Stadt

*Referenz-Korpus (R6, R11):* Stadtpläne (OpenStreetMap), Luft- und Straßenfotos je Stadtklasse, Nachtlicht (Black Marble), Rang-Größen-Tafeln; für die Messlatte die genannten Vergleichstitel im selben Protokoll

#### Größe einer zusammenhängenden Stadt

`mensch.stadt.groesse` — **HEUTE 0 / 8**

*misst:* wie groß eine zusammenhängende, betretbare Stadt wird — gezählt im Bild oder per Anflug, im Blindpaar gegen Fotos realer Städte derselben Klasse und in der Statistik ihres Plans (Orientierungs-Entropie, Blockgrößen, Rang-Größe der Höhen); gegen ein Band vieler Städte, nie gegen EINE — kein Abbild. Die Messlatte der besten Spiel-Städte zählt mensch.stadt.messlatte.

*Beleg:* Start-Dorf 12 Häuser in den E-Messorten (GTX 16,8 ms); Stadt des Worts 300 Häuser, 1,08 Mio. Dreiecke, P an der vollen Stadt nie gemessen; GROESSE_WAND 500 (fachwerk-core.js:3354); Häuser lesen als weiße Kästen mit Fenstern (14.11.) — KARTE: 0 — kein Blindpaar gegen ein Foto gefahren; P an der vollen Stadt nie gemessen.

*alte Karte:* siedlung.K5

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Weiler: 10 Gebäude | Tür, Dach, Hof; keine zwei gleich | P · Ortsrand | im Bild gezählt ≥ 10 Häuser; Straßenbild gegen Foto eines Weilers: Panel-2AFC ≤ 90 %; Zwillinge im Bild 0 |
| 2 | Marktstadt: 10² Gebäude | Platz, Kirche, Markt, Mauer | P · Marktplatz | im Blick gezählt ≥ 100; 2AFC Straßen- und Luftbild ≤ 85 %; Gassenbreiten und Parzellen im Band realer Marktstädte ±30 % |
| 3 | Kleinstadt: 10³ | Viertel unterscheidbar | P · höchster Punkt | Anflug-Zählung ≥ 10³; 2AFC ≤ 80 %; Blockgrößen-Verteilung gegen reale Kleinstädte KS ≤ 0,2 |
| 4 | Großstadt: 10⁴ | Innenstadt, Vorstadt, Gewerbe | P · Flug 100 m/s | Zählung an 20 Stichflächen, hochgerechnet ≥ 10⁴ ±10 %; 2AFC ≤ 75 %; Orientierungs-Entropie und Blockgrößen im Band der Stadtklasse |
| 5 | Metropole: 10⁵ Gebäude, 10⁶ Bewohner | Skyline aus 20 km lesbar | P · Zentrum | Zählung ≥ 10⁵; 2AFC Skyline und Straße ≤ 70 %; Rang-Größe der Gebäudehöhen im Band von ≥ 10 realen Metropolen |
| 6 | Megastadt: 10⁶ Gebäude, 10⁷ Bewohner, ~2 000 km² | lückenlos bis zum Horizont | P · 20 Zufallstürme | Zählung ≥ 10⁶; bebaute Horizontpixel ≥ 90 %; 2AFC Luftbild ≤ 65 %; Stadtplan-Statistik im Band an 100 Stichflächen |
| 7 | Tokio-Maß: 10⁷ Gebäude, 3,7·10⁷ Bewohner, ~8 500 km² | jede Straße eigen | P · jede Pose | 100 km am Boden ohne Ladeschirm; 1 000 Straßenbilder: 2AFC gegen Fotos einer Megastadt ≤ 60 %, Zwillinge ≤ 1 %; Zählung an 100 Stichflächen |
| 8 | Jenseits: ≥ 10⁸ Gebäude, ≥ 4·10⁸ Bewohner — zehnmal Tokio in EINER Bebauung | Stadt als Landschaft; alles Gesehene ist betretbar | P · jede Pose | 100 Zufallsposen: jedes im Bild gewählte Gebäude (N = 1 000) wird angeflogen und betreten — die Tür führt in einen Raum ≥ 99 %; Zwillinge ≤ 0,1 %; Stadtplan-Statistik je Viertel im Band, Viertel untereinander verschieden |

#### Stadtform-Wahrheit

`mensch.stadt.form` — **HEUTE 0 / 7**

*misst:* ob Kern, Rand, Viertel, Netz und Dichte den Gesetzen realer Städte folgen — bis die Form ihre Ursachen verrät.

*Beleg:* Kern-Verdichtung (fachwerk-core.js:4632), Gewerbe-Hallen am Rand (:3693) im Code, Richter nie gefahren; kein Bodenwert (Grep 0)

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Stadt: Kern und Rand | geschlossene Straßenwand im Kern, Gewerbe am Rand | P · Straße | geschlossene Wand Kern ↔ Rand ≥ 2:1 |
| 2 | Großstadt: Viertel aus dem Bodenwert | nicht aus einer Typen-Liste | P · Straße | Blindtest Lage und Wohlstand aus 20 Straßenbildern ≥ 70 % |
| 3 | Großstadt: Dichtegradient und Höhe | Clark-Gradient, Turm im Kern, Slum am Hang | P | exponentieller Fit R² ≥ 0,8; Höhen-Median Kern/Rand ≥ 5 |
| 4 | 10² Saaten: Netz-Statistik | Blockgröße, Knotengrad, Orientierungs-Entropie | P | 4 Kennzahlen im Band von 100 realen Städten (OSM) ≥ 80 % |
| 5 | 10² Saaten je Größenklasse: Luftbild | Draufsicht wie Satellitenbild | P · Flug | Verwechslungsrate ≥ 40 % |
| 6 | jede Straße: Bodenblick | Pflaster, Schilder, Abnutzung, Leben | P · Straße | Verwechslung gegen Street-View gleicher Stadtklasse ≥ 40 % |
| 7 | 10² Saaten: Umkehr-Wahrheit | die Form trägt Alter, Wohlstand, Klima, Gelände | P | Kenner lesen die Saat-Parameter aus Luft- und Straßenbild ≥ 70 % |

#### Vertikale Stadt

`mensch.stadt.vertikal` — **HEUTE 0 / 8**

*misst:* wie viele begehbare Stadtschichten übereinander liegen und wie hoch die Stadt wächst.

*Beleg:* höchster Typ hochhaus mit 7 Geschossen (fachwerk-core.js:1987); keine zweite Ebene, keine Arkologie (Grep 0) — KARTE: 0 — Beleg ist ein Code-Zitat (R2).

*alte Karte:* siedlung.K1

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Ebene, Häuser bis 7 Geschosse | Haus von Keller bis Dachboden | P · Stadt | höchstes Gebäude im Bild, begehbare Ebenen = 1 |
| 2 | Türme 30 Geschosse | Fassade aus 5 km lesbar | P · Fernblick | höchstes Gebäude ≥ 100 m, Silhouette aus 5 km erkennbar |
| 3 | Supertall ≥ 400 m | Fernform hält ohne Flackern | P · Anflug | Anflug 10 km bis Fuß ohne Formsprung, Pixel-Unruhe ≤ 1 % |
| 4 | 2 Ebenen: Brücken, Unterführung, U-Bahn | Unterwelt beleuchtet und belebt | P · Ebenenwechsel | −1 → +1 ohne Ladeschirm; Bewohner auf beiden Ebenen |
| 5 | ≥ 5 Schichten, 10⁶ Menschen/km² lokal (Kowloon) | Gänge, Höfe, Licht von oben | P · im Block | ≥ 10 000 Bewohner je ha; Bildpaar gegen Fotos der Kowloon Walled City: 2AFC ≤ 70 % |
| 6 | Arkologie ≥ 1 km, 10⁶ Bewohner | innen Straßen, Parks, Viertel | P · innen | Fuß → Dach ohne Ladeschirm; Bewohnerzahl der Struktur |
| 7 | Stadtschalen über ≥ 100 km², Ebenen bis 10 km | eigenes Klima je Schicht | P · 100 Zufallsposen | ≥ 10 durchgehend begehbare Schichten |
| 8 | bodenlos: Meeresboden bis Orbit | jede Höhe bewohnt | P · Sprung ≤ 5 s | Straße → Orbit ohne Ladeschirm; Bewohner auf ≥ 5 Höhen-Dekaden |

#### Stadtgestalt aus Ursache

`mensch.stadt.breite` — **HEUTE 0 / 7**

*misst:* die Kraft, Stadtformen aus Klima, Stoff, Technik, Macht und Leib der Bauenden zu erzeugen — gemessen daran, ob man vom Bild auf die Ursache kommt.

*Beleg:* 9 Epochen, 6 Namens-Regionen, 32 Hausstile (fachwerk-core.js:3294–3312, 2012); Netz nur organisch oder Raster, gesetzt statt verursacht; Blindtest nie gefahren

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Familie, 6 Regionen | Region aus dem Stadtbild | P · Stadt | Region einer Stadt aus 6 erkannt ≥ 50 % |
| 2 | 10 Netzformen aus Ursache (organisch, Raster, radial, Wasser, Terrasse, Burg) | Netz und Haus zusammen stimmig | P | 50 Saaten: Kenner nennen die Ursache ≥ 70 % |
| 3 | die Erde: Kulturräume aller Kontinente | gegen Fotos realer Altstädte | P | 20 Referenz-Altstädte glaubhaft ≥ 70 %; Klimazone aus dem Stadtbild ≥ 60 % |
| 4 | 10² Kultur × Epoche | Bauweise folgt Klima, Stoff, Technik | P | 100 Saaten: 2AFC gegen Fotos des Kulturraums ≤ 80 %, paarweise unterscheidbar ≥ 90 % |
| 5 | Zukunft 2100–3000 | Folge von Technik und Klima | P | Fremdwelt-Probe (R10) an 100 Zukunfts-Städten: Ursache (Klima, Energie, Verkehrstechnik) aus dem Stadtbild gelesen Rang ≥ 0,7; Gegenlauf: Technik getauscht → Stadtform kippt ≥ 80 %; Neuheit gegen den Korpus gebauter Städte |
| 6 | fremde Städte | Form folgt dem Bauenden | P · fremder Planet | 100 Saaten: Fremdwelt-Probe (R10) — Körperbau der Bauenden aus dem Stadtbild geschätzt Rang ≥ 0,7 |
| 7 | ≥ 10⁴ unterscheidbare Stadtformen | jede mit Ursache | P | 10 000 Saaten: ≥ 1 000 Cluster im Wahrnehmungsraum; die Erd-nahen im 2AFC gegen Stadtfotos ≤ 75 %, die übrigen mit Fremdwelt-Probe (R10) |

#### Siedlungsnetz

`mensch.stadt.siedlungsnetz` — **HEUTE 0 / 6** · Kern 1

*misst:* wie viele Siedlungen ein Planet trägt, ob Hierarchie und Netz wahr sind und ob der Spieler jede erreicht.

*Beleg:* Stadt binnen 2 km in 7/8 Saaten an Radeon und GTX; Zipf ζ 1,022 [0,956; 1,158] über 8 Saaten, Spannweite 6–500 Häuser (siedlung.K2) — KARTE: Kern 1 — an beiden Geräten grün (siedlung.K2); Bild-Preis am Hügel an der Radeon nicht gemessen.

*alte Karte:* siedlung.K2

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 ◐ | Region 32 × 32 km, Weiler bis Kleinstadt | Rang-Größe-Gesetz | P · Hügel | Stadt binnen 2 km in ≥ 6/8 Spawns; Zipf ζ ∈ [0,8; 1,2] |
| 2 | Land 10³ km | zentrale Orte, Abstände nach Rang | P · Flug | Nachtbild aus 100 km gegen Satellitenbild eines Landes: Verwechslung ≥ 30 % |
| 3 | Kontinent: 10⁴ Städte | Zipf über 4 Dekaden, Handelswege, Grenzen | P · Landung ≤ 5 s | ζ ∈ [0,8; 1,2] über 4 Dekaden; 100 Zufallslandungen ≤ 5 s |
| 4 | Planet: 10⁶ Siedlungen, 8·10⁹ Bewohner | Nachtlicht folgt Küsten, Flüssen, Klima | P · Landung ≤ 5 s | Orbitbild bei Nacht gegen Black Marble plausibel ≥ 70 % |
| 5 | Ökumenopolis: Land ganz Stadt, ≥ 10¹¹ | Viertel, Klimazonen, Epochen-Reste | P · Abstieg | Orbit → Straße ohne Ladeschirm; Horizont ≥ 95 % bebaut, Wiederholung ≤ 0,1 % |
| 6 | 10² Planeten-Saaten | Muster folgt Planet und Art | P | Orbitbilder paarweise unterscheidbar ≥ 90 %, plausibel ≥ 70 % |

#### Siedeln jenseits der Oberfläche

`mensch.stadt.habitat` — **HEUTE 0 / 7**

*misst:* ob Menschen dort wohnen, wo die Oberfläche es nicht erlaubt — unter der Erde, unter Wasser, auf Mond, Mars, Asteroid, im freien Raum — und ob die Siedlung zeigt, was sie am Leben hält.

*Beleg:* Stand 0: jede Siedlung steht auf der Oberfläche EINER Welt (siehe mensch.stadt.vertikal: keine zweite Ebene).

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | EINE Siedlung unter der Erde, 10² Bewohner | Luft, Licht, Wasser haben sichtbare Wege; die Gänge folgen dem Gestein | P | 3 Lebenslinien (Luft, Wasser, Licht) im Bild bis zur Quelle verfolgbar; Gegenlauf Schacht verstopft → die Bewohner verlassen den Trakt |
| 2 | Stadt unter Wasser, 10³ | Druckhülle, Schleusen, Tauchboote, Licht aus dem Wasser | P · innen und außen | Schleuse hin und zurück ohne Ladebild; Hüllform ↔ Tiefe nach dem Druck-Gesetz ±20 % |
| 3 | Kolonie auf Mond oder Mars, 10³ | Schwere, Staub, Strahlung prägen Bau und Tag; Versorgung von außen im Takt | P · Außeneinsatz | Gang der Bewohner bei einem Sechstel und einem Drittel der Schwere gegen Film realer Mondgänge (2AFC ≤ 75 %); Gegenlauf Nachschub aus → der Vorrat fällt, der Tagesplan rationiert |
| 4 | Asteroiden-Bergwerk und Station im freien Raum, 10⁴ | Schwere aus Drehung oder keine; Andocken, Außenarbeit | P | Bewegung in Schwerelosigkeit gegen Stations-Film (2AFC ≤ 75 %); Coriolis im Drehring messbar |
| 5 | Zylinder-Habitat, 10⁶, mit Land und Wetter | Stadt an der Innenwand, der Blick nach oben zeigt Dächer | P | Stadtplan-Statistik im Band der Stadtklasse; Bildpaar gegen Rechen-Referenz |
| 6 | Netz von 10³ Habitaten und Kolonien eines Systems | Handel, Reise, Abhängigkeit zwischen ihnen | P · Sprung ≤ 5 s | Fracht folgt Bedarf; Gegenlauf Habitat gekappt → Mangel bei den Abnehmern nach der Flugzeit |
| 7 | jede Lebensform an jedem Ort jeder Welt (Wolkenstädte, Eis-Ozean, Sternnähe) | Bauart folgt Welt und Leib | P | Fremdwelt-Probe (R10) an 100 Saaten |

#### Die Stadt gegen die Besten

`mensch.stadt.messlatte` — **HEUTE 0 / 7**

*misst:* ob dieselbe Szene die vom Schöpfer genannten Messlatten schlägt — im Blindpaar und in vier Zählungen nach EINEM Protokoll, das im Vergleichstitel genauso gefahren wird: Dinge zum Benutzen je 100 m Straße, betretbare Innenräume je Block, Bewohner mit eigenem Tagesplan je Straße, Sekunden vom Start bis in die Straße. Vergleichstitel: die Stadt aus Cyberpunk 2077 (Night City), die jüngste offene Stadt von Rockstar Games — und, sobald ein Titel sie übertrifft, der beste der Gegenwart; dazu Straßenfotos von Tokio.

*Beleg:* Nie gefahren. Stadt des Worts 300 Häuser, Test-Stadt 35 Häuser mit 118 Bewohnern, Häuser lesen als weiße Kästen mit Fenstern (14.11.).

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | EINE Straße, 100 m, Tag | Fassaden, Läden, Menschen, Verkehr — als Straße gelesen | P | Blindpaar gegen dieselbe Kameralage im Vergleichstitel: das Panel wählt unser Bild in ≥ 20 %; die vier Zählungen sind an beiden gefahren |
| 2 | EIN Block, Tag und Nacht | Innenräume hinter den Türen, Licht aus den Fenstern | P | betretbare Innenräume je Block ≥ Vergleichstitel; Blindpaar ≥ 30 % |
| 3 | ein Viertel, 1 km² | Dichte der Dinge zum Benutzen; Bewohner mit Tagesplan | P | Dinge je 100 m und Bewohner mit Tagesplan je Straße ≥ Vergleichstitel an 20 Zufallsstraßen; Blindpaar ≥ 40 % |
| 4 | Nachtstraße der Megastadt im Regen | Leuchtschrift, Spiegelung, Menge, Verkehr in drei Ebenen | P | Blindpaar gegen die Nachtstraße des dichtesten Vergleichstitels: unser Bild gewählt ≥ 50 %; gegen ein Nachtfoto von Tokio 2AFC ≤ 70 % |
| 5 | die ganze Stadt des Vergleichstitels (10–100 km²) an 100 Zufallsorten | überall dieselbe Tiefe, nicht nur an gebauten Schauplätzen | P | an 100 Zufallsorten alle vier Zählungen ≥ Vergleichstitel in ≥ 90 %; Ankunft in der Straße schneller als dessen Start |
| 6 | zehnmal Fläche und Menge von Tokio | mehr, und nirgends flacher | P | Blindpräferenz ≥ 70 % an 100 Zufallsorten gegen den Vergleichstitel UND gegen Straßenfotos von Tokio 2AFC ≤ 60 % |
| 7 | dieselbe Tiefe in jeder Stadt jeder Epoche, Kultur und Welt | jeder Zufallsort schlägt den besten Schauplatz der Gegenwart | P | 1 000 Zufallsorte über Saaten und Epochen: Blindpräferenz ≥ 70 %, alle vier Zählungen ≥ Vergleichstitel |

### Netze, Verkehr, Stadtstoffwechsel

*Referenz-Korpus (R6, R11):* Straßen- und Bahnnetze (OpenStreetMap), Verkehrszählungen, Fahrpläne, Leitungs-Normen

#### Das Netz als Gestalt

`mensch.netz.gestalt` — **HEUTE 0 / 7**

*misst:* ob Netze in Größe, Hierarchie und Form echten gleichen und EIN Gesetz jede Dichte, Kultur und Welt trägt.

*Beleg:* STRASSENGRAPH-GESETZ (fachwerk-core.js:3810), 4 Klassen; Gefälle nur headless (siedlung.K3), Befahrbarkeit nie gefahren

*alte Karte:* fahrzeug.K2 · siedlung.K3 · siedlung.K5

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Ort, ~10 km, 4 Klassen | Trasse folgt Hang, Brücke über Wasser | P · Fahrt | Gefälle p95 ≤ 9,5 % über 8 Saaten UND jede Klasse ohne Wand oder Klemmen befahren |
| 2 | 10³ Häuser, ~50 km | Kreuzungsgrad, Sackgassen, Block, Entropie | P · dichtester Platz | 3 von 4 Kennzahlen im OSM-Band ± 20 % in ≥ 80 % von 32 Saaten |
| 3 | 10⁴ Häuser, ~500 km, Achsen und Ring | breite Straßen tragen den Verkehr | P · Fernblick | Breite ↔ Fahrten r ≥ 0,7; Luftbild-Echtheits-Probe |
| 4 | 10⁵ Häuser, ~5 000 km, Kreuze auf 2 Ebenen | Kultur prägt Form | P · 130 km/h quer | Unterscheider ordnet 64 Netzbilder der Kultur ≥ 80 % |
| 5 | 10⁶ Häuser, ~3·10⁴ km, 5 Ebenen (Megastadt) | Rampe und Kreuzung aus Fluss × Raum | P · Flug, Landung ≤ 5 s | Luftbild-Probe gegen Tokio/Shanghai; Umweg-Faktor im Tokio-Band |
| 6 | 10⁷ Häuser, ~5·10⁵ km in 3 D | erreichbar bei 10-facher Tokio-Last | P · wie 5 bei 10× Fläche | Tür-zu-Tür-Zeit ≤ Tokio-Referenz; Umweg ≤ 1,4 |
| 7 | Planeten, 10⁸–10⁹ km | Netzform folgt Physik und Wesen | P · jeder Ort ≤ 5 s | 3 Welten × 32 Saaten: Kennzahlen aus dem Gesetz der Welt ± 20 % |

#### Verkehr mit Anlass

`mensch.netz.verkehr` — **HEUTE 0 / 8**

*misst:* wie viele Fahrzeuge und Reisende mit eigenem Anlass zugleich unterwegs sind und ob der Strom echt fließt (Netze L2 + Fahrzeuge L4).

*Beleg:* VERKEHR_GESETZ 1 Wagen je 15 Häuser (fachwerk-core.js:4070), Fahrer würfelt eine Wende (_verkehrZielNeu siedlung-verkehr.js:934); pflicht.C 0/3; GTX reißt bei 36 km/h (35,4 ms)

*alte Karte:* fahrzeug.K2 · profiband.K4 · pflicht.C

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Wagen des Spielers | Route kommt durch | P · Fahrt 50 km/h | 2-km-Route 0 Steckenbleiber, Bild p95 ≤ 33 ms während der Fahrt |
| 2 | 10 Wagen, je ein Bewohner am Steuer | 0 Berührung, 0 Stillstand | P · Marktplatz | nH 300, Tag + Nacht, 10 min: 0 / 0 / 100 % am Ziel UND Wagen im Bild |
| 3 | 10² Teilnehmer an Ampel und Übergang | Folgeabstand, Vorfahrt | P · voller Knoten | Zeitlücken Median 1–3 s; 0 Konflikte |
| 4 | 10³ sichtbar, 10⁴ in der Stadt | Stau entsteht von selbst | P · 10³ Wagen im Bild | Fundamentaldiagramm ± 25 %; Stauwelle rückwärts 15–20 km/h |
| 5 | 10⁵ Wege am Tag mit Anlass | Spitzenstunde aus Tagesplänen | P · Spitzenstunde | Ganglinie r ≥ 0,8; 20 verfolgte Fahrer steigen am passenden Ort aus ≥ 90 % |
| 6 | 10⁷ Fahrzeuge, alle Moden (Tokio-Maß) | Moduswahl, Umleitung, Unfall | P · Bildzeit 10⁶ ≤ 10⁴ + 10 % | Achse gesperrt: Reisezeit ± 30 % gegen Referenzlauf; Modal Split im Band |
| 7 | 10⁹ Wege/Tag, 3 D, planetweit Schiffe und Flüge | Verkehrskultur aus Gesetz | P · dichtester Knoten | Video-Echtheits-Probe; Kultur ≥ 80 %; verfolgtes Fahrzeug kommt an ≥ 98 % |
| 8 | 10¹⁰ Reisende über Epochen und Sonnensysteme | jede Fracht mit Herkunft | P · überall | 5 Orte × 3 Welten × 3 Epochen: Anlass erklärt ≥ 95 % |

#### Massenverkehr und dritte Dimension

`mensch.netz.massenverkehr` — **HEUTE 0 / 7**

*misst:* ob Bahnen, Bahnhöfe und Ebenen unter und über der Stadt aus dem Fluss entstehen und betreten werden.

*Beleg:* Schiene, Bahnhof: Grep 0

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Linie, 2 Halte | Linie liegt, wo Bedarf ist | P · im Fahrzeug | Spieler fährt mit; ≥ 10 Bewohner je Stunde |
| 2 | 10 Korridore: Stadt wählt Modus | Bus → Tram → Bahn nach Last | P · fahrender Zug | 32 Saaten: Modus passt zur Last ≥ 80 %; Querbeschleunigung ≤ 1 m/s² |
| 3 | 10³ Fahrgäste/Tag, 1 Tiefen- + 1 Hochebene | Treppe, Bahnsteig, Tunnel | P · Ebenenwechsel | Straße → Zug → Ziel 0 Brüche |
| 4 | 10⁵/Tag, 10 Linien | wie reale Metros | P · voller Knoten | Kosten, Effizienz, Fehlertoleranz (Tero 2010) im Band ≥ 80 % |
| 5 | 10⁶/Tag (Shinjuku), 5+ Ebenen | Gedränge wie echt | P · 10³ Leiber im Bild | Bahnsteig Fruin D–E; Bild-Probe gegen Shinjuku |
| 6 | 10⁸/Tag, 10+ Ebenen, Fernbahn ≥ 300 km/h | eine Stadt, keine gestapelte Kulisse | P · 300 km/h | Fernzug 0 Ladebilder; 1 000 Punkte ≥ 95 % erreichbar und belebt |
| 7 | Planeten, Epochen, fremde Netze | Technik aus Epoche × Physik | P · Bahnhof ≤ 5 s | 5 Bahnhöfe × 3 Saaten × 3 Epochen begehbar, belebt, echt |

#### Stadtstoffwechsel

`mensch.netz.stoffwechsel` — **HEUTE 0 / 7**

*misst:* ob Wasser, Abwasser, Energie, Müll und Daten als geschlossene Flüsse EINES Gesetzes existieren, deren Ausfall die Welt ändert.

*Beleg:* Laternen und Brunnen ohne Fluss dahinter; Leitungen Grep 0

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Ort, 1 Netz | Trennung wirkt | P · Dorf | Leitung getrennt: abhängige Lichter dunkel ≤ 1 s, Rest brennt |
| 2 | 10³: Wasser, Strom, Abwasser, Müll | Bedarf je Kopf (Kennedy 2015) | P · Viertel | Bilanz ± 5 %; Quelle gedrosselt: Hähne versiegen in Netzreihenfolge |
| 3 | Leitungen aufschneidbar | Abwasser bergab, Leitungen unter Straßen | P · Schnitt | Rohre in plausibler Tiefe; Gefälle ≥ Norm 100 % |
| 4 | 10⁵ Häuser | Ausfall kaskadiert Strom → Pumpe → Ampel → Stau | P · im Ausfall | Dunkel-Reihenfolge folgt Topologie; Reisezeit steigt |
| 5 | 10⁶ Häuser, Daten und Funk | jedes Fenster ein Verbraucher | P · Nachtflug | Nachtbild gegen Black Marble ± 20 % |
| 6 | Kontinent: Fernleitungen | Verbrauch je Kopf sinkt mit Dichte | P · Fernbild | Steigung ± 30 % der Kennedy-Kurve; Fernausfall vorhergesagt 100 % |
| 7 | Planeten, fremde Stoffe | Stadt wächst nur an ihrer Ressource | P | 32 Saaten × 3 Welten: ohne Quelle 0 % Wachstum, Bilanz geschlossen |

### Architektur, Gebäude, Innenräume

*Referenz-Korpus (R6, R11):* Bauaufnahmen und Architektur-Kataloge je Kultur und Epoche, Fassaden- und Innenraum-Fotos

#### Bedarf wird Bauwerk

`mensch.bau.bedarf` — **HEUTE 0 / 6**

*misst:* ob der Bedarf der Welt (Fluss, Flotte, Sport, Glaube, Industrie) das Bauwerk erzeugt — vom Wohnhaus zur Megastruktur.

*Beleg:* Rollen Kirche der Epoche, Scheune, Schmiede, Turm (fachwerk-core.js:3189, 3697); Funktions-Blindtest nie gefahren; kein Ingenieurbau

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Dorf: 4 Funktionen | Funktion am Außenbild erkennbar | P · Dorf | 50 Bauten blind nach Funktion ≥ 80 % |
| 2 | Stadt: ≥ 20 Funktionen | Häufigkeit wie reale Städte der Epoche | P · Stadt | Rangkorrelation gegen Zensus ≥ 0,7 |
| 3 | 10² Saaten: Ingenieurbau (Brücke, Damm, Hafen, Aquädukt) | am richtigen Ort | P · Brücke | Flussquerungen mit Brücke/Furt ≥ 95 %; Lage sinnvoll ≥ 80 % |
| 4 | Großbau: Stadion, Bahnhof, Fabrik, Kathedrale | Größe ∝ Bevölkerung und Reichtum | P · Stadion mit Publikum | Stadiongröße/Einwohner im Band an 32 Städten; Sportart aus dem Bau ≥ 80 % |
| 5 | Megastruktur: Arkologie, Raumhafen, Liftfuß | aus Technik und Bedarf | P · im Megabau | Mutation Bedarf ändert Großbauten gesetzrichtig ≥ 90 % |
| 6 | jeder Bedarf jedes Planeten | fremde Funktion lesbar | P | 100 fremde Großbauten: Funktion erraten ≥ 60 % |

#### Hülle gegen das Foto

`mensch.bau.huelle` — **HEUTE 0 / 6**

*misst:* die Wahrheit der Fassade, des Dachs und des Details in jedem Abstand und jeder Menge.

*Beleg:* Welt 14.11.: Häuser lesen als weiße Kästen mit Fenstern; Labor ↔ Welt 0,788 (studios.K4); Pop 2,30 px am Labor-Haus

*alte Karte:* material.K3 · lod.K5 · studios.K4 · ankunft.K4

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Haus im Spiel | aus 10 m als Haus seiner Kultur | P · Dorf, kein Pop | Paarvergleich Spiel ↔ Foto bei 10 m: „Foto“ ≥ 5 % |
| 2 | 10 Häuser eines Orts | Fuge, Maserung, Verwitterung; Stufenwechsel unsichtbar | P · Dorf | 10 m und 100 m ≥ 15 % „Foto“; kein Pop im Gang |
| 3 | 10³ Bauten | Ornament, Gesims, Laden, Schilder | P · Platz | 1/10/100 m ≥ 30 % „Foto“ |
| 4 | 10⁴ im Blick, Tag und Nacht | Fenster zeigen Raum, Nachtlicht | P · Stadt | Panel-2AFC Nachtstadt-Bild gegen Nachtfoto einer realen Stadt ≤ 75 %; Anteil erleuchteter Fenster je Uhrzeit gegen reale Zählreihen ±15 % |
| 5 | 10⁷ bis zum Horizont | Dachlandschaft ohne Wiederholung | P · 1-km-Turm | 10⁴ Paare ohne Duplikat; gegen Luftfoto ≥ 40 % |
| 6 | jedes Bauwerk jedes Planeten | ununterscheidbar vom Foto | P | 1 000 Stichproben ≈ 50 % |

#### Innenräume

`mensch.bau.innen` — **HEUTE 0 / 7**

*misst:* ob jedes Bauwerk betretbar ist und das Raumgefüge aus Fassade und Funktion folgt.

*Beleg:* Tür → Keller → Dachboden ganz in 1 von 8 Gängen, headless (siedlung.K1); Raumteilung mit Herd (fachwerk-core.js:576–620)

*alte Karte:* siedlung.K1

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Haus, Tür → Keller → Dachboden | Herd, Küche, Möbel | P · im Haus | Gang ohne Sprung > 0,3 m |
| 2 | 10 Häuser des Start-Dorfs | innen lesbar | P · beide Geräte | Spielgang aller Häuser im echten Fenster |
| 3 | 10² Bauten: Werkstatt, Laden, Schenke | Raumfunktion lesbar | P · außen ↔ innen | 200 Räume blind klassifiziert ≥ 85 % |
| 4 | 10⁴ Bauten | Fassade ↔ Raum stimmt | P · kein Ladeschirm | 1 000 Fenster: Raum und Zugang dahinter ≥ 99 % |
| 5 | 10⁶ Bauten, 100 Etagen | Einrichtung folgt Beruf, Reichtum, Epoche | P · Dach → Keller | Beruf und Epoche aus dem Raumbild ≥ 60 % |
| 6 | ≥ 10⁹ Bauten, 10¹⁰ Räume | bewohnbar und kulturtreu | P | Architekt: 1 000 Räume ≥ 90 % |
| 7 | fremde Bauten fremder Leiber | Raum folgt dem Leib | P | Körpergröße und Gang aus 100 Räumen ≥ 70 % |

#### Bauen als Vorgang

`mensch.bau.bauen` — **HEUTE 0 / 6**

*misst:* ob Bauen in der Welt geschieht — Baustelle, Bewohner bauen, Spieler-Haus, Satz → Bau. Das Werk des Spielers zählt erleben.schoepfen.hebel; hier zählt das Bauen der Bewohner als sichtbarer Vorgang.

*Beleg:* Häuser erscheinen ohne Baustelle (12 → 19/20 in 1 500 s); Labor ↔ Welt 0,788

*alte Karte:* studios.K4

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Spieler-Haus aus der Werkstatt | gleiche Tiefe wie im Labor | P · Bauplatz | Bildpaar Labor ↔ Welt gleiche Kamera: kein Unterschied |
| 2 | 10 Baustellen der Bewohner | Aushub, Gerüst, Rohbau, Dach | P · beim Zusehen | Bauphasen richtig geordnet ≥ 90 % |
| 3 | Spieler-Haus wird bewohnt | Einrichtung und Spur folgen | P | nach 1 h: Bewohner, Einrichtung nach Beruf, Abnutzung |
| 4 | Stadt baut sich um über 50 Jahre | Kran, Gerüst, Schalung der Epoche | P · Stadt | Umbau-Anteil im Band; Baustellen epochen-richtig ≥ 80 % |
| 5 | 50 Sätze → Bau | passt zum Ort und trägt | P · ≤ 5 s bis zum Rohbild | „das Gemeinte“ und „passend“ ≥ 80 % |
| 6 | fremde Leiber bauen auf fremden Welten | Bautechnik folgt Leib und Stoff | P · fremder Planet | 10 fremde Baustellen: Phasen geordnet ≥ 80 %, Bau trägt |

### Fahrzeuge und Maschinen

*Referenz-Korpus (R6, R11):* Typenkataloge, Fahr- und Flugdaten, Film realer Fahrten

#### Bewegung in jedem Medium

`mensch.fahrzeug.medium` — **HEUTE 0 / 8**

*misst:* in wie vielen Medien der Spieler fährt und wie wahr — Boden, Nässe, Furt, Wind eingeschlossen (Fahrzeuge L1 + L7 S1–3).

*Beleg:* Bremsweg Gras/Weg 1,63×, nass 1,48–1,72× (fahrzeug.K1); GTX reißt bei 36 km/h (Bild 35,4 ms); fahrWasser/fahrLuft nur Widerstand (vehicle-core.js:3619/3633)

*alte Karte:* fahrzeug.K1 · fahrzeug.K4 · fahrzeug.K5

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Land, 1 Wagen, 50 km/h | Haftung je Boden, Nässe, Furt, Seitenwind | P · Fahrt 50 km/h | Bremsweg Gras/Weg ≥ 1,5×, nass ≥ 1,3×, Bild ≤ 33 ms während der Fahrt |
| 2 | Land, jede Saat bis 130 km/h, Einspur | Bremsweg, Kurvengrenze; Spur bleibt im Schlamm | P · 130 km/h | 20 Saaten: Bremsweg 100 → 0 in 30–50 m ∝ v²/μ; Spurrinne nach 10 Durchfahrten sichtbar |
| 3 | + Wasser: Floß bis Segler | Auftrieb, Krängung, Segel aus dem Wetter | P | Wende 80–100°, Höhe gegen den Wind > 0; Rollperiode ± 15 % |
| 4 | + Schiene + Luft | Steigungsgrenze, Abriss, Thermik | P · 50 km Flug, Ruck ≤ 100 ms | Zug 2 % ja / 4 % nein; Überziehtempo ± 10 % |
| 5 | + Tiefsee, Verformung, Untergang | Schaden aus der Stoff-Zeile | P | Crash-Tiefe im Band realer Tests; Sinkdauer gegen dokumentierten Fall |
| 6 | + Raum: Boden → Orbit → Mond | Bahnmechanik, Wiedereintritt | P · ohne Ladebild | Orbit-Periode ± 1 % gegen Kepler |
| 7 | alle Medien auf fremden Welten | fremdes g, ρ, Meer | P | 100 Saaten: Skalierung mit g und ρ korrekt ≥ 95 % |
| 8 | zwischen Sonnensystemen | Zeit an Bord ≠ Zeit daheim | P | Flug mit 0,9 c: Uhren weichen um den Lorentz-Faktor ± 1 % ab |

#### Form wird Fahrt

`mensch.fahrzeug.form` — **HEUTE 0 / 6**

*misst:* ob JEDE gebaute, gesprochene oder erfundene Form nach dem Gesetz fährt — oder ehrlich kentert.

*Beleg:* Teile-Werk fährt mit seiner Hülle (stamm/koerper-fahrt.js:550), Preis nicht gemessen

*alte Karte:* fahrzeug.K1

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Werkstatt-Wagen | Masse, Radstand aus dem Bauplan | P · 500 m Fahrt | Tempo folgt der Masse |
| 2 | 50 Baupläne an Land | Schwerpunkt und Spur entscheiden Kippen | P | Kippgrenze ± 15 % gegen statische Formel |
| 3 | + Rumpf, Segel, Flügel aus Teilen | Auftrieb aus der gebauten Hülle | P | Floß sinkt/schwimmt, Gleiter fällt/fliegt an der Formel-Grenze ± 15 % |
| 4 | 10² Sätze → Fahrzeug | erfüllt die Aufgabe | P · Satz bis Fahrt ≤ 10 s | ≥ 90 % erfüllen die Aufgabe im Spiel |
| 5 | 10³ Kultur-Saaten erfinden | Gestalt aus Randbedingung | P | ≥ 95 % bestehen den Physik-Test; ohne Metall kein Metall 100 % |
| 6 | Technik-Evolution über 500 Jahre | Auslese durch Gebrauch | P · Zeitraffer | Leistung je Masse steigt; Ahnen im Nachfahren erkannt ≥ 70 % |

#### Gestalt-Breite

`mensch.fahrzeug.gestalt` — **HEUTE 0 / 6**

*misst:* wie viele unterscheidbare, glaubhafte Fahrzeug-Welten die Saaten gebären.

*Beleg:* 5 Gattungen, EPOCHE_GESETZ 6 Stufen über EINER Wagen-Vorlage (vehicle-core.js:4523, 4725); Blind-Erkennung nie gefahren

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 10² Saaten, 5 Gattungen | als Wagen der Gattung erkannt | P | ≥ 90 % erkannt |
| 2 | Land −5000 bis 2150 | Gestalt je Epoche eigen | P | Epoche ± 1 Jh. ≥ 70 %; Silhouette gegen Museumsfoto IoU ≥ 0,7 |
| 3 | 10³ Saaten: Land, Wasser, Schiene, alle Kulturen | Dschunke ≠ Kogge ≠ Dhau | P | glaubhaft ≥ 90 %, Kultur ≥ 60 % |
| 4 | 10² Wagen einer Straße tragen Leben | Abnutzung, Ladung, Beulen | P · Straße | keine zwei gleich; Alter ± 10 J ≥ 60 % |
| 5 | fremde Evolutionen | Fahrzeuge anderer Leiber | P | „nicht von der Erde“ ≥ 80 %; passen zum Leib ≥ 90 % |
| 6 | 10⁴ Planeten-Saaten | eigene Formensprache je Zivilisation | P | zwischen ≥ 95 % unterscheidbar, innerhalb Familie ≥ 80 % |

#### Lenkerkunst

`mensch.fahrzeug.lenker` — **HEUTE 0 / 6**

*misst:* ob die Fahrer fahren können — Pendler, Kapitän, Pilot, Rennfahrer.

*Beleg:* kein Bewohner fährt mit Können; pflicht.C offen

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 10 Fahrer auf Wegen | Spur halten, bremsen | P | 1 h: 0 Kollisionen bei Durchsatz und Reisetempo im Band realer Straßen (Zeitlücke 1–3 s, Reisetempo ≥ 80 % des erlaubten), 0 Stillstände ohne Anlass |
| 2 | 10² Fahrer mit Charakter | vorsichtig ≠ eilig | P | Tempo je Charakter trennbar; Zeitlücke 1–3 s |
| 3 | Rennfahrer auf 20 Strecken | Ideallinie aus der Physik | P | bester Umlauf ≤ 105 % des Optimums |
| 4 | Kapitän und Pilot | kreuzt, landet bei Seitenwind | P | Regatta: Rang folgt Können; Landung 15 kn ≥ 95 % |
| 5 | jede Sportart mit Gefährt | Regeln, Taktik, Windschatten | P | Wettkampf im Bild: Windschatten und Überholen treten auf; Siegerzeit je km ±15 % gegen die Rekordklasse; Gegenlauf ohne Windschatten: das Feld zieht sich auseinander |
| 6 | fremde Lenker, fremde Medien | Steuerkunst folgt Leib und Medium | P · fremder Planet | N = 100: ≤ 110 % des Optimums |

#### Maschinen, Werkzeug, Fabrik

`mensch.fahrzeug.maschine` — **HEUTE 0 / 6**

*misst:* ob dasselbe Kraft-Fluss-Gesetz laufende Maschinen erzeugt, deren Arbeit in der Welt ankommt.

*Beleg:* Haspel des Ziehbrunnens als Gestalt ohne Wirkung (fachwerk-core.js:5314)

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Werkzeug mit Wirkung | Kraft sichtbar übertragen | P | Haspel hebt Eimer, Hub folgt Kurbelweg |
| 2 | 50 Maschinen-Saaten | Quelle aus Wetter und Fluss | P | ≥ 90 % arbeiten nur bei Quelle (Mühle steht bei Flaute) |
| 3 | Werkstatt-Kette Rohstoff → Fahrzeug | Teile entstehen sichtbar | P | Wagen aus Holz, Eisen, Leder ≤ 10 min |
| 4 | Fabrik, Industriestadt | Riemen, Welle, Band | P | Bild gegen Fabrikfoto; Kraftwerk aus → Fabriken stehen |
| 5 | Industrie eines Planeten | Werften, Raumhäfen | P | Raumschiff aus gesehen abgebautem Erz |
| 6 | Industrie über Sonnensysteme | Energie aus dem Stern | P · Orbit | Nachtseite ↔ Energie- und Rohstoffkarte Rang-r ≥ 0,7 |

### Nahrung, Landwirtschaft, Kulturlandschaft

*Referenz-Korpus (R6, R11):* Flur- und Landnutzungskarten, Ertragsreihen (FAO), Luftbilder von Kulturlandschaften

#### Die Flur

`mensch.nahrung.flur` — **HEUTE 0 / 7**

*misst:* wie viel Land als Kulturlandschaft entsteht und ob Größe, Zuschnitt, Kante und Lage der Wirklichkeit gleichen.

*Beleg:* 1–2 Äcker je Feldweg-Ende (fachwerk-core.js:4699–4714), als Fleck im Boden-Kanal gemalt (stamm/siedlung-wege.js:1621); in jedem Dorfbild sichtbar — KARTE: 0 — Beleg ist ein Code-Zitat (R2).

*alte Karte:* siedlung.K3

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1–2 Äcker je Feldweg-Ende | Fleck im Boden | P · Dorf | ≥ 1 Acker als Fläche im Bild am Dorfrand |
| 2 | Flur eines Dorfs ≈ 1 km² | Zuschnitt folgt Hang und Weg, Rain und Hecke | P · 150-m-Hügel und Ego am Rain | Feldgrößen-Verteilung gegen reale Flur KS ≤ 0,25, Blindurteil ≤ 65 % |
| 3 | Landschaft 10² km², 10³ Parzellen | Flurform aus Werkzeug und Recht | P · Flug 100 m/s | 20 Luftbilder gegen Satellit, Blindurteil ≤ 65 % an 8 Saaten |
| 4 | Region 10⁴ km² | Thünen-Ringe aus Lagerente | P · aus 2 km | Acker/Weide/Wald über Abstand r ≥ 0,8 in ≥ 80 % von 16 Saaten |
| 5 | Kontinent 10⁶ km² | Agrarzonen aus Klima | P · 10 km → Feld ohne Ladebild | Nutzflächen je Klimazone gegen FAO ± 25 % |
| 6 | Planet: 10⁹ Parzellen | jede nah begehbar | P · Orbit → Rain ≤ 60 s | 100 Zufallslandungen plausibel ≥ 90 % |
| 7 | fremde Agrarformen | Flur aus fremder Biologie | P · fremder Planet | 64 Welten: „bewirtschaftet“ ≥ 70 %, Lagerente r ≥ 0,7 |

#### Die Frucht und das Jahr

`mensch.nahrung.frucht` — **HEUTE 0 / 6**

*misst:* ob Kulturpflanzen mit Saison, Wetter und Arbeit sichtbar wachsen und aus dem Gesetz statt einer Liste fallen.

*Beleg:* keine Kulturpflanze in der Welt; nur das Studio zeichnet Furchen (worlds/fachwerk/fachwerk.js:361) — Zwilling der Darstellung

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Kulturpflanze auf 1 Acker | Bestand in Reihen | P · Ego im Feld | Reihen im Bildspektrum ≥ 3σ; Blindurteil ≤ 65 % |
| 2 | 1 Art über 1 Spieljahr | Saat → Reife → Stoppel | P · jede Jahreszeit | Höhe und Farbe gegen BBCH-Kurve ± 15 % |
| 3 | 10 Klimazonen, ihre Pflanzen | Reis im Wasser, Wein am Südhang | P · jede Zone | 32 Saaten × 4 Zonen: Bild ↔ Klima ≥ 80 % |
| 4 | 10³ Felder mit eigenem Schicksal | Ertrag aus Wetter, Boden, Schädling | P · Ego im Feld | Dürre: Ertrag −30…−70 %, Feld gelb im Bildpaar |
| 5 | Domestikation über 10⁴ Jahre | Wildform → Hochleistung | P · Zeitsprung ≤ 5 s | Ährengröße −9000/−2000/1900/2020 ± 30 % archäobotanisch |
| 6 | Millionen Kulturformen auf Planeten | fremde Nutzpflanzen, gezüchtet | P | 64 Welten: ≥ 80 % mit gezüchteter Art, Merkmal wandert |

#### Das Tier im Dienst

`mensch.nahrung.tier` — **HEUTE 0 / 7**

*misst:* wie Menschen Tiere jagen, zähmen, halten und fangen, sichtbar an Land und Meer.

*Beleg:* gebundenes Tier folgt ≥ 10 min über Hang (oekologie.K5); wilde Herde ohne Hirte — KARTE: 0 — die Bindung ist headless gebucht (oekologie.K5).

*alte Karte:* oekologie.K5

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Tier bindet sich an den Spieler | Bindung aus Füttern | P · Gelände | Abstand p95 ≤ 5 m über Hang |
| 2 | Bewohner jagen und fischen | Beute wird Nahrung | P · Ortsrand | 8 Saaten: ≥ 1 Jagd je Tag, Wildbestand sinkt |
| 3 | 10² Tiere: Herde mit Hirte | Weide abgefressen, Pfad | P · 100 Tiere im Bild | Grasdeckung −≥ 20 % nach 30 Tagen, Viehpfad |
| 4 | 10³ Haustiere aus Wildfauna | Hausform durch Selektion | P · Dorf | 32 Saaten: Haustier ≥ 80 %, Gestalt-Distanz im Soll |
| 5 | Fischerei und Aquakultur | Überfischung bricht Bestand | P · Küste mit Flotte | Kollaps-Kurve −≥ 50 % bei Übernutzung |
| 6 | Wanderhirten über 10⁴ km² | Transhumanz | P · Gebirge aus der Luft | Herden folgen Weide-Höhenlinie ≥ 80 % |
| 7 | Milliarden Nutztiere, fremde Haustiere | dasselbe Gesetz | P · Orbit → Herde | 64 Welten: Zähmungs-Drift ≥ 70 % |

#### Wasser und Erdbau

`mensch.nahrung.erdbau` — **HEUTE 0 / 7** · Kern 1

*misst:* ob Bewohner Gelände und Wasser umformen, wo es sich lohnt, und die Form physikalisch trägt.

*Beleg:* Graben füllt sich ≤ 2 s, eine Wasserfläche (gelaende.K2); Bewohner bauen keine Gräben — KARTE: Kern 1 — Graben füllt sich im Ausgabe-Bild an beiden Geräten (gelaende.K2); Bild-Preis beim Graben nicht gemessen.

*alte Karte:* gelaende.K2

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 ◐ | Spieler gräbt, Wasser folgt | eine Wasserfläche | P · Mess-Wiese | Graben gefüllt ≤ 2 s |
| 2 | Bewohner bewässern | Bach → Graben → Acker | P · Dorf | Acker grüner als ohne; ohne Bach kein Graben |
| 3 | Terrasse, Mühlteich, Damm | wo Neigung × Wasser × Epoche tragen | P · Gegenhang | Blindurteil ≤ 65 %; Terrassen über Schwelle ≥ 80 % |
| 4 | 10³ km²: Polder, Deich, Kanal | Pumpe hält trocken | P · aus 2 km | Pumpe aus → Polder läuft voll; Deichbruch folgt Relief |
| 5 | 10⁸ m³: Talsperre, Tagebau | wo der Nutzen trägt | P · am Damm | Stauseefläche ± 10 %; Aue stromab ändert sich |
| 6 | planetare Umformung | Gebirge terrassiert, Wüste bewässert | P · Orbit | Jahr 0/1000: ≥ 1 % Land umgeformt, plausibel ≥ 90 % |
| 7 | Terraforming fremder Welten | Erdbau unter fremder Schwere | P | 64 Welten: Terrassenhöhe skaliert mit g |

#### Der Nahrungsstrom

`mensch.nahrung.strom` — **HEUTE 0 / 6**

*misst:* ob Menschen von dem leben, was das Land trägt, und Mangel und Überfluss die Welt ändern.

*Beleg:* Bewohner mit Rolle feld geht zum Acker (koerper-core.js:4907), nichts wird geerntet, niemand isst

*alte Karte:* mensch.K2

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Dorf erntet und lagert | Scheune füllt sich, Bewohner essen | P · Dorf über 1 Spieljahr | Bildpaar Scheune voll/leer, Sägezahn |
| 2 | 10² Bewohner beim Mahl | Gericht aus eigener Flur | P · 100 beim Essen | Korb Feld → Teller verfolgt; Gericht ≤ 65 % vom Foto trennbar |
| 3 | 10 Orte: Markt | Preis aus Knappheit | P · Handelsstraße | Missernte A → Preis ≥ + 50 %, Wagen aus B unterwegs |
| 4 | 10⁴: Hunger und Überfluss | Geburten, Wanderung, Aufruhr | P · 10⁴ im Umkreis | Dürre: Bevölkerung −≥ 10 %, Wanderstrom sichtbar |
| 5 | Stadt jenseits Tokio (≥ 10⁸) lebt vom Hinterland | Kühlkette, Großmarkt, Nachtverkehr | P · Großmarkt bei Nacht | 100 Bissen bis Feld/Stall ≥ 90 % |
| 6 | Milliarden auf vielen Planeten | Bilanz je Planet | P | 16 Saaten × 100 J: kein Hunger ohne Ursache |

#### Die Hand am Feld

`mensch.nahrung.hand` — **HEUTE 0 / 6**

*misst:* ob Spieler und Bewohner sammeln, pflügen, säen, mähen und ernten — mit dem Werkzeug ihrer Epoche.

*Beleg:* Nah-Streu: Kraut, Stein, Holz pflücken, Mahd, Nachwachsen (stamm/vegetation-wiese.js:1741, 2710) — KARTE: 0 — Beleg ist ein Code-Zitat (R2); halten.K3 headless.

*alte Karte:* halten.K3

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Spieler sammelt Wildes | es wächst nach | P · Nah-Wiese | Pflanze verschwindet, kehrt nach der Nachwuchs-Zeit |
| 2 | Spieler bestellt ein Feld | Furche bleibt, Saat geht auf | P · Ego am Pflug | Bildpaar vor/nach: Furchen in Zugrichtung |
| 3 | 50 Bewohner arbeiten sichtbar | Hacke, Sense, Garbe, Dreschen | P · 50 im Bild | Erntetag gegen Foto ≤ 65 %; Fläche je Stunde ± 30 % |
| 4 | Werkzeug jeder Epoche | Grabstock bis Mähdrescher | P · Ego im Mähdrescher | ha/Tag ± 30 %; Spur je Werkzeug ≥ 80 % |
| 5 | Fest des Jahres, 10³ Menschen | Erntefest aus Saison | P · Fest | 16 Saaten: Fest in der Erntezeit der eigenen Frucht |
| 6 | jede Rolle der Nahrung auf jeder Welt | Bauer bis Turmgärtner | P · in jeder Rolle | 20 Zufallsrollen ≤ 5 s spielbar, Tat ändert Welt ≥ 80 % |

#### Nahrung jenseits des Ackers

`mensch.nahrung.jenseits` — **HEUTE 0 / 6**

*misst:* ob die Welt Nahrung ohne offenes Feld erzeugt, wo Boden knapp und Energie billig ist.

*Beleg:* nichts

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Gewächshaus und Garten im Ort | wo die Lagerente es trägt | P · Ort | Bildpaar ≤ 65 %; nur in passendem Klima |
| 2 | Gewächshausmeer 10² km² | aus Licht, Wasser, Markt | P · aus 10 km | vom Orbit als Albedo-Fleck; Blindurteil ≤ 65 % |
| 3 | Nahrungstürme der Megastadt | wo Boden teurer als Licht | P · im Turm | Stadtnahrung ↔ Bodenpreis r ≥ 0,7 |
| 4 | Ozeanfarm | Tangwald, Gehege | P · auf See | Fläche wächst mit Küstenbevölkerung |
| 5 | Habitat-Agrar auf fremden Welten | geschlossener Kreislauf | P · im Habitat | 64 Saaten: ≥ 70 % ernähren sich sichtbar |
| 6 | über Sonnensysteme | Habitat-Kreisläufe koppeln Welten | P · Raumhafen | 16 Saaten: Welten ohne Überschuss importieren sichtbar |

### Arbeit, Technik, Handel

*Referenz-Korpus (R6, R11):* Preis- und Lohnreihen, Handelsmatrizen, Technik-Chronologien, Werkstatt-Fotos

#### Stoffstrom vom Gestein zur Ware

`mensch.wirtschaft.stoffstrom` — **HEUTE 0 / 7**

*misst:* wie viele Waren aus Ressourcen des Geländes hergestellt UND verbraucht werden — Gesetz-Hebel H ≥ 10^(n−2) ab Sprosse 3.

*Beleg:* Misch-Regel Bronze (schmiede-core.js:2911) nur im Studio; in der Welt hat keine Ware eine Herkunft

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Kette, 3 Waren: Erz → Barren → Werkzeug | Erz liegt, wo die Geologie es legt | P · Dorf | Zeitraffer: Halde kleiner, Barren am Ofen, Werkzeug in der Hand |
| 2 | 10 Waren | Mengen erhalten sich | P · 100 Bewohner | 7 Tage: hinein = hinaus ± 10 % |
| 3 | 10² Waren | Rezepte aus Stoff-Gesetzen | P · 10³ Werke | 20 Saaten: Warenkorb passt zu Geologie ≥ 90 %; H ≥ 10 |
| 4 | 10³ Waren | Werkstück wandelt sich schrittweise | P · 10⁴ Werke im Blick | Werkstatt gegen Foto „echt“ ≥ 70 %; H ≥ 10² |
| 5 | 10⁴ Waren (Gussteil, Chip) | rückverfolgbar bis zur Lagerstätte | P · Industriestadt | 50 Waren: Kette bis Gestein 100 %; H ≥ 10³ |
| 6 | 10⁷ Warenformen über Epochen | Abfall, Rückgewinnung | P · jeder Ort | 100 Saaten × 10 Epochen: Warenkörbe plausibel ≥ 95 % |
| 7 | 10⁹ über Sonnensysteme | fremde Stoffe, gleiche Gesetze | P · Raumhafen | ≥ 10³ Waren im Blick, je Kette abrufbar; H ≥ 10⁵ |

#### Werk und Beruf

`mensch.wirtschaft.beruf` — **HEUTE 0 / 7**

*misst:* ob man eine zufällige Person ihr Werk tun sieht, das den Stoff ändert, und wie viele Berufe aus Stoff × Technik auftauchen (Geist L2 + Wirtschaft L2).

*Beleg:* 8 Rollen (koerper-core.js:4928–4943), Schmiede 10/2 Uhr 2/0 (mensch.K2); kein Werkstück ändert sich; Dorf-Bild Radeon ROT

*alte Karte:* mensch.K2

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 8 Rollen am Werk | steht zur Werkzeit am Werk | P · Dorf zur Werkzeit | Schmiede 10 Uhr besetzt / 2 Uhr leer |
| 2 | 10 Berufe mit Handlung | Hammer trifft, Werkstück ändert Form | P · 40 Arbeitende nah | Beruf aus 1 Bild benannt ≥ 80 % |
| 3 | 10² Berufe, Lehrling und Meister, Ketten | Stoff ändert sich, Ware wandert | P · Stadt 10³ | nach 2 h verändert ≥ 0,9; Ware am nächsten Glied ≥ 0,9 |
| 4 | 10³ Berufe als Bündel von Umwandlungen | Schicht, Betrieb, Können wächst | P · Stadt 10⁵ | 1 000 Stichproben passen zu Werk, Uhr, Epoche ≥ 95 % |
| 5 | 10⁴ Berufe über Epochen | entstehen und verschwinden mit Technik | P · jede Epoche | Anachronismen ≤ 0,01; ≥ 0,2 stehen in keiner Liste des Codes |
| 6 | 10⁷ Arbeitende in einer Stadt | am Ort wiederfindbar ± 2 m | P · Turmblick Berufsverkehr | ≥ 10⁵ sichtbar; Rückkehr nach 1 h 100 % |
| 7 | 10⁸ je Stadt jenseits Tokio, 10¹⁰ über Planeten | Berufe fremder Arten | P · Turmblick | ≥ 10⁶ sichtbar; Berufe passen zum Ort ≥ 0,95 |

#### Markt und Geld

`mensch.wirtschaft.markt` — **HEUTE 0 / 6**

*misst:* ob Preise aus Knappheit, Weg und Bedarf entstehen und der Spieler sie spürt.

*Beleg:* Spieler-Inventar 27 Plätze (stamm/dirigent-kern.js:736); Preis/Münze/Geld in stamm/: 0 Treffer

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Tausch Spieler ↔ Bewohner | nur, was er hat | P · Markt | Bestand sinkt, füllt sich nur aus Herstellung |
| 2 | 1 Markt, 10 Waren | Knappheit treibt Preis | P · Markt | Missernte: Brot ≥ + 30 % in 3 Tagen, fällt nach Ernte |
| 3 | 10 Märkte, Münze | Münzwert aus Metall | P · Markt | Preis ↔ Wegkosten r ≥ 0,7 |
| 4 | 10³ Märkte, Kredit, Bank | Arbitrage schließt Lücken | P · Handelsstadt | Spanne halbiert sich ≤ 30 Tage |
| 5 | 10⁵ Märkte, Börse | Blasen und Krisen entstehen | P · Börsenstadt | 20 Saaten: fette Ränder ≥ 80 %; Krise im Straßenbild ≥ 80 % |
| 6 | 10⁷ über Sonnensysteme | Lichtlaufzeit als Preis | P · Raumhafen | Preisunterschied ≈ Transport ± 20 % |

#### Fernhandel, Knoten und Ketten

`mensch.wirtschaft.handel` — **HEUTE 0 / 7**

*misst:* ob sichtbare Transporte echte Ladung auf sinnvollen Wegen tragen und Häfen und Lager ihren Ort selbst wählen (Wirtschaft L4 + Netze L5).

*Beleg:* Wagen ohne Ladung (hausJeWagen 15); Hafen, Lager: Grep 0

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Ware, 1 Weg mit Fahrer | Stand leert sich ohne Lieferung | P · Stadt | Bildpaar leer/beladen; ohne Lieferung Stand leer binnen Tagesfrist |
| 2 | 10 Routen, Karawane, Lieferwagen | Tier, Wagen, Träger je Gelände | P · auf der Route | Route ≤ 10 % teurer als die billigste (ORBIS-Maß) |
| 3 | 10² Routen, Hafen | Hafen an geschütztem Wasser, Segelzeit aus Wind | P · Hafen | Hafenlage plausibel 100 %; Schiffe beladen ≥ 80 % |
| 4 | 10³ Knoten, Pässe, Zölle | Verkehr folgt Anziehung; Engpass wirkt fern | P · Pass | Dichte ↔ Gravitationsmodell r ≥ 0,7; Hafen-Sperre leert ferne Regale in Reihenfolge |
| 5 | 10⁵ Routen, Container | Megastadt versorgt | P · Containerhafen | ≥ 10⁴ Frachtbewegungen; Kette 3 Tage gesperrt: Verhalten ändert sich nach Reserven |
| 6 | Planet: Welthandel | Seewege aus Geographie | P | Seewege auf kürzesten Passagen ± 10 % |
| 7 | Sonnensysteme | Bahnfenster, Startenergie | P · Raumhafen | Start nur im Fenster, Hohmann ± 5 % |

#### Erfindungspfade

`mensch.wirtschaft.technik` — **HEUTE 0 / 7**

*misst:* ob Technik aus Voraussetzungen wächst, Saaten verschiedene Pfade gehen und Erfindungen über Wege wandern — bis zur Gegenwart; die Epochen danach zählt mensch.zukunft.technik.

*Beleg:* Werkstoff-Tafeln im Studio, Epochen-Tafel der Stadt (fachwerk-core.js:3294) — Liste, nicht gewachsen; jede Saat hat dieselbe Epochenfolge

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 10 Techniken mit Voraussetzung | Stoff + Temperatur + Vorgänger | P | 20 Saaten: 0 Techniken ohne Voraussetzung im Bild |
| 2 | 10² Techniken, ≥ 5 Pfade | ohne Zinn keine Bronze | P | 50 Saaten: ≥ 5 plausible Pfadfolgen; Erfindungsjahre streuen ≥ 10 % |
| 3 | 10³ als sichtbare Dinge | in Werkzeug, Bau, Fahrzeug | P · jede Epoche | Artefakte passen zum Pfad ≥ 80 %; H ≥ 10 |
| 4 | 10⁴ bis Dampf, Elektrik, Chemie | Wissen wandert, mehrfach unabhängig erfunden | P · Zeitraffer | Ausbreitung ↔ Handelsdichte ≥ 0,6; Front 0,3–3 km/J; ≥ 60 % mehrfach erfunden |
| 5 | Halbleiter, ≥ 10 Pfade | lückenlose Kette Sand → Chip | P · Chipstadt | ≥ 10 verschiedene Pfade mit lückenloser Kette |
| 6 | 10 Epochen eines Orts | jede folgt aus der vorigen | P · Sprung ≤ 5 s | 0 Werkzeuge ohne Vorgänger; Ort wiedererkannt ≥ 80 % |
| 7 | fremde Chemie, ≥ 10 Pfade jenseits unserer | Biotechnik statt Metall | P · fremder Planet | „folgt aus Stoffen“ ≥ 80 % UND „nicht unsere Geschichte“ ≥ 80 % |

#### Energie

`mensch.wirtschaft.energie` — **HEUTE 0 / 6**

*misst:* ob jede Arbeit Energie kostet und die Quelle bestimmt, wie viel eine Zivilisation umwandelt.

*Beleg:* keine Energie-Größe in der Wirtschaft

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Muskel und Feuer | Ofen kostet Holz | P · Dorf | Holzstapel sinkt je Schmelze; ohne Holz kein Barren |
| 2 | Wasser und Wind | Mühle folgt Abfluss und Wind | P | Flaute ↔ Wind: Mühle steht ↔ dreht, Mehl knapper |
| 3 | Kohle und Dampf | Warenstrom je Kopf springt | P · Kohlestadt | Strom je Arbeitendem ≥ 10× über den Übergang |
| 4 | Strom | Ausfall wandert durch das Netz | P · Stadt bei Nacht | Kraftwerk aus → Viertel dunkel, Werke stehen |
| 5 | Planet | Verbrauch je Kopf folgt Quelle | P · Orbit | Nachtbild gegen Erde „wirklich“ ≥ 70 % |
| 6 | Sonnensysteme | Energie bestimmt Reichweite | P · Raumhafen | 20 Saaten: besiedelte Zone ↔ Energie ≥ 0,7 |

### Macht, Recht, Konflikt

*Referenz-Korpus (R6, R11):* Seshat-Datenbank, historische Atlanten, Rechtsquellen, Berichte von Feldzug und Belagerung, Luftbilder von Wehrbauten

#### Gemeinwesen, Grenzen, Reiche

`mensch.macht.grenze` — **HEUTE 0 / 8**

*misst:* wie viele Ordnungen der Planet trägt, in wie vielen Ebenen, wie sie steigen und fallen und ob man ihre Grenzen im Land sieht (Macht L1 + Geschichte L4).

*Beleg:* BURG-GESETZ zu 50 % per Zufall (fachwerk-core.js:3705), Mauer bis 1750; kein Gemeinwesen, keine Grenze

*alte Karte:* siedlung.K2

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Herrschaftsgebiet | Grenze im Land sichtbar, Herr mit Ursache | P · Grenzübertritt | Grenze im Bild = Karte; Burg, wo Lage und Reichtum sie tragen |
| 2 | 10 Gemeinwesen auf 32 × 32 km | Grenze aus der Kostenfläche | P · Ritt über die Grenze | Fluss/Kamm verlegt → Grenze folgt ≥ 70 % von 32 Saaten; ≥ 1 Grenzzeichen |
| 3 | 10² Gemeinwesen, 2 Ebenen | Stadtstaat + Bund | P · Flug | Größenverteilung im Band historischer Atlanten |
| 4 | 10³ über 1 000 J: Aufstieg und Fall | Hauptort wandert mit dem Überschuss | P · Hauptstadt | Lebensdauer gegen Seshat KS p > 0,05 |
| 5 | 10⁴: Kontinent, Reich bis 10⁶ km² | Straßen, Garnisonen, Münzen | P · Grenzwechsel ≤ 50 ms Hänger | Maximalfläche folgt Taagepera; ≥ 3 Grenzen in 10 min, Seite erkannt ≥ 80 % |
| 6 | 10⁵ über die Menschenzeit, Übersee | Kolonien nach Hochseeschifffahrt | P · Sprung | 64 Orte × 20 Jahre im Seshat-Band ≥ 0,8; Übersee nur nach Erfindung |
| 7 | planetare Ordnung, Gegenwart, Zukunft | jede Stufe von Horde bis Weltordnung | P · Sprung | 256 Saaten: jede Stufe ≥ 1× in ≥ 90 % |
| 8 | 10²+ Planeten, fremde Arten, Sonnensysteme | Ordnungen, die die Erde nicht kennt | P · Planetenwechsel ≤ 5 s | Abstand der Ordnungstypen zur Erde > Erde–Erde |

#### Spuren der Macht im Stein

`mensch.macht.wehrbau` — **HEUTE 0 / 8**

*misst:* ob Mauern, Burgen, Festungen und Machtbauten am richtigen Ort und in der richtigen Epoche stehen.

*Beleg:* mauerRing 30 Ecken, Tore, Türme (fachwerk-core.js:4481); ummauerte Stadt vom Hügel in 7/8 Saaten an beiden Geräten (siedlung.K2) — KARTE: 0 — die ummauerte Stadt vom Hügel zählt bei mensch.stadt.siedlungsnetz (R9); Ring ohne Schwebe-Spalt bei Mittag und Dämmerung nie gerichtet.

*alte Karte:* siedlung.K2

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Mauerring mit Toren und Türmen | Fuß folgt Hang | P · Hügel | geschlossener Ring mittags und Dämmerung lesbar, kein Schwebe-Spalt |
| 2 | Wehrbau folgt Waffe und Epoche | Palisade → Steinring → Bastion → kein Wall | P · Sprung | 900/1350/1650/1900: Jahrhundert ≥ 70 % |
| 3 | Mauer-Generationen als Jahresringe | alter Ring wird Ringstraße | P · Sprung | 32 Saaten: Ring als Straße ≥ 0,7 |
| 4 | 10² Burgen je 10⁴ km² | Lage strategisch | P | Hügel/Furt entfernt → Festung wandert ≥ 80 % |
| 5 | Grenzbefestigung über 10³ km | folgt der Grenze | P · Flug 100 km | Lücken ≤ Sichtweite auf ≥ 90 % |
| 6 | 10⁴ Wehrbauten aller Epochen | Familien entstehen aus Waffe × Gelände × Stoff | P | ≥ 20 Form-Cluster, je näher an realer Familie als an Zufall |
| 7 | Machtbauten jeder Metropole | Monumentalität ∝ Macht | P · Metropole | Größe ↔ Macht ρ ≥ 0,6; Sitz der Macht aus der Vogelschau ≥ 70 % |
| 8 | fremde Welten | Form folgt fremder Waffe | P | Waffe getauscht → Form-Cluster wechselt ≥ 0,7 |

#### Stand, Kaste, Klasse

`mensch.macht.stand` — **HEUTE 0 / 6**

*misst:* ob Ungleichheit sichtbar und wahr ist, in Wohnung, Leib, Kleidung und Viertel.

*Beleg:* Rollen ohne Stand; „Stände“ im Code sind Marktstände (fachwerk-core.js:4511)

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Stadt, 2 Stände | Wohnfläche ungleich | P · Viertel | Gini der Wohnfläche im archäologischen Band; arm/reich erkannt ≥ 80 % |
| 2 | 3–5 Stände mit Vierteln | Viertel, Kleidung, Nahrung nach Stand | P · Gang durchs Viertel | Segregation im Band; Stand aus dem Nah-Bild ≥ 80 % |
| 3 | 10² Städte, Ordnung aus Überschuss | Gini steigt mit Überschuss | P · Sprung | 64 Saaten × 4 Epochen: Gini im Band ≥ 80 % |
| 4 | 10⁶ Bewohner mit Stand und Lebenslauf | Aufstieg, Lebensdauer nach Stand | P · 10⁴ sichtbar | Lebensdauer oben/unten ± 20 % |
| 5 | 10⁹ über alle Epochen, Megastadt | Revolution, Reform, Gentrifizierung | P · Sprung | Umstürze folgen Gini-Spitzen ≥ 0,7 |
| 6 | fremde Ränge | Ordnung folgt Biologie | P | Rangordnung aus dem Bild ≥ 60 % |

#### Gesetz, Verwaltung, Steuer, Strafe

`mensch.macht.recht` — **HEUTE 0 / 7**

*misst:* ob Recht das Verhalten der Welt beobachtbar ändert.

*Beleg:* Wächter und Nachtwächter stehen 6–20 Uhr und reagieren auf nichts (koerper-core.js:4942)

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Wache, die wirkt | sieht und antwortet | P · Platz | Regelbruch in Sicht → Antwort ≥ 0,8 von 20 |
| 2 | 1 Regel, Spieler als Täter | sehen, verfolgen, strafen | P · Verfolgung | Folge binnen 60 s ≥ 0,8, ungesehen ohne Folge ≥ 0,8 |
| 3 | Verbrechen unter 10³ Bewohnern | Rate nach Stand und Wache | P | Rate steigt mit Gini ≥ 80 %; Wache × 2 → Rate fällt |
| 4 | Steuer fließt sichtbar | Zehnt, Zoll, Fron | P · Straße | Wagen zum Sitz; Steuer × 2 → Unmut steigt |
| 5 | 10³ Rechtsordnungen | aus Kultur und Epoche | P | dieselbe Tat in 10 Gemeinwesen: ≥ 5 Folgen, je realer Tradition zuordenbar |
| 6 | Verwaltung über 10⁸ | Bürokratie wächst mit Fläche | P | Beamte je Kopf im Seshat-Band ≥ 80 % |
| 7 | Planet, alle Epochen | Recht wandelt sich | P · Sprung | Strafmaß ↔ historische Folge ρ ≥ 0,6 |

#### Krieg, Belagerung, Diplomatie

`mensch.macht.krieg` — **HEUTE 0 / 9**

*misst:* wie viele Kämpfer bei vollem Preis, wie wahr, und ob Krieg und Frieden die Welt bleibend ändern.

*Beleg:* Hieb-Physik, Treffer am Leib (stamm/kampf.js), an beiden Geräten im Bild (halten.K1); das umringende Rudel (tiere.K2, oekologie.K4) ist Jagd und zählt bei leben.tiere.verhalten und leben.tiere.mensch. — KARTE: 0 — ein Zweikampf zwischen zwei Bewaffneten ist nicht gemessen.

*alte Karte:* halten.K1 · pflicht.F

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Zweikampf: 2 Bewaffnete | Hieb trifft den Leib, Deckung, Ausweichen | P · Arena | 20 Zweikämpfe im Bild: der Treffer sitzt, wo die Klinge den Leib kreuzt, der Getroffene antwortet; kein Treffer durch die Deckung |
| 2 | 10 Kämpfer, Mensch gegen Mensch | Moral, Flucht | P · 10 im Bild | Flucht statt Tod im Band; „menschlich“ ≥ 60 % |
| 3 | 10² Scharmützel | Formation, Gelände | P · 10² im Bild | Höhe gewinnt ≥ 65 % bei gleicher Stärke |
| 4 | 10³ Feldschlacht | Formationen halten und brechen | P · 10³ im Bild | Flankenangriff → Bruch ≥ 70 % |
| 5 | 10⁴ Belagerung | Bresche, Hunger; Spur bleibt | P · Sprung | nach 100 J Flickmauer sichtbar ≥ 80 % |
| 6 | 10⁵ Schlacht | Logistik, Versorgung | P · fern Masse, nah Leib | Übergang ohne Pop; Versorgung geschnitten → Schwäche ≥ 70 % |
| 7 | Krieg und Frieden zwischen 10³ | Bündnis, Vertrag, Tribut | P · Sprung | Kriege an Ungleichgewichten ≥ 0,7 |
| 8 | 10⁷ Kämpfer, Front 10³ km | Front formt Landschaft und Stadt | P · Flug | Graben- und Ruinenbild gegen Luftbild ununterscheidbar |
| 9 | interplanetare Konflikte | nach Biologie und Technik | P · Planetenwechsel ≤ 5 s | Konflikt-Spuren aus dem Samen ≥ 70 % |

#### Macht in der Megastadt

`mensch.macht.megastadt` — **HEUTE 0 / 7**

*misst:* ob Polizei, Bande, Konzern, Protest und Überwachung aus dem Feld entstehen statt aus dem Nichts.

*Beleg:* nichts

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Wache, Streife | Streife fährt aus der Wache | P · Straße | Antwortzeit ∝ Weg zur Wache ρ ≥ 0,7; niemand erscheint im Sichtfeld |
| 2 | 10 Bandenreviere | Überschuss minus Kontrollkosten | P | Grenzen an Barrieren ≥ 0,7; Revier aus Graffiti ≥ 70 % |
| 3 | 10² Machtzentren | Bodenpreis und Höhe folgen Macht | P · Skyline | Gradient im Band; Türme an maximaler Erreichbarkeit ≥ 0,8 |
| 4 | 10⁴ im Protest | Masse mit Ursache | P · 10⁴ im Bild | Protest nach Schock ≥ 0,7; zentrale Plätze |
| 5 | 10⁷ Köpfe, Überwachung | Kontrolle folgt Macht und Unruhe | P · jeder Bezirk | Kontrolldichte ↔ Preis und Verbrechen ≥ 80 % |
| 6 | 10⁸ vertikal geschichtet | oben/unten nach Kultur | P | Höhe ↔ Stand erkennbar ≥ 80 % |
| 7 | fremde Megastädte | Ordnungen jenseits der Erde | P · Planetenwechsel | Richter 1–6 in 64 fremden Saaten ≥ 0,7 |

### Kultur, Sprache, Glaube, Wissen

*Referenz-Korpus (R6, R11):* WALS und Glottolog, Schrift-Kataloge, ethnografischer Atlas (D-PLACE), Musik-, Kunst-, Bühnen- und Bau-Korpora je Kultur

#### Sprachen der Welt

`mensch.kultur.sprache` — **HEUTE 0 / 7**

*misst:* wie viele unterscheidbare Sprachen aus dem Samen entstehen, wie wahr sie klingen und ob ihre Verwandtschaft rekonstruierbar ist.

*Beleg:* keine Welt-Sprache; Ortsnamen aus festen Silben je Region (fachwerk-core.js:3306)

*alte Karte:* spielgang.K5

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Sprache: Orts- und Personennamen | aus einem Guss | P · Dorf | 100 Namen aus 2 Saaten richtig zugeordnet ≥ 90 % |
| 2 | U_eff ≥ 10 | Laute, Silben, Wortschatz | P · Dorf | Sprachen an 20 Sätzen getrennt ≥ 85 % |
| 3 | U_eff ≥ 10², ≥ 5 Familien | Lautgesetze erzeugen Kognaten | P | Stammbaum aus gelesenen Wortlisten, Robinson-Foulds ≤ 0,3 in ≥ 70 % |
| 4 | U_eff ≥ 10³, Dialekt-Kontinua | Typologie wie WALS, Grenzen an Barrieren | P | KL ≤ 0,2; Isoglossen auf Barrieren ≥ 70 % |
| 5 | U_eff ≥ 7·10³ hörbar | Satz passt zur Handlung | P · Markt mit 500 Sprechenden | Linguisten-Blindtest: Tonaufnahme der erzeugten Sprache gegen eine reale, den Hörern unbekannte Sprache, 2AFC ≤ 60 %; Satz ↔ Handlung ≥ 80 % |
| 6 | ≥ 10⁵ Sprachstufen über Epochen | Ursprache wird hörbar zur Tochter | P · Jahreswechsel ≤ 1 s | Swadesh-Retention 70–86 % je 1 000 J; Ursprache ≥ 60 % rekonstruiert |
| 7 | ≥ 10⁶ über Planeten, fremde Medien | Licht, Duft, Infraschall | P | Verständigungs-Probe: zwei fremde Sprecher stimmen über ihren Kanal eine Tat ab (Treffen am genannten Ort ≥ 80 %); Gegenlauf Kanal gekappt → Zufall; Zipf 0,8–1,2 |

#### Die geschriebene Welt

`mensch.kultur.schrift` — **HEUTE 0 / 6**

*misst:* wie viel Schrift der Spieler im Bild liest und ob sie aus dem Ort folgt — bis jeder Text wahr über die Welt ist.

*Beleg:* die Stele mit Schriftband lebt nicht im Spiel; lesbar nur das Peer-Namensschild (stamm/netz-p2p.js:2232)

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Schrift an Sonderbauten | Zeichen passend zur Rolle | P · Dorf | Sonderbauten mit lesbarem, passendem Schild ≥ 90 % |
| 2 | U_eff ≥ 10 Schrift-Typen, 500 Grabsteine | Typus folgt Epoche; Grabstein aus der Akte | P · Friedhof | OCR liest ≥ 80 % zu den Akten zurück |
| 3 | U_eff ≥ 10², jede Hauswand | Schild aus dem Gewerbe dahinter | P · Marktgasse | Text-Pixel-Anteil ± 25 % gegen Foto; ≥ 90 % nennen das Gewerbe |
| 4 | ≥ 10⁵ leuchtende Schilder, ≥ 20 Schriften im Viertel | nachts gespiegelt auf nassem Asphalt | P · Nacht und Regen | Leuchtdichte und Schriftdichte im Band gegen Shinjuku |
| 5 | alle Epochen und Planeten | fremde Träger | P | N = 100: Typus, Träger, Epoche plausibel ≥ 85 % |
| 6 | jeder lesbare Text ist wahr | Chronik, Grabstein, Karte stimmen | P | 200 Texte widerspruchsfrei ≥ 90 %, ≥ 50 % verweisen auf ein Ereignis |

#### Glaube, Ritual, Bestattung

`mensch.kultur.glaube` — **HEUTE 0 / 6**

*misst:* wie viele unterscheidbare Glaubenssysteme die Welt trägt und wie sichtbar sie Landschaft und Leben formen.

*Beleg:* Rolle kirche als Region-Markbau mit 1 Bewohner (fachwerk-core.js:3696–3700, 8163); kein Ritus, kein Kalender, kein Friedhof

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Glaube mit Kalender | Ritus-Stunde, Fest füllt den Platz | P · Ritus-Stunde | ≥ 30 % der Gläubigen im Kultbau; Festtag ≥ 3× Werktag |
| 2 | U_eff ≥ 10 Glauben | Kultbau und Ritus aus der Lehre | P · 500 Feiernde | Ausrichtung ≤ 5° von der Regel; blind getrennt ≥ 80 % |
| 3 | ≥ 10³ Gräber je Stadt | Gräberfeld wächst mit Sterblichkeit | P · Friedhof | Gräberzahl ± 20 %; Schichtung 1320/1860 |
| 4 | U_eff ≥ 10², heilige Landschaft | heilige Orte an Extremen, Pilgerwege | P · 10⁴ Pilger | ≥ 70 % an Extremen; Pilgerstrom vom Hügel |
| 5 | ≥ 10³ Richtungen, Spaltung, Synkretismus | Erbe mit Mutation | P · Jahreswechsel ≤ 1 s | Stammbaum RF ≤ 0,3; Mischriten an Grenzorten ≥ 30 % |
| 6 | fremdes Heiliges | Mythos erklärt die gebaute Welt | P | Hauptgötter ↔ reales Phänomen der Saat ≥ 80 % |

#### Kultur als Stil-Raum

`mensch.kultur.gestalt` — **HEUTE 0 / 7**

*misst:* wie viele unterscheidbare Kulturen und Zeit-Gestalten das Gesetz hervorbringt, sichtbar in Bau, Tracht, Werkzeug, Speise, Fest — gezählt als U_eff an Saaten (Kultur L4 + Geschichte L5 + Bauten L1).

*Beleg:* 32 Archetypen per Hash (fachwerk-core.js:2012), 28 Baustil-Pools, 9 Epochen; zwei Epochen 72,3 % andere Leib-Pixel (haar.K4); Häuser-Trennung ungemessen, Häuser lesen als weiße Kästen

*alte Karte:* haar.K4 · siedlung.K4

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | U_eff ≥ 10 (auch aus Liste) | Bau und Tracht je Kultur und Epoche | P · Dorf und Stadt | 10 Kulturen an Häuser-Bildern blind getrennt ≥ 80 % |
| 2 | U_eff ≥ 10² aus dem Samen | Merkmalsvektor aus dem Erbfeld | P | Saat-Probe: getrennt ≥ 80 %, plausibel ≥ 90 % |
| 3 | U_eff ≥ 10³ auf einem Kontinent | hält Fotovergleich nah und fern | P · Nah- und Fern-Pose | Merkmalsabstand zum realen Gegenstück im Foto-Band |
| 4 | U_eff ≥ 10⁴ mit Fest und Alltag | Speise, Musik, Tanz folgen der Kultur | P · 10⁴ Feiernde | Fest-Tracht ≥ 60 %; Musik der Kultur zugeordnet ≥ 70 % |
| 5 | U_eff ≥ 10⁵ über alle Epochen | jede Zeit am Ort plausibel | P · Jahreswechsel ≤ 1 s | 100 (Ort, Jahr): plausibel ≥ 85 %; Foto-Verwechslung ≥ 40 % |
| 6 | U_eff ≥ 10⁶ über Planeten und Arten | Ästhetik folgt Leib, Sinnen, g | P | fremde Bauten passen zu Leib und g ≥ 90 % |
| 7 | jede Stichprobe so wahr wie die Wirklichkeit | Gegenprobe an nie-irdischen Orten | P | 1 000 irdische Stichproben: Foto-Verwechslung ≥ 50 %; Wiederholung einer Gestalt ≤ 1 % |

#### Wanderung, Diffusion, Mischung

`mensch.kultur.diffusion` — **HEUTE 0 / 6**

*misst:* ob Merkmale über Wege wandern, Kulturen sich berühren und mischen, sichtbar im Raum.

*Beleg:* Stile lösen sich nur in der Zeit ab (fachwerk-core.js:3281), keine Wanderung im Raum

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 2 Kulturen an einer Grenze | Mischformen | P · Grenzdorf | Grenzstreifen ≥ 30 % gemischt, abseits ≤ 5 % |
| 2 | ≥ 10 Kulturen, Diffusion über Wege | Merkmale und Lehnwörter folgen dem Weg | P | Mantel-r ≥ 0,4 und größer als Luftlinie; Lehnwort ↔ Distanz r ≤ −0,5 |
| 3 | 10 Herkünfte in einer Stadt | Diaspora-Viertel, zweite Generation mischt | P · Viertel | Herkunft aus Straßenbildern ≥ 75 % |
| 4 | 10² Herkünfte in 10⁷ | Hybrid-Kultur wird Quelle | P · Stadt | ≥ 1 neues Hybrid-Merkmal in 100 J, trennbar, wandert ins Umland |
| 5 | Völkerwanderung über Jahrtausende | Sprachkarte trägt die Spur | P · Jahreswechsel | Wanderrichtung rekonstruiert ± 30° |
| 6 | 10⁸-Stadt mit Herkünften mehrerer Planeten | Kolonien driften | P | Divergenz ↔ Zeit × Abstand r ≥ 0,7 |

#### Wissen und Weitergabe

`mensch.kultur.wissen` — **HEUTE 0 / 6**

*misst:* ob Wissen wächst, gelehrt, aufgeschrieben, verloren und wiedergefunden wird.

*Beleg:* Technikstand nur als Funktion der Jahreszahl (fachwerk-core.js:8105)

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Technikstand je Ort | wächst mit Größe und Vernetzung | P | Stand ↔ Bevölkerung × Vernetzung r ≥ 0,5 |
| 2 | Schule, Bibliothek, Werkstatt | Können folgt Lehrer und Buch | P | Schüler eines Meisters ≥ 1 SD über dem Mittel |
| 3 | Bücher und Medien lesbar und wahr | zeigen Ereignisse der eigenen Welt | P · Text am Blick | ≥ 70 % verweisen auf ein reales Ereignis der letzten Tage |
| 4 | Verlust und Wiederfindung | Katastrophe vernichtet, Fund hebt | P · Jahreswechsel | Stand fällt nach Ausbruch, steigt nach Fund |
| 5 | Wissen über 10³ Jahre und Städte | Gelehrtennetze, Übersetzung | P | Zitat-Netz der Archive gegen Handelsnetz r ≥ 0,5 |
| 6 | Wissenschaft fremder Arten | ihre Physik stimmt mit ihrer Welt | P | gelesene Naturgesetze widerspruchsfrei ≥ 90 % |

#### Verständigung

`mensch.kultur.verstaendigung` — **HEUTE 0 / 6**

*misst:* ob der Spieler einer fremden Sprache begegnen, sie lernen und verstehen kann.

*Beleg:* keine Welt-Sprache, Bewohner sprechen nicht mit dem Spieler

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Grüße und Gesten | kulturgemäße Antwort | P · Markt | ≥ 90 % antworten; Gruß-Form trennbar ≥ 80 % |
| 2 | Wort für Wort lernbar | aus Zeigen, Schild, Kontext | P | unbefangener Spieler: ≥ 20 Wörter in 30 min |
| 3 | Schrift entziffern | Bilinguen im Spiel | P | ≥ 50 % einer Inschrift entziffert |
| 4 | Sitte und Tabu wirken | Bruch wird anders behandelt | P | Ablehnung nach Bruch ≥ 3× |
| 5 | Verkehrssprache, Pidgin | wo Sprachen aufeinandertreffen | P | Handelsorte mit Verkehrssprache ≥ 70 % |
| 6 | nicht-menschliche Sprache | aus Verhalten und Signal | P | ≥ 10 Bedeutungen erschlossen |

#### Bild, Skulptur, Baukunst

`mensch.kultur.bildkunst` — **HEUTE 0 / 7**

*misst:* ob Kulturen Kunst hervorbringen, die man in der Welt findet — Wandbild, Gemälde, Skulptur, Ornament, Bau als Kunstwerk —, mit eigenem Stil je Kultur und Epoche und Motiven aus dem, was es in ihrer Welt gibt.

*Beleg:* Nie gemessen; keine Station der alten Karte misst Kunst am Bau oder im Raum.

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | EIN Ort, 10 Werke (Wandbild, Figur, Ornament) | das Motiv zeigt etwas aus der Welt des Orts (Tier, Berg, Herrscher, Ereignis) | P · nah | 10 Werke: Motiv in der Welt gefunden (das Tier lebt dort, das Ereignis geschah) ≥ 80 %; keine zwei gleich |
| 2 | 10 Kulturen, je eigener Stil | Stil aus einem Bild erkennbar | P | Werk blind der richtigen von 10 Kulturen zugeordnet ≥ 70 % |
| 3 | Stil wandelt sich über 1 000 Jahre | früh, hoch, spät — datierbar | P · Sprung ≤ 5 s | Blind-Datierung der Werke eines Orts: Fehler ≤ 15 % der Spanne |
| 4 | Werkstoff und Technik aus der Welt | Farbe aus Erden und Pflanzen des Orts, Stein aus dem nahen Bruch, Bronze nur mit Erz | P | Gegenlauf: Saat ohne den Stoff → keine Werke daraus (0 im Bild); Farbtöne der Malerei im Band der Pigmente des Orts |
| 5 | 10⁴ Werke einer Stadt: Tempel, Galerie, Straßenkunst, Grabmal | Kunst sitzt, wo Macht, Glaube und Geld sitzen | P | Dichte der Werke je Viertel ↔ Rang und Kult r ≥ 0,5; Blindpaar Werk gegen Foto realer Kunst der Epoche (2AFC ≤ 70 %) |
| 6 | Künstler als Personen, 10⁶ Bewohner | jedes Werk hat einen Urheber mit Leben, Schule, Schülern; Stil vererbt sich | P | 100 Werke: Urheber auffindbar, sein Leben nennt das Werk; Stil-Abstand Lehrer ↔ Schüler kleiner als zu Fremden |
| 7 | Kunst jeder Kultur jeder Welt, auch für fremde Sinne (Duft-Bild, Tast-Figur) | Kunst folgt Sinn, Stoff und Glaube der Art | P | Fremdwelt-Probe (R10): Sinn und Glaube der Art aus dem Werk gelesen Rang ≥ 0,7 |

#### Buch, Bühne, Film

`mensch.kultur.erzaehlkunst` — **HEUTE 0 / 7**

*misst:* ob die Welt erzählende Künste trägt — Buch, Theater, Kino, Sendung — als Orte mit Publikum und als Werke, deren Stoff aus der Geschichte dieser Welt kommt und die man lesen, sehen, hören kann.

*Beleg:* Nie gemessen; Bewohner sprechen nicht (siehe erleben.klang.stimme).

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | EINE Bühne oder EIN Erzähler am Abend, 10² Zuhörer | das Stück läuft von Anfang bis Ende, das Publikum antwortet | P · im Saal | Stück mit Anfang, Wende, Ende im Bild; Lachen und Stille des Publikums folgen den Stellen des Stücks (r ≥ 0,5) |
| 2 | 10 Werke einer Stadt, lesbar oder sehbar | jedes erzählt ein Ereignis, das in der Welt geschah oder geglaubt wird | P | 10 Werke: Kern (Wer, Was, Wo) gegen den Zustand der Welt oder ihre Legenden ≥ 80 % |
| 3 | 10² Werke, 5 Gattungen (Epos, Posse, Tragödie, Lied, Chronik) | Gattung blind erkannt; die Werke verschieden | P | Gattung ≥ 70 % richtig; Blindpaar Text gegen Übersetzungen realer Werke der Epoche (2AFC ≤ 75 %) |
| 4 | Theater, Kino, Verlag als Betrieb, 10⁴ Besucher am Tag | Spielplan, Kasse, Erfolg und Misserfolg; Werke wandern von Stadt zu Stadt | P | Besucherzahl folgt Güte und Mode; Gegenlauf Haus geschlossen → die Besucher verteilen sich auf andere |
| 5 | Film und Sendung der Epoche: bewegtes Bild im Bild | die Aufnahme zeigt echte Orte und Personen der Welt; Darsteller sind Bewohner | P | 20 Filme: Drehort in der Welt auffindbar ≥ 80 %; Darsteller als Person mit Leben |
| 6 | Werke über Jahrhunderte: Klassiker, Verbot, Wiederentdeckung | ein Kanon entsteht; spätere Werke zitieren frühere | P · Sprung ≤ 5 s | Zitat-Netz über 500 Jahre: Anteil der Werke mit benennbarem Vorgänger ≥ 60 % |
| 7 | Erzählkunst jeder Kultur jeder Welt, gegen die besten der Gegenwart | Werke, die ein Mensch freiwillig zu Ende liest | P | blinde Leser: zu Ende gelesen ≥ 50 %; Paarvergleich gegen ausgezeichnete Erzählungen der Gegenwart: unser Werk gewählt ≥ 30 % |

#### Straßenleben — Küche, Mode, Nacht, Vergnügen

`mensch.kultur.strassenleben` — **HEUTE 0 / 7**

*misst:* ob die Stadt lebt, wenn niemand arbeitet: Garküche und Wirtshaus, Mode, die kommt und geht, Nacht mit Lokalen und Musik, Spiel, Rausch und Einkauf — als Orte, die Bewohner aufsuchen, mit Wandel über die Zeit.

*Beleg:* Bewohner tragen einen Tagesplan mit 6 Akten (siehe mensch.geist.tag); Lokal, Mode und Nacht als eigene Orte und Abläufe: nie gemessen.

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | EINE Gasse am Abend: 3 Lokale, 20 Gäste | Essen wird gekocht, gereicht, gegessen; Gäste kommen aus eigenem Anlass | P | 20 Gäste verfolgt: jeder kam nach seinem Tagesplan, isst und geht; Gericht aus Zutaten der Flur (Gegenlauf Zutat fehlt → das Gericht fehlt) |
| 2 | Küche eines Orts: 10² Gerichte aus Flur, Meer, Handel | die Küstenstadt isst Fisch, das Bergdorf Käse | P | Speisekarte ↔ Umland: Zutaten im Umkreis oder im Handel gefunden ≥ 90 % |
| 3 | Mode in einer Stadt über 10 Jahre | Schnitt und Farbe kommen auf, breiten sich aus, verschwinden | P · Sprung ≤ 5 s | Anteil eines Merkmals auf der Straße über 10 Jahre: Aufstieg und Abklingen im Band realer Mode-Kurven; zuerst bei Jungen und Reichen |
| 4 | Nachtleben, 10⁴ unterwegs | Lokale, Musik, Tanz, Glücksspiel; andere Menschen als am Tag | P · Nacht | Belegung der Lokale je Stunde gegen Zählreihen realer Ausgehviertel ±25 %; Blindpaar Ausgehstraße gegen Foto ≤ 75 % |
| 5 | Einkauf und Vergnügen einer Megastadt: 10⁵ Läden und Buden | jede Bude mit Ware, Wirt, Stammgast; die Ware wechselt mit Saison und Mode | P | 100 Zufallsläden: betretbar, Ware benutzbar, Wirt mit Leben ≥ 95 %; Dichte je 100 m ≥ Vergleichstitel |
| 6 | Szenen und Jugendkulturen | Gruppen mit eigener Tracht, Musik, Treffpunkt, Sprache — sie entstehen und vergehen | P · Sprung ≤ 5 s | 10 Szenen blind an Tracht und Ort getrennt ≥ 80 %; jede mit Anfang und Ende in der Zeit |
| 7 | Straßenleben jeder Kultur jeder Epoche jeder Welt | Rom bei Nacht, Edo zur Kirschblüte, eine Stadt, die es nie gab | P | Erd-Seite: 2AFC gegen datierte Bildquellen ≤ 70 %; fremd: Fremdwelt-Probe (R10) |

### Menschenzeit — Epochen und Geschichte

*Referenz-Korpus (R6, R11):* archäologische Pläne und Rekonstruktionen, historische Atlanten, Bevölkerungsraster (HYDE), datierte Bildquellen

#### Die Kultur-Zeit am Ort — datierbar

`mensch.zeit.spanne` — **HEUTE 0 / 7**

*misst:* wie fein und wie wahr die Zeit der Kultur am selben Ort ist: ob ein blinder Prüfer das Jahr aus dem Bild liest und Nachbar-Halte sich aus einer Ursache unterscheiden. Die Spanne, das Raffen und die Sprung-Zeit des Spielers zählen erleben.spieler.zeit und same.massstab.sprung; die Orte der echten Menschheit mensch.zeit.erde.

*Beleg:* Zeitreise nur per Chat-Satz, Jahre 1–9999, jeder Satz gründet den Ort neu (stamm/feld-leben.js:1173–1197); Wechsel-Zeit nie gemessen, kein Regler

*alte Karte:* siedlung.K4

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Jahr 1–9999 per Satz, 4 Halte | Stil, Tracht, Größe je Epoche | P | dieselbe Zelle unter 4 Jahren: Blind-Datierung bringt die 4 Bilder in die richtige Folge ≥ 80 % |
| 2 | 3 000 J, Schritt ≤ 50 J, Regler | Bauten, Wege, Menschen, Fahrzeuge | P | 60 Halte: Blind-Datierung, Fehler ≤ 10 % der Spanne bei ≥ 80 %; Nachbar-Halte im Bildpaar unterscheidbar ≥ 70 % |
| 3 | 12 000 J, Schritt ≤ 10 J | Lager, Dorf ohne Metall, Tell | P | Stichprobe 100 aus 1 200 Halten: Datierungs-Fehler ≤ 10 % der Spanne; jeder Unterschied zweier Nachbar-Halte hat eine benennbare Ursache (Brand, Zuzug, neue Technik) ≥ 80 % |
| 4 | + 1 000 J Zukunft, stetiger Zeitraffer | man sieht die Stadt wachsen | P · Raffer 100 J/s | 130 s Zeitraffer: Bildsprünge ohne Ursache = 0 (Sprung heißt Luma > 5 % oder Lage > 1 % zwischen zwei Bildern); Anfang und Ende blind in der richtigen Folge ≥ 95 % |
| 5 | 300 000 J + 10⁴ J Zukunft, jedes Jahr | jede Kultur am Ort | P | 1 000 Zufallsjahre: Blind-Datierung ≤ 10 % der Spanne in log-Jahren; Zukunfts-Halte mit Fremdwelt-Probe (R10) |
| 6 | jeder Ort des Planeten × jedes Jahr | alle Kulturen konsistent | P | 1 000 Stichproben (Ort, Jahr): 2AFC gegen datierte Bildquellen und Rekonstruktionen der Epoche ≤ 70 %; Datierungs-Fehler ≤ 10 % |
| 7 | jede Welt, jede Kultur tragende Art, 10⁶ J | Zeit gehbar wie Raum | P · Raffer 10⁴ J/s | Stichproben (Planet, Art, Ort): 5 Halte eines Orts blind in die richtige Folge gebracht ≥ 90 %; Fremdwelt-Probe (R10) |

#### Hervorgehen: das Jüngere trägt das Ältere

`mensch.zeit.palimpsest` — **HEUTE 0 / 8** · Kern 1

*misst:* welcher Anteil des Sichtbaren eines jüngeren Zustands aus dem älteren stammt, und wie lange eine Stadt am selben Ort wächst, verfällt und überbaut wird (Geschichte L2 + Stadt L5).

*Beleg:* Wachstum aus Bewohnern 12 → 19/20 Häuser in 1 500 s, alte 0,917, Radeon und GTX (siedlung.K4); Jahresringe 0,915 nur headless — KARTE: Kern 1 — Wachstum an beiden Geräten grün (siedlung.K4); Bild-Preis nicht gemessen.

*alte Karte:* siedlung.K4

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 ◐ | Ort wächst in Spielzeit | alte Häuser bleiben | P · Hügel | Häuserzahl über 1 500 s steigt, alte ≥ 0,9 erhalten |
| 2 | Jahresringe über 4 Jahrhunderte im Spiel | Kern alt, Rand jung | P · Sprung ≤ 5 s | Überdeckung je Slot ≥ 0,9 über 1320 → 1935 im echten Spiel |
| 3 | + Wege und Mauer erben | Mauertrasse wird Straße | P · Sprung | Luftbild 1560/1860: Trasse als Straße ≥ 80 %, Kerngassen ≥ 90 % |
| 4 | 600 J stufenlos, Umbau statt Ersatz | Aufstockung, Spolien, Ruinen | P · Schieber ≤ 2 s je Jahr | kein Sprung > 5 % zwischen Nachbarjahren; ≥ 2 Bauphasen an ≥ 50 % der Altstadt |
| 5 | 5 000 J: Schichten im Boden, Tell | Grabung zeigt Vorgänger | P · Grabungsschnitt | Schichtfolge = gefahrene Zustände 100 %; Trassen-Persistenz ≥ 30 % |
| 6 | Namen erben | Ortsname wandelt sich lautgesetzlich | P | 100 Orte über 1 000 J ableitbar ≥ 90 % |
| 7 | Städte entstehen und sterben | Ruinen werden Wald | P · Sprung | 100 Saaten × 5 000 J: Niedergang ≥ 10 %, Ruine erkannt ≥ 70 % |
| 8 | planetare Metropole über 10⁴ J; fremde Zivilisationen über 10⁶ J | jede Epoche im Gegenwartsbild | P · Metropole | 1 000 Blicke: ≥ 2 Epochen sichtbar ≥ 60 %, jede Spur im Zustand ihres Jahres |

#### Die Kausalkette aus dem Samen

`mensch.zeit.kausal` — **HEUTE 0 / 6**

*misst:* ob Geschichte entsteht statt aus einer Kalender-Tafel gelesen zu werden, und ob jedes „Warum“ beantwortbar ist.

*Beleg:* Gewalt → Furcht → langsameres Wachstum im Spiel gemessen (WACHSTUM fachwerk-core.js:3580, siedlung.K4); Epoche sonst Kalender-Nachschlag an ≥ 4 Stellen — KARTE: 0 — Geräte der Messung nicht belegt.

*alte Karte:* siedlung.K4

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Ereignis beugt 1 Kurve | Gewalt bremst Wachstum | P · Zeitraffer | Ort nach Gewalt wächst messbar langsamer |
| 2 | 10² Saaten × 10³ J | Geschichte entsteht, keine Kalendertafel | P · Geschichte bis t ≤ 1 s | Varianz der Epoche über Saaten > 0; Ordnungsbrüche 0 |
| 3 | 10² Orte: jeder Bruch hat Ursache | „Warum?“ im Spiel beantwortbar | P · Kette ≤ 1 s | Kette ≥ 5 Glieder bis zum Samen ≥ 95 %; Brüche ohne Ursache ≤ 5 % |
| 4 | 10⁴ Saaten: alternative Geschichten | auch Wege, die die Erde nie ging | P | Kette lückenlos (jedes Glied hat einen Vorgänger) ≥ 90 %, Verläufe paarweise verschieden ≥ 90 %, ohne Erd-Vorbild ≥ 30 % |
| 5 | Eingriff gabelt die Zukunft | Zeitreise mit Folgen | P · Gabelung ≤ 5 s | Bildpaar anders; ohne Eingriff byte-gleich |
| 6 | viele Planeten, je EINE Kette über 10⁶ J | jedes Leben herleitbar | P | 1 000 Stichproben: Kette lückenlos 100 %; Gegenlauf: Glied entfernt → die Folge bleibt aus ≥ 95 % |

#### Geschichte erleben

`mensch.zeit.erleben` — **HEUTE 0 / 6**

*misst:* ob ein historisches Ereignis als Erlebnis in Echtzeit begehbar ist, nicht nur als Folge.

*Beleg:* keine begehbaren Ereignisse

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Ereignis als Folge am Ort | Ort danach anders | P · am Ort | Bildpaar vorher/nachher am selben Ort |
| 2 | 1 Ereignisart begehbar (Brand) | Feuer nach Bauart und Wind, Flucht | P · während des Ereignisses | Fluchtwege sinnvoll ≥ 90 % blind |
| 3 | 10 Ereignisarten | Ablauf aus Gesetzen | P | 100 Saaten je Art: Abläufe paarweise verschieden ≥ 90 %; Phasen des Ablaufs gegen Quellen realer Ereignisse der Art (Brand, Flut, Belagerung) im Faktor 2 bei ≥ 85 % |
| 4 | 10² Ereignisse einer Kette anspringbar | Sprung auf den Tag | P · Wechsel ≤ 5 s | anspringbar und sichtbar ≥ 95 % |
| 5 | jede Perspektive derselben Stunde | Bürger, Soldat, Herrscher, Tier | P | 5 Perspektiven derselben Stunde: jedes Ereignis steht in allen fünf Bildfolgen am selben Ort zur selben Zeit (±1 s, ±1 m) |
| 6 | jedes Ereignis jeder Zivilisation | Pompeji bis erste Landung | P | 1 000 Stichproben begehbar ≥ 95 %; Verwechslung mit Referenz-Inszenierung ≥ 50 % |

#### Orte und Zeiten der echten Menschheit

`mensch.zeit.erde` — **HEUTE 0 / 6**

*misst:* ob die Erd-Saat die Orte der Menschheit zu ihrer Zeit trifft — Rom um 100, Edo um 1700, Tenochtitlan um 1500 — gemessen am archäologischen Plan und an datierten Bildquellen. Der Schlüssel zählt im Byte-Preis (R4).

*Beleg:* Stand 0: keine Erd-Saat; die Zeitreise per Satz gründet den Ort neu (siehe mensch.zeit.spanne).

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | EIN Ort, EINE Zeit (eine römische Stadt um 100) | Stadtplan, Hauptbauten, Tracht nach dem Befund | P · Schlüssel ≤ 10 kB | Straßenachsen gegen den archäologischen Plan: Deckung ≥ 70 %; Fach-Panel 2AFC Spielbild gegen wissenschaftliche Rekonstruktion ≤ 80 % |
| 2 | 10 Orte × 3 Epochen | Bauweise, Dichte, Lage am Wasser je Ort | P · Schlüssel ≤ 100 kB | je Ort Plan-Deckung ≥ 70 %, Einwohner ±30 % gegen die Schätzung der Forschung |
| 3 | 100 Orte über 5 000 Jahre, je 5 Zeitschnitte | dieselbe Stadt wächst, brennt, wird überbaut — wie sie es tat | P · Sprung ≤ 5 s | Blind-Datierung der Schnitte: Fehler ≤ 10 % der Spanne; Stadtumriss je Schnitt gegen den historischen Atlas IoU ≥ 0,6 |
| 4 | die bewohnte Erde in jedem Jahrhundert seit −3000 | Siedlungsdichte, Reiche, Handelswege | P · Schlüssel ≤ 5 MB | Bevölkerungsraster gegen HYDE je Jahrhundert: Rang-r ≥ 0,7; Reichsgrenzen gegen Seshat IoU ≥ 0,5 |
| 5 | 10⁴ Orte in jedem Jahr der Schriftzeit | Alltag, Tracht, Sprache der Zeit | P | 1 000 (Ort, Jahr): 2AFC gegen datierte Bildquellen ≤ 70 %; das Fach-Panel findet ≤ 1 Anachronismus je 10 Bilder |
| 6 | jeder Ort der Erde in jedem Jahr, das ein Mensch erinnert | die eigene Stadt im Jahr der Großeltern | P · Schlüssel je besuchtem km² und Jahrzehnt, am Ort geladen und gezählt | Heimat-Probe über die Zeit: 100 Menschen erkennen ihren Ort um 1950 im 2AFC gegen alte Fotos ≤ 75 % |

### Zukunft — Zivilisation jenseits der Gegenwart

*Referenz-Korpus (R6, R11):* kein Erd-Korpus: die Fremdwelt-Probe (R10); der Korpus bekannter Welten umfasst hier Bilder der Gegenwart und der genannten Vergleichstitel

#### Technik nach uns — Epochen jenseits der Gegenwart

`mensch.zukunft.technik` — **HEUTE 0 / 7**

*misst:* ob die Technik aus dem Samen über die Gegenwart hinaus weiterwächst — Energie, Stoff, Rechnen, Raumfahrt — und im Stadtbild als Folge sichtbar wird. Die Pfade bis zum Halbleiter zählt mensch.wirtschaft.technik; hier beginnt die Zeit danach. Richter ist die Fremdwelt-Probe (R10) am Bild, nie eine Studie.

*Beleg:* Die Epochen-Tafel der Stadt ist eine Liste, nicht gewachsen (fachwerk-core.js:3294, siehe mensch.wirtschaft.technik); die Zeitreise per Satz bis Jahr 9999 gründet den Ort neu, ohne Technik-Folge (siehe mensch.zeit.spanne).

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | EINE Stadt, 50 Jahre nach der Gegenwart ihrer Saat | 10 sichtbare Dinge, die es heute nicht gibt, je mit Vorgänger in der Stadt davor | P | Bildpaar Jahr 0 / +50 am selben Ort: ≥ 10 neue Dinge im Bild benannt; Gegenlauf: Vorgänger gekappt → das Ding fehlt ≥ 80 % |
| 2 | +200 Jahre, 10² neue Techniken | die Energiequelle prägt die Stadt (Fusion, Sonne aus dem Orbit, Erdwärme): Trassen, Türme, Abwärme | P | Ursachen-Probe: der Leser nennt aus dem Stadtbild die Energiequelle ≥ 70 %; Gegenlauf Quelle getauscht → das Stadtbild kippt ≥ 80 % |
| 3 | +500 Jahre: neue Stoffe und Bauweisen | Bauten, die heutige Stoffe nicht trügen — und nach ihrem Stoff-Gesetz tragen | P | höchste Spannweite und Höhe im Bild ≤ Grenze des Stoffs der Epoche (same.physik.tragen) und > Grenze heutiger Stoffe |
| 4 | +1 000 Jahre, 10 Saaten, 10 verschiedene Zukünfte | Zukunft ist kein Katalog: die Pfade trennen sich nach Stoffen, Klima, Geschichte | P · Sprung ≤ 5 s | Blind-Sortierung: 10 Stadtbilder zur richtigen Saat ≥ 80 %; je Paar ≥ 5 benennbare Unterschiede mit Ursache |
| 5 | Zivilisation mit dem Energiehaushalt eines Planeten (10¹⁷ W) | Megabauten, Orbit-Ring, Wetter-Lenkung — von der Straße aus zu sehen | P | Energie-Bilanz aus dem Bild (Lichter, Abwärme, Verkehr) gegen die Quelle ±50 %; Nachtseite gegen Rechen-Referenz |
| 6 | Zivilisation mit dem Energiehaushalt eines Sterns (10²⁶ W) | Schwarm um den Stern, Industrie zwischen den Planeten | P · Sprung ≤ 5 s | Sternlicht am Heimatplaneten gedimmt um den Anteil des Schwarms ±10 %; Fremdwelt-Probe (R10) |
| 7 | jede Saat ihre eigene Zukunft über 10⁴–10⁶ Jahre, auch fremder Arten | Technik-Epochen, die niemand vorhersah, jede aus der vorigen | P | 100 Saaten: Kette lückenlos (jedes Ding hat einen Vorgänger) 100 %; Neuheit gegen den Korpus (Gegenwart und Vergleichstitel) ≥ 30 % |

#### Rechner, Netz und die Bildschicht der Stadt

`mensch.zukunft.medien` — **HEUTE 0 / 7**

*misst:* ob Rechnen und Netz als Schicht der Stadt da sind — Bildschirm, Leuchtschrift, Hologramm, Werbung, Nachricht, Unterhaltung — und ob ihr Inhalt aus der Welt stammt statt aus einer Schleife.

*Beleg:* Stand 0: Hologramm, Reklame, Werbetafel, Leuchtreklame — 0 Treffer in stamm/ und den Kernen (Grep 14.11.).

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | EINE Straße mit 10 Bildflächen (Schild, Schirm, Leuchtschrift) | jede zeigt etwas, das es in der Stadt gibt (Laden, Ware, Uhrzeit, Wetter) | P · Nachtstraße | 10 Flächen: der Inhalt stimmt mit der Welt (der Laden steht dort, Uhr und Wetter richtig) 100 %; keine zwei gleich |
| 2 | ein Viertel, 10² Flächen, bewegt | Werbung folgt Ort und Tageszeit; das Licht der Flächen fällt auf Straße und Gesichter | P | Leuchtdichte der Straße folgt dem Inhalt der Flächen (r ≥ 0,7); Blindpaar Nachtstraße gegen Foto einer Leuchtschrift-Straße ≤ 80 % |
| 3 | Stadt, 10⁴ Flächen und Nachrichten | Nachrichten berichten, was in der Stadt geschah (Brand, Wahl, Spiel-Ergebnis) | P | 20 Ereignisse ausgelöst: auf Flächen und Geräten der Bewohner binnen 1 Spielstunde ≥ 80 %; Gegenlauf ohne Ereignis: keine Meldung |
| 4 | Bewohner am Netz: 10⁵ mit Gerät | sie lesen, rufen an, verabreden sich darüber; ihr Verhalten ändert sich | P | Nachricht an Bewohner A → B kommt zum Treffpunkt ≥ 80 %; Gegenlauf Netz aus → das Treffen bleibt aus |
| 5 | Megastadt: Hologramm, Raum-Bild, Schichten von Werbung bis in den Himmel | Bild im Raum mit richtiger Verdeckung und Lichtwurf, lesbar im Regen | P · bei Nacht und Regen | Blindpaar gegen die Nachtstraße der Vergleichstitel (unser Bild gewählt ≥ 50 %) und gegen Fotos (2AFC ≤ 65 %); Dichte lesbarer Flächen je 100 m ≥ Vergleichstitel |
| 6 | begehbares Netz: der Datenraum als Ort | die Rechner der Welt sind bedienbar, ihr Inhalt ist der Zustand der Welt | P | 20 Zufalls-Terminals: Abfrage (Fahrplan, Register, Kamera) liefert den wahren Zustand ≥ 95 %, am Ort nachgeprüft |
| 7 | jede Kultur ihre eigenen Medien, auch für fremde Sinne (Duft-Schrift, Infraschall-Funk) | das Medium folgt Sinn und Technik der Art | P | Fremdwelt-Probe (R10): Medium aus den Sinnen der Art vorhergesagt Rang ≥ 0,7; Verständigungs-Probe mit Gegenlauf |

#### Roboter, Androiden, KI-Personen

`mensch.zukunft.maschinenwesen` — **HEUTE 0 / 7**

*misst:* ob Maschinen als Wesen der Welt leben — arbeiten, sich bewegen, wie ihr Bau es verlangt, Personen sind mit Tag, Gedächtnis und Recht — und ob die Straße mit ihnen der Messlatte standhält.

*Beleg:* Stand 0: Roboter, Android, Cyborg — 0 Treffer in stamm/ und den Kernen (Grep 14.11.).

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | EIN Arbeits-Roboter an EINER Aufgabe | Gang und Griff folgen seinem Bau (Räder, Beine, Arme), nicht dem Menschen | P | Bewegungs-Kennzahlen aus dem Bild (Schrittfolge, Gelenkgrenzen) passen zum Bau ≥ 90 %; Blindpaar gegen Film realer Roboter ≤ 85 % |
| 2 | 10² Maschinen in einer Stadt, 10 Bauarten | jede Bauart aus ihrer Aufgabe (Lasten, Putzen, Liefern, Wachen) | P | Aufgabe aus dem Bild der Maschine erraten ≥ 70 %; Gegenlauf Aufgabe getauscht → die Bauart wechselt |
| 3 | Maschinen im Stoffwechsel der Stadt: 10⁴ | sie laden, werden gewartet, fallen aus, werden repariert; ohne sie stockt die Stadt | P | Gegenlauf: Maschinen gekappt → Lieferzeit und Müll steigen messbar binnen 1 Spieltag |
| 4 | Androiden und KI-Personen, 10³ | Tag, Gedächtnis, Beziehungen, Besitz — Personen wie Bewohner, mit eigenem Unterschied (kein Schlaf, Ladung, Kopie) | P | 100 gefolgte: Tagesprofil eigen und wiederkehrend; das Gespräch nennt wahre Fakten ihres Lebens ≥ 0,95 |
| 5 | Gesellschaft aus Menschen und Maschinen, 10⁶ | Recht, Arbeit, Streit, Zuneigung zwischen beiden; Viertel, Berufe, Vorurteile | P | Rollen und Wohnorte je Art aus dem Stadtbild messbar; Gesetz geändert (Maschinen-Recht) → Tagespläne ändern sich, mit Gegenlauf |
| 6 | Megastadt mit 10⁷ Maschinen-Personen | die Straße gegen die Vergleichstitel | P | Blindpaar Straßenszene gegen die Vergleichstitel: unser Bild gewählt ≥ 50 %; Maschinen mit eigenem Tagesplan je Straße ≥ Vergleichstitel im selben Protokoll |
| 7 | Maschinen-Zivilisationen ohne Erbauer, eigene Evolution der Bauarten | Bauart folgt Welt und Geschichte | P | Fremdwelt-Probe (R10) an 100 Saaten |

#### Der veränderte Leib — Implantat, Prothese, Gentechnik

`mensch.zukunft.leib` — **HEUTE 0 / 7**

*misst:* ob Leiber sichtbar und wirksam verändert sind — Ersatzglieder, Implantate, gezüchtete Merkmale — und ob die Änderung kann, was sie zeigt.

*Beleg:* Stand 0: Implantat, Prothese, Gentechnik — 0 Treffer in stamm/ und den Kernen (Grep 14.11.).

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | EIN Bewohner mit Ersatzglied | Gang und Griff ändern sich nach dem Bau des Glieds | P · nah | Gang-Kennzahlen (Schrittlänge, Symmetrie) gegen Aufnahmen von Prothesen-Trägern im Band |
| 2 | 10² Bewohner, 10 Arten von Eingriff (Auge, Arm, Haut, Sinnes-Zusatz) | jeder Eingriff ändert, was der Träger kann (sieht nachts, hebt mehr) | P | je Eingriff ein Versuch im Bild: Leistung des Trägers gegen Unveränderte um die genannte Spanne höher; Gegenlauf Eingriff aus |
| 3 | Stadt 10⁴: Eingriffe folgen Beruf, Stand und Geld | die Verteilung hat eine Ursache; Werkstätten, Kliniken, Schwarzmarkt als Orte | P | Eingriffs-Dichte je Viertel ↔ Einkommen und Beruf r ≥ 0,5; Gegenlauf Klinik entfernt → die Dichte sinkt über Jahre |
| 4 | der Spieler verändert seinen Leib | neue Sinne und Kräfte als Spiel: was er einbaut, kann er | P · Wechsel ≤ 5 s | 10 Eingriffe: je ein vorher unmögliches Verb wird möglich (Bildpaar), mit Preis im Leib (Ladung, Wartung, Abstoßung) |
| 5 | Gentechnik über Generationen, 10⁶ | Merkmale werden vererbt, Moden und Verbote entstehen | P · Sprung ≤ 5 s | Häufigkeit eines Merkmals über 5 Generationen folgt Vererbung und Gesetz der Stadt; Gegenlauf Verbot → Rückgang |
| 6 | Megastadt: jede Straße zeigt 10² verschiedene veränderte Leiber | die Straße gegen die Vergleichstitel | P | Blindpaar gegen die Vergleichstitel: unser Bild gewählt ≥ 50 %; verschiedene Eingriffe je 100 Passanten ≥ Vergleichstitel; Zwillinge 0 |
| 7 | Leiber jenseits des Menschen: hochgeladen, verteilt, für andere Welten gebaut | der Leib folgt Welt und Zweck | P | Fremdwelt-Probe (R10): Zweck und Zielwelt aus dem Leib gelesen Rang ≥ 0,7 |

## 5 · Erleben und Erschaffen

### Der Spieler

*Referenz-Korpus (R6, R11):* Latenz-Normen, Bewegungsaufnahmen, Vergleichstitel im selben Protokoll, Aufnahmen realer Instrumente

#### Präsenz: der Leib antwortet

`erleben.spieler.praesenz` — **HEUTE 0 / 6**

*misst:* ob der Spieler in jeder Lage SEIN Leib ist — Taste → Bild schnell, Fuß steht, Kamera nie im Bau —, gezogen an Zufallslagen, nicht an der Mess-Wiese.

*Beleg:* Fuß p95 0,3–1,4 cm und Third draußen gehalten (§25.K2, §25.K4 Stufe 1); Taste→Pixel ROT: Radeon ego/gehen 235 ms, third 81,6 ms gegen 50 ms (§25.K1 = 0); im Haus 17 von 1 320 Bildern < 0,25 m am Bau, Sprint-Ruck 0,039 m (§25.K4#2).

*alte Karte:* gelaende.K5 · fahrzeug.K3 · fahrzeug.K4 · leib.K1 · leib.K2 · leib.K4

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Wiese, gehen und laufen, Ego + Third | Fuß ≤ 3 cm am 25°-Hang, Kamera nie im Fels | P · Taste→Bild p95 ≤ 50 ms | Gang 2 min je Gerät: Taste → erstes Bild mit Leib-Antwort p95 ≤ 50 ms, Fuß p95 ≤ 3 cm, 0 Bilder mit Kamera im Fels |
| 2 | 10² Lagen: Hang, Wasser, Höhle, Haus, Gasse, Treppe, Sprint, Sturz | dieselben Schwellen in jeder Lage | P · 50 ms | N = 100 Zufallslagen aus 10 Saaten: Anteil, der alle drei Schwellen hält ≥ 0,95 |
| 3 | im Gedränge: 10³ Bewohner im Bild | Leib weicht, stößt, wird gestoßen; kein Durchgleiten | P · 50 ms | Gang durch die Menge 2 min: 0 Bilder Leib in Leib, Latenz wie S1 |
| 4 | jeder Leib, den die Welt hat: Reittier, Wagen, Boot, Flieger | Antwort folgt der Masse des Leibs, nie träger als das Gesetz | P · 50 ms bis zur ersten Bewegung | N = 50 Zufallsleiber: Latenz p95 ≤ 50 ms, 0 Kamera-Bilder im Bau |
| 5 | Megastadt, 10⁶ Bewohner im Umkreis von 5 km | Präsenz kostet nichts von der Stadt | P · 50 ms | Lagen-Stichprobe wie S2 im dichtesten Viertel: Anteil ≥ 0,95 |
| 6 | jeder Leib jeder Art jeder Saat, auch fremde Gliedmaßen | Präsenz auf Wettkampf-Niveau | P · Taste→Bild p95 ≤ 35 ms | N = 1 000 (Saat, Art, Lage): Latenz ≤ 35 ms, Kontakt ohne Durchdringen im Bild, Kamera frei — Anteil ≥ 0,95 |

#### Die Rolle: jeder Bewohner ist übernehmbar

`erleben.spieler.rolle` — **HEUTE 0 / 7** · Kern 1

*misst:* wie groß die Welt ist, in der der Spieler JEDEN Bewohner übernehmen kann, und wie tief dessen Verben die Welt ändern — Rolle als Regelwerk des Bewohners, nie als Liste von Spieler-Modi. Eine Leiter für Übernahme UND Folge der Rolle (Athlet, Hersteller, Wache, Herrscher, Rebell); das Tier-Sein mit dessen Sinnen zählt leben.tiere.mensch, jede Perspektive ohne Leib (Fluss, Stadt, Maschine, Planet) erleben.spieler.nichtleib.

*Beleg:* Bauen, Aufsitzen (stamm/koerper-fahrt.js:1271), Hieb (stamm/kampf.js), Inventar 27 Plätze (stamm/dirigent-kern.js:739) ändern die Welt; Bewohner tragen einen Beruf (stamm/siedlung-bewohner.js:783-798), keiner ist übernehmbar. — KARTE: Kern 1 — Werk wird benutzt (bauen.K5), Hieb trifft (halten.K1), Fahrt (fahrzeug.K3/K4) je an beiden Geräten im Bild; Bild-Preis in Bewegung an der Radeon ROT.

*alte Karte:* bauen.K5 · spielgang.K1

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 ◐ | der eigene Leib mit Verben: gehen, bauen, fahren, kämpfen | jede Verb-Gruppe ändert die Welt beobachtbar | P | 15 min je Verb-Gruppe: ≥ 1 sichtbare Weltänderung (Werk steht, Tier flieht, Fahrzeug fährt), Bildpaar vorher/nachher |
| 2 | ein Dorf, 10² Bewohner: jeden übernehmen | die Welt antwortet auf die Rolle (Kunde, Rivale, Gefolge) | P · Übernahme ≤ 1 s | N = 30 Zufallsbewohner: spielbar mit ≥ 3 Verben seines Berufs, Anteil ≥ 0,9; je Rolle Δ eines Weltfelds (Preis, Bestand, Ertrag) nach 15 min ≠ 0, im Bild sichtbar |
| 3 | eine Stadt, 10⁴ | Rollen koppeln: Entscheid in Rolle A ändert den Alltag in Rolle B | P · ≤ 1 s | N = 20 Rollenpaare: Δ in B binnen 1 Spieltag messbar, Anteil ≥ 0,8 |
| 4 | eine Metropole, 10⁶ — über Epochen und Kulturen | Verben der Epoche (Schmied 1200 ≠ Mechaniker 1950) | P · ≤ 1 s | N = 100 (Epoche, Bewohner): Anteil epochentreuer Verben im Blindurteil gegen Quellen ≥ 0,8 |
| 5 | Megastadt bis jenseits Tokio, 10⁷–4·10⁸, Herrscher eingeschlossen | Herrschaft wirkt auf Millionen, die einzeln weiterleben | P · ≤ 1 s | Gesetz erlassen → Anteil geänderter Tagespläne nach 1 Spieltag; an 10 Zufallsgesichtern im Ego sichtbar (Bildpaar) |
| 6 | Planet, 10⁹–10¹⁰ Lebewesen, auch Wolf, Wal, Biene im Stock | Rolle = Regelwerk der Art | P · Übernahme ≤ 5 s | N = 1 000 Zufallslebewesen aus 10 Saaten: spielbar mit ≥ 3 arteigenen Verben mit Weltwirkung, Anteil ≥ 0,95 |
| 7 | jedes Lebewesen jedes Planeten jedes Sonnensystems jeder Epoche | die Tiefe jeder Rolle ist die Tiefe ihrer Domäne, nicht flacher | P · ≤ 5 s | wie S6 über N Planeten und Epochen; dazu Verb-Tiefe einer Zufallsrolle gegen den Richter ihrer Domäne-Leiter (gleiche Sprosse wie dort) |

#### Hand und Werk: Wirkung aus dem Stoff

`erleben.spieler.hand` — **HEUTE 0 / 6**

*misst:* ob das, was die Hand mit einem Werkzeug an einem Stoff tut, so aussieht und wirkt wie in der Wirklichkeit — an zufällig gezogenen Paaren aus dem Stoff-Gesetz.

*Beleg:* Taste→Wirkung p95 81–235 ms (§25.K1 = 0); Halten und Führen (Klinge, Werkzeug, Bogen) 10/10 in der alten Karte, aber nie gegen Real-Foto oder Stoff-Stichprobe.

*alte Karte:* leib.K1 · halten.K1 · halten.K2 · halten.K3

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | setzen und brechen | die Hand trifft, was das Auge zeigt | P · Taste→Wirkung p95 ≤ 50 ms | Eingabe → erstes Bild mit Wirkung p95 ≤ 50 ms, Trefferpunkt = Zielpunkt ± 1 Zelle, beide Geräte |
| 2 | Stoffe des Spawns (Holz, Erde, Stein, Wasser, Laub) | Wirkung folgt dem Stoff (Holz splittert, Erde krümelt) | P · 50 ms | N = 20 Zufallspaare (Werkzeug × Stoff): Blindurteil Ergebnisbild gegen Real-Foto, Anteil plausibel ≥ 0,8 |
| 3 | Parameter: Kraft, Winkel, Schärfe — 10² Paare | Ergebnis monoton im Parameter | P · 50 ms | N = 100 Zufallspaare, je ein Parameter variiert: Anteil monotoner Antwort ≥ 0,95 |
| 4 | Werkstück in Schritten: Handwerk einer Epoche (Töpfern, Weben, Schmieden) | Form entsteht aus den Taten, nicht per Knopf | P · 50 ms | Spieler-Werkstück gegen Museumsfoto: Form-Abweichung im Band, ≥ 5 Schritte |
| 5 | jedes Werkzeug, das die Kulturen der Saat erfinden — Faustkeil bis Lötkolben | Werkzeug und Stoff aus Gesetz und Epoche | P · 50 ms | N = 200 (Saat, Epoche, Werkzeug, Stoff): Anteil benutzbar mit plausibler Wirkung ≥ 0,8 |
| 6 | alles, was ein Lebewesen der Welt tun kann — fremde Glieder, fremde Stoffe | Stoff, Kraft, Geschick aus dem Gesetz der Art | P · 50 ms | N = 1 000 (Saat, Art, Glied, Stoff, Tätigkeit): Anteil plausibler Wirkung ≥ 0,8 |

#### Wegfindung ohne Pfeil

`erleben.spieler.wegfindung` — **HEUTE 0 / 7**

*misst:* wie zuverlässig ein Spieler ein benanntes Ziel nur mit Mitteln der Welt erreicht — Landmarke, Sonne, Sterne, Auskunft, eine Karte, die die Welt selbst zeichnet.

*Beleg:* keine Karte, kein Kompass, kein Wegweiser in stamm/; Landmark-Formationen im Genom (stamm/bau-vorlagen.js:855), nie gegen Wegfindung gemessen.

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Landmarke aus 1–3 km sichtbar | Turm, Fels, Gipfel vom Rauschen der Ferne trennbar | P | N = 50 Saaten: Anteil Spawn-Orte mit ≥ 1 Landmarke in 1–3 km im Bild, Kontrast ≥ 0,1, ≥ 0,9 |
| 2 | Ziel in 1 km per Landmarke | die Silhouette ist eindeutig | P | Testspieler (Mensch, nicht Entwickler) nur mit Bild: Erfolg ≥ 0,9, Umweg ≤ 1,5 |
| 3 | Karte aus dem Gesetz, 10 km | Höhenlinien, Wege, Ortsnamen — die Welt zeichnet sich selbst | P · Karte ≤ 1 s | Wege-Deckung Karte ↔ Draufsicht ≥ 0,95; Ziel in 10 km mit Karte: Erfolg ≥ 0,9 |
| 4 | Auskunft der Bewohner, 100 km, in einer Stadt von 10⁶ | „zwei Brücken nach Norden, dann am Turm links" — aus dem Wegenetz | P | Auskunft befolgt → Ziel erreicht ≥ 0,8; der Satz nennt ≥ 1 sichtbare Landmarke |
| 5 | Sonne und Sterne, 10³ km | Polarstern-Höhe = Breite, Sonnenstand = Uhr | P | Gestirn-Höhe im Bild ↔ Breite: Fehler ≤ 1°; Seereise 1 000 km nur mit Himmel: Erfolg ≥ 0,8 |
| 6 | Planet, 4·10⁴ km, mit den Mitteln der Epoche | Karten der Kultur (Portolan bis Satellit) aus ihrem Wissen | P | Ziel auf anderem Kontinent: Erfolg ≥ 0,8 mit den Mitteln der gewählten Epoche |
| 7 | jeder Planet jeder Saat, bis zur Bahn zwischen Planeten | Landmarken, Himmel, Kultur, Bahnmechanik — alles aus dem Samen | P | N = 100 Saaten × 10 Ziele: Erfolg ≥ 0,8, Umweg ≤ 1,5, 0 HUD-Pfeile; Transfer zum Nachbarplaneten ≤ 10 % Δv über dem physikalischen |

#### Die Zeit des Spielers: Dehnen, Raffen, Springen

`erleben.spieler.zeit` — **HEUTE 0 / 9**

*misst:* über wie viele Größenordnungen der Spieler die Zeit dehnen, raffen oder an ein Datum springen kann — rückwärts bis zum ersten Licht, vorwärts bis zur sterbenden Sonne — und ob die Welt danach dieselbe ist, die ein Echtzeit-Lauf ergeben hätte. Die EINE Leiter für die Zeit-Achse des Spielers; was er in der Zeit SIEHT, zählen planet.zeit.klimageschichte (Land), leben.evolution.zeitreise (Leben) und mensch.zeit.spanne (Kultur).

*Beleg:* Tag-Länge 1–60 min (stamm/daten.js:135-150), Saison per Wort setzbar (stamm/bild-himmel.js:885-929, Sprung, kein Raffer); Ephemeride ungemessen; Raffer nur in Prüfläufen (stamm/dirigent-takt.js:1045), keine Zeitlupe, kein Epochen-Sprung. — KARTE: 0 — die Sonnenbahn gegen die Ephemeride ist ungemessen.

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Tag-Länge 1–60 min, Jahreszeit per Spieler-Wort | Sonne, Licht, Bewohner-Tag, Laub folgen der Uhr | P | Sonnenbahn gegen Ephemeride der Breite ≤ 1°; Saison-Wort ändert Laub und Licht im Bildpaar |
| 2 | Zeitlupe 10× (Fliegen-Takt) | Fall, Flügel, Wasser bleiben stetig und gesetzestreu | P · Wechsel ≤ 0,5 s | fallender Tropfen in 10×: Fallzeit ±5 % zum Fallgesetz, ≤ 2 px Sprung je Bild |
| 3 | Raffer 10³: ein Tag in 90 s, als Spieler-Verb | Wetter, Wachstum, Bewohner konsistent | P | Zustand nach Raffer ↔ nach Echtzeit-Lauf: Feld-Abweichung ≤ 5 % — UND gegen den Start verändert: Sonnenstand, Wetter und der Ort von ≥ 80 % der Bewohner |
| 4 | Raffer ~10⁵: ein Jahr in ≤ 5 min | Laub, Schnee, Ernte, Bestände nach dem Gesetz, ohne Abkürzung | P | Laub-Deckung und Bestand nach Raffer-Jahr ±10 % zum Normal-Lauf; je Monat Bildvergleich gegen Foto-Reihe gleicher Breite |
| 5 | 10² Jahre: Generationen, Baum-Zeit, Sukzession | Stadt wächst, Bewohner altern; Brand → Pionier → Hochwald | P · Halt → Ego ≤ 5 s | Häuser- und Bewohnerzahl gegen historische Wachstumskurven (Form); Eiche 0 → 100 Jahre Kronenform ≥ 0,7; Sukzession nach Brand an 20 Saaten in der Folge realer Chronosequenzen (Pionier → Busch → Hochwald) ≥ 0,8 |
| 6 | 10⁴ Jahre: Kulturen kommen und gehen | Küsten, Wälder, Siedlungen wandeln sich | P · Halt → Ego ≤ 5 s | Bildpaar vor/nach gegen paläogeografische Rekonstruktion; Stadt an Zufallsdatum betretbar ≤ 5 s |
| 7 | 10⁸ Jahre: Platten driften, Gebirge wachsen, Arten entstehen | Planet als Film, jederzeit betretbar | P · ≤ 5 s | Raffer an Zufallsdatum anhalten: Ego-Bild ≤ 5 s; Kontinentbild gegen Plattenmodell-Rekonstruktion |
| 8 | EIN ungeschnittener Raffer vom Magma-Ozean über die Gegenwart bis zur sterbenden Sonne, ein Planet | Äon, Eiszeit, Epoche, Stunde auf EINER Achse — auch vorwärts: nächster Superkontinent, schwindende Biosphäre, Roter Riese | P über die ganze Fahrt, kein Ladebild | 10 min Raffer −4,5 Ga → +5 Ga an 20 Orten: P gehalten, Bild bei 0 = Ankunftsbild der Gegenwart; an 6 Halten der Zukunft Kontinentlage, Ozean und Sonnenscheibe im Band der Rechnung (Leuchtkraft +10 % je Ga, Ozeanverlust +0,5 bis +2 Ga) |
| 9 | Millisekunde ↔ 13,8 Ga (≈ 21 Dekaden) stufenlos, Sprung an jedes Datum jedes Planeten — zurück bis zum ersten Licht | dieselbe Saat, dieselbe Geschichte, jedes Mal | P in jeder Dekade · Sprung ≤ 5 s | N = 100 (Planet, Datum): Ankunft ≤ 5 s; Gleiten über 21 Dekaden ohne Ladebild; zweimal gesprungen = dieselbe Welt (Bild-Diff ≤ 1 %); an 8 Stich-Dekaden Bildvergleich gegen Referenz der Skala; am frühesten Halt ein Himmel ohne Sterne, dann die ersten |

#### Viele Menschen, EINE Welt

`erleben.spieler.gemeinsam` — **HEUTE 0 / 7**

*misst:* wie viele Menschen zugleich in derselben bleibenden Welt aus demselben Samen stehen, einander als Leib sehen und dieselbe Welt sehen — ungeteilt, ohne Kopie und ohne Zeitdehnung. Last-Protokoll ab Sprosse 5: Protokoll-Klienten dürfen die Menge stellen, gerichtet wird an ≥ 100 echten Browser-Fenstern auf echten Geräten mitten in ihr. Die Leiter endet bei 10⁶ — dort ist das Protokoll fahrbar; „Millionen von Personen“ meint Bewohner, sie zählt mensch.menge.bevoelkerung.

*Beleg:* P2P über RTCPeerConnection (stamm/netz-p2p.js:451), Räume als Map (signaling-server.js:63); gemessen nur zwei Seiten in EINEM Browser, §22.K4 0/2.

*alte Karte:* tore.K4

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 2 Spieler, zwei physische Geräte | Peer als Leib im Bild, beide sehen dieselbe Welt | P · ≤ 100 kbit/s je Spieler | Taste an A → Leib im Bild von B p95 ≤ 150 ms; Welt-Bild an gleicher Kamera ≤ 1 % Pixel-Abweichung (ohne Leiber) |
| 2 | 10 Spieler, ein Dorf | Werk und Spur des einen stehen beim anderen; gemeinsames Bauen ohne Verlust | P bei allen | Werk von A bei B ≤ 1 s; 10 Spieler × 30 min: 0 verlorene Edits, 0 Durchdringungen im Bild |
| 3 | 10² Spieler, eine Stadt | Bewohner reagieren auf alle gleich | P bei 100 sichtbaren Leibern | N = 20 Bewohner: gleicher Tagesplan auf allen Klienten; Pose-Latenz p95 ≤ 150 ms |
| 4 | 10³ (EVE-Größe, ohne Zeitdehnung) | Schlacht, Fest, Markt in echter Zeit | P · ≤ 200 kbit/s je Spieler | 1 000 Teilnehmer auf 1 km²: Welt-Zeit / Wand-Zeit ≥ 0,99, Pose-Latenz p95 ≤ 200 ms |
| 5 | 10⁴ in einer Stadt | die Menge liest als Menge, die Nahen als Personen | P · ≤ 200 kbit/s je Spieler | Last-Protokoll: Pose-Latenz p95 ≤ 200 ms an den echten Fenstern; Video der Spieler-Menge gegen Video einer realen Großmenge 2AFC ≤ 75 % |
| 6 | 10⁵ auf einem Kontinent | jeder erreicht jeden ohne Wechsel in eine Kopie der Welt | P an jedem Ort | Last-Protokoll: 1 000 Zufallspaare aus den echten Fenstern — A erreicht B über Reise und sieht ihn, 100 % |
| 7 | 10⁶ auf einem Planeten, verschiedene Zeiten und Rollen | ein Live-Ereignis (Vulkanausbruch) für alle zugleich; eine Geschichte, viele Gegenwarten | P | Last-Protokoll: Ereignis-Zeitpunkt je echtem Fenster ±1 s; Welt-Bild an gleicher Pose gleich (≤ 1 % Abweichung) in einer Stichprobe von 1 000 Klienten |

#### Sein, was kein Leib ist

`erleben.spieler.nichtleib` — **HEUTE 0 / 7**

*misst:* ob der Spieler Perspektiven einnimmt, die kein Lebewesen sind — Wolke, Fluss, Lava, Vulkan, Planet, Stern; Schwarm oder Stadt als Ganzes; Maschine, Fahrzeug-Geist, Roboter — mit den Verben dieses Dings und in seiner Zeit. Jeden Leib zählt erleben.spieler.rolle.

*Beleg:* Der Spieler ist EIN Leib mit Verben (siehe erleben.spieler.rolle); keine Perspektive ohne Leib.

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | EIN Ding der Welt: der Spieler ist ein Fluss | er fließt nach dem Gefälle, schwillt mit dem Regen, trägt Geschiebe; sein Verb ist der Lauf | P | 10 min als Fluss: der Weg ist die Gefälle-Linie der Welt (Abweichung ≤ 5 %); ein Eingriff des Spielers (Lauf verlegen) ändert das Ufer im Bildpaar |
| 2 | 10 Dinge: Wolke, Wind, Feuer, Lava, Gletscher | jedes in seiner Zeit (Gletscher im Raffer, Feuer in Echtzeit) und mit seiner Grenze | P · Wechsel ≤ 5 s | je Ding 3 Verben mit Weltwirkung im Bildpaar; die Grenze hält (Feuer ohne Brennstoff erlischt) |
| 3 | das Ganze sein: Schwarm, Herde, Wald, Stadt | die Teile leben weiter; der Spieler lenkt die Neigung, nicht jedes Glied | P | als Stadt: eine Vorliebe gesetzt (Hafen, Höhe) → das Wachstum folgt binnen 50 Spieljahren; 100 Zufallsbewohner leben ihren Tag weiter |
| 4 | Maschine sein: Fahrzeug-Geist, Roboter, Stations-Rechner | Sinne und Verben der Maschine (Kameras, Arme, Netz) | P | 10 Maschinen-Rollen: je ≥ 3 arteigene Verben; Sicht aus den Sensoren der Maschine, das Blind-Panel erkennt die Bauart ≥ 70 % |
| 5 | Planet und Stern sein | Platten schieben, Klima kippen, im Raffer von 10⁶ Jahren je Minute; als Stern brennen und altern | P · Raffer | als Planet: gesetzte Hebung → Gebirge → Regenschatten → Wüste im Bild; Gegenlauf ohne Hebung |
| 6 | jede Perspektive, die die Welt hat: 10³ Arten von Ding | jede erdenkliche: auch Meer, Straße, Sprache, Seuche, Gerücht | P · Wechsel ≤ 5 s | N = 100 Zufalls-Dinge aus 10 Saaten: spielbar mit ≥ 3 Verben mit Weltwirkung ≥ 0,9 |
| 7 | jedes Ding jeder Welt jeder Zeit | die Tiefe jeder Perspektive ist die Tiefe ihrer Domäne | P | wie 6 über Welten und Epochen; Verb-Tiefe einer Zufalls-Perspektive gegen den Richter ihrer Domänen-Leiter |

#### Instrument und Ursache — der Blick des Forschers

`erleben.spieler.forscher` — **HEUTE 0 / 7**

*misst:* ob der Spieler die Welt mit Instrumenten befragen kann — Fernrohr, Mikroskop, Seismograph, Spektrum, Bohrkern, Feldkarte — und ob das Instrument die Ursache zeigt, die das Gesetz wirklich rechnet. Eine Welt aus Gesetzen kann ihre Ursachen zeigen; hier zählt, ob man an ihr die Wirklichkeit lernt.

*Beleg:* Stand 0: Mikroskop, Seismograph, Spektrometer — 0 Treffer in stamm/ und den Kernen; „Teleskop“ nur als Form-Signatur eines Bauteils (stamm/bau-teile.js:291, 374) (Grep 14.11.).

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | EIN Instrument: Fernrohr auf den Mond der Welt | es zeigt mehr, als das Auge sah, und dasselbe Ding | P | das Fernrohr-Bild zeigt Krater, die beim Anflug an derselben Stelle liegen (Lagefehler ≤ 1 %) |
| 2 | 5 Instrumente: dazu Mikroskop, Thermometer, Kompass, Lot | der Messwert stimmt mit der Welt | P | je Instrument 20 Messungen: Wert gegen den Zustand, den ein zweiter Weg zeigt (Eis schmilzt bei 0, Lot gegen Tauchgang) ±5 % |
| 3 | Feldkarten: Wärme, Strömung, Wind, Bestand, Dichte der Menschen | die Karte ist das Feld, das die Welt rechnet — nicht gemalt | P · Karte ≤ 1 s | 20 Stichpunkte je Karte: die Karte sagt den Ort voraus, an dem der Spieler das Ding dann antrifft (Herde, Strömung) ≥ 90 % |
| 4 | Zeit-Instrumente: Bohrkern, Jahresringe, Schichtprofil, Sternspektrum | die Vergangenheit ist lesbar; die Zeitreise bestätigt sie | P · Sprung ≤ 5 s | 10 Lesungen (Eiszeit im Kern, Brand im Ring): der Sprung in die gelesene Zeit zeigt das Ereignis ≥ 90 % |
| 5 | Versuch und Vorhersage: der Spieler ändert eine Ursache und sagt die Folge voraus | der Gegenlauf als Spiel (Damm bauen, Art entfernen, Hang roden) | P | 20 Versuche: die von der Feldkarte vorhergesagte Folge tritt ein ≥ 80 % |
| 6 | Lernen an der Welt: blinde Neulinge lösen 20 Schulfragen (Warum Jahreszeiten? Warum Wüsten im Windschatten?) | sie finden die Antwort durch Sehen und Versuch | P | Anteil richtiger Antworten nach 60 min Spiel gegen vorher: +30 Prozentpunkte; eine Kontrollgruppe mit Lehrfilm gleicher Länge ist nicht besser |
| 7 | jede Messung jeder Wissenschaft an jeder Welt, auch fremden | das Instrument einer fremden Welt enthüllt deren eigenes Gesetz | P | 100 Zufalls-Messungen über Saaten: Wert ±5 % gegen den zweiten Weg; auf Welten mit eigenem Gesetz (planet.kosmos.eigengesetz) Vorhersage ≥ 70 % |

### Erschaffen

*Referenz-Korpus (R6, R11):* die Korpora der erzeugten Domäne (eine Stadt aus einem Satz urteilt gegen den Korpus der Stadt)

#### Der Hebel: Geste, Plan, Gott — Folge im Ego

`erleben.schoepfen.hebel` — **HEUTE 0 / 9**

*misst:* wie viel Welt EINE Geste, ein Plan oder ein Gott-Eingriff gesetzestreu verändert — und ob die Folge in der Ego-Sicht am einzelnen Bewohner ankommt; die Kraft des Werkzeugs, nie der Fleiß des Bauens.

*Beleg:* 72/72 Werke über echte Ereignisse (Werkstatt, Rezeptbuch, Hotbar je 24/24), Statik, Turm 70 m; Haus als Slot 2/2 (§21); Wille → Bild ≤ 1 s offen (bauen.K1#2, Radeon 1 052–2 346 ms kalt); Bildvergleich Studio ↔ Welt und Blindurteil ungefahren. Pinsel, Terraforming, Gesetz-Geste: nichts. — KARTE: 0 — Wille → Bild an der Radeon 1 052–2 346 ms kalt gegen ≤ 1 s; Bildvergleich Studio ↔ Welt ungefahren; Werke headless gebucht.

*alte Karte:* studios.K2 · studios.K4 · pipeline.K1 · bauen.K1 · bauen.K2 · bauen.K3 · bauen.K4

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Werk über ≤ 3 Eingaben | steht, trägt, wirkt (Statik, Tür, Brennglas); gleich dem Studio-Werk | P · Wille → Bild ≤ 1 s | Konstruktions-Prüfsatz richtig geurteilt mit sichtbarer Folge, Klicks und Zeit am Ereignis-Strom, beide Geräte; Bildvergleich Studio ↔ Welt im Band |
| 2 | 1 Werk wird Teil des Orts | Gasse legt sich um, Haus wird Slot | P · ≤ 1 s | Bildpaar Spieler-Hof ↔ Gesetz-Hof derselben Region: Blindurteil unterscheidet ≤ 60 % |
| 3 | 10¹: einen Weg setzen | das Wegenetz ist Gesetz, Bewohner nehmen ihn | P | nach 1 Spieltag: Anteil Bewohner-Wege über den neuen Weg > 0, Trampelspur im Bild |
| 4 | 10² Werke je Geste: Viertel-Pinsel | Viertel trägt Bewohner, Wege, Stil der Region | P während des Malens | Belegung ± 10 % gegen ein Gesetz-Viertel; Blindurteil Pinsel ↔ Gesetz ≤ 60 % |
| 5 | km² je Geste: Fluss umleiten, Berg abtragen | Wasser, Erosion, Vegetation, Siedlung folgen | P · Edit im Fern-Ring ≤ 1 s | nach 1 Spieljahr: Wasserlauf, Uferbewuchs, Erosion, verlegte Siedlung im Bildpaar plausibel (Blindurteil ≥ 70 %) |
| 6 | eine Stadt je Gesetz-Geste; ein Gesetz für 10⁵–10⁷ Bewohner | die Stadt wächst selbst; Verhalten ändert sich, nicht nur eine Zahl | P | nach 50 Spieljahren Stadtplan-Statistik im Band realer Städte gleicher Epoche ≥ 80 % in 100 Saaten; Anteil geänderter Tagespläne, an 10 Zufallsgesichtern im Ego sichtbar |
| 7 | ein Reich von 10⁸; Megastruktur ≥ 10 km | Handel, Konflikt, Kultur antworten; Statik im Maßstab | P bei Sicht auf das ganze Werk | Kopplungskette: Eingriff → ≥ 3 Domänen messbar, die dritte im Ego sichtbar; Annäherung vom Horizont ohne Aufploppen (Blindurteil) |
| 8 | ein Planet je Geste: Platte schieben, Vulkan, Klima, Zeitalter | Gebirge, Küsten, Klima, Leben, Zivilisation folgen der Tektonik | P · Raffer bei 33 ms · am neuen Ort | 100 Eingriffe: Folgebild nach 10⁷ Spieljahren gehorcht dem Erd-Muster (Gebirge an Nähten, Wüsten an Wendekreisen) ≥ 80 %; Bildpaar am selben Ego-Ort |
| 9 | ein Sonnensystem je Geste | jeder Maßstab kausal verbunden bis zum Gesicht eines Bewohners | P | N = 20 Eingriffe, Zoom ins Ego an Zufallsbewohner: Folge sichtbar (Kleidung, Ernte, Stimmung), Anteil ≥ 0,8 |

#### Ein Satz wird Welt

`erleben.schoepfen.satz` — **HEUTE 0 / 9**

*misst:* wie groß und wie wahr die Welt-Änderung ist, die EIN Satz oder Absatz im echten Spiel erzeugt, und wie schnell sie im Bild steht.

*Beleg:* Op spawn_studio (stamm/feld-dsl.js:1072); KI-Korpus 41/41 gegen lokales qwen3:4b, Absicht 100 %, Negativ 9/9, p95 4 998 ms — alles headless, ein Werk je Satz; ki.K5#2 (0 Hänger) offen; im echten Fenster ungerichtet. Stadt des Worts (300 Häuser) ohne Plausibilitäts-Richter. — KARTE: 0 — headless (R2).

*alte Karte:* studios.K1 · ki.K1 · ki.K2 · ki.K5

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Werk eines Studios (Eiche, Haus) | das Gemeinte entsteht, Negativ-Sätze tun nichts | P · Satz → Bild ≤ 6 s lokal | eingefrorener Korpus ≥ 40 Sätze im echten Fenster: gültig ≥ 95 %, Absicht ≥ 85 % am Ausgabebild, 0 Brüche, 0 Hänger > 100 ms |
| 2 | 1 Werk, sein ganzer Ausdrucksraum | „knorrige alte Eiche" sieht knorrig und alt aus | P · Satz → Bild ≤ 3 s | Bildpaar Satz-Werk ↔ Referenzfoto der genannten Eigenschaft, 100 Regler-Sätze: Blindurteil „passt" ≥ 70 % |
| 3 | 10–100 Werke: ein Ensemble (Hof, Weiler, Hain) | Anordnung gehorcht dem Ort (Hang, Wasser, Weg) | P · erstes Bild ≤ 3 s | 100 Zufallssätze × Zufallsorte: Anteil plausibler Ensembles im Blindurteil ≥ 80 % |
| 4 | 10³ Werke: ein Dorf oder Viertel mit Bewohnern | Epoche und Kultur des Satzes lesbar (Bauweise, Kleidung, Alltag) | P | Bildpaar gegen Referenzfoto der genannten Epoche/Region; Blindurteil trifft die Epoche ≥ 70 % |
| 5 | 10⁶ Bauten, 10⁷ Bewohner: Megastadt | Stadt hat Alter: Schichten, Verkehr, Wirtschaft aus dem Satz | P · Kosten unabhängig von der Stadtgröße | 100 Stadt-Sätze: Stadtplan-Statistik (Orientierungsentropie, Dichte-Gradient, Straßen je km²) im Band realer Großstädte ≥ 80 %; Turmblick gegen Luftbild einer Megastadt ≥ 50 % „echt" |
| 6 | 10²–10⁴ km²: eine Landschaft (Vulkaninseln, Delta) | Geologie formt Küste formt Siedlung | P | „Vulkaninsel mit Hafenstadt" in 100 Saaten: Höhenprofil und Küstenform im Band realer Vulkaninseln, Stadt am geschützten Hafen ≥ 80 % |
| 7 | ein Planet aus einem Absatz | Klima, Leben, Kulturen folgen aus Text und Gesetz | P · erstes Bild ≤ 5 s, Rest strömt | 100 Absätze → Planet: Orbit- und Bodenbild entsprechen dem Text im Blindurteil ≥ 80 % |
| 8 | eine Epoche dieses Planeten („Rom 50 n. Chr.", „Kreide") | Geschichte und Physik zugleich wahr | P | Bildpaar gegen historische/paläontologische Rekonstruktion; Fach-Blindurteil „glaubwürdig" ≥ 70 % |
| 9 | ein Sonnensystem mit Zeitachse über 10⁹ Jahre aus einem Absatz | jeder Planet, jede Epoche bereisbar und kausal verträglich | P je Ort und Zeit | 100 Absätze, je 10 Ort-Zeit-Punkte: Anteil, der Text UND Vorzeit gehorcht (Blindurteil + Kausal-Probe: Gebirge, wo Platten es fordern) ≥ 80 % |

#### Gesetz erfinden

`erleben.schoepfen.gesetz` — **HEUTE 0 / 6**

*misst:* ob Mensch oder KI ein NEUES Gesetz — Art, Bauweise, Kultur, Physik — schafft, das danach selbst Millionen plausible Werke erzeugt: die Kraft des Samens in Spielerhand.

*Beleg:* Spieler-Regel wirkt und reist, Spieler-Gesetzbuch dockt an (7 822 B, §28.K4) — headless; kein Saaten-Richter, keine KI-Erfindung eines Gesetzes. — KARTE: 0 — headless (R2).

*alte Karte:* studios.K5 · ki.K4 · ultiversum.K4

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Spieler-Regel wirkt in der Welt | sichtbare Folge, reist zum Mitspieler | P | Regel im Spiel geschrieben → Wirkung im Bild bei A und B |
| 2 | 1 Spieler-Gesetzbuch dockt an wie ein Studio | erzeugt Varianten, nicht ein Ding | P | 100 Saaten: ≥ 80 % plausible Werke; Blindvergleich gegen Studio-Werke derselben Gattung ≤ 60 % Trefferquote |
| 3 | 1 Gesetz aus einem Satz (KI): „eine Baumart für Salzwüsten" | neue Form gehorcht Ort und Klima | P · Satz → erstes Werk ≤ 10 s | 100 Erfindungssätze × 100 Saaten: Anteil plausibler UND vom Bestand verschiedener Werke ≥ 70 % |
| 4 | 10³ erfundene Gesetze nebeneinander | sie koppeln (neue Art frisst, wird gefressen, wird gebaut) | P · Kosten unabhängig von der Gesetz-Zahl | Frame p95 und Ankunft bei 10³ gegen 10 Gesetze ± 5 %; keine Art stirbt in 90 % der Saaten sofort aus |
| 5 | eine erfundene Physik/Chemie (andere Schwerkraft, anderes Lösungsmittel) | Leben und Bauten passen sich an | P | 100 Saaten je Physik: Fach-Blindurteil „folgerichtig" ≥ 70 % |
| 6 | eine erfundene Evolution über Zeitalter | Stammbäume, Konvergenz, Aussterben | P · Raffer bei 33 ms | nach 10⁸ Spieljahren in 100 Saaten: Artenvielfalt und Körperbau-Verteilung im Band der Erd-Fossilgeschichte ≥ 70 % |

#### Im Gespräch erschaffen

`erleben.schoepfen.gespraech` — **HEUTE 0 / 6**

*misst:* wie gut Mensch und KI ein Werk Satz für Satz gemeinsam verfeinern — und wie niedrig die Schwelle für den ersten Menschen ist.

*Beleg:* Korrektur-Dialoge, Neulings-Schwelle, Gruppe mit KI: nichts gemessen.

*alte Karte:* affekt.K3 · spielgang.K2

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Neuling, erste Schöpfung | ohne Anleitung, ohne Fachwort | P | 20 Neulinge ab 10 Jahren: Anteil, der in 5 min ein eigenes Werk erschafft und teilt ≥ 80 % |
| 2 | 1 Werk, 5 Korrektursätze („höher", „älter", „mehr wie Kyoto") | jede Korrektur ändert nur das Gemeinte, Rücknahme jederzeit | P · Satz → Bild ≤ 3 s | Korrektur-Korpus 100 Dialoge: Endfassung im Blindurteil näher am Wunsch als jede Zwischenfassung ≥ 80 % |
| 3 | ein Ort, der im Gespräch eine Stunde wächst | die KI erinnert Absicht und Stil | P | nach 60 min: Urteil des Schöpfers des Orts „das wollte ich" ≥ 4/5; ≤ 1 vergessene Absicht |
| 4 | ein Werk über 10 Sitzungen und Wochen | Absicht und Stil überdauern die Sitzung | P | Sitzung 10 gegen Sitzung 1: 0 still verlorene Absichten im Protokoll, Urteil des Schöpfers ≥ 4/5 |
| 5 | eine Gruppe (10) mit der KI an einer Stadt | Absichten mehrerer zusammengeführt, nicht überschrieben | P bei allen | 10 Spieler × 30 min: jeder findet ≥ 1 eigene Absicht sichtbar wieder (100 %), 0 still überschriebene Werke |
| 6 | die Welt selbst als dritter Mitspieler schlägt vor | Vorschläge folgen dem Gesetz und dem Geschmack des Spielers | P | Anteil angenommener Welt-Vorschläge in 100 Sitzungen ≥ 50 %; Blindurteil Vorschlag ↔ Spieler-Werk ≤ 60 % |

#### Teilen und offene Bibliothek

`erleben.schoepfen.teilen` — **HEUTE 0 / 6**

*misst:* wie schnell eine Schöpfung beim Empfänger steht und wie viel Ausdrucksraum die offene Bibliothek trägt — nie die bloße Zahl der Einträge.

*Beleg:* Welt 1 041 B, Regel 335 B, Bauplan 428 B, signiert, forkbar; Fusion byte-gleich auf zwei Geräten (§28.K2) — headless; fremdes Gerät mit frischem Profil ungemessen (§22.K5 1/2). — KARTE: 0 — headless (R2).

*alte Karte:* tore.K5 · ultiversum.K2 · ultiversum.K3

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Bauplan im selben Profil | signiert, gleich | P · ≤ 10 s | Export/Import: Bildpaar an gleicher Pose gleich |
| 2 | 1 Bauplan / 1 Welt auf ein fremdes Gerät, frisches Profil | dasselbe Werk an der Pose von B | P · Geste → Bild bei B ≤ 5 s über Mobilfunk | B (anderes Gerät, Speicher leer) sieht das Werk; Bildpaar A ↔ B gleich ± Rauschen |
| 3 | forkbare Bibliothek mit Herkunft | Fork trägt Kette, Autor sichtbar | P · Zufallseintrag → Bild ≤ 5 s | Zufallseintrag im Bild ≤ 5 s; Fork zeigt Herkunft im Spiel |
| 4 | Suche nach Satz | findet das Gemeinte | P · ≤ 5 s | Such-Korpus 100 Sätze: Treffer unter den ersten 5 ≥ 80 % |
| 5 | Remix zweier beliebiger Welten (Fusion) | Ergebnis spielbar und neu | P · ≤ 5 s | 1 000 Zufallsfusionen: spielbar ≥ 90 %, im Blindurteil von beiden Eltern verschieden ≥ 70 % |
| 6 | jede Welt des Ultiversums offen nachbaubar | ein Fremder baut aus Quelle + Same nach | P · ≤ 5 s | fremder Nachbau, Stichprobe 100 Welten: Welt-Bild an gleicher Pose gleich in 100 % |

#### Schutz, Vertrauen und Moderation

`erleben.schoepfen.schutz` — **HEUTE 0 / 6**

*misst:* wie gut die Welt Werke und Menschen gegen feindliche Inhalte, Störer und gelenkte KI schützt — bei wachsender Menge.

*Beleg:* RULE_FORBIDDEN_EFFECT_OPS (stamm/feld-dsl.js:194); 0 von 7 Injektionen erreichen das Modell (§28.K5) — headless, Korpus zu klein für S2. — KARTE: 0 — headless (R2).

*alte Karte:* ultiversum.K5

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 geteilte Welt mit verbotener Tat | benannt abgewiesen | P · 0 Kosten im Takt | feindliche Welt geladen: eigene Welt im Bildpaar unverändert, Abweisung im Spiel benannt |
| 2 | feindlicher Korpus ≥ 10²: Injektionen in Namen, Plänen, Regeln | 0 erreichen das Modell, 0 Taten | P | Injektions-Korpus ≥ 100: 0 ausgeführte fremde Anweisungen |
| 3 | roter Spieler am zweiten Gerät; Besitz und Rechte | Griefing wirkungslos auf fremden Besitz, erlaubte Änderung gelingt | P beim Opfer | 30 min, 100 Versuche: 0 bleibende Schäden am fremden Werk, 100 % erlaubte Änderungen gelingen |
| 4 | 10² Spieler, 10 % Störer | Moderation durch Gesetz und Gemeinschaft | P · Reaktion ≤ 60 s | Anteil Störaktionen, die ein anderer länger als 60 s sieht ≤ 1 % |
| 5 | 10⁴ Spieler, Text- und Bauwerk-Inhalte | anstößige Werke benannt, nie still gelöscht | P · ≤ 60 s, keine Server-Farm je Bild | feindlicher Werk-Korpus 1 000: erkannt ≥ 99 %, Fehlalarm ≤ 1 % |
| 6 | 10⁶ Spieler, manipulierter Klient | Zustand nicht fälschbar | P · Prüfkosten ≤ 5 % CPU-Takt | manipulierter Klient in Stichprobe: 100 % benannt, 0 Fremd-Zustand verändert |

### Spiel und Sinn

*Referenz-Korpus (R6, R11):* blinde Neulinge im festen Protokoll (Spielzeit, Wiederkehr, Erinnern), die genannten Vergleichstitel, der Zustand der Welt als Quelle des Erzählten

#### Ziele aus dem Zustand der Welt

`erleben.sinn.ziele` — **HEUTE 0 / 7** · Kern 1

*misst:* wie viele verschiedene Ziele ein Spieler ohne Drehbuch aus der Welt liest, ob jedes auf einen wahren Zustand zurückgeht und ob ihre Vielfalt mit der Welt wächst statt mit einer Liste.

*Beleg:* δ-Wertung antwortet am Ort, beide Geräte, Tag/Nacht, Ego/Third: Tat 1 δ 0,1607 → Tat 10 δ −0,0018, Vogelchor 3,39 dB, Nachbar 0 dB (§10.K1 2/2). Kein Ziel entsteht aus der Welt; „Aufträge/Quests" in der Statusleiste sind Befehle an Wesen. — KARTE: Kern 1 — die Antwort am Ort an beiden Geräten, Tag und Nacht, Ego und Third (affekt.K1); Bild-Preis nicht gemessen.

*alte Karte:* feld.K5 · affekt.K1

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 ◐ | 1 Signal: die Welt antwortet hörbar am Ort einer Tat | Schaden kehrt die Antwort um, Gewöhnung bei Wiederholung | P · Antwort ≤ 2 s | dieselbe Tat 10×: Antwort am Ort (dB, Licht) fällt von Tat 1 auf Tat 10 auf ≤ 30 %, Nachbarzelle 0 |
| 2 | 1 Not je Spielstunde, die ein Bewohner im Blick äußert | 100 % wahr gegen den Zustand (der Brunnen IST leer) | P | Blind-Spieler (nur Bild und Eingabe) nennt nach 60 min ≥ 1 Ziel, die Prüfung gegen den Zustand bestätigt es |
| 3 | 10¹ Ziel-Arten: Vielfalt folgt der Welt, keine Liste | jedes Ziel lösbar, die Lösung ändert ein Bildpaar | P | 10 Saaten: ≥ 10 unterscheidbare Ziel-Arten; Arten je Ort steigen mit den Domänen dort ρ ≥ 0,6 |
| 4 | 10² offene Ziele in einer Stadt mit 10⁴ Bewohnern | Ziele hängen aneinander | P mitten in der Stadt | ≥ 30 % der Ziele mit kausalem Vorgänger; nach Lösen von A erscheint/verschwindet B binnen 1 Spieltag im Blick |
| 5 | 10⁵ ungeschriebene Ziele, Metropole mit 10⁶ | „hätte ein Autor schreiben können" | P in der Metropole | Blind-Paarvergleich: 100 Welt-Ziele gegen 100 Quests eines AAA-Titels, Präferenz ≥ 50 % |
| 6 | 10⁸ Ziele auf einem Planeten mit 10⁹ Bewohnern, je Epoche, Kultur, Klima | die Wüstenstadt sucht Wasser, 1300 sucht anderes als 2300 | P · Zeitsprung ≤ 5 s | N = 100 Saaten × 10 Orte × 5 Epochen: Gegenlauf — Zustand getauscht → das Ziel wechselt ≥ 90 %; Panel-2AFC gegen von Menschen geschriebene Ziele derselben Lage ≤ 70 % |
| 7 | jeder Bewohner auf 10³ Planeten über 10⁵ Jahre | Ziele erschöpfen sich nie | P | Rate neu gewählter Ziel-Arten je Stunde nach 1 000 h ≥ 50 % der Rate in Stunde 10 |

#### Legenden aus Bewohnern und Ereignissen

`erleben.sinn.legenden` — **HEUTE 0 / 7**

*misst:* wie viele Geschichten die Welt aus wirklich geschehenen Ereignissen erzählt, wie weit sie reisen und ob man sie bis zum Ursprung zurückverfolgen kann. Dazu gehört das Erinnern am Ort (Grab, Mal, Name) und in der Rede, über Generationen verzerrt, aber aus dem Ereignis herleitbar.

*Beleg:* journalAppend (stamm/dienst.js:385), entryCap 200; Zeilen journal.bedrohung-bezwungen / journal.fiel-im-kampf (stamm/kreatur-leben.js:898/902) — Gedächtnis, keine Legende: nichts wird weitergegeben, verzerrt oder gealtert. Die Welt erklärt sich 0/2 (§10.K4). — KARTE: 0 — das Tagebuch ist nie gegen den Zustand gerichtet worden.

*alte Karte:* affekt.K4 · ki.K3

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Tagebuch der Welt, 200 Zeilen | jede Zeile eine wahre Tat mit Ort | P | 20 Zufallszeilen des Tagebuchs: der Spieler geht zum genannten Ort und findet die Spur der Tat im Bild (Bildpaar gegen dieselbe Saat ohne die Tat) ≥ 95 % |
| 2 | 1 Bewohner erzählt auf Frage eine Tat, die er sah | wahr, in der Sprache des Spielers, mit Ort | P · Antwort p95 ≤ 2 s am Gerät allein | „Was hast du gesehen?" an 20 Zeugen: Faktentreue ≥ 95 % |
| 3 | 10 Ereignisse über 2 Weitergaben durch ein Dorf (10²) | nach δ verdichtet, Details verblassen messbar | P | Zeugen 1., 2., 3. Hand: Kern-Treue (Wer, Was, Wo) ≥ 90 %, Detail-Treue fällt monoton |
| 4 | 10³ Geschichten in einer Stadt mit 10⁴, Gerücht neben Wahrheit | Widerspruch zwischen Quellen, Lüge eines Parteiischen | P mitten in der Stadt | Stemma-Probe: aus 5 erfragten Fassungen findet ein Agent das Ursprungsereignis in ≥ 80 % |
| 5 | Legenden über 10³ Jahre einer Region mit 10⁶ | die Legende führt zu einem Ort, den es gibt | P · Reise an den Ort ≤ 5 s | 10 Legenden gefolgt: ≥ 7 führen zu einem Ort, dessen Bild das Erzählte trägt |
| 6 | 10⁹ Bewohner, 10⁴ Jahre: Mythen mit wahrem Kern | die Zeitreise bestätigt den Kern | P · Sprung zum Ursprung ≤ 5 s | 10 Mythen, 10 Sprünge: Kern in ≥ 8 im Bild wahr |
| 7 | 10³ Planeten, 10⁶ Jahre, jede Art mit eigener Überlieferung (Lied, Zeichen, Duft, Bau) | Epen neben den besten geschriebenen | P | N = 100 Saaten: in ≥ 90 % wählt das Panel im Blind-Paarvergleich die Legende vor der Lore der Vergleichstitel in ≥ 50 % der Paare |

#### Leben und Tod des Spielers

`erleben.sinn.tod` — **HEUTE 0 / 7**

*misst:* wie viel Folge ein Leben und ein Tod des Spielers in der Welt hinterlassen — auch dort, wo er nie war.

*Beleg:* _playerDeathRespawn (stamm/koerper-seele.js:322-352): Trauer +0,3, Ehrfurcht +0,2, Wunde ~10 min, Lebensspur, Rückkehr am Genesis-Anker — im Code gelesen. — KARTE: 0 — halten.K5 misst Zustand und Anker-Abstand an beiden Geräten (Mechanik); die Bildfolge am Todesort und die Rückkehr-Zeit sind ungefahren; kein Erbe, keine Erzählung, kein Ruf.

*alte Karte:* halten.K5

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Tod setzt zurück an den Ankunftsort | derselbe Leib, das Gefährt bleibt, wo er fiel | P · Rückkehr ≤ 5 s | Bildfolge: der Leib fällt, derselbe Leib steht am Ankunftsort; das Gefährt steht im Bild, wo er fiel |
| 2 | Tod hinterlässt Spur: Lebensspur am Todesort, Wunde, Trauer, Ehrfurcht | Spur sichtbar, Wunde fühlbar | P | Bildpaar am Todesort vor/nach; die Wunde mindert die Werte des Spielers messbar über ~10 min |
| 3 | Zeugen erzählen den Tod, der Täter steigt im Ruf (Nemesis für jede Art) | Faktentreue gegen das Ereignis | P | 20 Zeugen: ≥ 80 % nennen Ort und Täter; der Täter tritt sichtbar anders auf |
| 4 | ein Spieler-Leben über Jahrzehnte | der Leib altert sichtbar; Können und Beziehungen wachsen | P | Zeitraffer 40 Jahre: Bildpaar mit 20 und 60 Jahren, Haus und Beziehungen geändert |
| 5 | Linie über Generationen: man spielt das Kind weiter | Erbe nach Gesetz (Besitz, Ruf, Feindschaft) | P | nach dem Tod gehen ≥ 3 Bestände sichtbar an den Erben |
| 6 | der Ruf reist: 10⁶ Bewohner, die den Spieler nie sahen | Wirkung nimmt mit Entfernung und Zeit ab, wie ein Gerücht | P | ferne Stadt: Rate von Gruß, Flucht, Preisänderung gegen dieselbe Saat ohne die Tat, Unterschied ≥ 20 Prozentpunkte |
| 7 | Leben in jeder Epoche, auf jedem Planeten, als jede Art | Tod ist Wendepunkt, kein Abbruch | P | Blind-Spieler beschreiben ihren Tod als „Teil der Geschichte" ≥ 70 % |

#### Entdeckung

`erleben.sinn.entdeckung` — **HEUTE 0 / 7**

*misst:* wie dicht die Welt Entdeckenswertes aus Gesetzen trägt und ob ein Spieler es ohne Markierung findet.

*Beleg:* jede dritte Siedlung trägt seed-deterministisch eine Epoche (stamm/siedlung-ort.js:1644) — Gesetz steht, ungefahren.

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Ort, der sich aus der Saat vom Nachbarn unterscheidet | Unterschied sichtbar, nicht nur Zahl | P | Blind-Agent nennt in 10 min ≥ 1 Ort „anders als der vorige" und begründet es am Bild |
| 2 | 1 Fund je 100 m Weg (Ruine, Höhle, Tier, Besonderheit) | aus Gesetzen, nicht platziert | P | Spielgang 10 min: Funde, die ein Blind-Agent „besonders" nennt ≥ 5 |
| 3 | Funde haben Ursachen | die Ruine hat eine Geschichte (Legenden-Leiter) | P | Anteil Funde mit Ursache im Ereignis-Graph ≥ 80 % |
| 4 | 10³ Funde je 100 km², kein Fund doppelt | „überraschend" | P | N = 100 Saaten: Anteil Regionen, in denen Blind-Agenten nach 30 min noch Neues finden ≥ 90 % |
| 5 | Entdeckung zwischen Epochen: unter der Stadt liegt eine ältere | die ältere Schicht passt zu ihrer Epoche | P | Grabung: Schichtbild gegen Referenz der Epoche, Plausibilität ≥ 80 % |
| 6 | Planeten, deren Leben, Kultur, Geschichte erst durch Entdecken verstanden werden | Wissen wächst messbar | P · Planetensprung ≤ 5 s | nach 10 h beantwortet der Spieler Fragen zu einem fremden Planeten ≥ 70 % richtig |
| 7 | Ultiversum aus 10³ Planeten, nach 10⁴ h noch Unentdecktes | jeder Fund wahr in seiner Welt | P | Rate neuer Funde je Stunde fällt nach 1 000 h um ≤ 50 % |

#### Takt: Dramaturgie ohne Regisseur

`erleben.sinn.takt` — **HEUTE 0 / 7**

*misst:* ob die Stunde des Spielers einen Bogen hat — keine toten Minuten, keine Reizflut, Höhepunkte in Wellen — aus dem Verlauf von δ, nie aus einem Ereignis-Katalog.

*Beleg:* keine Messung toter Minuten; ungemessen.

*alte Karte:* spielgang.K2

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 10 min an der Ankunft | tote Minute = im Blick ändert sich nichts, das auf den Spieler antwortet | P | Anteil toter Minuten ≤ 50 % |
| 2 | 1 h Spielgang | weder leer noch überladen | P | tote Minuten ≤ 20 % UND Minuten mit > 3 gleichzeitigen Ansprüchen ≤ 10 % |
| 3 | 1 Abend (3 h) | Wellen: Ruhe, Ahnung, Höhepunkt | P | ≥ 1 Höhepunkt je 30–60 min (δ im Blick ≥ 3× Median), danach ≥ 5 min Ruhe |
| 4 | jeder Spieler, gleich welcher Stärke | der Bogen folgt dem Spieler, nicht einer Schwierigkeitsstufe | P | Anfänger und 10-h-Spieler, dieselbe Saat: Höhepunkt-Rate innerhalb ± 30 % |
| 5 | Metropole mit 10⁶ Bewohnern | Masse ohne Reizflut | P in der Metropole | tote Minuten ≤ 10 %, Überlast-Minuten ≤ 10 % |
| 6 | Zeitsprünge über 10⁴ Jahre | jeder Sprung landet in erlebenswerter Lage | P · Sprung ≤ 5 s | N = 100 Sprünge: ≥ 80 % binnen 2 min bei einem Ziel oder Ereignis im Blick |
| 7 | jede Stunde jedes Spielers auf jedem Planeten | der Bogen trägt wie eine Kampagne | P | Blind-Spieler über 10 h: Bogen gegen AAA-Kampagne ≥ gleichwertig in ≥ 50 % |

#### Der Sog — bleiben und wiederkommen

`erleben.sinn.sog` — **HEUTE 0 / 7**

*misst:* ob Menschen in dieser Welt bleiben wollen: freiwillige Spielzeit blinder Neulinge ohne Auftrag, Wiederkehr an späteren Tagen, und die Wahl, wenn daneben das Beste der Gegenwart liegt. Fühlbar im Spiel schlägt messbar im Trace — hier wird das Fühlen selbst gezählt.

*Beleg:* Nie gemessen: kein blinder Neuling hat die Welt im Protokoll gespielt; der v1-Pfad ist als Spielgang nur von der Maschine gefahren (spielgang.K1, headless).

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | die ersten 10 Minuten, 12 blinde Neulinge | niemand bricht ab; sie wissen, was sie tun können | P · die Ankunft zählt mit | Anteil, der nach 10 min freiwillig weiterspielt ≥ 70 %; Zeit bis zur ersten eigenen Tat ≤ 2 min |
| 2 | die erste Stunde | sie wollen weiter | P | freiwillige Spielzeit ohne Auftrag: Median ≥ 45 von 60 min; „will weiter“ ≥ 60 % |
| 3 | der zweite Tag | sie kommen wieder | P | Wiederkehr am Folgetag ≥ 40 %, nach 7 Tagen ≥ 20 %, ohne Erinnerung von außen |
| 4 | 10 Stunden: die Welt trägt | nach 10 h noch Neues; kein „alles gesehen“ | P | Zahl neuer Dinge je Stunde (vom Spieler selbst benannt) fällt bis Stunde 10 nicht unter die Hälfte von Stunde 1 |
| 5 | die Wahl: 2 h hier, 2 h im Vergleichstitel, dann eine freie Stunde | sie wählen diese Welt | P | Anteil, der die freie Stunde hier verbringt ≥ 50 %; Blindpräferenz derselben Szene ≥ 50 % |
| 6 | 100 Stunden, 10³ Spieler | sie bleiben über Monate | P | Wiederkehr nach 30 Tagen ≥ 20 %, nach 90 Tagen ≥ 10 %; Median der Gesamtzeit ≥ 20 h |
| 7 | Jahre: eine Welt, in der Menschen leben wollen | wer geht, kommt zurück; wer erzählt, bringt andere | P | Wiederkehr nach 1 Jahr ≥ 10 %; je Spieler ≥ 1 weiterer, der durch ihn kam |

#### Die erlebte Größe — Staunen und Merken

`erleben.sinn.staunen` — **HEUTE 0 / 7**

*misst:* ob ein Spieler die Größenordnungen der Welt ERLEBT: ob er die Millionen Arten als Vielfalt merkt, den Planeten als Planeten, die Tiefe der Zeit als Zeit — gemessen an dem, was blinde Spieler nach dem Spiel sagen, schätzen und wiedererkennen.

*Beleg:* Nie gemessen: kein blinder Spieler hat die Welt im Protokoll gesehen.

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | EIN Ort, 30 min | sie merken sich, was eigen war | P | blinde Spieler nennen nach 30 min ≥ 10 verschiedene Dinge beim Namen oder im Bild; 5 davon finden sie wieder |
| 2 | Vielfalt am Ort: ein Wald, ein Riff, ein Markt | sie merken, dass kaum etwas sich wiederholt | P | Schätzfrage „wie viele verschiedene Arten, Gesichter, Häuser?“: Median im Faktor 3 der gezählten Zahl; „wiederholt sich“ ≤ 20 % |
| 3 | Staunen: 10 Augenblicke aus Gesetzen (Sonnenaufgang über dem Meer, Herde am Horizont, Stadt bei Nacht) | sie halten an und schauen | P | Verweildauer und freiwillige Standbilder an den Augenblicken ≥ 2× Umgebung; Staunen-Panel (Skala 1–7) Median ≥ 5 |
| 4 | Größe der Welt: eine Reise über 100 km | sie spüren Weite, nicht Wiederholung | P | Skizze der Reise aus dem Gedächtnis: ≥ 5 Landmarken in richtiger Folge; „wurde es eintönig?“ ≤ 20 % |
| 5 | Planet und Zeit: Orbit ↔ Boden, ein Sprung über 10⁴ Jahre | sie verstehen, dass es EIN Ort ist | P · Sprung ≤ 5 s | nach dem Sprung erkennen ≥ 70 % denselben Ort an Bergform oder Flusslauf; Staunen-Panel Median ≥ 5 |
| 6 | Millionen: Megastadt, Schwarm, Sternhimmel | sie glauben die Zahl | P | Schätzfrage zur Menge im Faktor 10 der wahren; Anflug-Probe auf selbst gewählte Punkte: „jeder Punkt war ein Einzelner“ ≥ 80 % |
| 7 | das Ganze gegen das Beste der Gegenwart | „so etwas habe ich nie gesehen“ | P | Paarvergleich derselben Art Augenblick gegen die Vergleichstitel: Staunen-Wahl ≥ 60 % für diese Welt |

### Fremde Sinne

*Referenz-Korpus (R6, R11):* Sehkurven und Hörschwellen der Arten, Tracer- und Rauchaufnahmen, Feldmessungen

#### Fremde Sicht: das Auge als Leser des Lichts

`erleben.sinne.sicht` — **HEUTE 0 / 6**

*misst:* ob das Bild durch ein fremdes Auge (UV, Wärme, Polarisation, Auflösung) wahr ist und wie weit diese Wahrheit reicht — Wiese → Planet → fremde Sterne.

*Beleg:* keine Sicht außer der menschlichen; Stoffe sind RGB/PBR, kein Spektrum (Grep UV/IR/Polarisation in stamm/ und *-core.js: 0).

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | eine Wiese, ein Bienen-Auge (UV/B/G) | UV-Muster aus dem Stoff der Blüte, nicht aus einer Bemalung | P · Wechsel ≤ 0,5 s | Bildpaar Mensch ↔ Biene an derselben Wiese: ≥ 1 Muster nur im Bienenbild (Kontrast ≥ 0,2), an Blüten, die Bienen anfliegen |
| 2 | Wiese, Siedlung, Himmel; jedes Auge aus 2–16 Rezeptor-Kurven | EIN Leser für beliebige Kurven, kein Modus je Art | P | Biene und Vogel gegen Tier-Kamera-Referenz (Vasas/Hanley 2024): Kontrast-Rangordnung über 10 Pflanzenklassen Spearman ≥ 0,7; 20 Zufalls-Kurvensätze → 20 Bilder ohne Bruch |
| 3 | Wärme und Polarisation | warme Leiber, Feuer, sonnenwarmer Stein aus der Temperatur des Gesetzes; Himmel polarisiert | P | Nacht, Grubenotter: warmer Leib in 10 m im Wärmebild sichtbar, im Menschenbild nicht; Polarisationswinkel ±10° zur Rayleigh-Erwartung |
| 4 | Raum- und Zeitauflösung jedes Auges | Facette, Adlerauge, 360°-Feld, Flimmerfusion aus dem Genom | P | Erkennungsentfernung im Habicht- gegen Fliegenbild im Verhältnis der biologischen Sehschärfe ±30 % |
| 5 | der ganze Planet in jedem Auge: Megastadt ≥ 10⁷, Tiefsee, Wüste, Eis | Reklame, Glas, Biolumineszenz, Sand tragen ihr Spektrum | P | 20 Zufallsorte × 5 Zufallsaugen: Anteil ohne Bruch (kein Stoff ohne Spektrum, kein RGB-Zwilling) = 1,0 |
| 6 | fremde Sterne 2 500–10 000 K und ihre Planeten | Licht am Boden aus Stern × Atmosphäre; Augen der Einheimischen passen dazu | P | N = 20 Planeten: Rezeptor-Maxima der Arten korrelieren mit dem Bodenspektrum r ≥ 0,6 |

#### Hören jenseits des Menschen

`erleben.sinne.hoeren` — **HEUTE 0 / 6**

*misst:* ob eine Welt aus Schall begehbar ist und in Bändern klingt, die der Mensch nicht hört — Laufzeit, Impedanz, Doppler tragen die Geometrie, die Ferne trägt den Infraschall.

*Beleg:* Klang nur fürs Menschenohr; kein Echolot, kein Infraschall, kein Hörbereich je Art.

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | ein Haus, ein Echo-Sinn | Echo aus Laufzeit gegen die Geometrie, kein Puls-Effekt | P | Blind-Lauf (Bild schwarz, nur Echo): Ausgang in ≤ 2× der sehenden Zeit |
| 2 | Wald 1 ha und eine Stadtstraße | Blatt, Stamm, Wasser, Glas, Stein klingen gesetzmäßig verschieden | P | Blind-Flug Fledermaus 200 m Wald: ≤ 1 Kollision je 100 m; trinkt im Flug ≥ 4 von 5 |
| 3 | Beute im Flug, Doppler | Motte als bewegtes Ziel, Rufrate steigt beim Anflug | P | Fangquote im Echobild ≥ 0,7 der Fangquote im Sichtbild |
| 4 | Infraschall und Ferne: 10–100 km | Gewitter, Brandung, Vulkan, Herden, Stadt; Walgesang, Thermokline lenkt | P | Elefanten-Ohr: Richtung zu Gewitter in 10 km ±15°; Walgesang über 100 km Laufzeit ±5 % zu 1 500 m/s |
| 5 | das Ohr jeder Art: Hörbereich, Richtung, Schwelle aus dem Leib | das Ohr selbst ist Gesetz; Wechsel des Leibs wechselt die Welt | P · Wechsel ≤ 0,5 s | Leibwechsel: Abgriff-Spektrum folgt dem Hörbereich der Art ±20 % (Fledermaus Ultraschall heruntergemischt, Elefant Infraschall) |
| 6 | Planet: jeder Ort in jedem Band — Megastadt im Ultraschall, Tiefsee im Sonar | Hörband aus dem Sinnes-Genom | P | 100 Saaten: Anteil echo-ortender Arten, deren Fang ohne Licht gelingt ≥ 0,9; 20 Zufallsorte × Hör-Genom ohne Bruch |

#### Das Geruchs-Feld: Chemie im Wind

`erleben.sinne.geruch` — **HEUTE 0 / 6**

*misst:* ob Gerüche als Feld MIT Gedächtnis existieren, das der Spieler mit fremder Nase lesen und verfolgen kann.

*Beleg:* _scentAt (stamm/koerper-seele.js:1578-1604), Leser stamm/kreatur-verhalten.js:178-275 und tetrapoda-core.js:149-171; Wolf findet Beute (§8.K4). Feld ohne Gedächtnis; der Spieler riecht nichts. — KARTE: 0 — der Gegenlauf ist headless gebucht (R2).

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | ein Tier folgt einer Witterung | Abfall mit Distanz, Wind an der Quelle | P | Gegenlauf im Bild: Wolf findet Beute über Witterung; Witterung aus oder Wind gedreht → Suchzeit ≥ 3× |
| 2 | der Spieler riecht: eine Nase | er findet, was er nicht sieht | P | Aas 100 m gegen den Wind in ≤ 90 s; Nase aus ≥ 3× die Zeit |
| 3 | Fahne mit Turbulenz und Alter | Filamente, Intermittenz; Spur altert über Stunden | P | Intermittenz-Faktor ±30 % gegen Rauch-/Tracer-Aufnahme; Spur von vor 1 h lesbar, von vor 24 h nicht |
| 4 | Duftklassen aus den Gesetzen (Blüte, Aas, Rauch, Mensch, Pheromon) | Quellen aus Stoff-, Pflanzen-, Tiergesetz, nicht aus einer Liste | P | Hunde-Probe: 1 h alte Fährte 500 m durch eine Stadt, Abweichung ≤ 5 m |
| 5 | Megastadt ≥ 10⁷ Personen als Geruchs-Chronik | jede Person, Küche, Abgas emittiert | P | Fährte einer bestimmten Person aus 10⁷ auffindbar, Treffer ≥ 0,8 über 20 Proben |
| 6 | Planet: Pheromon-Netze, Ameisenstraßen, Lachs riecht seinen Fluss | Duft trägt Information über Tage und 10³ km | P | der Spieler als Lachs: von der Mündung zum Geburtsfluss allein nach Duft, N = 20 Saaten ≥ 0,9; Gegenlauf Duft aus → Trefferquote auf Zufall |

#### Feld-Sinne: Magnetismus, Elektrizität, Schwingung

`erleben.sinne.feld` — **HEUTE 0 / 6**

*misst:* ob die unsichtbaren Felder des Planeten-Inneren existieren, sichtbar wirken und von Wesen gelesen werden.

*Beleg:* kein Magnetfeld, kein Elektrosinn („Magnet" nur als Bild in stamm/koerper-bewegung.js:1127).

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Dipolfeld des Planeten, schief zur Drehachse | aus dem Kerngesetz; Sonnenwind am Pol | P | Polarlicht um den MAGNETISCHEN Pol (60–75° geomagnetisch auf erdähnlichen Saaten); Kompass weist zum selben Pol |
| 2 | Magnetsinn-Sicht (Vogel), ein Zugweg | Feldlinien als Muster im Auge | P | Zugvogel-Schar 1 000 km: Fehler ≤ 50 km; Feld aus → Fehler ≥ 5× |
| 3 | Elektrosinn (Hai, Rochen), Seitenlinie (Fisch) | Muskelfelder der Beute, Druckwellen im Wasser | P | Hai findet eingegrabenen Rochen ohne Licht ≥ 0,8 |
| 4 | Feld mit Anomalien und Polwanderung | Erzkörper, Umpolung über Äonen | P | Magnetstreifen am Ozeanboden symmetrisch zum Rücken (Bildvergleich gegen Vine-Matthews) |
| 5 | Boden-Schwingung (Elefant, Spinne) | Wellen aus Beben, Herden, Verkehr der Stadt | P | Herde flieht ≥ 10 s vor dem Spieler-Erleben des Bebens in ≥ 0,7 der Fälle |
| 6 | fremde Planeten: kein Dynamo, Riesenfeld, Gezeitenheizung | Sinne folgen den Feldern des Planeten | P | N = 20 Planeten: Magnetsinn-Arten nur, wo ein Dynamo ist (Fehlpaarungen ≤ 0,1) |

#### Sinnes-Genom: Breite und Evolution der Umwelten

`erleben.sinne.genom` — **HEUTE 0 / 6**

*misst:* wie viele Wesen eine eigene, plausible Wahrnehmung aus EINEM Sinnes-Genom ziehen — und ob sie entsteht statt gesetzt zu werden.

*Beleg:* pirschSichtM 5 (tetrapoda-core.js:162), sichtM 320 (:2310), scentRangeM 50 — Zahlen für Verhalten, keine Organe, keine Kurven. — KARTE: 0 — dieselbe Messgröße wie erleben.sinne.geruch Sprosse 1 (R9), headless.

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Tiere mit Sicht- und Witter-Radius je Gattung | Radien, keine Organe | P | Witterung und Sicht ändern Flucht und Jagd (Gegenlauf) |
| 2 | jede Art der heutigen Welt zieht ihre Sinne aus EINEM Genom | Kurven, Bänder, Reichweiten im Bereich der Erd-Biologie | P | alle Gattungen beziehbar; Anteil Sinneswerte im Band der Biologie ≥ 0,9 |
| 3 | 10³ Arten je Saat | Sinne passen zum Lebensraum (Höhle → blind + Echo, Nacht → großes Auge) | P | N = 50 Saaten: Höhlenarten mit reduziertem Auge ≥ 0,7, Nachtarten mit größerem Auge ≥ 0,7 |
| 4 | Evolution über 10⁵ Generationen | Augen, Nasen, Ohren entstehen und schwinden | P | N = 20 Saaten: Sinne divergieren zum Lebensraum; ohne Selektion nicht |
| 5 | 10⁶ Arten auf einem Planeten | Sinne für jedes Feld des Planeten | P | Stichprobe 1 000 Arten: Sinnesband überlappt ein im Lebensraum vorhandenes Feld (Licht, Schall, Duft, Feld) ≥ 0,9 |
| 6 | 10⁶ Arten × beliebig viele Planeten | Umwelten, die die Erde nicht kennt | P · Ankunft in der Umwelt einer Zufallsart ≤ 5 s | 100 Zufallsbezüge (Planet, Art): Anteil ohne Bruch und ≤ 5 s = 1,0 |

#### Signale: ein Wesen schreibt, ein anderes liest

`erleben.sinne.signale` — **HEUTE 0 / 6**

*misst:* ob Ruf, Tanz, Duftmarke und Muster Information tragen, die ein Empfänger mit SEINEM Sinn liest und nach der er handelt.

*Beleg:* Grep Warnruf/Alarmruf/Duftmarke/Gesang: 0 Treffer.

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Warnruf in der Herde | Artgenossen fliehen, bevor sie den Jäger selbst wahrnehmen | P | Fluchtbeginn vor eigener Wahrnehmung ≥ 0,7; Ruf aus → Verluste steigen |
| 2 | Ort-Information: Bienentanz, Duftmarke des Reviers | Richtung und Entfernung kodiert | P | Sammlerinnen erreichen die getanzte Tracht, Richtungsfehler ≤ 15°; Reviergrenzen folgen den Marken |
| 3 | Dialekte: Gesänge je Population, wandernd | kulturelle Evolution der Signale | P | N = 20 Saaten: Gesangs-Ähnlichkeit fällt mit Distanz r ≥ 0,4 |
| 4 | Lauscher und Fälscher zwischen Arten | Räuber liest den Ruf der Beute, Brutparasit fälscht das Ei | P | Fangquote des lauschenden Räubers steigt mit der Rufrate der Beute; Annahmequote gefälschter Signale fällt über 10³ Generationen |
| 5 | Menschen lesen die Signale der Welt | Hirte, Jäger, Bauer deuten Ruf, Spur, Wetterzeichen | P | Bewohner mit Beruf handeln vor dem Ereignis nach dem Signal (Herde eingetrieben vor dem Wolf) ≥ 0,6; ohne Signal nicht |
| 6 | Planet: Signale in Kanälen, die nur fremde Sinne tragen (UV, Entladung, Biolumineszenz) | Kanal aus dem Sinnes-Genom von Sender und Empfänger | P | Bildpaar: im passenden Sinn sichtbar, im Menschensinn nicht; Empfänger reagieren ≥ 0,8 |

#### Gesehen werden: Tarnung, Mimikry, Warnfarbe

`erleben.sinne.gesehen` — **HEUTE 0 / 6**

*misst:* ob Erscheinung im Auge des ANDEREN wirkt — Tiere, Bewohner und der Spieler eingeschlossen.

*Beleg:* Wild bemerkt den Spieler über Radien, nicht über Farbe.

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | der Spieler als Beute | Rotwild sieht dichromat: Orange und Grün ähnlich | P | Entdeckungsdistanz bei Spieler in Orange ≈ Grün (±15 %), in Weiß auf Schnee messbar anders |
| 2 | Tarnung im Jäger-Auge | Muster gegen Bodenfarbe im Rezeptorraum des Jägers | P | getarnte Beute: Entdeckungsdistanz −≥ 30 % |
| 3 | Tarnung ist sinn-abhängig | ein Muster tarnt im Vogelauge und leuchtet im UV-Auge | P | Bildpaar zweier Jäger-Augen an derselben Beute; Entdeckungsdistanzen verschieden ≥ 30 % |
| 4 | Evolution von Tarnung, Mimikry, Warnfarbe über 10⁴ Generationen | Färbung aus Selektion durch die Sinne der Jäger | P | N = 20 Saaten: Abstand Beute ↔ Boden im Jäger-Farbraum fällt ≥ 50 %; giftige Arten werden auffälliger |
| 5 | Bewohner tarnen sich und zeigen sich (Jäger, Krieger, Fest) | Kleidung und Bemalung aus dem Auge des Gegenübers und der Kultur | P | Jäger-Kleidung im Rezeptorraum des Wilds näher am Boden als Festkleidung ≥ 0,8 der Kulturen |
| 6 | fremde Planeten: Tarnung im Licht fremder Sterne | Färbung aus Sternspektrum × Jäger-Auge | P | N = 20 Planeten: Beute-Boden-Abstand im Jäger-Farbraum unter Zufall in ≥ 0,8 |

### Licht und Bild

*Referenz-Korpus (R6, R11):* kalibrierte HDR-Fotos, Himmels- und Nachtaufnahmen, Luftbilder, Film gleicher Szene und Blende

#### Fernsicht und Treue über die Stufen: die Ferne ist dieselbe Welt

`erleben.bild.ferne` — **HEUTE 0 / 9**

*misst:* die größte Entfernung, bis zu der das Bild der Ferne der Welt GLEICHT, die man dort betritt (Richter „Ferne = Nähe": Fernbild gegen verkleinerte Nahaufnahme nach Abzug der Luft, SSIM ≥ 0,8, ΔE ≤ 5). Was Höhe oder Ferne statistisch zeigen, findet der Abstieg an derselben Stelle als Einzelnes wieder (Lichter fern = Fenster nah, Wolken oben = Wetter unten) — eine Welt statt zweier.

*Beleg:* Gelände-Ring ±8 km (stamm/gelaende-fern.js:2123), Koschmieder je Kanal T/T_soll 0,86–1,08, Restkontrast 1,0–1,3 % bei 17–22 km (§14.K1/K2 je 2); Wald-Saum bis 8 km 0 (§14.K3); Ferne = Nähe nirgends gefahren; die Wiese trägt bis ~20 m. — KARTE: 0 — die Luft-Hälfte des Richters steht an beiden Geräten (ferne.K1, ferne.K2: Koschmieder, Restkontrast), „Ferne = Nähe“ ist nirgends gefahren.

*alte Karte:* ferne.K1 · ferne.K2 · ferne.K3 · ferne.K4 · ferne.K5

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 0,2 km | Relief und Bewuchs bis zum Nahrand, Luft wirkt | P | Restkontrast je Kanal gegen Koschmieder T/T_soll 0,8–1,2; Ferne = Nähe ≥ 0,8 an 12 Posen |
| 2 | 2 km | Relief, Wald, Häuser mit Luft, kein Umschlag beim Näherkommen | P | Gang auf ein Ziel aus 2 km: kein Bildsprung > 5 % Leuchtdichte im Zielfenster; Ferne = Nähe ≥ 0,8 |
| 3 | 8 km | Relief bis zum Horizont mit Luft, Welt ohne Kante | P | T/T_soll 0,86–1,08, Restkontrast ≤ 1,3 % am Rand; Ferne = Nähe für Relief ≥ 0,8 |
| 4 | 25 km | Wald auf Graten, Stadt als Silhouette, Flüsse spiegeln, Abendschatten der Grate | P | Ferne = Nähe ≥ 0,8 für Wald- und Stadtziele aus 25 km in 100 Saaten (Anteil ≥ 0,9) |
| 5 | 100 km | Wetter in der Ferne — und es regnet dort, wenn man hinfliegt | P · Flug | Anteil von 100 Saaten, in denen das ferne Wetter bei Ankunft dort herrscht ≥ 0,9; 2AFC Fernbild gegen Foto ≤ 60 % |
| 6 | 500 km | Gipfelblick über Vulkan, Küste, Megastadt mit Erdkrümmung und Brechung, nachts als Lichtteppich | P | Horizontabsenkung ±0,05° gegen Kugel + Standard-Refraktion; Ferne = Nähe ≥ 0,8 für einen 500-km-Gipfel |
| 7 | Planet: Boden → Orbit ohne Ladebild | Tag/Nacht-Grenze, Wolkenbänder, Stadtnetz; jeder Punkt anfliegbar | P · Flug | Ferne = Nähe vom Orbit auf 20 Zufalls-Landepunkte ≥ 0,8; Blue-/Black-Marble-Statistik KS ≤ 0,1 |
| 8 | Sonnensystem | Nachbarplanet und Monde am Himmel sind bereisbare Welten; Phasen, Finsternisse stimmen | P · Flug | Ferne = Nähe Fernrohr-Bild ↔ Ankunft ≥ 0,8; Phase und Finsternis ±1 min gegen Himmelsmechanik der Saat |
| 9 | Galaxie | Sternhimmel des Dorfs = Sterne der Galaxie-Ansicht | P | Ferne = Nähe am Himmel: Lage der 500 hellsten Sterne ±0,1°; Milchstraßen-Band an der Stelle der Scheibe |

#### Nacht: Lichter, die werfen

`erleben.bild.nacht` — **HEUTE 0 / 8**

*misst:* wie viele Quellen, die die Welt selbst setzt, zugleich im Bild stehen — nah als LICHT, das fällt und Schatten wirft, fern als wahre Statistik der Stadt.

*Beleg:* Licht-Pool 4 Plätze in 48 m (stamm/stoff-material.js:3849); Feuer-Wurf gebaut (stamm/bild-schatten.js:383-391), gemessen ROT 0,248:1 statt ≥ 3:1 (Radeon, cec92db1, §16.K5); ~2 800 Sterne.

*alte Karte:* schatten.K5

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Quelle | das nächste Feuer wirft Licht und Schatten, auch vom gehenden Spieler | P | Schatten-Kontrast ≥ 3:1 an einem Pfosten 2 m vom Feuer; Gasse in der Kelvin-Farbe ±200 K |
| 2 | 10²: Dorf bei Nacht | jede Quelle im 50-m-Umkreis beleuchtet ihren Boden | P | Anteil sichtbarer Quellen in 50 m mit Bodenfleck ≥ 1 EV über Umgebung ≥ 0,9; Gassen-Histogramm gegen Fotosatz ΔEV-Median ≤ 0,5 |
| 3 | 10³: Kleinstadt | Fenster gehen nach dem Leben ihrer Bewohner an und aus | P | Anteil beleuchteter Fenster 20 → 4 Uhr gegen gemessene Nachtgang-Kurven ±0,1; Straße 5–30 lx |
| 4 | 10⁴: Viertel mit Verkehr | Scheinwerfer, Ampeln, Reklame, Spiegelstreifen auf nassem Asphalt | P | Leuchtdichte-Histogramm und Spiegelstreifen gegen Fotosatz nasser Nachtstraßen ΔEV ≤ 0,5; 2AFC ≤ 65 % |
| 5 | 10⁵: Großstadt aus 300 m | Lichtteppich, Hochhausflanken, Himmelsglocke | P | Himmelshelligkeit am Stadtrand gegen Walker's Law ±30 %, Bortle ±1 |
| 6 | 10⁷: Tokio-Maß aus dem Flugzeug | jedes Licht ein Weltzustand | P | Radianz je km² gegen VIIRS-Ausschnitte gleicher Dichte KS ≤ 0,1; Ferne = Nähe beim Sinkflug ≥ 0,8 |
| 7 | 10⁸: Megaregion + Vulkanglut in einem Bild vom Gipfel | Stadt und Glut als Quellen derselben Welt | P | 100 Saaten mit Stadt und Vulkan: Nachtbild-Statistik passt zur Black-Marble-Statistik extrapolierter Dichte ≥ 0,8 |
| 8 | 10⁹–10¹⁰: Nachtseite eines Planeten über Epochen | Feuer, Gas, Glühlampe, Natrium, LED; Milchstraße, wo keine Glocke steht | P · Flug | Nachtlicht-Statistik je Epoche gegen DMSP/VIIRS-Archiv 1992 → heute KS ≤ 0,1; Bortle eines Orts folgt seiner Epoche ±1 |

#### Fläche im wahren Licht

`erleben.bild.flaeche` — **HEUTE 0 / 8**

*misst:* in welcher Szenen-Härte und über welchen Raum von Stoffen jede Fläche steht wie in der Wirklichkeit — Kontakt, Rückstrahlung, Innenraum, Schlucht, Glut; die Stoffbreite als Stichprobe aus dem Stoff-Gesetz.

*Beleg:* Kontaktschatten steht (§16.K1 2), Albedo-Band 0 (§15), Ruhe 1/2, Rückstrahl 1/2, Kontakt-Verdeckung 0; Stoffe eine gebaute Tafel, kein Raum.

*alte Karte:* material.K1 · material.K4 · material.K5 · schatten.K1 · schatten.K2 · schatten.K3 · schatten.K4

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Wiese, 10² m² | Kontaktschatten scharf und weich mit Abstand; Basis-Stoffe mit Albedo im realen Band | P | Halbschattenbreite gegen Abstand im Band; Albedo im Bild ±0,05 gegen Tabellenwert für Gras, Erde, Fels, Holz, Haut |
| 2 | Dorf, 10⁴ m² | Schatten ruhig unter laufender Sonne, Rückstrahlung, Kontakt-Verdeckung, Nässe | P | Flimmer-Anteil der Schattenkante ≤ 1 % im Gang; Wand unten/Sonnenseite ±20 % gegen Messung; Glanz nach Regen gegen Foto |
| 3 | Innenraum | Licht fällt durch Tür und Fenster, Raum ohne Lampe lesbar | P | Tageslichtquotient im Bild gegen gemessene Werte gleicher Fenstergröße (1–5 %) ±30 % |
| 4 | Stadtschlucht, 10⁶ m² | Mehrfachsprung an 100-m-Fassaden, Glas spiegelt die Gegenseite | P | Schatten-/Sonnenfassade ±20 % gegen Messwerte; Spiegelbild der Gegenfassade ±2 px |
| 5 | Stoff-Raum: Stoffe aus dem Gesetz mit Verwitterung | Gestein aus Geologie, Holz aus Pflanze, Putz/Ziegel/Beton aus der Kultur der Epoche | P | 100 Zufallsstoffe unter Normlicht: Albedo und Glanz im Band gemessener Datensätze, ΔE ≤ 5, Anteil ≥ 0,9 |
| 6 | Glut und Asche | Magma nach Temperatur, erkaltende Lava, Aschewolke von unten rot | P | Glutfarbe gegen Schwarzkörper der Temperatur des Geologie-Gesetzes ΔE ≤ 5; Wolkenunterseite gegen Fotos ΔE ≤ 10 |
| 7 | 10¹⁰ m² × 24 h | Metropole und Landschaft zu jeder Stunde und jedem Wetter | P | 288 Zufallsposen (12 Orte × 24 h): Bildstatistik im Band des Fotosatzes gleicher Szene ≥ 0,9 |
| 8 | jeder Planet | fremde Mineralien und Lebensoberflächen, mehrere Sonnen | P | Zufalls-Planetenstoffe mit Albedo und Glanz im physikalisch möglichen Band ≥ 0,95; Doppelschatten in Farbe der Sonnen |

#### Luft, Tag und Himmel

`erleben.bild.himmel` — **HEUTE 0 / 7**

*misst:* die Treue von Himmel und Luftperspektive als Stichprobe über den Zustandsraum Uhr × Wetter × Saison × Breite × Aerosol × Zeitalter × Planet — Umfang ist die Zahl der Achsen.

*Beleg:* Hillaire-Atmosphäre mit Rayleigh, Mie, Ozon (welt-licht.js:211-265) — gegen Klarhimmel ungemessen; Tag-Bahn ROT: Radeon +0,94 EV bei Uhr 0,33, GTX −22 % golden (§13.K1 = 0). — KARTE: 0 — gegen den Klarhimmel ungemessen.

*alte Karte:* licht.K1 · licht.K2 · licht.K5

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Mittag, klar | eine Atmosphäre (Rayleigh, Mie, Ozon) | P | Himmels-Leuchtdichte gegen gemessenen Klarhimmel ±0,3 EV |
| 2 | × Uhr | Tag-Bahn monoton, golden, Nacht lesbar; Wolken mit Körper und Schatten | P | Belichtungskurve über 24 h gegen Referenzkurve, max. Abweichung ≤ 0,3 EV |
| 3 | × Wetter | Dunst, Nebel, Regen, Gewitter, Schnee als Dichte desselben Mediums | P | Sichtweite im Bild ±15 % zur gesetzten; kein Bildsprung beim Wetterwechsel |
| 4 | × Saison × Breite | Polarnacht, Mitternachtssonne, Tropen, Wüstendunst | P | Zufalls-(Breite, Tag, Uhr): All-Sky-Bild ±0,3 EV gegen Himmelsfoto-Datensätze, Anteil ≥ 0,9 |
| 5 | × Aerosol | Asche, Rauch, Smog im selben Medium; Halo, Regenbogen, Polarlicht | P | Regenbogen 42° ±1°, Halo 22° ±1°; Abendrot nach Ausbruch ΔE ≤ 10 gegen Beobachtung |
| 6 | × Zeitalter | dichte CO₂-Luft, junge schwächere Sonne, andere Tageslänge | P · Flug | Himmelsfarbe ±0,3 EV gegen Strahlungstransport-Referenz, Anteil von 100 Zeitpunkten ≥ 0,9 |
| 7 | × Planet | fremde Atmosphären, mehrere Sonnen, Ringe, Monde | P · Flug | Mars-Abend gegen Rover-Fotos ±0,3 EV je Kanal; Zufalls-Planeten gegen Referenz ±0,3 EV ≥ 0,9 |

#### Das Auge: Belichtung, Dynamik, Ruhe

`erleben.bild.auge` — **HEUTE 0 / 6**

*misst:* ob das Bild sich verhält wie ein Auge in jeder Perspektive — vom Insekt im Gras bis zum Orbit, aus der Höhle in die Sonne, im Gehen, Fahren, Fliegen.

*Beleg:* Belichtungs-Gesetz mit Gleitung (BELICHTUNG, stamm/bild-himmel.js:3292), gegen keine Referenz gemessen; Schatten-Ruhe 1/2 (§16.K2).

*alte Karte:* licht.K5 · schatten.K2

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Gehen | kein Flimmern, kein Treppenkriechen an Kanten, Laub und Schatten | P | zeitliche Pixel-Varianz in ruhenden Bildbereichen ≤ 1 % der Fläche über Schwelle |
| 2 | Tag ↔ Nacht, drinnen ↔ draußen | Belichtung gleitet wie ein Auge, nie Pumpen | P | Höhle → Mittagssonne: ausgebrannte Fläche ≤ 2 % nach 1 s; hell → dunkel ohne Belichtungs-Umkehr |
| 3 | 10⁻³ – 10⁵ cd/m² (8 Dekaden) | Sterne, Mond, Laterne, Sonne im selben Lauf lesbar | P | 20 Szenen: geklippte Fläche ≤ 2 %, Tonwertumfang im Band kalibrierter HDR-Fotos |
| 4 | Blendung | Gegenlicht, Scheinwerfer, Sonne im Wasser wie im Auge | P | Panel-2AFC gegen Fotos gleicher Blendsituation ≤ 65 % |
| 5 | Fahren und Fliegen: 300 km/h, 1 000 km/h | Bewegungsunschärfe nach Belichtungszeit, keine Nachzieh-Geister | P · Flug | Geister-Fläche gegen 16-fach zeitabgetastete Referenz ≤ 1 % |
| 6 | jede Perspektive: Makro 1 cm, Riesenhöhe, Unterwasser, Orbit | dasselbe Auge über 10 Größenordnungen Höhe | P | 200 Zufalls-Kameraposen: Anteil ohne Bruch ≥ 0,9 — Bruch heißt Luma-Sprung > 5 % oder Positionssprung > 1 % zwischen zwei Bildern |

#### Jede Kamera — Foto, Kino, Wiederholung, Zuschauen

`erleben.bild.kamera` — **HEUTE 0 / 7**

*misst:* welche Blickweisen der Spieler jenseits von Ego und Third hat — freie Kamera, Foto mit Blende und Brennweite, Kinofahrt, Wiederholung eines Augenblicks, Zuschauen bei Bewohnern und Mitspielern, Sport-Übertragung, Karten- und Feldherrenblick — und ob jedes Bild davon dem echten Gerät standhält.

*Beleg:* Spieler-Kameras der gebuchten Stationen sind Ego und Third; Fotomodus 0 Treffer in stamm/ und den Kernen (Grep 14.11.).

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | freie Kamera und Standbild | die Welt hält an und bleibt ganz: kein Loch, kein fehlendes Ding hinter der Spieler-Kamera | P | 20 Standbilder aus freier Lage: Bild ganz (Lücke ≤ 2 %), Schärfe und Licht wie im Spiel |
| 2 | Foto: Brennweite, Blende, Belichtungszeit | Schärfentiefe und Bewegungsunschärfe nach der Optik | P | Unschärfe-Kreis gegen die Linsenformel ±10 %; Blindpaar gegen ein Foto gleicher Brennweite und Blende ≤ 80 % |
| 3 | Wiederholung: die letzten 60 s aus jeder Lage | derselbe Augenblick — bild-gleich aus der alten Lage, neu aus jeder anderen | P | Wiederholung aus der Spieler-Lage gegen die Aufnahme: Diff ≤ 1 %; aus 5 anderen Lagen ohne Loch |
| 4 | Zuschauen: einem Bewohner, einem Tier, einem Mitspieler folgen | sein Tag läuft weiter, die Kamera stört nicht | P | 20 gefolgte Wesen über 1 Spieltag: Tagesplan gleich dem ohne Zuschauer (Abweichung ≤ 5 %) |
| 5 | Übertragung: ein Wettkampf mit Regie | Totale, Nahe, Zeitlupe, Wiederholung der Entscheidung — von selbst an der richtigen Stelle | P · Stadion | blinde Zuschauer verstehen Stand und Entscheidung nach 5 min ≥ 80 %; Blindpaar gegen eine Fernseh-Übertragung ≤ 75 % |
| 6 | Karten- und Feldherrenblick über Stadt, Land, Planet | vom Viertel bis zum Kontinent lenken und lesen, ohne Bruch zum Boden | P | Zoom Karte → Straße ohne Sprung (Luma ≤ 5 %, Lage ≤ 1 %); 20 Befehle aus der Karte kommen am Boden an |
| 7 | Kino: eine Fahrt durch die Megastadt, den Sturm, die Äonen | eine Minute Film ohne Schnitt, die ein Blinder für gedreht hält | P | Panel-2AFC 60 s Fahrt gegen eine Filmaufnahme gleicher Szene ≤ 65 %; N = 20 Zufalls-Fahrten über Saaten |

### Klang

*Referenz-Korpus (R6, R11):* Feldaufnahmen, gemessene Raumantworten (RT60), Instrumenten- und Stimm-Korpora, Hörversuche

#### Raum, Medium und Hörort

`erleben.klang.raum` — **HEUTE 0 / 7** · Kern 2

*misst:* ob Richtung, Entfernung, Verdeckung, Beugung und Nachhall jeder Quelle aus der Welt folgen — vom Feld über die Häuserschlucht bis zur fremden Atmosphäre und zum Vakuum.

*Beleg:* RT60 Feld 0,283 · Wald 0,649 · Gasse 1,522 · Höhle 3,195 s, Verdeckung Haus −11,2 dB (§32.K3 2/2); Klang-Takt Radeon p95 0,25 ms > 0,2 (§32.K5 1/2); kein HRTF, kein Medienwechsel. — KARTE: Kern 2 — am Abgriff gemessen (klang.K3); Bild-Preis in der Szene nicht gemessen; das alte Klang-Budget (an der Radeon 0,25 ms gegen 0,2) ist kein Preis mehr (R8).

*alte Karte:* klang.K3 · klang.K5

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 ◐ | 1 Ort, Stereo | links/rechts, Pegel fällt mit Abstand | P · 0 Aussetzer | Pegel- und Laufzeitunterschied am Abgriff an 24 Quellenlagen mit richtigem Vorzeichen (100 %) |
| 2 ◐ | 4 Raumklassen (Feld, Wald, Gasse, Höhle) | Nachhall paarweise ≥ 1,3× verschieden; hinter Haus/Hang ≥ 6 dB leiser und dumpfer | P | RT60 am Abgriff je Ort; Mutation Bau-Dichte → RT60 monoton |
| 3 | 10³ begehbare Orte einer Siedlung | vorn/hinten/oben, Ecke und Tür hörbar | P | Blind-Lokalisierung (geeicht) ≥ 85 %; RT60 an 50 Zufallsorten ±25 % der Sabine-Zahl |
| 4 | 10⁵ Innenräume einer Stadt | Raum-in-Raum, Tür, Treppenhaus; Nachbar durch die Wand nach Stoff | P | Impulsantwort gegen gemessene IR realer Raumtypen: Oktav-RT60 ±20 %; Wanddämmung ±5 dB gegen Bauakustik-Tafel |
| 5 | Stadt, Fernschall bis 10 km, jede Perspektive (Ohr, Helm, Wagen) | Tiefen beugen um Hochhäuser, Gradienten biegen den Schall | P | Donner/Glocke aus 2/5/10 km: Laufzeit ±2 %, Höhendämpfung nach ISO 9613 ±3 dB; Wagen-Innenraum FAD ≤ Schwelle |
| 6 | Medienwechsel: Unterwasser, Eis, Körperschall | 4,3× schnellerer Schall, Grenze dämpft ~30 dB, Beben gefühlt vor gehört | P | Eintauchen: Spektralschwerpunkt kippt wie Hydrophon-Referenz ±20 %; Bodenwelle vor Luftwelle |
| 7 | jeder Planet aus 10⁶ Saaten, Gasriese bis Vakuum | Dichte, c, Absorption aus dem Gesetz; im Vakuum nur Körperschall | P | 100 Saaten: Laufzeit, Pegel, Höhendämpfung folgen der Atmosphären-Zeile in ≥ 95 %; Vakuum: Luftschall 0 |

#### Stoff und Ereignis

`erleben.klang.ereignis` — **HEUTE 0 / 7** · Kern 2

*misst:* wie viele Ereignisse aus dem Gesetz unterscheidbar klingen und wie wahr sie gegen Aufnahmen sind — an Zufallsstichproben, nie an einer Liste.

*Beleg:* schrittKlang (klang-core.js:1532), trefferPaar (:1420), Motor mit Doppler (:1675); Motor r 1,0, Landung r 0,9975 (§32.K4 2/2); Preis Radeon ROT; kein Bruch, kein Donner, kein Vulkan. — KARTE: Kern 2 — am Abgriff an den Geräten gemessen (klang.K4); Bild-Preis in der Szene nicht gemessen; das alte Klang-Budget ist kein Preis mehr (R8).

*alte Karte:* fahrzeug.K5 · klang.K4

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 ◐ | Schritt auf 3 Stoffen | Stoffe am Klang unterscheidbar | P | Spektralschwerpunkt je Stoff ≥ 300 Hz getrennt, ≥ 5 Schritte je Stoff |
| 2 ◐ | ~10 Ereignisklassen (Schritt, Landung, Treffer, Motor+Doppler, Glut, Substanz) | Landung ∝ Aufprall, Motor folgt Gas, Doppler stimmt | P | Motor r = 1,0, Landung r ≥ 0,99, Doppler r ≥ 0,99 am Abgriff |
| 3 | jeder Stoff × jede Kontaktart (Stoß, Kratzen, Rollen, Gleiten, Bruch) | Stoff am Klang erkennbar | P bei 32 Ereignissen | Stoff aus 10 nur am Klang ≥ 70 % (Jury, dann Klassifikator); FAD je Stoff gegen Foley-Korpus ≤ Schwelle |
| 4 | jedes Ding aus der Werkstatt, 100 Zufallsbauten | Größe → Tonhöhe, Hohlraum → Resonanz, Bruch → Trümmerklänge | P bei 64 Ereignissen | tiefste Eigenfrequenz ±10 % gegen Platten-/Balkenformel; Trümmer im Bild ↔ Einschläge am Abgriff r ≥ 0,8 |
| 5 | Elementar-Ereignisse: Brandung, Lawine, Hagel, Donner, Sturm, Brand | Kaskaden-Klang aus der Simulation | P | Donner-Spektrum und -Dauer ±25 %; Brandungspegel ∝ Wellenhöhe im Bild r ≥ 0,9 |
| 6 | Geologie: Vulkan, Beben, Lavastrom, Geysir, Kalben | Infraschall bis 1 Hz als Tief- und Vibrationsspur, Lautheit ∝ Energie | P | Eruptionsstärke → Pegel in 1/5/20 km gegen Vulkan-Akustik-Messungen ±6 dB |
| 7 | jedes Ereignis jeder Welt, 10⁶ Saaten, fremde Stoffe | plausibel für einen nie gehörten Stoff | P | 1 000 Zufallsereignisse: geeichtes Ohr „plausibel für Stoff und Medium" ≥ 90 % |

#### Klanglandschaft: Natur und Stadt als EINE Population

`erleben.klang.landschaft` — **HEUTE 0 / 8** · Kern 1

*misst:* ob die Landschaft klingt nach dem, was dort WIRKLICH lebt, fährt und arbeitet — fern als Feld, nah als Einzelne, von der Wiese bis zur Megastadt.

*Beleg:* neun Textur-Gesetze (klang-core.js:668-766), Tier-Ruf f0 ∝ L^−0,9 (:495-497), Wind r 0,81/0,79 (§32.K1, K2 je 2/2); Verkehr K-nah (stamm/klang.js:1092-1110); keine Bewohner-Klänge, kein Stadtteppich; Preis Radeon ROT. — KARTE: Kern 1 — Zensus am Abgriff, Wind gesehen = gehört an beiden Geräten (klang.K1, klang.K2); Bild-Preis in der Szene nicht gemessen; das alte Klang-Budget ist kein Preis mehr (R8).

*alte Karte:* luftwasser.K1 · klang.K1 · klang.K2

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 ◐ | 1 Biom (Wiese) + Dorf, Feuer, Motor | jede Quelle hat einen Körper im Bild; Wind gesehen = gehört | P | Klang-Zensus Pegel je Ort im Soll; Wind Bild ↔ Ohr r ≥ 0,6 |
| 2 | 5 Biome × Tag/Nacht × Regen; 20 Wagen | Insekten-Takt aus Temperatur; Kosten an K Stimmen | P | Kreuzkorrelation Bild ↔ Ohr ≥ 0,6 je Biom; Wagenpegel ∝ Abstand |
| 3 | 10² lebende Quellen eines Dorfs | Schritte, Werkzeug, Tür, Murmeln folgen dem Tagesplan | P | Dorfplatz Mittag gegen Nacht ≥ 15 dB; Quellen am Abgriff ↔ Bewohner im Bild r ≥ 0,8 |
| 4 | jedes Biom der Erde (20 Zufallsorte) | Dämmerungschor, Jahreszeit; Arten teilen das Spektrum | P | Bioakustik-Indizes (ACI, NDSI) ±25 % gegen Feldaufnahmen; Spektral-Überlappung der Rufer < Zufall |
| 5 | 10⁴ Quellen einer Großstadt | fern Feld, nah Einzelner; Schlucht hallt; Stadion-Chor synchron | P | Tagpegel und Oktavspektrum an 10 Zufallsorten ±5 dB gegen Lärmkarten; FAD Straße/Markt/Stadion ≤ Schwelle |
| 6 | 10⁶ Bewohner einer Metropole | Rushhour, Feiertag, Stromausfall verändern den Klangkörper | P | 24-h-Fahrt: Pegelkurve folgt der Aktivität r ≥ 0,9; Blindtest gegen Feldaufnahme ≥ 50 % „echt" |
| 7 | 10⁸ in einer Stadt, 10⁹⁺ auf dem Planeten | jeder Bezirk, jede Höhe hat seinen Klang | P | 50 Zufallsorte × 6 Uhrzeiten: Bezirkstyp und Uhrzeit nur am Abgriff ≥ 70 %; hörbare Quellen mit Verursacher im Bild ≥ 99 % |
| 8 | fremde Evolution: 10⁶ Saaten mit eigenen Arten, Medien, Sinnen | Ruf folgt Leib, Rufe in fremden Medien | P | 100 Saaten: „lebendig und eigen" ≥ 80 %, Paare unterscheidbar ≥ 90 %; Ruftonhöhe ↔ Körpergröße Allometrie-Steigung ±20 % |

#### Die Stimme

`erleben.klang.stimme` — **HEUTE 0 / 5**

*misst:* wie viele Personen mit eigener Stimme sprechen und antworten — verständlich, gefühlvoll, aus dem Leib, ohne Aufnahme und ohne Gewichte; die Sprachen selbst (Zahl, Wandel, Verwandtschaft) zählt mensch.kultur.sprache.

*Beleg:* Bewohner sprechen nicht; der Begleiter spricht über speechSynthesis des Browsers (stamm/werkstatt-hud.js:71-89) — Gerätestimme, nicht aus Gesetz, zählt nach R4 nicht.

*alte Karte:* affekt.K4

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Stimme aus Gesetz, Laute ohne Bedeutung (Murmeln, Rufe) | Stimme folgt dem Leib: Kind, Frau, Mann, groß, klein | P | F0 und Formanten am Abgriff gegen Peterson-Barney-Tafel ±15 % nach Leibmaßen |
| 2 | 10 Stimmen, 1 Sprache (Spielersprache), verständlich | Prosodie aus Affekt | P · 0 Gewichts-Download | Wortfehlerrate eines Spracherkenners am Abgriff ≤ 10 %; Affekt blind ≥ 60 % |
| 3 | jeder Bewohner einer Siedlung (10³) | eigen nach Alter, Herkunft, Krankheit | P | Sprecher-Verwechslung zweier Zufallsbewohner ≤ 5 % |
| 4 | jede Person einer Metropole (10⁶) spricht und antwortet | Antwort im Sinn, eigene Stimme | P · Antwort ≤ 1 s | Stichprobe 1 000: hörbar in seiner Sprache, Latenz ≤ 1 s, Spielersprache ≤ 10 % WER |
| 5 | 10⁴ Sprachen, 10⁸⁺ Sprecher, fremde Sprechorgane (Pfeif-, Klick-, Infraschall) | fremde Sprache als Sprache erkennbar, nicht als Lärm | P | 100 Saaten: geeichtes Ohr „Sprache" ≥ 90 %; Wortgrenzen und Wiederholungsstruktur messbar |

#### Musik je Kultur und Epoche

`erleben.klang.musik` — **HEUTE 0 / 7**

*misst:* ob Musik aus einem Gesetz entsteht (Instrument aus Stoff → Spektrum → Tonsystem → Tradition), an Quellen der Welt hängt und Hörer Kultur und Epoche erkennen.

*Beleg:* 22 Genre-Tafeln (klang-core.js:96-117), 7 Skalen 12-TET (:39-47), 185 Phrasen 0 wiederholt (§10.K5 2/2) — von Hand gestimmt, Fleiß statt Same. — KARTE: 0 — der Hörer-Blindtest von Sprosse 1 ist nie gefahren; affekt.K5 misst den Chroma-Abstand headless.

*alte Karte:* affekt.K5

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Musik-System der Welt | Musik liest das Feld (Valenz, Erregung) | P | Hörer-Blindtest: Stimmung der Szene aus der Musik erkannt ≥ 70 %; am Abgriff keine Wiederholung in 10 min |
| 2 | Musik am Ort: eine hörbare Quelle in der Welt | gebautes Instrument klingt nach seiner Gestalt | P | Tonhöhe am Abgriff folgt Saiten-/Röhrenlänge ±3 % |
| 3 | 100 Zufallskulturen, je Tonsystem aus dem Spektrum ihrer Instrumente | Mikrotonalität, Metrum, Form | P | Intervall-Histogramme decken reale Traditionen: jede hat einen Nachbarn ≤ 15 cent; Paare unterscheidbar ≥ 90 % |
| 4 | jedes Instrument, das eine Kultur aus ihren Stoffen baut | Klangfarbe aus Stoff und Bauform, Spieltechnik aus Leib | P bei 16 Stimmen | Klassifikator ordnet den Abgriff der richtigen Hornbostel-Sachs-Familie ≥ 80 % |
| 5 | Musik im Leben: Fest, Arbeit, Trauer, Krieg, Stadion | Gesang mit Text in der Sprache der Kultur | P | 100 Kulturen: 2AFC gegen Feldaufnahmen des Musik-Korpus ≤ 75 %; Anlass blind erkannt ≥ 70 % |
| 6 | Musik wandelt sich durch Kontakt und Technik | Stil-Evolution, nicht Stil-Katalog | P | Stammbaum der Stile aus dem Abgriff rekonstruierbar (Baumabstand ≤ 25 %) |
| 7 | 10⁵ Traditionen über Planeten, fremde Ohren und Medien | Musik fremder Arten, die es nie gab | P | Zufallsreise über 1 000 Saaten: effektive Zahl der angetroffenen Traditionen (Chao1 über Hör-Cluster) ≥ 10⁵; Struktur messbar (Wiederholung, Hierarchie, Tonzentrum oder Puls) ≥ 95 %; Fremdwelt-Probe (R10) |

#### Hören im Getümmel

`erleben.klang.getuemmel` — **HEUTE 0 / 6**

*misst:* ob der Spieler in der lautesten Welt das Wichtige hört — Gespräch, Warnung, eigener Schritt —, ohne dass die Menge verschwindet.

*Beleg:* Stimmen-Deckel 7 (klang-core.js:417), Spitzen-Wand, Musik-Duck 8,5–12 dB; Preis Radeon ROT. — KARTE: 0 — Spitzen über 10 min nie gemessen.

*alte Karte:* affekt.K5 · klang.K5

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 7 Stimmen zugleich, die lautesten gewinnen; Musik tritt unter Stimme | keine Spitze über 0 dBFS | P | Spitzen ≤ 0 dBFS über 10 min; Duck 8–12 dB bei Stimme |
| 2 | Dorfplatz mit 10² Quellen | der zugewandte Sprecher bleibt verständlich | P | WER des zugewandten Sprechers bei 65 dB(A) ≤ 15 % |
| 3 | Großstadtstraße 75 dB(A), 10⁴ Quellen | Zuwendung hebt eine Stimme aus der Menge, wie das Ohr | P | WER ≤ 15 %, Menge dabei ≤ 3 dB gesenkt |
| 4 | Ausnahme-Lage: Explosion, Stadion-Tor, Sirene | Vertäubung, Klingeln — der Leib hört mit | P | nach 130-dB-Ereignis: Hörschwelle steigt und erholt sich nach der Audiologie ±30 % |
| 5 | Stadion 10⁵ Stimmen, Metropole 10⁶ | Gespräch neben dem Chor; Warnung durchdringt | P | WER des zugewandten Sprechers bei 90 dB(A) ≤ 20 %; Warnsignal hörbar erkannt ≥ 95 % |
| 6 | jede Lage jeder Saat | das Wichtige bleibt hörbar, die Menge bleibt da | P | 100 Zufallsorte × Lagen: zugewandter Sprecher, Warnung und eigener Schritt hörbar in ≥ 95 % |

## 6 · Der Same und sein Preis

### Physik und Stoff

*Referenz-Korpus (R6, R11):* Messreihen und Formeln (Fallzeit, Balken, Rothermel, Abkühlkurven realer Laven), Hochgeschwindigkeits-Film

#### Freie Körper

`same.physik.koerper` — **HEUTE 0 / 7**

*misst:* Zahl der losen Dinge, die bei einem Ereignis im Bild zugleich der Physik folgen, ohne Durchdringen, und liegen bleiben, wo die Rechnung sie ließ. Achse: Körper 10⁰ → 10¹².

*Beleg:* EIN Starrkörper-Löser für Kiste und Zylinder (stamm/koerper-frei.js:3-35), headless 100 wache Körper 0,4 ms; im echten Spiel an der Stadt kein Bild, die Dinge der Stadt sind keine losen Körper.

*alte Karte:* physik.K1 · physik.K2 · physik.K3

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Körper | fällt, ruht, Masse = Volumen × ρ | P | Fass fällt vom Dach: Ruhe ≤ 2 s, Zittern ≤ 1 cm, Spalt zum Boden im Bild ≤ 5 cm |
| 2 | 10 | Stapel, Stoß nach Massenverhältnis | P | Wagen fährt in 10 Kisten: 0 Durchdringen im Bild, Δv ±10 % gegen Impulsbilanz, Ruhe ≤ 3 s |
| 3 | 10² | Trümmerfeld eines Einsturzes, liegt über Reload | P | Einsturz eines Werks: 100 Trümmer im Bild, nach Reload jede Lage ±1 cm |
| 4 | 10³ | jedes lose Ding einer Gasse der GESÄTEN Stadt ist ein Körper | P | Explosion in einer Gasse: 1 000 Körper fliegen, 0 Durchdringen im Bild |
| 5 | 10⁵ | ein Viertel im Sturm oder Beben, Kippen nach Schwerpunkt und Reibung | P | Böe 30 m/s: Anteil der Dinge, die laut Kipp-Kriterium kippen müssen und im Bild kippen, ≥ 95 %, Fehl-Kipper ≤ 2 % |
| 6 | 10⁶ im Blick, 10⁹ in einer Megastadt mit Gedächtnis | jedes Ding einer Stadt jenseits Tokio, ab dem ersten Bild; Naht wach/schlafend unsichtbar | P | Flug über die Stadt nach einem Beben: 1 000 sichtbare Dinge an der gerechneten Lage ±1 cm; Bildreihe beim Annähern ohne Naht |
| 7 | ≥ 10¹² (jedes lose Ding eines Planeten), Jahrhunderte | bewegt nur, was eine Ursache hatte (Mensch, Flut, Wind, Fäulnis) | P | Rückkehr nach 100 Spieljahren an 100 Zufallsorte: ≥ 99 % der Dinge am Ort oder ihre Bewegung einer benannten Ursache zuordenbar |

#### Tragen und Brechen

`same.physik.tragen` — **HEUTE 0 / 7**

*misst:* Größte Struktur, deren Stehen, Durchbiegen, Schwingen und Brechen aus Stoff-Zeile, Querschnitt und Last folgt — absolut wahr, nicht geeicht. Achse: Bauvolumen 10⁰ → 10⁹ m³ und fremde Schwere.

*Beleg:* Biegung und Euler-Knick je Glied (stamm/bau-buch.js:1823-1892), aber durch knickSicherheit 500 geeicht (:2580-2591): relativ wahr, absolut nicht; Lastpfad-Bruch nur in der Werkstatt, kein gesätes Stadthaus bricht.

*alte Karte:* physik.K3 · bauen.K3

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Glied | knickt nach Euler, zerdrückt nach Druckfestigkeit, ohne Eichfaktor | P | Säule realer Schlankheit unter wachsender Last: Versagens-Last gegen Euler ±20 %; halbes E knickt früher |
| 2 | ein Werk (≈ 10 Glieder) | Teile ohne Lastpfad fallen, die übrigen stehen, Trümmer bleiben | P | zufälliger Pfosten entfernt: gefallene Teile = Teile ohne Lastpfad (100 %), Trümmer liegen 10 min |
| 3 | ein Haus (10³ m³) | Balken biegen sichtbar; Holz bricht längs der Faser, Mauer in Fugen, Glas radial | P | 1 m Schnee auf flachem Holzdach: Durchbiegung ±20 % gegen Balkenformel; Bruchbild-Paar je Stoff gegen Fotos, Jury „echt" ≥ 70 % |
| 4 | jedes gesäte Haus einer Stadt (10³ Bauten) | steht, weil es trägt, nicht weil es gesetzt ist | P | N = 1 000 Saaten: 100 % stehen unter Eigenlast; mit E/2 in der Zeile fallen ≥ 10 % |
| 5 | ein Hochhaus (10⁵–10⁶ m³, 300 m) | Wind-Schwingung, fortschreitender Kollaps, Staub aus derselben Masse | P | Periode der Turmspitze gegen T ≈ H/46 s ±25 %; Kollaps-Zeit gegen reale Einstürze ±30 % |
| 6 | Stadtteil bis Megastadt (10⁷–10⁹ m³) | Beben bricht je Bauweise und Boden-Stoff | P | Beben M7: Schadensgrad je Bau gegen EMS-98-Verteilung ±1 Grad bei ≥ 70 % |
| 7 | Megastrukturen auf fremden Welten (km, 0,3–3 g) | die Statik setzt Grenze und Silhouette der Stadt | P | N = 100 Planeten-Saaten: Höhe der höchsten Bauten ∝ σ/(ρ·g) ±30 %; Blind-Jury ordnet Silhouetten der richtigen Schwere zu ≥ 80 % |

#### Flüssigkeit und Gas

`same.physik.fluid` — **HEUTE 0 / 8**

*misst:* Volumen Wasser, Schlamm, Lava, Rauch, Gas, das mit Impuls und freier Oberfläche sichtbar fließt und Körper mitnimmt. Achse: 10⁰ → 10⁹ m³, dann planetar und fremd.

*Beleg:* Zellen-Feld Uint8Array Luft/Wasser/fest je Chunk (stamm/wasser-zellen.js:3), kein Impuls; die gegrabene Grube füllt sich im Code, im Spiel-Bild nie gesehen. Gas als Feld: nichts.

*alte Karte:* gelaende.K2

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Zellen-Wasser ohne Impuls | gegrabene Grube unter dem Pegel füllt sich | P | Grube unter dem Pegel gegraben füllt sich im Bild, beide Geräte |
| 2 | 1 m³ (Eimer, Brunnen) | Schwall, Spritzer mit Impuls | P | gekippter Eimer: Front gegen Ritter 2·√(g·h) ±15 % |
| 3 | 10³ m³ (Becken, Bach-Stau) | Dammbruch, Strömung trägt Körper mit | P | Holzdamm gebrochen: Front ±15 %, Fässer treiben mit der Strömung |
| 4 | Gas: Stadtbrand-Fahne, Gaswolke | Auftrieb, Wind, Verdünnung; schwere Gase sammeln sich in Senken | P | Steighöhe der Fahne gegen Briggs ±30 %; CO₂-Wolke fließt bergab in die Senke (Bild) |
| 5 | 10⁶ m³ (Stausee) | Flutwelle durch eine Stadt, Wagen und Trümmer schwimmen | P | Ankunftszeit in 1 km ±20 % gegen Flachwasser-Rechnung; Bildpaar gegen Flutvideo, Jury ≥ 60 % |
| 6 | 10⁹ m³ (Lavastrom, Tsunami, km) | Viskosität aus Temperatur, Erstarren an der Front | P | Lava-Tempo im gemessenen Band 0,1–10 m/s je Hang und Viskosität |
| 7 | planetar, ein Kontinuum | Ozean, Atmosphäre, Magma fein im Blick, gemittelt in der Ferne | P | Flug vom Strand in den Orbit: kein sichtbarer Bruch der Fluid-Stufen (Bildreihe), p95 ≤ 33 ms über den ganzen Flug |
| 8 | fremde Fluide auf N Welten | Methan-Meere, Lava-Ozeane, dichte Atmosphären folgen g und Viskosität | P | N = 100 Planeten: Dispersion ω² = g·k im Bild ±15 %; Tropfen- und Wellenbild skaliert sichtbar mit g |

#### Wärme, Feuer, Phase

`same.physik.feuer` — **HEUTE 0 / 8**

*misst:* Fläche, auf der Wärme wandert, Stoffe ihre Phase wechseln oder verbrennen — mit Tempo nach Physik, gemessen im Brand-Fenster, nicht im ruhigen Stand. Achse: 10² m² (Zelle) → Kontinent → fremde Welten.

*Beleg:* Rothermel 1972 + Albini + Anderson auf dem Feld (stamm/feld-leben.js:2477-2620), Halt an Fluss und Fels, Asche als Tat; Phasen nur Eis und Wasser (bau-vorlagen.js:1610). Alle Belege headless (stoffe.K2/K3 an d3708675), Bild-p95 im Brand nie gemessen; nur Vegetation brennt.

*alte Karte:* stoffe.K2 · stoffe.K3

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Zelle | zündet am Zündpunkt, nass nicht; Eis trägt, Lava erstarrt | P | Fackel an trockenes / nasses Gras: zündet / zündet nicht; Eis trägt den Spieler, y am Spiegel ±5 cm |
| 2 | eine Wiese (10⁴ m², 2 000 Zellen) | Front mit Wind und Hang 0,5–2 m/s, Halt an Fluss, Fels, nassem Gras; Regen löscht | P im Brand-Fenster | Front-Tempo im Rothermel-Band, Halt in 100 % der Proben, Bild-p95 ≤ 33 ms während 2 000 Zellen brennen, beide Geräte |
| 3 | ein Haus innen (10³ m³) | Raum zu Raum, Flashover, Rauchschicht unter der Decke, Glas springt | P | Flashover nach 3–10 min; Raum-Temperatur gegen ISO 834 ±20 % |
| 4 | 1 km² Wald | Übergang Boden → Krone, Funkenflug bis 1 km | P | Anteil Fronten, die einen 20-m-Fluss überspringen, im Real-Band (Sturm ja, Windstille nein) |
| 5 | ein Viertel (10³ Gebäude, 10⁵ m²) | Holz und Stroh brennen, Stein hält, Brandgassen stoppen; Stahl verliert ab ≈ 550 °C Festigkeit | P | Holz- gegen Steinstadt gleicher Saat: verbrannter Anteil ≥ 5:1; Stahlhalle knickt nach Minuten, nicht Sekunden, nicht nie |
| 6 | eine Stadt (10⁶ Gebäude, 10⁷ m²) | Feuersturm zieht eigenen Wind | P | Wind am Brandrand ≥ 2× Umgebung; Holzstadt mit Ostwind gegen London 1666 (≈ 1,8 km² in 4 Tagen) Faktor 2 |
| 7 | Landschaft bis Kontinent (10⁹–10¹² m²), Brandsaison | Waldbrand über Wochen, Rate aus Klima, Ökosystem liest die Asche | P, Zeitraffer | Brandfläche gegen FARSITE derselben Lage ±30 %; Erd-Saat: Fläche je Jahr und Biom im Faktor 1,5 gegen GWIS |
| 8 | planetar, Äonen, fremde Welten | O₂ 15–35 % (Karbon), Methan-Seen, Eis-Vulkane; jede Phase nach ihrem Diagramm | P | N = 100 Planeten-Saaten: Phase sichtbarer Oberflächen-Stoffe stimmt mit Phasendiagramm ≥ 95 %; Saat mit O₂ 30 %: Brandfläche ≥ 3× der heutigen |

#### Verformung und Weiches

`same.physik.verformung` — **HEUTE 0 / 7**

*misst:* Wie viel Stoff elastisch oder plastisch verformt wird und die Verformung behält: Seil, Tuch, Blech, Boden, Schüttgut, Eis. Achse: ein Seil → jedes Ding → Kriechen über Zeitalter.

*Beleg:* EIN Seil-Löser im Körper-Kern, gelesen vom Flegel. Das Blatt nennt ein Bild im Spiel, die alte Karte bucht physik.K4 aber nur headless (d3708675) — Preis an den Standardgeräten ungemessen. Plastische Verformung: nichts (vehicle-core.js:1317 ist ein Modellier-Werkzeug).

*alte Karte:* physik.K4

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | ein Seil | Länge hält ±2 %, Schwung klingt ab | P | Flegel schwingt am Leib des Spielers, Seillänge im Bild ±2 %, beide Geräte |
| 2 | Tuch und Hängebrücke | Fahne im EINEN Wind, Brücke trägt den Spieler | P | Fahne und Gras schwingen gemeinsam (Phasen-Korrelation r ≥ 0,6); Durchhang unter 90 kg ±20 % |
| 3 | ein Wagen knautscht | Blech plastisch, Dellen bleiben, Achse verbiegt, das Fahren ändert sich | P | frontal 50 km/h gegen Mauer: Knautschtiefe gegen Crashtest ±25 %; danach zieht der Wagen messbar zur Seite |
| 4 | Boden nimmt Spuren | Schlamm, Schnee, Sand unter Fuß und Rad, die Spur bleibt | P | Reifenspur-Tiefe in nassem Lehm ±30 % gegen Bodenmechanik, sichtbar nach 10 min |
| 5 | 10³ m³ Schüttgut in Bewegung | Lawine, Düne im Schüttwinkel, Erdrutsch nimmt Häuser mit | P | Schüttwinkel trockener Sand 30–35° im Bild; Lawinen-Tempo im gemessenen Band |
| 6 | jedes Ding aus seiner Zeile | Metall biegt, Holz splittert, Gummi federt, Eis bricht spröde — ohne Sonderfall | P | Mutation der Streckgrenze ändert die bleibende Verformung im Bild bei 7 von 7 Stoffen |
| 7 | Kriechen über Zeitalter | Gletscher fließen, Gestein faltet sich | P, Zeitraffer | Gletscher-Tempo im Band 10–1 000 m/Jahr |

#### Reaktion und Umwandlung

`same.physik.reaktion` — **HEUTE 0 / 6**

*misst:* Welche Stoff-Umwandlungen (Verbrennen, Explodieren, Rosten, Faulen, Verhütten) aus Zeile, Temperatur und Partner folgen — bis die Werkstoffe einer Epoche aus dem Prozess entstehen. Achse: 1 Reaktion → Epochen → fremde Chemie.

*Beleg:* Außer Verbrennen nach Rothermel nichts; „phaseChange"/„plastic" je Stoff (bau-buch.js:2624-2626) sind Etiketten des Bauplans, keine Chemie.

*alte Karte:* stoffe.K2

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Reaktion | Holz brennt zu Asche und Rauch, Masse bleibt | P | Asche + Rauch-Masse = Holz ±10 %, Rauchmenge sichtbar proportional |
| 2 | Explosion | Druckwelle nach Ladung, Fenster splittern bis zum gerechneten Abstand | P | Schadensradius ∝ W^(1/3) ±25 % bei drei Ladungen |
| 3 | Zeit-Reaktionen | Rost, Fäulnis, Gärung, Kochen — Tempo nach Temperatur und Nässe | P | Bildpaar Eisen am See / in der Wüste nach 1 Spieljahr: Rost-Verhältnis ±30 % gegen Korrosions-Raten |
| 4 | Verhüttung | Erz + Kohle + Hitze → Metall, Glas, Kalk aus dem Prozess | P | Ofen unter 1 085 °C gibt kein Kupfer, darüber schon; das Ergebnis liest die erreichte Temperatur |
| 5 | Epochen aus Chemie | Werkstoffe einer Kultur folgen aus Lagerstätte und erreichter Hitze | P | N = 100 Saaten: Werkstoff-Inventar der Siedlungen konsistent mit Lagerstätten und Ofentemperatur ≥ 95 % |
| 6 | fremde Chemie | ohne Oxidator kein Brand, in Wasserstoff-Welten andere Flammen | P | N = 100 Planeten: 0 Verstöße (Brennstoff + Oxidator + Zündtemperatur) in 1 000 Bränden |

#### Umströmung und Flug

`same.physik.flug` — **HEUTE 0 / 6**

*misst:* Wurf, Ball, Segel, Flügel und Schwimmen im EINEN Wind und Wasser, skaliert mit Schwere und Luftdichte des Planeten — die Physik jeder Sportart und jedes Fliegers.

*Beleg:* Nichts als Gesetz belegt: kein Widerstand, kein Drall, kein Auftrieb am Körper gesehen.

*alte Karte:* wetter.K5 · halten.K4

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Wurf | Ballistik mit Luftwiderstand | P | Stein und Feder: Wurfweiten gegen Rechnung ±10 %, Feder fällt sichtbar langsamer |
| 2 | ein Ball im Sport | Drall krümmt die Bahn, Abprall nach Fläche | P | Freistoß mit Drall: Ablenkung im Band realer Messungen ±25 %; Abprall Rasen/Beton nach Stoßzahl ±10 % |
| 3 | Schwimmen und Segeln | Auftrieb und Widerstand in Wasser und Wind | P | Tauchtiefe = Dichteverhältnis ±5 %; Segelboot fährt am Wind, nicht gegen ihn (Polar-Form) |
| 4 | Flügel | Gleiter, Vogel, Flugzeug: Auftrieb, Strömungsabriss | P | Mindestfahrt gegen √(2mg/(ρ·S·C_L)) ±15 %; zu langsam kippt er ab |
| 5 | Wind der Stadt am Körper | Böen, Thermik, Lee hinter Häusern auf jeden umströmten Körper | P | Papier dreht im Lee der Straßenschlucht sichtbar um; Drachen steigt in der Thermik über heißem Platz |
| 6 | fremde Konstanten auf N Welten | g und Luftdichte skalieren Wurf, Sprung, Flug | P | N = 100 Planeten: Wurfweite ∝ 1/g ±10 %, Mindestfahrt ∝ 1/√ρ ±15 %; Blind-Jury ordnet Sprung-Videos der Schwere zu ≥ 80 % |

#### Stoff-Vielfalt aus dem Samen

`same.physik.stoffe` — **HEUTE 0 / 6**

*misst:* Wie viele Stoffe die Welt zeigt, die ein Mensch am Verhalten (Fallen, Klingen, Brechen, Brennen) ohne Textur erkennt — Kraft, nicht Tafel-Länge. Achse: 10 → 10⁶ Stoffe.

*Beleg:* Unter Sprosse 1: 21 SI-Zeilen (stamm/bau-vorlagen.js:1585-1608), ρ über den EINEN Leser _stoffRho, 7 Wirkungen mit 4–5 belegt; die Jury wurde nie gefahren.

*alte Karte:* physik.K1 · stoffe.K1

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 10 Stoffe | unterscheidbar am Verhalten, jede Wirkung liest die Zeile | P | Blind-Jury sieht und hört einen grauen Gegenstand fallen, brechen, brennen und benennt den Stoff ≥ 70 % |
| 2 | 10² | Werte gegen Handbuch | P | Stichprobe 50 Zeilen ±10 % gegen Ingenieurs-Tafeln; Jury ≥ 70 % |
| 3 | 10³ Werkstoffe einer Zivilisation, je Epoche | Legierungen, Gemische, Nahrung entstehen aus Reaktion, nicht eingetragen | P | Stichprobe 50 entstandener Werkstoffe: Verhalten gegen Handbuch ±15 % |
| 4 | 10⁴ Stoffe einer Welt | Eigenschaften aus Zusammensetzung statt Zeile | P | 100 zufällige Verbindungen einer Saat: Reihenfolge von Dichte und Schmelzpunkt stimmt ≥ 90 % |
| 5 | 10⁵ über Welten | dieselbe Ableitung über Planeten verschiedener Zusammensetzung | P | N = 20 Planeten × 50 Stoffe: Reihenfolge ≥ 90 %; Jury unterscheidet ≥ 10 Stoffe je Welt am Verhalten |
| 6 | 10⁶+ fremde Stoffe | Stoffe, die die Erde nicht kennt, aber die Physik erlaubt | P | N = 100 Planeten: Jury hält sie im Verhalten für physikalisch denkbar ≥ 70 % und unterscheidet ≥ 20 je Welt |

### Die Entfaltung — Welt als Funktion

*Referenz-Korpus (R6, R11):* der Lauf mit Zuschauer als Referenz; für das Bild die Korpora der gezeigten Domäne

#### Gleichheit über Geräte und Peers

`same.entfaltung.gleichheit` — **HEUTE 0 / 8**

*misst:* Was zwei Geräte und zwei Peers an derselben Koordinate (Ort, Maßstab, Zeit) sehen, ist dieselbe Welt — dieselben Dinge und Personen an denselben Stellen, nur feiner oder gröber. Achse: Stichproben-Raum 1 Pose → 10⁴ Koordinaten einer Galaxie.

*Beleg:* Headless: alle Teil-Simulationen gleich ohne Zustands-Nachricht (Leben 1189/1189, Reload mitten im Sturm), Fusion byte-gleich 1146 B (feld.K2, ultiversum.K2). Bild-Gleichheit zweier GPUs und Horizont G2 ↔ G3 nie gemessen.

*alte Karte:* gelaende.K1 · wetter.K1 · feld.K2 · ultiversum.K2

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Gelände am Spawn | Höhenform gleich | P je Gerät | Bild G2 ↔ G3 gleiche Pose: Horizont-Linie ≤ 2 px Abweichung |
| 2 | Dorf: Häuser, Bäume, 10 Taten eines Spielers | Klassen gleich; Spieler B sieht die Taten von A, auch nach Reload | P | Klassen-Masken-Diff ≤ 1 % (A ↔ B, vor ↔ nach Reload, Radeon ↔ GTX) |
| 3 | Stadt mit Bewohnern in Bewegung, alle Teil-Simulationen, 20 min | Personen ≤ 0,5 m nach 10 min; Wetter, Leben, Pegel, Brand ohne Zustands-Nachricht | P | zwei Geräte in EINER Sitzung: Masken + Positionen; Netz-Log zeigt nur Akten |
| 4 | Startwelt (~10 km²), 100 zufällige Posen | bild-gleich auch zu Nacht, bei Regen, im Winter | P | Klassen-Diff ≤ 1 % an ≥ 99 % der Posen |
| 5 | 100 Saaten × 10 Posen; Megastadt mit Wetter und Verkehr | gleich über G0–G6 | P | wie 4, über Saaten und Geräteklassen |
| 6 | ein Planet: 1 000 Koordinaten, nach Tagen Weltzeit und Edits | jede Uhrzeit und Jahreszeit, zwei Geräte, zwei Peers | P | Klassen-Diff ≤ 1 % an ≥ 99 % der Stichproben |
| 7 | ein Ort in 10 Epochen (−10⁹ … +10³ a) | dieselbe Epoche gleich auf beiden Geräten und nach Reload | P | Diff ≤ 1 % je Epoche; Zeitreise hin und zurück: Diff = 0 |
| 8 | Galaxie: 10¹¹ Systeme × Planeten × Äonen, fusionierte Welten | gleich ohne Zustands-Strom | P | 10 000 zufällige (System, Planet, Ort, Jahr): Diff ≤ 1 % an ≥ 99,9 % |

#### Schirm statt Sack

`same.entfaltung.schirm` — **HEUTE 0 / 7**

*misst:* Die Kosten eines Bildes hängen am Schirm, nicht an der Menge Welt dahinter — UND was er zeigt, hält dem Foto stand (sonst gewinnt die leere Stadt). Achse: Bauten im Blick 10² → 10⁷, Menschen bis 10¹⁰ je Welt.

*Beleg:* GTX stehend p95 16,8 ms an Wiese und Genesis; das Radeon-ABAB am Kopf fehlt (PFLICHT E), die Wiese trägt bis ~20 m, Häuser lesen als weiße Kästen. Das Blatt setzte HEUTE mit dem Preis „nur GTX" — die Karte nicht, solange ein Standardgerät fehlt.

*alte Karte:* studios.K3 · pipeline.K3 · profiband.K1

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Wiese und Genesis, Sicht 8 km | Wiese trägt bis ~20 m, Häuser als Kästen | P stehend | Frame p95 je Gerät, Wiese und Genesis, Ego und Third |
| 2 | 10³ Häuser im Blick (heute 300 am Marktplatz) | ≥ 50 % der Häuser im Blindtest gegen Fotos echter Altstädte plausibel | P; Inhalt ×10 kostet ≤ 10 % mehr | p95(×10) ÷ p95(×1) ≤ 1,10; Blindtest Bildpaar Spiel ↔ Foto |
| 3 | 10⁴ Gebäude und 10⁴ Menschen im Bild (Kreuzung einer Großstadt) | jeder Mensch mit eigenem Leib und Gang | P, Steigung ≤ 10 % | wie 2; Dichte-Histogramm gegen Foto einer Großstadt-Kreuzung |
| 4 | Skyline mit 10⁵ Gebäuden bis 30 km | Fensterlicht je Wohnung, Dunst; Silhouette und Nachtlicht-Statistik gegen Hongkong, Manhattan, Shanghai | P; ≤ 1,1 × leere Ebene derselben Pose | p95 Skyline ÷ p95 leere Ebene ≤ 1,10; Blindtest ≥ 40 % „Foto" |
| 5 | Tokio-Maß: 10⁷ Gebäude, 3,7·10⁷ Menschen, Blick aus 1 km und auf der Straße | Ströme als Verkehr und Menge; Luftbild ≥ 40 % „Foto" gegen Tokio | P, Abstieg ohne Kosten-Sprung > 10 % | wie 4 entlang des Abstiegs |
| 6 | Hyperstadt: 10⁷ Gebäude, 10⁹ Menschen über 1 000 km, Türme bis 2 km, Ebenen übereinander | aus jedem Fenster, jeder Ebene und 5 km Höhe glaubhaft; keine zwei Viertel gleich | P; Steigung 10⁷ → 10⁹ Menschen ≤ 10 % | p95 je Ebene und Höhe; Kosten-Kurve über zwei Größenordnungen flach; Blindtest ≥ 40 % |
| 7 | jede Pose einer Galaxie, 10¹⁰ Menschen je Welt | so wahr wie Sprosse 6 | P; Steigung über 10⁰ … 10⁹ Weltinhalt ≤ 10 % | Kosten-Kurve p95 über neun Größenordnungen bei fester Pose ≤ 1,10 |

#### Reise ohne Bruch

`same.entfaltung.reise` — **HEUTE 0 / 8**

*misst:* Wie weit und wie schnell der Spieler am Stück reist, während die Welt ihm vorauswächst: Anteil ganzer Bilder (Lücke ≤ 2 % gegen dieselbe Pose in Ruhe), Zittern, Pause. Achse: Strecke 1 km → 10⁵ Lichtjahre, je Sprosse eine Größenordnung.

*Beleg:* Sicht 8 km auf einer flachen Ebene ohne Krümmung und ohne Ursprungs-Versatz (Grep: nur ein Kommentar in netz-p2p.js:2126); Radeon gehend 66 %, fahrend 94 % der Bilder > 33 ms. Wo float32 zu zittern beginnt, ist nie gemessen.

*alte Karte:* lod.K2 · streaming.K1 · streaming.K2

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Gehen 1 km durch die Wiese | Bilder ganz, sichtbares Nachwachsen nur fern | P an G2 + G3 | Gang-Bahn: Anteil ganzer Bilder ≥ 98 % |
| 2 | Fahrt 30 km/h, 10 km durchs Dorf | ≥ 90 % der Bilder ganz | P | Fahrt-Bahn, Bild-Diff je Bild gegen Ruhe-Referenz |
| 3 | Fahrt 120 km/h, 100 km am Stück | ≥ 98 % ganz, kein Aufploppen in 50 m, Zittern ≤ 0,5 px | P | wie 2 über 100 km |
| 4 | Flug 1 000 km/h, 1 000 km (ein Kontinent) | Klimazonen wechseln entlang der Bahn, ganz bis 10 km Sicht | P | Lücken-Bilder ≤ 0,1 % |
| 5 | 40 000 km: einmal um den Planeten | Krümmung wahr: Horizont aus 1,7 m ≈ 4,7 km | P | Horizont-Distanz ±5 % gegen die Geometrie; die Reise schließt sich ohne Naht |
| 6 | Planet → Mond (3,8·10⁵ km), Landung | Mond aus der Bahnmechanik des Samens, kein Ladebild | P | Flug mit Landung: Zittern, Pause, Lücke wie 3 |
| 7 | ein Sonnensystem, 10¹⁰ km | Flug zwischen Planeten, Bahnen nach Kepler | P | Reise Planet A → B wie 3; Bahnlage gegen die analytische Lösung |
| 8 | eine Galaxie, 10⁵ Lj; Sprung zwischen Planeten und Epochen im Flug | jeder Stern ein Landeort; Ziel ganz ≤ 1 s, kein schwarzes Bild | P an G0–G7 | 100 zufällige Ziele: 100 % ohne Bruch nach den Maßen von 3 |

#### Rechnung ohne Zuschauer

`same.entfaltung.abwesenheit` — **HEUTE 0 / 7**

*misst:* Wer fortgeht und wiederkommt, findet die Welt, wie sie geworden wäre, obwohl in der Abwesenheit fast nichts gerechnet wurde. Achse: Wesen 10² → Galaxie, Abwesenheit Tag → Äonen.

*Beleg:* Tag jedes Bewohners = f(Same, t) (siedlung-bewohner.js:1881-1932), aber periodisch (mod 24, :1894), die Ankunft spielt nur 3 h nach (:3500); Ruhe ist Null (feld.K3, headless). Die Abwesenheits-Probe wurde nie gefahren; Bestand und Strom über Tage gibt es nicht.

*alte Karte:* feld.K3 · mensch.K2

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 118 Bewohner einer Test-Stadt, ein Tag | nach der Abwesenheit steht jeder, wo er gestanden hätte | P | Ort sehen, gehen, nach N h zurück: Lage jedes Bewohners gegen den Lauf mit Zuschauer ≤ 1 m |
| 2 | 10⁴ Wesen (Menschen, Tiere, Wuchs), 1 Tag | Widersprüche = 0 (niemand an zwei Orten, gefällt bleibt gefällt) | P | Klassen-Statistik Rückkehr ↔ Zuschauer-Lauf ≤ 5 %; Widerspruchs-Zähler = 0 |
| 3 | 10⁶: eine Metropole, 1 Jahr | Ströme, Märkte und Bauten wachsen nach Gesetz | P | wie 2 an 100 Stichproben; Bildpaar Stadtteil vorher ↔ nachher zeigt die Veränderung |
| 4 | 10⁸: ein Kontinent, 100 Jahre | Bevölkerung, Wälder und Flüsse verschieben sich gekoppelt | P | Statistik ≤ 10 % gegen Stichproben-Lauf mit Zuschauer; Widersprüche = 0 |
| 5 | 10¹⁰: ein Planet, Jahrhunderte | Städte wachsen und fallen, Kulturen wandern | P | 100 Zufallsorte nach 300 Jahren: Stadtgrößen folgen Zipf (Exponent 0,8–1,2), Wachstum je Stadt im Band historischer Kurven; ≥ 50 % der Orte zeigen im Bildpaar eine benennbare Veränderung |
| 6 | Äonen: 10⁶–10⁹ Jahre | Platten, Erosion und Evolution geschlossen verdichtet | P | Zeitsprung hin und zurück: Bild gleich (Diff ≤ 1 %) UND am Ziel anders — Küstenlinie an ≥ 50 % der Stichproben messbar verschoben, Rate unter der physikalischen Grenze; Küste und Biome im Band der Paläo-Rekonstruktionen an ≥ 90 % von 100 Saaten |
| 7 | eine Galaxie, jede Welt lebt ohne Zuschauer | Besuch nach beliebiger Zeit ohne Widerspruch | P | 1 000 Besuche an zufälligen (Welt, Ort, Zeit): Widersprüche = 0, Statistik ≤ 10 % |

#### Jede Saat eine eigene Welt

`same.entfaltung.vielfalt` — **HEUTE 0 / 7**

*misst:* Ob jede Saat eine Welt ergibt, die ein Mensch aus EINEM Bild wiedererkennt und deren Eigenheit eine Ursache hat — über alle Gesetze zugleich (Haus, Baum, Tier, Mensch, Wagen, Stadt, Kultur), im Spiel gezählt. Die Breite je Gesetz zählen die Arten-, Bau- und Gestalt-Leitern der Kapitel (R9); hier zählt, ob aus ihnen unterscheidbare Orte, Regionen und Welten werden. Rauschen besteht nicht: jede Unterscheidung braucht ihre Ursache (R10).

*Beleg:* Nie gemessen; Häuser lesen als weiße Kästen mit Fenstern. — KARTE: 0 — kein Erkennungs-Lauf gefahren.

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 10 Orte EINER Welt | jeder Ort aus einem Bild erkannt; das Merkmal hat eine Ursache (Gestein, Klima, Kultur) | P | aus einem Zufallsbild den richtigen von 10 Orten ≥ 80 % (Panel); der Prüfer nennt das Merkmal, Gegenlauf: Ursache getauscht → Merkmal weg ≥ 80 % |
| 2 | 10² Orte: Stadtteile und Biome mit eigenem Charakter | ≥ 3 Gesetze tragen den Unterschied zugleich (Bau, Wuchs, Tracht) | P | richtiger von 10 Zufalls-Orten aus 10² ≥ 80 %; Unterschied in ≥ 3 Domänen benannt |
| 3 | 10³ Orte, 10 Regionen einer Welt | Region aus einem Bild; Nachbar-Regionen gehen ohne Naht ineinander über | P | Region ≥ 80 %; Übergangs-Bilder werden zwischen die Nachbarn eingeordnet, nie zu einer dritten |
| 4 | 10 Welten aus 10 Saaten | jede Welt aus EINEM Bodenbild erkannt | P · Welt-Sprung ≤ 5 s | aus einem Zufallsbild die richtige von 10 Saaten ≥ 90 %; effektive Zahl der Wahrnehmungs-Cluster über alle Bilder ≥ 10 |
| 5 | 10² Welten | Eigenheit jeder Welt aus ihrer Saat erklärt (Stern, Schwere, Geschichte) | P | richtige von 10 Zufalls-Welten aus 10² ≥ 90 %; Ursachen-Probe Rang ≥ 0,7 |
| 6 | 10³ Welten, darunter die Erde und ihre Epochen | die Erd-nahen halten dem Foto stand, die fremden der Fremdwelt-Probe | P | Erd-nahe: 2AFC gegen Fotos ≤ 70 %; fremde: Fremdwelt-Probe (R10); Chao1 der Welt-Typen aus Zufalls-Sprüngen ≥ 10³ |
| 7 | 10⁴ Welten, ≥ 30 % jenseits jeder Erd-Epoche | jede Welt aus einem Bild erkennbar UND aus ihrem Gesetz erklärt | P | aus einem Zufallsbild die richtige von 10 Zufalls-Saaten aus 10⁴ ≥ 95 %; Fremdwelt-Probe ganz: Ursache Rang ≥ 0,7, Gegenlauf ≥ 80 %, Neuheit ≥ 30 % |

#### Die Tat bleibt

`same.entfaltung.akte` — **HEUTE 0 / 8** · Kern 1

*misst:* Was Spieler und KI-Bewohner tun, bleibt — für alle, über jede Gesetzes-Version — und kostet nach der Zahl der Taten, nie nach der Größe der Welt. Achse: Akte 10² → 10¹².

*Beleg:* Reload im echten Spiel: bild-diff 0,69 % (Radeon) / 0,71 % (GTX) mit Bau, Grube und Wasser im Bild (Speicher K4). 1 000 Edits 86 kB, Peers byte-gleich und Korpus 138 Stände nur headless; Bytes je Tat und eine Gesetzes-Version im Bild nie gemessen. — KARTE: Kern 1 — Bildpaar vor ↔ nach Reload an beiden Geräten grün (speicher.K4); der Bild-Preis in dieser Szene ist an der Radeon nicht gemessen.

*alte Karte:* feld.K2 · feld.K4 · tore.K3 · speicher.K1 · speicher.K2 · speicher.K3 · speicher.K4 · speicher.K5

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 ◐ | 10² Taten einer Sitzung | nach dem Reload steht jede Tat sichtbar an ihrem Ort | P | Bildpaar vor ↔ nach Reload ≤ 1 % Diff mit Pflicht-Inhalt, beide Geräte |
| 2 | 10³ Edits eines Spielers | Stand ≤ 100 kB, Ankunft unverändert | P | Bildpaar ≤ 1 %; Median ≤ 100 B je Tat; Ankunft mit ↔ ohne Taten |
| 3 | 10⁴ Edits, 2 Peers, jede alte Version | gleich ohne Zustands-Nachricht, alte Stände laden | P | Bild zweier Gäste ≤ 1 % Diff; Anteil ladender alter Stände = 100 % |
| 4 | 10⁶ Taten von 10³ Spielern, eine Stadt | keine Tat geht bei gleichzeitigen Taten verloren, geladen nur Taten im Schirm | P am Ort mit 10⁵ fremden Edits; Speicher ∝ Taten, nie ∝ Fläche | Stichprobe 1 000 Taten sichtbar 100 %; Bytes-Kurve gegen Taten und gegen Fläche |
| 5 | eine Gesetzes-Version weiter (N → N+1) | die alte Welt bleibt wiedererkennbar, jede Tat am selben Ort | P | 100 Saaten: Welt-Erkennung (Richter von vielfalt Sprosse 7) ≥ 95 %, Taten-Lage 100 % |
| 6 | 10⁹ Akte: 10⁵ Spieler + 10⁷ KI-Bewohner, ein Planet | Konflikte deterministisch aufgelöst | P, ≤ 1 MB je Ankunft | 1 000 Zufallsorte: Ankunft, Sichtbarkeit, zwei Gäste byte-gleich |
| 7 | 10¹² Akte, 10 Jahre Gesetzes-Wandel (≥ 50 Versionen) | ein Werk von heute steht in 10 Jahren, gealtert nach gedaechtnis.alter · Besitz signiert, Erbe über Generationen von Spielern im Spiel lesbar | P | Korpus aller Versionen eines Jahrzehnts: 100 % laden und zeigen ihr Alter · Besitzkette eines Werks am Ort abrufbar und wahr |
| 8 | eine Galaxie: jede Tat jedes Spielers je | an jeder Koordinate | Bild ganz ≤ 1 s; Bytes je Welt ∝ Taten | 10 000 zufällige Taten: sichtbar 100 %, Ankunft ≤ 1 s |

### Das Maßstab-Kontinuum

*Referenz-Korpus (R6, R11):* Fotos und Mikroskopie je Maßstab, Satelliten- und Teleskopbilder

#### Die Spanne ohne Bruch

`same.massstab.spanne` — **HEUTE 0 / 9**

*misst:* Größte zusammenhängende Spanne der Bildbreite, über die ein Flug in beide Richtungen keine Stufe verrät: keine Lücke, kein Ladebild, Pop ≤ 0,5 %, Jitter < 0,5 px, kein Farbsprung > ΔE₀₀ 3, und P. Achse: Größenordnungen 3 → 31 (bis zu fremden Galaxien).

*Beleg:* Unter Sprosse 1: die Wiese trägt bis ~20 m, der Fern-Saum ist ROT (Kohärenz 0,60, Radeon); der Himmel rechnet eine Kugel (foundry-core.js:284, 6 360 km), der Boden ist eine flache Ebene — ein Zwilling, sichtbar ab ~10 km Auge. Gemessen ohne Bruch ist keine Spanne.

*alte Karte:* ferne.K2 · ferne.K3 · material.K3 · lod.K1 · lod.K2 · lod.K3 · lod.K4 · lod.K5 · pipeline.K2

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 3 Größenordnungen: Bildbreite ~1 m bis ~1 km | Wiese, Baum, Haus, Gelände wechseln Stufen unsichtbar | P | N = 20 Saaten × Steigflug 0,5 m → 700 m Auge in 30 s, hin und zurück: alle Bruch-Bedingungen gehalten |
| 2 | 5: 1 cm bis 1 km; Sicht bis ~20 km ohne Kante | Halm und Blatt mit Parallaxe und Eigenschatten; Landschaft ohne Farbsprung | P | wie 1, Spanne 1 cm → 1 km |
| 3 | 8: 1 mm bis 100 km; der Planet krümmt sich | Korn als Körper; Horizont sinkt wie auf einer Kugel | P | wie 1; Horizont-Absenkung aus 10 km gegen √(2h/R) ±10 % |
| 4 | 10: Korn bis ganzer Planet (10⁷ m) | Atmosphäre von innen wird Atmosphäre von außen, Tag-Nacht-Grenze, Wolken, Ozeane | P | Flug Boden → Orbit → Boden auf der anderen Seite, N = 20 Saaten |
| 5 | 13: bis Sonnensystem (10¹³ m), wahre Abstände | Planeten in Bahnen aus der Mechanik des Samens, nicht geschrumpft | P | Bahnabstand ±1 %; Jitter eines Objekts 10¹² m vom Ursprung < 0,5 px bis zum Ranflug auf 1 m |
| 6 | 17: bis Nachbarsterne (10¹⁷ m) | jeder Lichtpunkt ein System mit Planeten | P | Flug zu 10 zufälligen Nachbarsternen mit Landung, Bruch-Bedingungen gehalten |
| 7 | 21: bis Galaxie (10²¹ m) | Stern → Punkt → Feld → Arm; Gesamtfluss bleibt beim Wegzoomen | P | Spanne 1 mm → 10²¹ m; Gesamtfluss ±5 %, kein Aufblitzen |
| 8 | 26: 10 µm bis 10²¹ m, beide Richtungen | dieselben Gesetze auf jeder Stufe, jede Stufe begehbar | P | EIN Flug Pollenkorn → Galaxie → Pollenkorn eines anderen Planeten in ≤ 120 s, N = 20: Pop ≤ 0,1 % |
| 9 | 31: 10 µm bis 10²⁶ m — andere Galaxien, Haufen, das kosmische Netz | jede Galaxie ein Ziel mit eigenen Sternen und Welten, keine Kulisse | P | Flug zu 10 Zufallsgalaxien mit Landung auf einem Planeten dort, alle Bruch-Bedingungen gehalten; Verteilung der Galaxien im Flug gezählt gegen Durchmusterungs-Karten im Band |

#### Die Tiefe am kleinen Ende

`same.massstab.nahe` — **HEUTE 0 / 7**

*misst:* Wie viel echte Struktur das Bild bei kleiner Bildbreite trägt, gegen Makro- und Mikroskop-Fotos derselben Bodenklasse, an zufälligen Orten. Achse: Bildbreite 2 m → 10 µm.

*Beleg:* Ungemessen; kleinstes Auge 0,25 m (bild-sicht.js:3861), die Armlänge-Pose der alten Karte prüft Pixel, nicht Spektrum.

*alte Karte:* material.K2

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 2 m (Blick vor die Füße), N = 100 Orte | Boden mit Halmen und Steinen | P | Spektrum gegen Foto der Bodenklasse: Energie über 1/20 der Bildbreite ≥ 50 % der Referenz in ≥ 80 % |
| 2 | 50 cm | einzelne Halme, Kiesel, Laubstreu | P | wie 1 gegen Foto 50 cm; Gram-Statistik im Band |
| 3 | 10 cm | Blattadern, Rindenrisse, Bodenkrümel mit Eigenschatten | P | wie 1 gegen Makrofoto 10 cm |
| 4 | 1 cm | Ameise, Korn, Moospflänzchen | P | bei 1 cm Kamera-Versatz: optischer Fluss gegen Tiefe eines Makro-Stereopaars, Fehler ≤ 20 % |
| 5 | 1 mm | Sandkörner mit Form und Farbe aus dem Gestein | P | Korngrößen am Ufer gegen die Sortierung des Flusses: Wentworth-Klasse richtig an ≥ 90 % von 100 Uferorten |
| 6 | 0,1 mm, überall auf jedem Planeten | Korn, Kristall, Pollen aus dem Gesetz des Ortes | P | N = 100 Orte auf 10 Planeten-Saaten: Bildvergleich gegen Makrofoto plausibel ≥ 90 % |
| 7 | 10 µm: der Mikroskop-Blick | Zelle, Pollenwand, Milbe — das Leben des Ortes | P | N = 100 Orte: gegen Lichtmikroskopie derselben Klasse plausibel ≥ 80 %; das Leben passt zum Biom |

#### Der Sprung

`same.massstab.sprung` — **HEUTE 0 / 8**

*misst:* Sekunden bis zum ganzen Bild (≤ 2 % Lücke) nach einem Sprung im laufenden Spiel an einen nie besuchten Ort, Maßstab oder Zeitpunkt. Achse: Reichweite 1 km → jeder Ort der Galaxie, Zeit 30 s → 1 s.

*Beleg:* Teleport 1 km: p95 33,8 ms (Radeon) / 49,9 ms (GTX), die Welt steht nach 14–45 s (streaming.K3 1/2) — der Preis von Sprosse 1 reißt an der GTX.

*alte Karte:* tore.K1 · tore.K2 · streaming.K3

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Teleport 1 km | Bild ganz, die Welt steht | ganz ≤ 30 s, p95 ≤ 33 ms an beiden Geräten | Spielgang-Station Sprung: p95, t(ganz), Lücke |
| 2 | Teleport 1 km | wie 1 | ganz ≤ 5 s, P | wie 1 an beiden Geräten |
| 3 | Zufallsort im Umkreis 10–100 km | volles Bild am Boden | ganz ≤ 2 s, P | N = 20 Sprünge: p95 t(ganz) |
| 4 | jeder Ort eines Planeten (10⁸ Orte à 100 m) | volles Bild am Boden | ganz ≤ 2 s, P | wie 3, Ziel überall auf dem Planeten |
| 5 | eine andere Zeit desselben Orts (10²–10⁹ a zurück) | Land, Leben und Siedlung jener Zeit | ganz ≤ 3 s, P | 10 Epochen × 10 Orte |
| 6 | ein anderer Planet des Systems | Himmel, Schwerkraft und Leben nach seinem Gesetz | ganz ≤ 2 s, P | 20 zufällige Planeten |
| 7 | ein beliebiger Stern der Galaxie (10¹¹) oder einer anderen Galaxie | volles Bild am Boden eines seiner Planeten | ganz ≤ 2 s, P | N = 20 zufällige Sterne |
| 8 | jeder Ort, Maßstab (10 µm … 10²⁶ m) und Zeit, als Ort-Wort oder Satz an die KI | volles Bild | ganz ≤ 1 s, 0 B, P | N = 100 Zufalls-Sprünge: p95 ≤ 1 s bis ganz, danach Frame p95 ≤ 33 ms |

#### Die Physik des Maßstabs

`same.massstab.physik` — **HEUTE 0 / 6**

*misst:* Ob dieselbe Physik je Größe das Richtige tut, gegen die dimensionslosen Gesetze (Reynolds, Bond, Froude, Kepler) — Fähigkeit, nicht Liste. Achse: 1 → 12 Größenordnungen Körpergröße.

*Beleg:* Körper- und Fahrt-Physik im Mensch-Maßstab vorhanden, gegen die Formel ungemessen; keine Physik über den Maßstab.

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Größenordnung (0,5–5 m: Mensch, Wagen, Kiste) | Fall, Stoß, Fahrt plausibel | P | Fallzeit aus 10 m gegen √(2h/g) ±5 %; Bremsweg gegen μ ±10 % |
| 2 | 3 (Ameise bis Haus) | die Ameise überlebt den Sturz, der Mensch nicht | P | Endgeschwindigkeit eines 5-mm-Körpers ±20 % gegen ~6 m/s; Sturzfolge passend zur Größe |
| 3 | Flüssigkeit über den Maßstab | Tropfen unter der Kapillarlänge kugelig, darüber flach | P | Tropfenform gegen Bond-Zahl ±15 % bei 0,5 / 2,7 / 10 mm |
| 4 | Bahn (Mond, Raumschiff) | Umlauf aus der Schwere des Samens, nicht aus Schienen | P | Umlaufzeit gegen Kepler ±1 %; Wurf aus dem Orbit fällt, wo die Mechanik sagt |
| 5 | Planet als Körper | Gezeiten aus Mond und Sonne, Abplattung aus Drehung | P | Tidenhub-Periode ±5 %; Abplattung ±10 % |
| 6 | 10 µm bis 10⁷ m, jede Größe | EIN Gesetzessatz trägt Staub, Ameise, Mensch, Schiff, Mond | P | N = 100 Körper log-gleichverteilt über 12 Größenordnungen: Verhalten im Band der dimensionslosen Gesetze ≥ 90 % |

### Spur, Verfall und Gedächtnis

*Referenz-Korpus (R6, R11):* Verwitterungs-Reihen, datierte Fotos derselben Bauten, Grabungsprofile

#### Alter des Gebauten

`same.gedaechtnis.alter` — **HEUTE 0 / 8**

*misst:* Ob alles Gebaute sein Alter nach Stoff, Lage, Klima und Gebrauch wahr trägt — als EINE Dosis-Faltung, die nicht sättigt, sondern bis zum Bruch und zur Rücknahme durch die Natur läuft. Achse: Zeit 30 Tage → 10⁶ Jahre.

*Beleg:* EIN Alters-Kern (siedlung-satz.js:843-967), 3 alternde Stoffe × 5 Schichten (bau-vorlagen.js:1650), sättigt nach 10–300 Tagen; Tag 30 Δ Albedo 0,038 (1 Klasse), Tag 60 Holz S 0,72 → 0,29, Rost 23° — alles headless (stoffe.K4 an d3708675). Die Nässe-Dosis ist ein Zähler im Stand (bild-himmel.js:2663), keine Funktion von t.

*alte Karte:* stoffe.K4

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Werk, 3 Stoffe, 30 Spieltage | Farbe ändert sich nach Nässe und Lage | P | Bildpaar vor ↔ nach 30 d: Δ Albedo ≥ 0,02, Nord- und Wetterseite verschieden, beide Geräte |
| 2 | ein Dorf, jedes Werk, 1 Jahr | Holz vergraut, Eisen rostet nur im Regen, Moos nord, Flechte oben, Algen im Regenlauf | P | nach 60 d und 1 a: Soll-Farbe je Schicht im Band, über Reload gleich |
| 3 | jede Fläche einer Stadt (10⁴ Werke), 10 Jahre | Gebrauch: Schwelle ausgetreten, Ruß, Rostfahne; Schäden wachsen statt zu sättigen | P | Blind-Paarvergleich gegen Fotos 10 Jahre alter Bauten: ≥ 60 % schätzen gleich alt |
| 4 | Großstadt (10⁵ Werke) mit Altersmischung, 100 Jahre | Dach sackt, Fenster brechen, Kletterpflanzen, Schutt; das Baualter ist lesbar | P | Panel schätzt Baualter von 20 Stichproben-Werken: Fehler ≤ Faktor 2 |
| 5 | jeder Stoff des Gesetzes, 300 Jahre | Stoffe brechen in ihrer Reihenfolge (Holz < Stahlbeton < Stahl-Hochhaus < Mauer), Pfad aus Zusammensetzung | P | N = 50 Stoff-Saaten: Anteil stehender Werke nach 50/150/300 a im Ingenieurs-Band ≥ 80 % |
| 6 | Megastadt (10⁶–10⁷ Werke), 10³ Jahre | Ruinenfeld unter Wald, jeder Bruch bleibt oder ist nachweislich geräumt; Klima-Signatur | P | Blind-Bildvergleich gegen Angkor, Tikal, Wüstenstädte ≥ 50 % Verwechslung; Panel ordnet Klimazone ≥ 70 %; Ruinenstadt lädt ≤ 5 s |
| 7 | jede Siedlung jeder Saat, 10⁴ Jahre | nur Hügel und Bewuchs-Merkmale | P | Luftbild: Panel findet ≥ 60 % der verschwundenen Siedlungen |
| 8 | jeder Planet, fremde Umwelt (Säure, Sand, Vakuum, Methan), 10⁶ Jahre | dieselbe Faltung mit der Dosis des fremden Planeten | P | N = 50 Planeten: Abtrag je Zeit im Band der Planetologie; Panel liest den Planeten-Typ aus der Ruine ≥ 70 % |

#### Spur des Gangs

`same.gedaechtnis.pfad` — **HEUTE 0 / 6**

*misst:* Ob die Bewegung aller Körper (Spieler, Bewohner, Tiere, Fahrzeuge) die Landschaft dauerhaft formt — vom Trampelpfad zur Fernroute. Achse: Leiber 10⁰ → 10¹⁰.

*Beleg:* Trampelpfad aus dem Tritt der Leiber und Peers (dirigent-takt.js:1163, netz-p2p.js:2938): 100 Gänge → Büschel 13 → 3, daneben 17 → 17 — headless (stoffe.K4).

*alte Karte:* stoffe.K4

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Weg, 1 Spieler, 100 Gänge | Gras-Dichte −60 % auf dem Weg, daneben gleich, über Reload | P | Büschel auf / neben dem Weg vor ↔ nach im Bild, beide Geräte |
| 2 | ~10² Leiber eines Dorfs | Pfade entstehen, wo Ziele sie ziehen | P | nach 30 Spieltagen: Pfad-Pixel auf Kürzesten-Weg-Linien zwischen Zielen ≥ 70 % |
| 3 | 10⁴ Leiber und Fahrzeuge, eine Stadt, 1 Jahr | Abkürzung über den Rasen, Wildwechsel, Spurrillen | P | Netzform (Knotengrad, Abkürzungs-Anteil) gegen Luftbilder echter Parks im Band |
| 4 | 10⁶ Leiber, Region 10⁴ km², 100 Jahre | Erde → Kies → Pflaster, Hohlwege | P, Kosten an Schirm, nie an Leibern | Hohlweg-Tiefe nach 100 a im Band 0,5–3 m; Blindvergleich gegen Foto |
| 5 | 10⁸ Leiber, Kontinent, 10³ Jahre | Wegenetz wird Straßennetz, Siedlungen an Kreuzungen und Furten | P | N = 30 Saaten: Hauptstraßen folgen alten Pfaden (Überdeckung ≥ 60 %) |
| 6 | 10⁹–10¹⁰ Leiber, Planet, 10⁴ Jahre | Handels- und Pilgerrouten aus dem Orbit lesbar | P | Bild aus 10 km Höhe: Panel erkennt Fernrouten in ≥ 70 % der Saaten |

#### Kulturschichten

`same.gedaechtnis.schicht` — **HEUTE 0 / 6**

*misst:* Ob unter dem Spieler die Vergangenheit des Orts in Schichten liegt, die er ausgraben kann, und ob sie zur bereisbaren Geschichte passt. Achse: 1 Grube → jeder Planet über Äonen.

*Beleg:* Nichts: Boden ohne Geschichte.

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Grube an einem Ort | Humus über Brandschicht über gewachsenem Boden | P, Graben ohne Bild-Riss | Grubenwand: ≥ 3 unterscheidbare Schichten im Bild |
| 2 | ein Siedlungshügel, 10³ Jahre | Dicke nach Rate (~1 cm/a), Zerstörungs-Schübe, Scherben je Schicht | P | Schichtdicke / Siedlungsdauer im Band 0,5–2 cm/a |
| 3 | jede Siedlung einer Region, 5 000 Jahre | Tells wachsen 10–20 m, Funde passen zur Epoche | P | Hügelhöhe gegen Besiedlungsdauer an N = 20 im Band |
| 4 | eine Stadt mit 10+ Epochen übereinander | jede Schicht widerspruchsfrei zur Geschichte, die die Zeitreise zeigt | P | Schicht k bei t₀ ↔ Oberfläche bei t_k: Mauer-Linien ≥ 90 %; Reihenfolge an ≥ 95 % von 100 Orten |
| 5 | Planet, 10⁵ Jahre Menschenzeit, jede Megastadt | Gräber, Horte, Wracks, Tunnel unter Schutt, datierbar | P | N = 50 Grabungen: plausible Abfolgen ≥ 90 % |
| 6 | jeder Planet, Äonen, fremde Zivilisationen | Kulturschicht wird geologische Schicht, fremde Bauweisen fossilisieren nach ihrer Chemie | P | Bohrkern-Bild: Panel erkennt den Horizont ≥ 70 % auf N = 20 Planeten |

### Ankunft, Geräte und Zugang — der Preis selbst

*Referenz-Korpus (R6, R11):* keiner — hier richten Uhr, Zähler und Netz-Mitschnitt

#### Ankunft

`same.preis.ankunft` — **HEUTE 0 / 8** · Kern 1

*misst:* Sekunden vom Klick (leere Platte, Netz der Sprosse) bis zur ersten angenommenen Eingabe in einem ganzen Bild (≤ 2 % Lücke gegen 60 s Ruhe) im vollen Bild der Auslieferung, beim Welt-Umfang der Sprosse. Achse: 60 s → 1 s, Dorf → viele Planeten, Standardgerät → G0–G7. Ab der Klasse Stadt ist ≤ 5 s Teil von P jeder Inhalts-Sprosse (R8); die Zeit eines Sprungs im laufenden Spiel stuft same.massstab.sprung.

*Beleg:* GTX kalt 16,6 s (16,1–17,0) am 18.10., Zweit-Boot 12,0 s, Haupt-Faden bis zum Bild 97 % belegt; Radeon ≈ 11 s am 17.10.; lokaler Server, nie gedrosselt (PFLICHT B); am Kopf nicht nachgemessen, die Station hat sich seither geändert. — KARTE: 0 — kein Lauf des Richters am Kopf (Z2). Kern 1: ≤ 60 s kalt ist an beiden Geräten gemessen. Sprosse 2 nicht im Kern: das ganze Bild (≤ 2 % Lücke) ist nur an der Radeon gebucht (ankunft.K2).

*alte Karte:* pipeline.K4 · pipeline.K5 · ankunft.K1 · ankunft.K2 · ankunft.K3 · ankunft.K4 · ankunft.K5

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 ◐ | eine Wiese am Spawn | Bild erscheint, Welt teilweise | ≤ 60 s kalt an beiden Geräten, lokales Netz | t(Kontrolle) von außen, ≥ 4 Kalt-Boots je Gerät |
| 2 | Dorf (10² Häuser) | Bild ganz, ≤ 2 % Lücke | ≤ 20 s kalt an beiden Geräten | t(Kontrolle) + Bild-Diff gegen 60 s Ruhe, ≥ 4 Boots je Gerät |
| 3 | Dorf | ganz nach 180°-Drehung, volles Bild der Auslieferung (keine Klasse abgeschaltet) | ≤ 10 s kalt, warm ≤ 3 s | wie 2, plus Drehung 2 s nach der Kontrolle |
| 4 | Stadt (10³ Häuser, 10³ Bewohner) | ganz in jeder Richtung, volles Bild der Auslieferung | ≤ 5 s kalt an beiden Geräten, warm ≤ 1,5 s | wie 3 in vier Richtungen |
| 5 | Stadt (10⁴ Häuser) | wie 4 | ≤ 5 s kalt an G1–G6 über 4G (9 Mbit/s) | je Klasse ein reales Gerät, Netz gedrosselt |
| 6 | Megastadt (10⁷ Bewohner wirkend), Horizont 10 km ganz | Bild gegen 5 min Ruhe ≤ 2 % | ≤ 2 s kalt an G1–G7 über 4G, warm ≤ 0,5 s | wie 5 |
| 7 | Stadt jenseits Tokio (≥ 4·10⁸) oder Planet, zufälliger Ort | wie 6 | ≤ 1 s kalt an G1–G7 über 3G (1,6 Mbit/s) | 20 zufällige (Same, Ort): Median und p95 t(ganz) |
| 8 | viele Planeten, jede Epoche | wie 6 je (Planet, Epoche) | ≤ 1 s kalt auf G0–G7 über 3G, auch ohne WebGPU | 20 zufällige (Same, Planet, Epoche): Median, p95, Lücke |

#### Bild-Takt über die Gerätespanne

`same.preis.takt` — **HEUTE 0 / 7**

*misst:* Nach Verbreitung gewichteter Anteil aller Geräte, auf denen die Welt läuft UND Frame p95 ≤ 33 ms (oben ≤ 16,7 ms, VR ≤ 11,1 ms) in Bewegung hält — beim Umfang der Sprosse und im vollen Bild der Auslieferung (keine Klasse abgeschaltet, kein Sparmodus). Wie wahr das Bild ist, richten die Inhalts-Leitern. Achse: Standardgerät stehend → ≥ 95 % der Geräte der Menschheit.

*Beleg:* GTX stehend p95 16,8 ms (18.10.); Radeon gehend 66 %, fahrend 94 % der Bilder > 33 ms; das Radeon-ABAB am Kopf steht aus (PFLICHT E). — KARTE: 0 — der Stand ist nur an der GTX gemessen, an der Radeon am Kopf nicht; kein Kern.

*alte Karte:* feld.K3 · streaming.K4 · profiband.K1 · profiband.K2 · profiband.K3 · profiband.K4

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Wiese, stehend, Ego | volles Bild der Auslieferung | p95 ≤ 33 ms stehend an beiden Geräten | werkbank lauf, 4 Boots je Gerät |
| 2 | Wiese + Genesis, Ego + Third, stehend | volles Bild, keine Klasse abgeschaltet | p95 ≤ 33 ms stehend an G2 und G3 in jeder Zelle | ABAB an beiden Geräten |
| 3 | Gehen, Sprint, Fahrt, Sturm, Dorfgasse | volles Bild | p95 ≤ 33 ms in jeder Bewegungszelle an G2 + G3, 0 Frames > 100 ms | Spielgang-Bahnen, 4 Sitzungen je Gerät |
| 4 | Stadt mit 10³ Bewohnern | volles Bild | ≤ 16,7 ms an G2 + G3, ≤ 33 ms an G4; Reichweite ≥ 50 % | Bahn durch die Stadt, Handy per Fern-Debug |
| 5 | Stadt 10⁴ Häuser | volles Bild | ≤ 33 ms an G0–G6 (≥ 85 % gewichtete Reichweite) | Spielgang je Klasse, Anteil der Klassen im Preis |
| 6 | Megastadt 10⁷ wirkend, 10⁵ im Blick vom Turm | volles Bild | ≤ 16,7 ms an ≥ 90 % Reichweite, VR ≤ 11,1 ms je Auge | wie 5, plus VR-Sitzung mit Kopfbewegung |
| 7 | Planet von Orbit bis Gras, Stadt jenseits Tokio, jede Epoche | volles Bild an jedem Ort | ≤ 16,7 ms an ≥ 95 % der Geräte | 20 zufällige (Same, Ort, Epoche) je Klasse, Anteil gehalten |

#### Null Download

`same.preis.bytes` — **HEUTE 0 / 7**

*misst:* Bytes über das Netz gegen den erlebten Welt-Umfang — der Preis hängt am Schirm, nie an der Welt; der Erd-Schlüssel (R4) zählt mit. Achse: 50 MB → 0 B je neuer Welt. Heap und Grafikspeicher stuft same.preis.speicher.

*Beleg:* ≈ 12,9 MB roh Stamm + Kerne (64 Dateien 9,1 MB + 10 Kerne 3,75 MB), vendor 2,3 MB — eine Summe von Dateigrößen, kein Netz-Mitschnitt. — KARTE: 0 — der Richter (Netz-Mitschnitt des Kalt-Boots) wurde nie gefahren; die Datei-Summe ist eine obere Schranke, kein Lauf (Z2).

*alte Karte:* pipeline.K5

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | eine Welt | Gesetz statt Assets | ≤ 50 MB roh über das Netz, kein Installer | Netz-Mitschnitt des Kalt-Boots an beiden Geräten |
| 2 | Dorf + Studios | volles Bild der Auslieferung | ≤ 20 MB roh | Netz-Mitschnitt des Kalt-Boots und des ersten Studio-Besuchs |
| 3 | Dorf | volles Bild | ≤ 5 MB komprimiert bis zur Kontrolle | Netz-Mitschnitt bis zur Kontrolle |
| 4 | Stadt, offline nach Erstbesuch | offline gleiches Bild (Diff ≤ 1 %) | ≤ 5 MB komprimiert, zweiter Besuch 0 B | zweiter Besuch im Flugmodus: Netz-Bytes, Bild-Diff |
| 5 | Megastadt | wie 4 | ≤ 3 MB bis zur Kontrolle | Netz-Mitschnitt an der Megastadt |
| 6 | Planet, alle Epochen, alle Arten | wie 4 an 20 Zufallsorten | Gesamtcode ≤ 50 MB komprimiert, ≤ 1 MB bis zur Kontrolle | Netz-Mitschnitt an 20 Zufallsorten |
| 7 | viele Planeten, Evolutionen, jede Epoche | wie 4 | neuer Planet, Epoche, Art = 0 B; einzig der Erd-Schlüssel wiegt, und er ist gezählt | 20 neue Planeten: Netz-Bytes je Sprung = 0 |

#### Jedes Verb über jede Eingabe

`same.preis.eingabe` — **HEUTE 0 / 7**

*misst:* Anteil der Verben, der über jede Eingabe-Art (Tastatur/Maus, Gamepad, Finger, Stimme, Hände im Raum) erreichbar ist, mit Latenz Eingabe → Pixel — oben: ein per Satz erschaffenes Verb ohne Hand-Arbeit. Achse: 1 → 5 Eingaben, v1-Verben → Verben, die es gestern nicht gab.

*Beleg:* Tastatur/Maus und Gamepad mit Totzone und freier Belegung (koerper-bewegung.js:2413-2434); kein Touch (nur ein pointerdown-Stempel), WebXR und Spracherkennung 0 Treffer. — KARTE: 0 — Eingabe → Pixel an der Radeon Ego gehend 235 ms, Third 81,6 ms (leib.K1 ROT) gegen ≤ 100 ms; der v1-Pfad ist nur an der GTX gebucht (spielgang.K3).

*alte Karte:* leib.K1 · leib.K5 · spielgang.K3

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Tastatur + Maus | v1-Verben erreichbar | Eingabe bis Pixel ≤ 100 ms | v1-Pfad aus aufgenommenen Eingaben, INP |
| 2 | + Gamepad, Belegung frei | v1-Verben über beide | INP ≤ 200 ms an G2 + G3 | v1-Pfad je Eingabe, Anteil erreichter Verben |
| 3 | + Finger | 100 % der v1-Verben, Treffer der Finger-Ziele ≥ 98 % | INP ≤ 100 ms an G4 | v1-Pfad am Handy nur per Finger, Fehltipp-Quote |
| 4 | + Stimme | 100 % der v1-Verben | Wort bis Wirkung ≤ 1 s | v1-Pfad nur per Stimme |
| 5 | + Hände im Raum (VR) | 100 % der Verben, Hände greifen Dinge | Bewegung bis Photon ≤ 20 ms, ≤ 11,1 ms je Bild | VR-Sitzung mit Händen; SSQ unter Schwelle |
| 6 | jedes Verb der vollen Welt (Sport, Fahrzeug, Erschaffen, Zeitreise) | 20 zufällige Studio-Verben × 5 Eingaben ≥ 95 % | wie 3–5 | Stichprobe, Anteil erreicht |
| 7 | ein Verb, das es gestern nicht gab | per Satz erschaffenes Verb sofort über alle 5 Eingaben | 0 Zeilen Hand-Arbeit je Verb | 20 per Satz erzeugte Verben × 5 Eingaben ≥ 95 % |

#### Zugang mit fehlendem Sinn

`same.preis.zugang` — **HEUTE 0 / 7**

*misst:* Anteil der Aufgaben, die ein Spieler mit je einem fehlenden oder geschwächten Sinn ohne fremde Hilfe schafft — gerichtet durch Läufe, die nur den verbleibenden Kanal erhalten; oben an Dingen aus Zufalls-Saaten, die niemand beschrieben hat.

*Beleg:* Untertitel aus dem Klang-Gesetz 39/39, Farbsicht-Modus (Deuteranopie min ΔE 31,8, bild-kosten.js:3928-3931), Komfort-Regler, DE/EN aus EINER Tafel; kein Screenreader-Kanal, keine Beschreibung der Welt in Sprache. — KARTE: 0 — Untertitel 39/39 und Farbsicht ΔE 31,8 sind headless gebucht (spielgang.K4, K5), im echten Fenster nie gefahren (R2).

*alte Karte:* spielgang.K4 · spielgang.K5

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Text der Oberfläche | DE/EN aus einer Tafel | 0 zusätzliche Kosten | harte UI-Zeilen = 0 |
| 2 | taub und farbschwach | jedes Klang-Ereignis hat seine Zeile; Klassen-Grenzen ΔE ≥ 10 unter Deuteranopie; Bewegungs-Komfort | ≤ 0,1 ms je Bild | Klang-Ereignisse mit Zeile; ΔE min unter Machado-Simulation am Ausgabe-Bild |
| 3 | + motorisch: Ein-Hand, Assist | v1-Pfad mit einer Hand | 0 Bild-Kosten | v1-Pfad mit halbierter Tastenmenge, Anteil Schritte |
| 4 | + sehschwach (20/200) | v1-Pfad bei Unschärfe am Ausgabe-Bild | ≤ 1 ms je Bild | Lauf mit unscharfem Bild: Anteil Schritte in ≤ 5 min |
| 5 | + blind (Welt beschreibt sich aus dem Gesetz), + Ein-Schalter | v1-Pfad nur per Ton und Ansage bzw. einem Schalter | Beschreibung ≤ 1 s, Abtastung ≤ 3 s je Verb | Läufe NUR mit Audio/Text bzw. EINEM Schalter: Anteil Schritte, Zeit |
| 6 | Stadt und Zufalls-Saaten | Beschreibung eines nie gesehenen Dings stimmt (Name, Lage, Gefahr) | wie 5 | 20 zufällige Stadt-Aufgaben je Sinn-Profil ≥ 90 % |
| 7 | Planet und Epochen: jede Reise, jeder Sport, jedes Erschaffen, auch eben per Satz Entstandenes | 20 Aufgaben × 5 Sinn-Profile an zufälligen (Same, Planet, Epoche) | wie 5 | Anteil geschafft ≥ 95 % je Sinn-Profil in Kanal-Läufen |

#### Die Sitzung hält

`same.preis.ausdauer` — **HEUTE 0 / 6**

*misst:* Spieldauer am Stück ohne Drift (p95 der letzten 5 min ≤ erste × 1,05), ohne Speicherwachstum, ohne thermische Drosselung, mit begrenztem Akku. Achse: 1 min → Tage.

*Beleg:* 1,06 min Spielgang an der Radeon ohne Absturz, aber ROT: Bild-p95 67,2 ms, Heap 290 → 486 MB (+185 MB/min), VRAM nach GC 135,6 → 159,4 MB (profiband.K5). — KARTE: 0 — die Messung steht ROT.

*alte Karte:* spielgang.K1 · streaming.K5 · profiband.K5

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 min Spielgang | kein Absturz, volles Bild | Heap-Steigung ≤ 50 MB/min an beiden Geräten | Spielgang am Stück mit Heap-Kurve |
| 2 | 5 min, Weg ≥ 1 km | Heap-Drift ≤ 5 MB/min, Bild am Ende = Anfang | p95 ohne Drift an beiden Geräten | 5-min-Spielgang |
| 3 | 20 min, Weg ≥ 5 km, Tor, Nacht | VRAM-Drift ≤ 2 MB | an G2 + G3 | 20-min-Spielgang, beide Geräte |
| 4 | 60 min | wie 3 | Handy G4 ohne Drosselung > 20 %, Akku ≤ 25 %/h | 60-min-Spielgang am realen Handy |
| 5 | 4 h: Megastadt, Fahrt, Sprünge | wie 3 | G1–G7, Akku ≤ 20 %/h, VR ohne Hitze-Abbruch | 4-h-Spielgang je Klasse |
| 6 | Tage, viele Planeten und Epochen | Speicher kehrt nach jedem Sprung zurück (≤ 2 %), Bild an Tag 3 = Tag 1 | wie 5 | Spielgang mit 100 Sprüngen |

#### Speicher, Wärme, Akku

`same.preis.speicher` — **HEUTE 0 / 6**

*misst:* Heap und Grafikspeicher gegen den erlebten Welt-Umfang, dazu Wärme und Akku am Laptop — der Speicher hängt am Schirm, nie an der Welt. Die Decken dieser Leiter sind der Speicher-Teil von P (R8).

*Beleg:* Heap 290 → 486 MB in 1,06 min (+185 MB/min), VRAM nach GC 135,6 → 159,4 MB an der Radeon (profiband.K5, ROT); GTX stehend VRAM 99,6–111,2 MB (PFLICHT E). — KARTE: 0 — Sprosse 1 reißt an der Radeon (VRAM 159 MB > 118 MB, der Heap steigt).

*alte Karte:* streaming.K5 · profiband.K3 · profiband.K5

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Wiese und Dorf | der Speicher steht nach 60 s | Heap ≤ 400 MB, VRAM ≤ 118 MB an beiden Geräten | Heap- und VRAM-Kurve über 5 min Spielgang |
| 2 | Dorf, 20 min Weg | kein Wachstum mit dem Weg | Steigung ≤ 5 MB/min, VRAM-Drift ≤ 2 MB | 20-min-Spielgang, Kurven an beiden Geräten |
| 3 | Stadt, 10³–10⁴ Bauten | Speicher ∝ Schirm | Heap ≤ 600 MB, VRAM ≤ 256 MB | Bahn durch die Stadt und zurück: Speicher am Ende = Anfang ±2 % |
| 4 | Megastadt, 10⁷ Menschen wirkend | wie 3 | Heap ≤ 1 GB, VRAM ≤ 512 MB; Laptop ohne Drosselung > 10 % in 60 min | 60 min Megastadt: Speicher-Kurve; Takt der letzten 5 min ≤ erste × 1,05 |
| 5 | Planet: Orbit ↔ Boden, 100 Sprünge | der Speicher kehrt nach jedem Sprung zurück | wie 4; Akku am Laptop ≤ 25 %/h | 100 Sprünge: Speicher nach jedem ≤ Ausgang + 2 % |
| 6 | viele Planeten und Epochen, Handy-Klasse | wie 5 | Heap ≤ 1 GB ohne Tab-Tod in 60 min am Handy, Akku ≤ 20 %/h | 60 min am realen Handy über 20 Welten |

## 7 · Das Zusammenspiel

### Die Seite des Planeten

*Referenz-Korpus (R6, R11):* die Korpora der gekoppelten Perspektiven; der Gegenlauf richtet (R7)

#### Gelände, Wasser und Gestein tragen Siedlung und Verkehr

`planet.kopplung.siedlungslage` · Kopplung (R7) · Glieder (Z3) — **HEUTE 0 / 7**

*misst:* wie viele Systeme Relief, Boden, Wasser und Gestein LESEN, bis Städte und Trassen aus der Landschaft vorhersagbar werden

*Beleg:* Mechanik von Sprosse 1 halb: EIN Spiegel und EINE Boden-Höhe headless an 6/6 Orten (gelaende.K4, gelaende.K5), im Spiel nicht an 50 Punkten. Bild-Preis in der Szene des Richters an beiden Geräten nicht gemessen.

*alte Karte:* gelaende.K4 · gelaende.K5 · siedlung.K3

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Wasserspiegel + Boden-Höhe, 50 Punkte | Leser folgen EINEM Spiegel; Huf, Rad, Fuß stehen ≤ 3 cm | P | Bildpaar an 50 Punkten: Wasserspiegel um 1 m gehoben → Ufer, Schilf, Steg, Boot und Fuß folgen im Bild (100 % der Leser); Gegenlauf ohne Hebung: kein Leser bewegt sich |
| 2 | ≥ 5 Boden- und Gesteins-Leser | Pflanze nach Bodenart und Gestein, Rad sinkt in Schlamm, Ernte, Fundament | P | Mutation der Bodenart ändert ≥ 5 Leser im Bild; ≥ 50 % der Biomgrenzen folgen einer Gesteinsgrenze |
| 3 | Siedlungen einer Region | an Furt, Terrasse, Hochwasserlinie, Küste und Fluss | P | Siedlungen an Furt, Terrasse, Küste ≥ 80 %; Gegenlauf: dieselbe Saat mit eingeebnetem Relief oder gekapptem Fluss → Anteil fällt auf das Zufallsniveau (≤ 30 %); Städte > 10⁵ ≤ 10 km von Küste oder Strom ≥ 70 % |
| 4 | Verkehr eines Landes | Trassen folgen Tälern und Pässen, Brücken an Engstellen | P | Trassen-Steigung ≤ Grenze in ≥ 95 %; Gegenlauf: Pass gesperrt (Bergsturz) → die Trasse verlegt sich auf den nächsten Pass in ≥ 80 % |
| 5 | die Stadt liest das Gestein | Baustein aus der Schicht darunter, Hafen an der Ria, Bergwerk am Erz | P in der Stadt | Stadt-Bausteine aus der Schicht unter der Stadt ≥ 90 %; Gegenlauf: Schicht getauscht → der Baustein der Stadt wechselt in ≥ 80 %; Erz nur in Lagen, die es tragen |
| 6 | Millionenstädte eines Kontinents | Lage folgt der Landschaft | P in der Millionenstadt | Jury rät aus der Geländekarte OHNE Städte deren Lagen: Treffer ≥ 3× Zufall; Gegenlauf mit vertauschter Karte: Treffer auf Zufallsniveau |
| 7 | 100 Saaten × Epochen | Planetengeschichte erklärt Zivilisation | P im Zeitsprung | Jury erkennt die geologische Ursache der Hauptstädte ≥ 70 %; Gegenlauf je Epoche: Gunst gekappt (Hafen verlandet, Fluss verlegt) → die Siedlung schrumpft oder wandert in ≥ 70 % |

#### Land, Meer und Luft — EIN Klima

`planet.kopplung.land-meer-luft` · Kopplung (R7) · Glieder (Z3) — **HEUTE 0 / 6**

*misst:* ob Gebirge, Meeresströme und Meeresabstand das Klima am Ort setzen — und eine Hebung das Klima kippt

*Beleg:* Stand 0: Regen ist ein Wetter-Stempel, das Meer kein Glied; ein Klima für die ganze Welt.

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Gebirge | Regenschatten | P im Regen | Niederschlag Luv/Lee ≥ 2:1 an 30 Saaten; im Bild grün/braun an der Kammlinie getrennt |
| 2 | Kontinent | Wüste folgt Meeresabstand und Regenschatten | P | Wüstenanteil gegen Meeresabstand und Schatten Rang ≥ 0,7 an 10 Saaten |
| 3 | Westküste eines Beckens | Auftrieb: kaltes Wasser, Nebel, Küstenwüste | P | an ≥ 70 % der Ostrand-Ströme Nebelhäufigkeit ≥ 2× Umland, Küstenwüste daneben |
| 4 | zwei Küsten gleicher Breite | Küstenklima folgt der Strömung | P | Temperatur unterscheidet sich ≥ 5 K mit richtigem Vorzeichen, 10 Saaten |
| 5 | Hebung über 10⁶ a | Gebirge hebt sich → Regenschatten → Steppe | P, Zeitsprung ≤ 5 s | Bildpaar Region vor/nach Hebung: grün → Steppe; Niederschlag Lee −50 % |
| 6 | jede Welt | Klimazonen passen zu Relief, Meer und Strömung | P je Saat | 1 000 Welten × 20 Orte: kein Widerspruch Klima ↔ Relief/Meer in ≥ 95 % |

#### Die Bahn formt Klima und Leben

`planet.kopplung.bahn-klima` · Kopplung (R7) — **HEUTE 0 / 6**

*misst:* ob der Himmel Ursache dessen ist, was am Boden geschieht

*Beleg:* Mechanik von Sprosse 1 steht: Jahres-Welle jahrTage: 365 (gelaende-core.js:1304,1317), Laub, Schnee, Wasser lesen sie. Bild-Preis in der Szene des Richters an beiden Geräten nicht gemessen.

*alte Karte:* wetter.K4

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Welt, 365 Tage | Jahreszeit als Welle | P | Schneelinie wandert über das Jahr im Bild |
| 2 | jede Breite, Saaten mit anderer Neigung | Insolation am Ort setzt Temperatur und Tageslänge | P | 0° Neigung: Jahresamplitude ≤ 10 % der Erd-Saat; 45°: ≥ 2× — Schneelinie und Laub im Bild |
| 3 | ±10⁶ Jahre | Milanković treibt Eisschilde, Meeresspiegel, Küste | P, Zeitsprung ≤ 5 s | Eisrand und Küste folgen der Juni-Insolation 65° N verzögert, r ≥ 0,7 gegen Laskar |
| 4 | Biome, Tiere, Menschen | Blüte, Zug, Laichtakt, Kalender folgen Mond und Jahr | P | Blühzeit verschiebt sich ~4 d je Breitengrad ±1 d; Laichtakt mit der Mondphase, 100 Saaten |
| 5 | gebundene Welt | Tag-Seite Wüste, Nacht-Seite Eis, Terminator lebt | P | Temperatur Tag/Nacht gegen Energie-Bilanz ±5 K; Leben im Terminator-Band ≥ 80 % |
| 6 | 1 000 Welten | Klimazonen passen zur Bahn | P je Saat | Klima-Zonen im Bild gegen Energie-Bilanz-Modell ±5 K in ≥ 90 % |

#### Eine Front läuft durch die Welt

`planet.kopplung.wetter-welt` · Kopplung (R7) · Glieder (Z3) — **HEUTE 0 / 6** · Kern 2

*misst:* wie weit das Wetter in Licht, Bewegung, Leben, Gelände und Bauform hineinreicht

*Beleg:* Mechanik von Sprosse 1 und 3 steht (wetter.K2 2/2), Wind-Leser halb (wetter.K5: 6 Leser im Code, Bild-Richter nie gefahren). Bild-Preis in der Szene des Richters an beiden Geräten nicht gemessen. — KARTE: Kern 2 — die Front im Licht (licht.K5) und die Nässe (wetter.K2) stehen je an beiden Geräten im Bild; als Glieder zählt jede für sich (Z3). Der Wind-Leser ist nur headless; Bild-Preis im Sturm an der Radeon nicht gemessen.

*alte Karte:* wetter.K2 · wetter.K5 · licht.K5

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 ◐ | Licht und Himmel | dieselbe Front dimmt Sonne, färbt Himmel | P | Bildpaar klar/Sturm an derselben Pose: Richtlicht gedimmt, Himmel grau |
| 2 | jeder Beweger liest den Wind | Lee schwächer, Tal-Düse stärker | P | ein Sturmbild: Gras, Bäume, Wolken, Rauch, Wasser zeigen dieselbe Richtung ±20°, Lee < frei < Düse |
| 3 ◐ | Nässe, Pfützen, Pegel | poröse Stoffe dunkler, Pfützen in Senken | P | Luma porös nass/trocken 0,5–0,8; Pfützen in Senken r ≥ 0,5 |
| 4 | Lebewesen und Bewohner | Tiere suchen Schutz, Bewohner fliehen den Regen | P | Anteil im Freien bei Sturm ≤ 30 % des klaren Werts; Bildpaar Marktplatz |
| 5 | Gelände über 10 Spieljahre | Starkregen gräbt Rinnen, Dünen wandern, Landfall versetzt Küste | P, Zeitsprung ≤ 5 s | Bildpaar vor/nach an derselben Pose: Dünenversatz in Windrichtung, Küstenlinie messbar verändert |
| 6 | Zivilisation, 100 Orte | Bauform folgt dem Klima | P | Dachneigung ↔ Schneelast r ≥ 0,5; Innenhof, Stelzen, Windturm ≥ 3× häufiger in ihrer Klimazone |

#### Die Megastadt macht ihr eigenes Wetter

`planet.kopplung.stadtklima` · Kopplung (R7) — **HEUTE 0 / 6**

*misst:* ob Stadt und Wetter einander formen, von der Gasse bis zur Stadt über Tokio

*Beleg:* Stand 0: kein Stadtklima.

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | ein Platz, eine Gasse | Gasse lenkt Wind, Schatten kühlt | P | Wind folgt der Gasse ±20°; Pfütze trocknet im Schatten später |
| 2 | Stadt 10² Häuser | Wärmeinsel | P | klare Winternacht: Kern ≥ 2 K wärmer; Schnee taut im Kern zuerst (Bildpaar) |
| 3 | Stadt 10⁴ Häuser | Dunstglocke, Fallwind am Turm | P | Sicht im Kern ≤ 50 % des Umlands bei Inversion; Böe am Turmfuß ≥ 1,5× |
| 4 | 10⁶ Bewohner | Millionen reagieren auf Regen | P mit allen 10⁶ in der Welt | Anteil im Freien bei Regen ≤ 30 % an 50 Zufallskreuzungen |
| 5 | Megastadt ≥ 10⁷ | Gewitter und Regen im Lee | P | 100 Saaten: Niederschlag im Lee ≥ +10 % gegen Luv |
| 6 | Städte aller Epochen | Kohlesmog, Neon-Regen | P je Sprung | Industriestadt 1850 ↔ heute: Sicht und Himmelsfarbe gegen historische Messreihen ±30 % |

#### Vulkan formt Küste formt Stadt formt Verkehr — die schnelle Kaskade

`planet.kopplung.kaskade` · Kopplung (R7) — **HEUTE 0 / 7**

*misst:* wie weit ein Ereignis durch die Welt läuft, bevor es versiegt, an nie gesehenen Auslöseorten. Gezählt wird, was die WELT nach dem Ereignis tut (Küste, Stadt, Bewohner, Verkehr, Neubau); die Physik im Ereignis-Fenster zählt same.kopplung.kaskade.

*Beleg:* Stand 0: kein Ereignis formt Gelände; die alte Kaskade (Ökologie) liegt im Leben-Kapitel.

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Ereignis, 1 Folge | Rutschung sperrt Straße → Umweg | P während der Kaskade | 20 Saaten: Folge tritt ein und ist im Bild sichtbar |
| 2 | Ausbruch an der Küste | neues Land, Lavadelta, schwarzer Strand | P am Strand | Küstenlinie verschiebt sich messbar; Strandfarbe folgt Gestein |
| 3 | Fluss verlagert sich | Stadt baut Deich | P | nach Verlagerung entsteht Deich am Prallufer in ≥ 80 % |
| 4 | Sturmflut bricht den Deich | Stadtteile fluten, Bewohner fliehen, Verkehr stockt | P während der Flut in der Stadt | überflutete Fläche = Tiefenkarte ≥ 90 %; ≥ 90 % der Bewohner verlassen die Zone; Verkehr auf gefluteten Trassen 0 |
| 5 | Beben → Rutschung → Tsunami → Stadt → Neubau | 4 Glieder, 10² km | P im Ereignis, in der Stadt | 30 nie gesehene Zufalls-Auslöseorte: Kette läuft in ≥ 80 % |
| 6 | Kaskade über Jahrzehnte | neues Land wird besiedelt, Hafen entsteht, Trasse folgt | P im Zeitraffer | Vulkaninsel nach Ausbruch: Siedlung und Trasse entstehen in ≥ 70 % der Saaten |
| 7 | jede Welt | Ketten aus deren Gesetzen | P je Saat | 100 Welten: Kette läuft in ≥ 70 %, kein Glied ohne Ursache |

#### Ereignis und Spur über die Äonen — Ausbruch, Trapp, Einschlag, Sterben

`planet.kopplung.ereignis-spur` · Kopplung (R7) — **HEUTE 0 / 6**

*misst:* ob eine Ursache Klima, Leben und Gestein verändert und alle Spuren übereinstimmen — erlebt im Moment UND gelesen danach

*Beleg:* Stand 0: keine Ereignisse jenseits des Wetters.

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Ausbruch | Asche-Lage im Umkreis | P | Grabung im Umkreis findet die Asche am erwarteten Alter in ≥ 95 % |
| 2 | Großausbruch VEI 7 | kühlt das Folgejahr | P beim Ausbruch und am Antipoden | Welt-Temperatur −0,5 bis −2 K für 1–3 Jahre |
| 3 | Trapp 10⁶ km² | Basaltdecken, Klimawechsel | P am Lava-Rand | Mitteltemperatur ändert sich ≥ 2 °C; Basalt in Bohrungen der Fläche ≥ 95 % |
| 4 | Einschlag mit globaler Grenzlage | Marker-Lage, Krater, Tsunamilagen | P | zufällige Bohrungen weltweit mit Grenzlage am selben Alter ≥ 90 % |
| 5 | Massensterben, erlebt | Himmel, Klima, Leben kippen; Erholung 10⁶–10⁷ a | P in 60 s um den Einschlag | Erd-Saat: ≥ 5 große Sterben mit Ursache, Gesteinsspur und Fossil-Einbruch am selben Alter; Licht am Boden −3 EV über Monate |
| 6 | jede Welt über 4,5 Ga | Sauerstoff-Katastrophe, Schneeball, Treibhaus als Ketten | P | 1 000 Saaten: Einbrüche ohne Ursache = 0; Ursachen ohne Spur = 0 |

#### Die Gegenwart als Ergebnis der Geschichte

`planet.kopplung.gegenwart` · Kopplung (R7) · Glieder (Z3) — **HEUTE 0 / 6**

*misst:* ob jedes Merkmal der Welt bei T = 0 seine Ursache in der Geschichte hat, die der Spieler bereisen kann

*Beleg:* Unter der Leiter: Findlinge „Eiszeit-Erratiker“ ohne je ein Eis (stamm/vegetation-baum.js:3246) — der erste Zwilling der Tiefen Zeit; die Landform ist Rauschen neben jeder Geschichte.

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Relikte, 10³ an 10 Saaten | Findling, Moräne, Strandterrasse nur wo Eis oder Meer war | P | 1 000 Relikte: Ursache in der Geschichte des Orts = 100 % |
| 2 | Gebirge und Becken | jede Kette ihr Zusammenstoß, jedes Becken seine Absenkung | P | 100 Saaten: Gipfel > 2 km an einer jemals konvergenten Grenze ≥ 95 % |
| 3 | Täler, Canyons, Fjorde | antezedente Durchbrüche, Fjorde nur wo Eis war | P | Bildpaar Durchbruch/Fjord gegen Foto; Fjorde außerhalb jemals vereister Küsten = 0 |
| 4 | Küsten | Rias, ertrunkene Täler, gehobene Strände aus der Meeresspiegel-Geschichte | P | 100 Saaten: Rias nur an überfluteten Flusstälern ≥ 95 %; Strandterrassen auf Höhen früherer Stände ±10 m |
| 5 | Erd-Saat, 10³ Orte | Zeitreise vorwärts endet im Ankunftsbild | P | 1 000 Orte: Zustand(x, 0) aus der Zeit-Funktion = Ankunftsbild (Bildpaar) |
| 6 | jede Welt | kein Gesetz der Landform neben der Geschichte | P | 1 000 Zufallsorte jeder Welt: Merkmale ohne Ursache = 0 |

### Die Seite des Lebens

*Referenz-Korpus (R6, R11):* die Korpora der gekoppelten Perspektiven; der Gegenlauf richtet (R7)

#### Leben formt Gelände, Wasser und Fels

`leben.kopplung.leben-formt-planet` · Kopplung (R7) — **HEUTE 0 / 7**

*misst:* Ob das Leben die Oberfläche sichtbar umbaut — vom Trampelpfad über Biberdamm und Atoll bis zu Kalkgebirge und Kohle; die Chemie zählt leben.oeko.stoffe.

*Beleg:* Trampelpfad: 17 → 3 Büschel nach 100 Gängen (alte Stoffe K4) — Zahl belegt, Bildpaar im Fenster fehlt.

*alte Karte:* stoffe.K4

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | ein Weg | Tritt formt Pfad | P · Weg im Bild | Gras-Dichte auf dem Weg −≥ 60 % gegen daneben im Bildpaar |
| 2 | ein Hang | Wurzeln halten den Hang | P · Starkregen im Bild | Gegenlauf: Erosion gerodet ≥ 5× bewaldet, Rutschung sichtbar |
| 3 | ein Fluss | Biber staut, Aue entsteht, Wald stirbt im Stau | P | Bildpaar 0/10 Jahre: Wasserfläche und Totholz gegen Referenz-Luftbild |
| 4 | eine Landschaft | Wölfe → weniger Verbiss → stabile Ufer | P · Zeitraffer | Ufer-Erosion mit Wölfen gegen ohne, Intervall ohne 0 |
| 5 | eine Küste über 10³ Jahre | Korallen und Mangroven bauen Land: Saum → Barriere → Atoll | P · Sprung ≤ 5 s | Riffdicke gegen Akkretionsraten; Rifftyp in Draufsicht ≥ 75 % richtig |
| 6 | Planet über 10⁸ Jahre | Kalkschalen werden Gebirge, Moor wird Kohle | P · Sprung ≤ 5 s | Kalkanteil der Kruste wächst mit dem Meeresleben; Kohleflöze in der Felswand sichtbar |
| 7 | jeder Planet: Vulkan → Asche → Pionierflora → Wald → Torf → Kohle; das Leben hält und kippt das Klima | die Spur steht in Fels, Luft und Küste | P an jedem Glied | 32 Saaten mit und ohne Leben im Bildvergleich unterscheidbar ≥ 90 %; Zeitreise an einem Ort über 10⁶ Jahre: jedes Kettenglied im Bild belegt |

#### Evolution liest den Planeten

`leben.kopplung.evolution-planet` · Kopplung (R7) — **HEUTE 0 / 6**

*misst:* Ob Gelände, Klima, Platten und Katastrophen die Arten formen — und der Spieler mit einem Eingriff eine andere Fauna erzeugt.

*Beleg:* Gattung wählt Boden-Klasse: 431/431, Gegenprobe 405/405 (alte Tiere K4) — headless, im Bild nie.

*alte Karte:* tiere.K4

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Lebensraum aus dem Gelände | Gattung wählt Boden-Klasse, Gegenprobe bei anderer Saat | P | ≥ 0,9 der Würfe in der Boden-Klasse der Gattung, im Bild gezählt |
| 2 | Merkmal aus Klima und Boden über 10² Generationen | Fell folgt der Bodenhelligkeit, Größe dem Klima (Bergmann) | P · Zeitraffer | Korrelation Fell ↔ Boden ≥ 0,5, ohne Selektion ≈ 0; Bildvergleich Nord ↔ Süd |
| 3 | Vikarianz | Platten trennen → Schwesterarten beidseits | P · Sprung ≤ 5 s | Baum-Distanz wächst mit dem Trennungsalter der Kontinente |
| 4 | Katastrophe | Vulkan-Provinz oder Einschlag → Einbruch, selektiv (Kleine, Grabende, Generalisten überleben) | P · Sprung ≤ 5 s | Überlebenden-Profil gegen das Muster der Kreide-Paläogen-Grenze; ohne Ereignis keine Welle |
| 5 | Eingriff des Spielers: Gebirge heben, Meerenge öffnen | nach Zeitraffer andere Arten, deterministisch | P · Zeitraffer 10⁶ Jahre ≤ 10 s | Paar mit/ohne Eingriff: Baum-Distanz über der Schwelle, Wiederholung byte-gleich |
| 6 | geschlossener Kreis über Äonen auf jedem Planeten | jede Art erklärt sich aus Ort und Geschichte | P | Zufallsort auf 10 Planeten: Ahnenlinie und Ereignis 100 % konsistent mit Baum und Geologie |

#### Mensch, Stadt und Meer im Netz des Lebens

`leben.kopplung.stadt-im-netz` · Kopplung (R7) — **HEUTE 0 / 8**

*misst:* Ob Siedlung, Landwirtschaft, Fischerei und Megastadt Wandler in derselben Bilanz sind — sie nehmen aus dem Netz, geben zurück, werden von Tieren besiedelt und ernährt.

*Beleg:* Alte Vegetation K4 Staffel 1 an einem Gerät: 42 Häuser des Start-Dorfs, 47/51 Boxen im Bild, Halm 0 px, Boden 0 px; Staffel 2 (jedes Haus, jedes Wasser, beide Geräte) offen. Fischer, Hafen, Kulturfolger, Stoffströme der Stadt: nichts. — KARTE: 0 — die Natur-Wand ist an der Radeon ROT, nur an der GTX gehalten (vegetation.K4).

*alte Karte:* vegetation.K4

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Siedlungsrand: die Natur-Wand | kein Halm im Haus, Waldsaum am Ort | P · Start-Dorf | Halm- und Büschel-Pixel 0 in jeder Haus-Box (Klassen-Maske) |
| 2 | Ernte, Fällen, Jagd und Fischen des Spielers | Wuchs, Bestand und Fang folgen Nutzung und Dichte | P | Bildpaar übernutzter Ort gegen daneben; Fang je Stunde ↔ Fischdichte an 20 Orten r ≥ 0,6 |
| 3 | ein Dorf mit Feldern, Weiden und Fang | Lage folgt Fischgründen und Boden; Überjagung lässt Bestände fallen, Schonung erholt | P · am Dorf | 50 Saaten: ≥ 70 % der Fischerdörfer am produktivsten Drittel der Küste; Fang ×3 → Bestand −≥ 50 % in 10 Spieljahren, Erholung nach Stopp |
| 4 | Stadt 10⁴ Bewohner: Kulturfolger und Nutztiere | Tauben, Ratten, Füchse, Möwen; Herden und Zugtiere der Epoche tragen die Bevölkerung | P · Stadt mit Bewohnern im Bild | Kulturfolger-Dichte Stadt > Umland, Scheue < Umland; Nutztiere und Weidefläche gegen Agrarstatistik der Epoche ±Faktor 3 |
| 5 | Metropole 10⁶–10⁷: Stoffströme | Nahrung herein, Abwasser hinaus | P · Mündung im Bild | Algenblüte und Sauerstoffloch stromab im Bildpaar gegen eine Saat ohne Stadt |
| 6 | Landwirtschaft eines Kontinents und Hafen-Megastädte | Monokultur verdrängt Bestäuber, Hecken halten sie; Stadtgröße folgt Ertrag und Hafengunst | P | Gegenlauf mit/ohne Hecken, Intervall ohne 0; Rangkorrelation Küstenstadt-Größe ↔ Meeres-Ertrag + Hafengunst ≥ 0,6 an 50 Saaten |
| 7 | Zivilisation über Epochen | Rodung ganzer Landschaften; Megafauna fällt nach Ankunft des Menschen; Fischerei-Technik je Epoche | P · Zeitsprung ≤ 5 s | Waldanteil über Jahrtausende gegen Pollen-Reihen; Panel ordnet Fischerei und Hafen ihrer Epoche ≥ 70 % |
| 8 | Stadt jenseits Tokio, > 10⁸ Bewohner | die Stadt ernährt sich aus dem Netz ihres Planeten und kippt Biome | P · Stadt im Bild | Versorgung schließt aus der Saat-Ökologie mit Fehlbetrag ≤ 1 %; Umland mit/ohne Stadt im Bildpaar verschieden |

### Die Seite des Menschen

*Referenz-Korpus (R6, R11):* die Korpora der gekoppelten Perspektiven; der Gegenlauf richtet (R7)

#### Leib folgt dem Planeten

`mensch.kopplung.leib` · Kopplung (R7) · Glieder (Z3) — **HEUTE 0 / 6**

*misst:* ob Kleidung, Leib und Tracht Wetter, Klima, Stoff, Migration, Epoche und Schwerkraft folgen (Leib L7).

*Beleg:* Tracht folgt nur der Epoche-Tafel; kein Wetter, kein Klima am Leib

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Platz: Kleidung folgt dem Wetter | Regen → Kapuze, Kälte → Lagen | P · Platz Sommer/Winter | Lagen-Anteil steigt im Bildpaar |
| 2 | 10² Saaten: Leib folgt Herkunftsklima | Hautton nach UV-Breite, Statur nach Bergmann/Allen | P | 200 Saaten: Hautton ↔ Breite r ≥ 0,7 |
| 3 | Tracht aus verfügbarem Stoff | Flachs, Wolle, Seide aus Feld, Herde, Handel | P | Stoffe ⊆ Erzeugnisse und Handel der Region 100 % |
| 4 | Migration mischt Leib und Mode | Hafen gemischt, Bergdorf einheitlich | P | Vielfalts-Index Hafen > Bergdorf, plausibel gegen Daten |
| 5 | Zeitreise am selben Ort, 4 Epochen | Größe und Tracht wandeln sich gesetzlich | P · je Epoche | Epoche ≥ 80 %; Körpergröße ± 5 cm gegen reale Kurve |
| 6 | fremde Planeten formen fremde Leiber | g, Licht, Atmosphäre | P | 2 g: Statur gedrungener; Leib und Kultur kohärent ≥ 0,8 |

#### Sport sitzt im Leben der Welt

`mensch.kopplung.sport` · Kopplung (R7) · Glieder (Z3) — **HEUTE 0 / 6**

*misst:* wie Klima die Sportart, Stadt die Arena und Alltag die Freizeit formt (Sport L10).

*Beleg:* tagesPlan kennt keine Freizeit (koerper-core.js:5057–5086)

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Abend: Spiel auf dem Platz | Wahl folgt Alter und Rolle | P · Dorfplatz am Abend | Anteil im Spiel 5–15 % |
| 2 | Wetter stoppt, Jahreszeit wechselt | Regen → Abbruch, Frost → Eis | P · Platz bei Regen und Frost | Partien bei Regen ↓ ≥ 50 %; Eis nur < 0 °C |
| 3 | 10² Saaten: Gelände formt Sportkultur | Bergvolk klettert, Küste rudert | P · Ankunft je Saat | 200 Saaten: Biom ↔ Sportart Cramérs V ≥ 0,3 |
| 4 | Sport formt Stadt und Verkehr | Spieltag-Stau | P · Spieltag | Verkehr ≥ + 30 % auf Stadion-Trassen |
| 5 | Sport ↔ Macht, Glaube, Geschichte | Arten entstehen, wandern, sterben | P · Zeitreise | je Saat ≥ 1 Art mit Lebenslauf, plausibel ≥ 70 % |
| 6 | volle Kaskade bis zum Heldentum | Vulkan → Küste → Stadt → Arena → Liga | P · zwei Saaten gleiche Stunde | andere Geländesaat zeigt andere Sportkultur, stimmig |

#### Leben und Welt formen sich

`mensch.kopplung.leben` · Kopplung (R7) — **HEUTE 0 / 6**

*misst:* wie stark die Welt die Leben ändert und die Leben die Welt (Geist L8).

*Beleg:* nur Gewalt → Furcht lokal; Bauten altern ohne Kopplung an Bewohner (stamm/siedlung-satz.js:858)

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Siedlung: Wetter ändert den Tag | Regen → drinnen | P · Markt Sonne/Regen | Anteil draußen sinkt ≥ 0,3 |
| 2 | 10³: Missernte, Brand → Not | Umzug, Trauer, Erinnerung | P | Gegenlauf: mit Missernte ziehen ≥ 10 % der Betroffenen um und ändern ihren Tag, ohne Missernte keine Umzugswelle; Betroffene nennen das Ereignis auf Frage ≥ 0,8 |
| 3 | 10⁵: Leben formen die Welt | Familien bauen an, Wege werden Straßen | P · Sprung 20 J | Bauten ↔ Familiengröße r ≥ 0,5; verlassene Häuser verfallen |
| 4 | 10⁷: Vulkan, Seuche, Krieg | Generationen und Gedächtnis verschoben | P · Sprung ≤ 5 s | Flucht, Gedenken nach 50 J, Kohorten-Delle — alle drei messbar |
| 5 | Planet, Äonen | Geschichte als Summe von Leben | P | Wendepunkte auf benennbare Personen ≥ 0,8; Gegenlauf: Person entfernt → der Wendepunkt bleibt aus oder verschiebt sich in ≥ 70 % |
| 6 | viele Planeten | Lebensläufe fremder Arten formen ihre Welt | P · Planetenwechsel | Saat-Tausch bei gleichem Planeten: andere Personen → andere Wendepunkte ≥ 70 %; Gegenlauf: dieselben Personen → dieselben Wendepunkte ≥ 95 % |

#### Die Welt antwortet auf Eingriff

`mensch.kopplung.antwort` · Kopplung (R7) — **HEUTE 0 / 6**

*misst:* ob Stadt und Region ein Gleichgewicht sind, das sich sichtbar umbaut, wenn Spieler oder Ereignis einen Wert ändern (Stadt L8).

*Beleg:* Ring 8–9 neuer Häuser, Median 22 m um das Spielerhaus, beide Geräte (siedlung.K4) — KARTE: 0 — das Wachstum (siedlung.K4) hebt den Kern von mensch.zeit.palimpsest, das benutzte Werk (bauen.K5) den von erleben.spieler.rolle (R9, Z6); der eigene Lauf mit Gegenlauf fehlt.

*alte Karte:* bauen.K5 · siedlung.K4

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Spielerhaus wird Keim | Ring neuer Häuser | P · Hügel | Ring neuer Häuser um das Spielerhaus binnen 1 500 s; Gegenlauf: dieselbe Saat ohne Spielerhaus → kein Ring an diesem Ort |
| 2 | 1 Trasse des Spielers | Bebauung folgt der Erreichbarkeit | P | Dichte im 200-m-Gürtel ≥ 2× gegen Kontroll-Saat |
| 3 | 1 zerstörtes Viertel | Neubau nach neuem Bodenwert | P | Netz-Kennzahlen des Neubaus weichen vom alten Viertel ab und liegen im Band realer Wiederaufbau-Pläne ≥ 70 %; Gegenlauf ohne Zerstörung: Viertel unverändert |
| 4 | Region: neue Stadt, gesperrter Hafen | Nachbarn wachsen/schrumpfen, Leerstand | P · Sprung ≤ 5 s | Sprung 50 J: Rang-Verschiebung gegen Kontrolle; Leerstand erkannt ≥ 70 % |
| 5 | Planet über Jahrhunderte | Siedlungsnetz und Reiche verschieben sich | P · Sprung | 64 Orte im Jahr X+300 anders; ohne Eingriff byte-gleich |
| 6 | jede Tat über alle Perspektiven | Leib, Bau, Markt, Recht, Sprache antworten | P · überall | 100 Taten: Folge in ≥ 3 Perspektiven ≥ 90 %; Mutante = 0 |

#### Kultur folgt der Welt

`mensch.kopplung.kultur` · Kopplung (R7) · Glieder (Z3) — **HEUTE 0 / 7**

*misst:* ob Baustoff aus dem Boden, Glaube aus der Landschaft und Kalender aus dem Himmel folgen — und der Bau den Ort deutet (Kultur L6 + Bauten L1).

*Beleg:* metaParams Klima × Epoche → Dach, Stoff, Hof (fachwerk-core.js:8103) liest nur das Studio (worlds/fachwerk/fachwerk.js:621); die Welt zieht die Region per Zufall (:3647) — Zwilling

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Baustoff aus Boden und Klima | Lehm, Holz, Stein nach Biom | P · Dorf | 32 Saaten: passender Baustoff ≥ 85 %; Region aus Hausbild ≥ 70 % |
| 2 | 3 Kopplungen: Dach ↔ Niederschlag, Hof bei Hitze, Speise ↔ Anbau | Mutation Klima ändert Bau gesetzrichtig | P · Dorf | Dach ↔ Niederschlag r ≥ 0,5; Mutation ≥ 90 % |
| 3 | Kalender und Fest aus Himmel und Ernte | Fest auf Ereignis der eigenen Welt | P · Festplatz | ≥ 80 % der Feste auf einem Ereignis der Saat |
| 4 | Heiliger Ort, Sprachgrenze, Gefahren-Bauweise aus Gelände | Bebenzone leicht, Vulkanhang befestigt | P · Vulkanhang | Gebirge verschoben → Grenze folgt, Mutante = 0; angepasst ≥ 80 % |
| 5 | Kaskade Vulkan → Kultur → Glaube → Sprache | Geologie ändert Mythos | P · ≤ 1 s nach Eingriff | heiliger Ort, Baustoff, Sprachgrenze, Mythos alle ≠; Mutante 0 |
| 6 | jeder Ort eines Planeten | Bau deutet den Ort | P · überall | 1 000 Orte: Klima, Gestein, Epoche aus dem Bild ≥ 70 % |
| 7 | Planeten und Zeitalter | Kultur folgt fremder Physik | P · fremder Planet | Schwerkraft aus 20 Stadtbildern ≥ 70 %; gekoppelt ≥ 85 % |

#### Die Stadt trägt sich

`mensch.kopplung.kreislauf` · Kopplung (R7) — **HEUTE 0 / 6**

*misst:* ob eine Zufallsperson Wohnung, Werk, Nahrung, Wasser und Energie hat — rückverfolgbar bis Feld, Quelle und Kraftwerk (neu; trägt die Megastadt).

*Beleg:* keine Ware mit Herkunft, niemand isst; Brunnen und Laternen ohne Fluss

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 10² Dorf | Nahrung aus eigener Flur, Wasser aus Brunnen | P · Dorf | 20 Personen: Mahl bis Feld ≥ 90 % |
| 2 | 10³ | + Markt, Brennholz, Werkzeug | P · Stadt | Bilanz je Gut ± 10 % |
| 3 | 10⁴ | + Leitung, Abwasser, Müll | P · Stadt | Bilanz je Stoff ± 5 % |
| 4 | 10⁶ | + Strom, Hinterland, Handel | P · Orbit | Hinterland ≥ Stadtfläche × Bedarf ± 30 % |
| 5 | 10⁸ in EINER Stadt | jede Person versorgt | P · Megastadt | 1 000 Personen ≥ 0,99; 100 Bissen bis Feld ≥ 90 % |
| 6 | Planeten | Bilanz schließt, Hunger hat Ursache | P | 16 Saaten × 100 J: kein Mangel ohne sichtbare Ursache |

### Die Seite des Erlebens

*Referenz-Korpus (R6, R11):* die Korpora der gekoppelten Perspektiven; der Gegenlauf richtet (R7)

#### Emergenz: ungeskriptete Ketten im Blick

`erleben.kopplung.emergenz` · Kopplung (R7) — **HEUTE 0 / 7**

*misst:* wie oft der Spieler eine Kette aus ≥ 3 Ursachen IM BLICK erlebt, die niemand geschrieben hat — die Kette als Gesetz misst das Kapitel Kopplung, hier zählt das Erleben.

*Beleg:* trophische Kaskade headless über 8 Saaten (Hirsche +0,448, Jungwuchs −0,279, §8.K1 2/2), Emotion → Wetter headless (§10.K2, K3) — im Bild nie gefahren.

*alte Karte:* oekologie.K1 · affekt.K2 · affekt.K3

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Kette in 6 Spielstunden: Wölfe weg → mehr Hirsche → weniger Jungwuchs | Gegenlauf ohne Kette | P · Raffer am Gerät | Bildpaar am selben Ort mit/ohne Wölfe nach 6 Spielstunden: Jungwuchs sichtbar dünner über ≥ 8 Saaten |
| 2 | 1 Kette mit ≥ 3 Gliedern je Spielstunde im Blick | jedes Glied sichtbar und mit Ursache | P | Spielgang 60 min: Ketten mit ≥ 3 Gliedern im Sichtkegel ≥ 1 |
| 3 | 10 Ketten je Stunde über Domänen (Dürre → Ernte → Preis → Auszug) | Glieder aus ≥ 3 Domänen | P | Ketten mit Gliedern aus ≥ 3 Domänen je Stunde im Blick ≥ 10 |
| 4 | Ketten mit ≥ 10 Gliedern über Tage, ≥ 10² Leben geändert | Änderung am Ort sichtbar (leere Häuser, neue Stände) | P | Bildpaar vor/nach: ≥ 10² Bewohner an anderem Ort oder in anderer Rolle |
| 5 | Ereignisse, die eine Stadt mit 10⁶ umformen (Brand, Seuche, Revolte) | „unvergesslich" wie ein gesetzter Höhepunkt | P auch während der Katastrophe | Blind-Spieler nennt nach 10 h ungefragt ≥ 3 Ereignisse, die er nicht verursachte |
| 6 | planetare Kaskaden über 10⁴ Jahre (Vulkan → Küste → Stadt → Krieg) | Verlauf historisch plausibel | P · Zeitsprung ≤ 5 s | N = 100 Saaten: plausible Geschichten ≥ 90 % (Gutachter), am Ort im Bild nachgeprüft |
| 7 | jede Stunde auf jedem von 10³ Planeten trägt eine nie erlebte Geschichte | zwei Saaten erzählen nie dasselbe | P | Ähnlichkeit erlebter Ereignis-Graphen zweier Saaten < Ähnlichkeit zweier Durchläufe eines geskripteten AAA-Titels |

#### Wahrnehmung treibt Verhalten und Landschaft

`erleben.kopplung.wahrnehmung` · Kopplung (R7) · Glieder (Z3) — **HEUTE 0 / 6**

*misst:* ob Sinne die Welt beobachtbar ändern: ein Sinn aus = ein anderer Bestand, eine andere Landschaft.

*Beleg:* Wolf findet Beute über Witterung; Gegenlauf in der alten Karte (§8.K4) — headless. — KARTE: 0 — dieselbe Messgröße wie erleben.sinne.geruch Sprosse 1 (R9), headless.

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Geruch führt den Jäger zur Beute | Wind trägt Witterung | P | Gegenlauf Witterung aus → Jagderfolg fällt |
| 2 | Räuber + Beute, Sicht + Geruch | Beute wählt die Lage gegen den Wind | P | Gegenlauf: Beute mit Wind-Wahl überlebt ≥ 1,5× |
| 3 | Bestäubung: UV-Saftmal ↔ Biene, koevolviert | Saftmal entsteht aus dem Bestäuber-Sinn | P | Saftmal aus → Bestäubung −≥ 30 %; N = 50 Saaten: bienenbestäubte Blüten mit Saftmal im Bienenspektrum ≥ 0,6 |
| 4 | Wettrüsten: Fledermaus ↔ hörende Motte | Ausweichen aus Echo-Wahrnehmung | P | Motten mit Gehör: Fangquote −≥ 30 % |
| 5 | die Stadt als Sinnes-Landschaft | Licht lockt Insekten, Lärm verschiebt Gesang | P | Insektendichte an Laternen ≥ 3× gegen dunkle Straße; Gesangsfrequenz in lauter Straße höher als im Park |
| 6 | Planet: Sternlicht → Augen → Blütenfarben → Landschaftsbild | ganze Kette aus einem Samen | P | Bildpaar zweier Planeten (roter/heller Stern): Vegetationsfarbe und Augenspektren unterscheiden sich gesetzmäßig, N = 20 Paare ≥ 0,8 |

#### Ein wahres Bild

`erleben.kopplung.bild` · Kopplung (R7) — **HEUTE 0 / 6**

*misst:* wie viele gekoppelte Phänomene in EINEM Bild konsistent stehen (Vulkan formt Küste, Küste trägt Stadt, Stadt leuchtet, Wetter verschleiert, Meer spiegelt) und ob Menschen es vom Foto unterscheiden.

*Beleg:* gleiche Helligkeit über alle Lichtwege gemessen (§13.K3 = 1). — KARTE: 0 — nur an der GTX gebucht (licht.K3).

*alte Karte:* licht.K3

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 2 Phänomene | Luft dunstet Relief; Gelände ändert seine Helligkeit nah ↔ fern nicht | P | Gang 2 km auf einen Hang: Leuchtdichte des Zielfensters springt an keinem Stufenwechsel > 5 % |
| 2 | 4 | Dorf, Wald, Wasser, Himmel ohne Bruch | P | Panel-2AFC Spiel gegen Foto ähnlicher Landschaft ≤ 75 % |
| 3 | 8 | Stadt, Küste, Meer, Wetterfront, Abendlicht | P | 2AFC ≤ 65 % |
| 4 | 16 | Vulkan mit Glut und Fahne, Küstenstadt mit Lichtern, Spiegelung, Gewitter fern, Nacht | P | 2AFC ≤ 55 % gegen Fotos realer Vulkanküsten bei Nacht |
| 5 | jede Pose jeder Saat | 100 Zufallssaaten × Pose, Uhr, Wetter, Epoche | P | Anteil, den ein Panel als Foto hält ≥ 0,4 (Zufall = 0,5) |
| 6 | jenseits der Erde | Bilder fremder Welten | P | 2AFC gegen Sondenfotos (Mars, Titan) ≤ 55 % |

#### Die Kette ist hörbar

`erleben.kopplung.klang` · Kopplung (R7) · Glieder (Z3) — **HEUTE 0 / 6**

*misst:* ob ein Ereignis seine Folgen hörbar durch die Welt zieht und ob die Klanglandschaft eines Orts nur nach dem klingt, was dort zu dieser Zeit lebt und gebaut ist.

*Beleg:* nichts über die Leitern hinaus gekoppelt; Regen nur als Textur am Ort.

*alte Karte:* klang.K2

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Wetter → Stoff: Regen auf jedem Dach nach dessen Stoff | gesehen = gehört über zwei Leitern | P | Regenklang je Dachstoff unterscheidbar; Regenstärke im Bild ↔ Pegel r ≥ 0,9 |
| 2 | Ereignis → Menge: Ausbruch, Beben, Unfall | Schrei, Flucht, Hupe, Vogel verstummt | P | Spektrum und Pegel der Klanglandschaft ändern sich ≤ 2 s, folgen der Reaktion der Simulation r ≥ 0,8 |
| 3 | Kette über 10² Jahre: Asche → Küste wächst → neue Bucht mit Brandung und Hafen | die Klanglandschaft folgt der Geschichte des Orts | P | Raffer 100 Jahre an 10 Orten: Quellen am Abgriff ⊂ was die Simulation dort entstehen ließ, 0 Waisen |
| 4 | Menschenzeit (Rom, Edo, Industrie, Zukunft) | Hufe, Dampf, Verbrenner, Elektro; Musik und Sprache der Epoche | P je Epoche | Epochenfahrt: 0 anachronistische Quellen; Epoche nur am Abgriff erkannt ≥ 80 % |
| 5 | Tiefe Zeit (Kambrium still, Karbon-Insekten, Kreide, Eiszeit) | Vogelgesang erst, wenn Vögel entstehen | P · ≤ 5 s | 6 Zeitalter × 10 Saaten: Quellen am Abgriff ⊂ Arten der Epoche, 0 Anachronismen |
| 6 | fremde Planeten-Geschichten | was dort lebt und weht, klingt — im Vakuum nichts | P · ≤ 5 s | 10 Zufallsplaneten × 3 Zeitalter: Quellen ⊂ Arten, Medien und Ereignisse des Planeten, 0 Waisen |

#### Geteilter Sinn: Taten reisen zwischen Spielern

`erleben.kopplung.geteilter-sinn` · Kopplung (R7) — **HEUTE 0 / 7**

*misst:* ob die Tat eines Spielers zur Welt, zum Ziel und zur Legende eines anderen wird (Spieler × Erzählung × Netz).

*Beleg:* ungemessen; kein Netz-Spiel über zwei Geräte.

*alte Karte:* tore.K4

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 2 Spieler, dieselbe Saat | die Tat von A steht bei B, deterministisch | P auf beiden Geräten | Tat von A → Bildpaar am Ort bei B zeigt dieselbe Spur |
| 2 | Bewohner bei B erzählen die Tat von A | Kern-Treue ≥ 90 % | P · Verzug ≤ 1 s | 10 Taten von A: Zeugen bei B nennen Wer, Was, Wo richtig |
| 3 | 10² Spieler in einer Stadt | gemeinsame Ziele aus dem Zustand | P | Anteil Ziele, die ≥ 2 Spieler zugleich verfolgen ≥ 20 % |
| 4 | 10⁴ Spieler | Ruf und Rivalität, getragen von Bewohnern | P | Ruf von A ändert die Begegnungen von B messbar (≥ 20 Prozentpunkte) |
| 5 | 10⁶ Spieler über Monate | Taten früherer Spieler werden Legende später Ankommender | P · trotz Geschichte | einen Monat später Ankommende finden in ≥ 50 % binnen 1 h eine Legende eines Früheren; Zeitreise bestätigt den Kern |
| 6 | Spieler-Zivilisationen: Städte, Ligen, Kriege, von der Welt erzählt | die Welt erzählt, nicht nur das Forum | P | Anteil Legenden mit Spieler-Ursprung zwischen 10 % und 50 % |
| 7 | Millionen Spieler, 10³ Planeten, eine Geschichte | Taten überdauern ihre Spieler | P | ≥ 50 % der Spieler haben nach 100 h eine Legende eines anderen Spielers gefunden und verfolgt |

#### Ein Ereignis, alle Sinne, alle Perspektiven

`erleben.kopplung.ein-ereignis` · Kopplung (R7) — **HEUTE 0 / 6**

*misst:* ob EIN Ereignis in jedem Kanal des Erlebens dasselbe ist — gesehen, gehört, gefühlt, gerochen, aus jeder Perspektive und in jeder Erzählung —, zeitlich und räumlich ohne Widerspruch.

*Beleg:* Wind gesehen = gehört r 0,81 (§32.K2) ist ein Zwei-Kanal-Same, aber kein Ereignis; nie über Kanäle gemessen.

*alte Karte:* klang.K2

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Feuer: 2 Kanäle | Glut im Bild, Knistern am Ohr, Licht auf dem Boden zugleich | P | 20 Feuer: Versatz Bild ↔ Abgriff ≤ 50 ms, Quellort am Abgriff ±10° zur Glut, 100 % |
| 2 | Gewitter in 10 km: 4 Kanäle | Blitz, Donner nach d/c, Regen kommt, Bewohner suchen Schutz | P | Donner-Verzug = Abstand/c ±2 %; Regen am Ort ≤ Zugzeit der Front; Bewohner unter Dach ≥ 0,8 |
| 3 | Vulkanausbruch in 20 km: ≥ 6 Kanäle | Glut, Grollen bis Infraschall, Beben im Boden, Ascheregen, Schwefelgeruch, Flucht | P während des Ausbruchs | Zeitfolge der Spuren am Spieler (Bodenwelle → Schall → Asche) nach Abstand und Geschwindigkeit ±10 %; 0 Kanäle ohne Spur |
| 4 | dasselbe Ereignis aus 3 Perspektiven | Ego, Orbit, Rolle eines Bewohners oder Tiers mit fremdem Sinn | P · Wechsel ≤ 1 s | Ereigniszeit und -ort in allen drei Sichten ±1 s, ±1 % Abstand; Bildpaar Orbit ↔ Ego zeigt dieselbe Fahne |
| 5 | das Ereignis lebt weiter: Zeugen, Spur, Legende über 10 Jahre | Erzählung, Ort und Zeitreise sagen dasselbe | P · Sprung ≤ 5 s | 20 Zeugen nennen Ort und Zeit richtig ≥ 80 %; Spur am Ort nach 10 Jahren sichtbar; Sprung zurück zeigt das Erzählte |
| 6 | jedes Ereignis jeder Saat | Konsistenz als Gesetz, nicht als Inszenierung | P | N = 100 Zufallsereignisse aus 10 Saaten: Anteil ohne Widerspruch zwischen allen Kanälen und Perspektiven ≥ 0,95 |

#### Die Epoche ist ganz

`erleben.kopplung.epoche-ganz` · Kopplung (R7) — **HEUTE 0 / 6**

*misst:* ob nach einem Zeitsprung ALLES Erlebte derselben Zeit gehört — Licht, Klang, Sprache, Verben, Ziele, Werkzeuge, Himmel —, ohne einen einzigen Anachronismus über die Kanäle.

*Beleg:* Uhr treibt Licht und Bewohnertag (§9.K2); Saison per Wort; keine Epochen-Sprünge.

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Tageszeit | Licht, Klang, Bewohnertag zeigen dieselbe Uhr | P | 24 Zufallsuhren: 0 Widersprüche zwischen Sonnenstand, Klangbild (Chor, Grillen, Verkehr) und Bewohnertag |
| 2 | Jahreszeit | Laub, Licht, Insekten- und Vogelklang, Kleidung, Ernteziele | P | 12 Zufallsmonate: 0 Widersprüche zwischen Bild, Klang, Kleidung und Zielen |
| 3 | 10² Jahre: eine Generation weiter | Bauweise, Lampen, Fahrzeuge, Klang der Technik, Sprache gewandelt | P · Sprung ≤ 5 s | Sprung um 100 Jahre an 10 Orten: Änderung in Bild, Klang und Sprache gleichgerichtet, 0 Waisen |
| 4 | Menschenzeit 10³–10⁴ Jahre (Rom, Edo, Industrie) | Licht, Klang, Verben, Ziele, Werkzeug der Epoche | P · ≤ 5 s | Epochenfahrt: 0 anachronistische Quellen über Bild, Abgriff, Verb-Tafel und Ziele; Epoche blind erkannt ≥ 80 % |
| 5 | Tiefe Zeit 10⁸ Jahre | Himmel, Luft, Arten, Klang, Sinne der Arten zueinander passend | P · ≤ 5 s | 6 Zeitalter × 10 Saaten: Himmel, Arten am Abgriff und im Bild ⊂ Inventar der Epoche, 0 Anachronismen |
| 6 | jedes Datum jedes Planeten | die Epoche ist eine Funktion der Saat, nie eine Kulisse | P · ≤ 5 s | N = 100 (Planet, Datum): Anteil ohne Anachronismus über alle Kanäle ≥ 0,95 |

### Über alle Kapitel — Kette, Störung, Ereignis, Zeit

*Referenz-Korpus (R6, R11):* die Korpora der gekoppelten Perspektiven; der Gegenlauf richtet (R7)

#### Das Kleine schreibt das Große — Tat, Stadt und Zivilisation formen Land, Wasser und Klima

`same.kopplung.aufwaerts` · Kopplung (R7) — **HEUTE 0 / 8**

*misst:* Ob eine Tat, eine Stadt, ein Ausbruch die größere Stufe sichtbar umschreibt (Region, Klima, Küste, Planet) — und gespeichert wird nur die Tat, kein mit der Welt wachsender Zustand. Koppelt entfaltung × massstab × gedaechtnis. Achse: 1 ha → Planet, Menschen 10² → 10⁷, Zeit 1 a → Jahrhunderte.

*Beleg:* Unter der Leiter: die Siedlung liest Natur nur als Verbot und Kosten (fachwerk-core.js:8623, :3861); keine Tat verschiebt ihren Elternknoten; ein gebautes Haus aus 400 m nie gemessen.

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | eine Tat (gebautes Haus, Rodung 1 ha), wirkt bis 1 km | steht im Steigflug, wo sie gebaut wurde; Pegel, Wuchs, Wild ändern sich | P; Speicher-Zuwachs = Bytes der Tat | Haus bauen, aufsteigen: Pixel aus 400 m an seiner Stelle; Bildpaar an 10 Orten im Umkreis |
| 2 | ein Dorf rodet 10 km² | Wald weicht Feld, Wild zieht ab; sichtbar aus 10 km | P | Waldanteil im Umkreis 5 km fällt mit der Bevölkerung (r ≥ 0,6); Bildpaar aus 10 km ΔE ≥ 5 an der Tat, sonst ≤ 1 |
| 3 | eine Stadt (10⁵) ändert ihr Tal (10 km) | Rodung → Erosion → Versandung; Damm → Stausee; Wärmeinsel 1–3 K | P, Zeitraffer | Sediment im Hafen ≥ 2× der Wald-Saat; Temperatur Stadt ↔ Umland gegen gemessene Wärmeinseln |
| 4 | ein Damm verschiebt ein Delta 100 km flussab | die Küste zieht sich zurück wie hinter echten Dämmen; aus dem Orbit sichtbar | P | Bildpaar Delta vor ↔ nach 10 Jahren; Fläche der Änderung Orbit ↔ Boden ±10 % |
| 5 | Megastadt (10⁷), Region | Wärmeinsel ≥ 3 K nachts, Versiegelung → Sturzflut, abgepumptes Tiefenwasser → Senkung | P | Hochwasser-Spitze ≥ 1,5× nach Versiegelung; Senkung cm/a im Faktor 3 von Jakarta |
| 6 | ein Ausbruch kühlt einen Kontinent ein Jahr | Ernten, Wanderung und Himmel gekoppelt; Aschewolke im Orbitbild | P | Abkühlung gegen Pinatubo (~0,5 K) ±50 %; Bodenlicht unter der Wolke ±15 % |
| 7 | eine Zivilisation formt ihren Planeten über Jahrhunderte | Landbau formt Biome, Industrie → Klima → Meeresspiegel; aus dem Orbit und im Planetenscheibchen sichtbar | P, Zeitraffer 10³ a ≤ 60 s | Orbitbild vor ↔ nach 300 Jahren an 100 Saaten plausibel ≥ 90 %; Erwärmung je CO₂-Verdopplung 2–5 K |
| 8 | Fremd-Zivilisationen auf 100 Planeten | Terraforming, Atmosphären-Umbau, Selbstvernichtung oder Gleichgewicht | P | Anteil der Planeten, die sich vom Zustand ohne Zivilisation messbar unterscheiden ≥ 80 % (Bildpaar Orbit) |

#### Die Kette der Stoff-Physik

`same.kopplung.kaskade` · Kopplung (R7) — **HEUTE 0 / 7**

*misst:* Wie viele Physik-Domänen ein Ereignis im Ereignis-Fenster (Sekunden bis Stunden) nacheinander in Gang setzt (Beben → Bruch → Brand → Flut), jedes Glied im Bild an der Stelle UND beim Festhalten seines Vorgängers ausbleibend. Koppelt die acht physik-Kriterien; was die Welt danach tut, zählt planet.kopplung.kaskade. Achse: Glieder 2 → 6, Raum Zelle → Region → fremde Welten.

*Beleg:* Kette regen → nässe → stoff → brand → licht, Tiefe 4 mit Festhalte-Probe (feld.K1) — headless; Bruch, Fluid mit Impuls und Beben fehlen als Glieder.

*alte Karte:* feld.K1

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 2 Glieder, eine Zelle | Regen löscht Brand | P im Ereignis-Fenster | Bildpaar: Brand erlischt im Regen, hält im Trockenen, beide Geräte |
| 2 | 4 Glieder an einem Ort (Regen → Nässe → Stoff → Brand → Licht) | jedes Glied liest seinen Vorgänger | P | Spielgang Sturm: Glieder, deren Bild sich ändert und beim Festhalten des Vorgängers stehen bleibt, ≥ 4 |
| 3 | Bruch → Körper → Fluid, 10³ m³ | Damm bricht, Wasser trägt Trümmer, Trümmer stauen | P | N = 20 Saaten: Anteil, in dem jedes Glied im Bild eintritt ≥ 90 % |
| 4 | Beben → Bruch → Brand, ein Viertel | Einsturz nach Lastpfad, Brand aus Herd und Stoff, Ausbreitung nach Bauweise | P | N = 20: vollständige Ketten ≥ 80 %, Festhalte-Probe je Glied |
| 5 | Beben → Bruch → Brand → Flut, eine Küstenstadt | aus Gesetz, nicht aus Drehbuch | P | N = 20 Küstenstadt-Saaten: vollständige Ketten ≥ 70 %; Wellen-Ankunft ±10 % gegen √(g·h) |
| 6 | Ausbruch → Asche → Dachlast → Einsturz → Lahar → Ernte, eine Region | 6 Glieder über Stoff, Fluid, Tragen, Leben | P, Zeitraffer | N = 20 Vulkan-Saaten: ≥ 5 von 6 Gliedern im Bild |
| 7 | Ketten, die nie als Klasse geschrieben wurden, auf 100 Fremd-Planeten | Methan-Brand, Gletscherlauf unter Vulkan, Säureregen-Einsturz | P | Anteil der Planeten mit ≥ 1 Kette von ≥ 3 Gliedern, jedes einer sichtbaren Ursache zugeordnet, ≥ 80 % |

#### Die gewachsene Kohärenz

`same.kopplung.kohaerenz` · Kopplung (R7) — **HEUTE 0 / 7**

*misst:* Wie viele Glieder Platte → Relief → Klima → Wasser → Boden → Biom → Siedlung → Wirtschaft → Verkehr → Kultur in einer UNGESTÖRTEN Saat erkennbar auseinander folgen. Achse: Glieder 2 → 10, Fläche 1 Ort → Planet → fremde Physik.

*Beleg:* Stream-Power-Flüsse und EIN Wasser-Spiegel (gelaende-core.js, gelaende.K4); die Siedlung liest Wasser nur als Verbot und Kosten, nicht als Ursache des Standorts; die 100-Saaten-Stichprobe wurde nie gefahren.

*alte Karte:* gelaende.K4

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 2 Glieder, ein Ort | Wasser folgt dem Relief | P | 100 Saaten × 50 Punkte: Wasserläufe bergab in Senke oder Meer ≥ 95 % |
| 2 | 4 Glieder, 10 km² | Relief → Wasser → Feuchte → Pflanze | P | 100 Saaten: Pflanzen-Dichte gegen Abstand zum Wasser monoton fallend in ≥ 80 % |
| 3 | 6 Glieder, 10³ km² | Regenschatten; Städte an Furt, Mündung, Pass | P | Städte an Fluss/Küste/Pass ≥ 70 %; Niederschlag Luv/Lee ≥ 2:1 |
| 4 | 8 Glieder, 10⁵ km², 10³ Städte | Handelswege über Pässe und Flüsse, Märkte an Knoten | P | Straßennetz-Umweg ≤ 1,2 × günstigster Gelände-Pfad; Zipf-Steigung 0,8–1,2 bis 10⁷ |
| 5 | 10 Glieder, Kontinent | Lehm im Trockenen, Holz im Wald, Stein im Gebirge, Speise und Glaube aus Ort | P | Blindtest: 20 Stadtbilder ihrem Biom zugeordnet ≥ 70 % |
| 6 | 10 Glieder ab der Platte, Planet, 10⁹ Bewohner | Gebirge an Plattengrenzen, Wüsten am 30°-Gürtel, Kulturräume an Barrieren | P, Orbit bis Straße ohne Ladebild | 100 Planeten-Saaten: Geograf trennt sie blind nicht von Erdkarten-Ausschnitten ≥ 50 % |
| 7 | fremde Physik, 10³ Planeten-Typen | die Kette hält, wo die Erde keine Referenz hat | P | 1 000 Fremd-Saaten: Siedlungen mit sichtbarer Ursache (Wasser, Pass, Stoff, Schutz) ≥ 90 % |

#### Der Katalog der Gewalt

`same.kopplung.gewalt` · Kopplung (R7) — **HEUTE 0 / 6**

*misst:* Wie viel Gefahr die Welt von SELBST trägt, mit Häufigkeit und Ort, die die Erde schrieb (Potenzgesetze aus Feldern, nie Schieberegler). Achse: Klassen 1 → namenlose, Zeit 10² → 10⁹ a.

*Beleg:* Unter der Leiter: Gefahr nur als Spieler-Tat (Brennglas, lava-Satz), kein Blitz (Grep leer); 100 Spieljahre ohne Zutun = 0 Ereignisse.

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Klasse von selbst, 1 km², 100 a | Blitz-Brand aus Trockenheit × Gewitter des EINEN Wetters | P | 100 Spieljahre Zeitraffer: Brände je km² und Jahr im Faktor 3 der Real-Rate |
| 2 | 3 Klassen (Brand, Hochwasser, Dürre), 10³ km², 10³ a | Rate aus dem Klima; Hochwasser verlässt das Bett | P | Häufigkeits-Kurven gegen GWIS und HQ100, Steigung im Faktor 1,5 |
| 3 | 6 Klassen (+ Beben, Ausbruch, Hangrutsch), Kontinent, 10⁴ a | b 0,8–1,2; VEI-Raten; Rutsch nach Neigung × Nässe | P | 8 Saaten × 10⁴ Jahre: b-Wert und VEI-Raten im Real-Band |
| 4 | Auslöser-Ketten (Beben → Tsunami, Dürre → Brand, Ausbruch → Gletscherlauf) | jede Folge-Gefahr hat ihren Auslöser IN der Welt | P | Tsunamis mit Auslöser in der Welt = 100 %; Rate je Küstenkilometer Faktor 3 |
| 5 | Erd-Saat, Planet, 10⁶ a | die Gefahr-KARTE stimmt, nicht nur die Rate | P, Zeitraffer 10⁶ a ≤ 60 s | Beben-Rate je 1°-Zelle ↔ GEM r ≥ 0,7; Vulkane ↔ GVP r ≥ 0,7; Krater N(>D) ∝ D^−2,7 |
| 6 | Fremd-Planeten, 10⁹ a | Gefahren ohne Erd-Namen aus Wärmefluss, Masse, Atmosphäre | P | 100 Fremd-Planeten: Fremdwelt-Probe (R10) — Gefahr-Klasse und Rate aus Wärmefluss, Masse und Atmosphäre vorhergesagt Rang ≥ 0,7; ≥ 1 namenlose Gefahr je 10 Planeten |

#### Die Antwort auf die Störung

`same.kopplung.stoerung` · Kopplung (R7) — **HEUTE 0 / 7**

*misst:* Wie viele Domänen ein Eingriff (Ereignis, Tat, Wurzel-Mutation) sichtbar ändert und wie lange. Achse: Domänen 1 → 10, Zeit Stunden → 10⁸ a. Richter mit Mutante: Kopplung gekappt → die Folge zeigt 0; ein Glied zählt ab ≥ 2σ gegen die Kontroll-Saat.

*Beleg:* Brand schwärzt, Asche düngt, Sukzession r = 0,825 (stoffe.K5) — Mechanik headless; Tier-, Wasser-, Siedlungs-Antwort fehlt.

*alte Karte:* stoffe.K5

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Domäne, Stunden | Brand schwärzt die Zelle | P | Bildpaar Zelle vor / nach dem Brand, beide Geräte |
| 2 | 3 Domänen (Boden, Pflanze, Licht), 1 Jahr | Asche düngt, Gras → Busch → Wald | P | Zeitsprung 1 Spieljahr: Nachwuchs auf Asche, r(Tempo, Feuchte × Licht) ≥ 0,5 |
| 3 | 5 Domänen (+ Tier, Wasser), 10 Jahre | Tiere fliehen und kehren zurück, Abfluss steigt | P | Tierdichte −50 % sofort, Rückkehr in 3–10 a; Pegel-Spitze ≥ 1,3× |
| 4 | 7 Domänen (+ Siedlung, Wirtschaft), 100 Jahre, 10⁵ Bewohner | Ernteausfall → Preise → Abwanderung | P, Zeitraffer | VEI 5 nahe Stadt: Bevölkerung −20 % binnen 5 a, Kornpreis ×2; Wiederaufbau im Bildpaar nach 50 a |
| 5 | 9 Domänen (+ Verkehr, Macht), 10³ Jahre, 10⁷ Bewohner | Hafen versandet → Handelsweg wandert → Stadt verfällt, andere wächst | P, Zeitraffer | Tsunami-Saat: verlegt neu entstehende Häfen ≥ 50 %; Straßennetz-Diff |
| 6 | 10 Domänen (+ Kultur), 10⁴ Jahre | gefahrangepasste Bauweise, Flutmythen, Gedenken, wo die Gefahr wohnt | P | 100 Saaten: Gefahr-Rate ↔ Anteil angepasster Bauten im Bild r ≥ 0,6 |
| 7 | Mutation an der WURZEL, 10⁶–10⁸ Jahre, Planet | Platte gekippt → andere Küste, Städte, Sprachen; Einschlag → Aussterben → Radiation | Zeitraffer 10⁶ a ≤ 60 s, danach P | 10/10 Glieder am selben Ort geändert (Bildpaar Weltkarte); Arten-Verlust 50–80 %, Erholung in 5–10 Mio. a |

#### Mitten im Ereignis

`same.kopplung.ereignis` · Kopplung (R7) — **HEUTE 0 / 7**

*misst:* Die größte Katastrophe und die meisten Menschen, die der Spieler LIVE erlebt, im Preis. Achse: Fläche 10² m² → Planet, Menschen 0 → 10¹⁰.

*Beleg:* Lava-Zelle glüht und erstarrt als Spieler-Tat (gelaende-core.js:1787-1801); Frame-p95 im brennenden Hektar und Flucht der Bewohner nie gemessen.

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | eine 16-m-Zelle, 0 Menschen | Glut, Lava erstarrt zu Stein | P | Bild der Zelle in Glut und erstarrt, beide Geräte |
| 2 | 1 ha, 10 Menschen | Feuerfront mit Wind und Hang; Bewohner weichen | P während der Front | Frame p95 während 1 ha brennt; Bewohner meiden die Front = 100 % |
| 3 | 1 km², 10³ Menschen | Wald- oder Lavafeld mit Rauch, Glut, Fluss; ein Dorf flieht | P | Bildvergleich gegen Foto (Brandfront, Pahoehoe); Fluchtwege folgen dem Gelände |
| 4 | 100 km², 10⁵ Menschen | Stadtbrand über 10⁴ Gebäude, pyroklastischer Strom; Panik, Helfer, Stau | P | Blind-Urteil gegen historische Bilder ≥ „glaubhaft" bei 70 %; Räumungszeit Faktor 2 gegen Evakuierungs-Modell |
| 5 | 10⁴ km², 10⁷ Menschen (Megastadt) | Tsunami über 1 000 km Küste, Beben M8 unter der Stadt | P am Ereignis | Wellen-Ankunft an 10 Küstenorten ±10 % gegen √(g·h); 100 Stichproben-Personen handeln (keine Statisten-Schleife) |
| 6 | 10⁶ km², 10⁸ Menschen | Supervulkan VEI 8, Kontinent unter Asche, Wanderung | P | Aschedicke gegen Distanz Faktor 2 (Toba/Yellowstone); Himmel-Bild über 3 Jahre |
| 7 | Planet, 10⁹–10¹⁰ Menschen | Einschlag 10 km: Feuerball, globaler Brand, Impakt-Winter, aus jeder Perspektive | P in jeder Perspektive | Flug Krater → Antipode ohne Ladebild; Bildvergleich gegen Chicxulub-Modellierung |

#### Die Erde als Saat

`same.kopplung.erdsaat` · Kopplung (R7) — **HEUTE 0 / 6**

*misst:* Wie viele Ereignisse der echten Geschichte aus Gesetzen nachwachsen statt nachgebaut zu werden — die Zeitreise in die Katastrophe. Achse: 1 Ort → 4,5·10⁹ Jahre Erdgeschichte. Die Erd-Saat trägt ihren Schlüssel (R4); wie genau die Erde selbst sitzt, zählt planet.erde.gestalt, die Orte der Menschheit mensch.zeit.erde.

*Beleg:* Es gibt keine Erd-Saat.

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Ort, 1 Ereignis-Typ | der Ort der Erd-Saat trägt die echte Gefahr (Vesuv am Golf) | P | Bildvergleich gegen Relief-Modell; der Vulkan bricht von selbst aus |
| 2 | 10 Orte, Epoche wählbar | Ausbruch, Beben, Brand mit Rate im Real-Band | P | simulierte Wiederkehr Faktor 3 der historischen |
| 3 | Pompeji 79, Lissabon 1755, London 1666 | Ablauf aus Gesetzen: Säulen-Phase → pyroklastischer Strom; Beben → Brand → Tsunami | P, 10⁴ Menschen live | Zeitachse gegen Quellen (Plinius, Augenzeugen 1755) Faktor 2 je Phase; Blind-Bildvergleich |
| 4 | 100 Ereignisse über 5 000 Jahre | Fernfolgen (Tambora → 1816, Pest → Löhne) entstehen ohne Skript | P, Zeitraffer | Anteil, deren dokumentierte Fernfolge messbar eintritt ≥ 50 % |
| 5 | Quartär, 10⁶ Jahre | Eiszeiten, Meeresspiegel, Gletscher, Ende der Megafauna | Zeitraffer, danach P | Meeresspiegel-Kurve gegen Rekonstruktion Faktor 1,5; Gletscher-Maximum am Ort ±20 % |
| 6 | Erdgeschichte 4,5·10⁹ Jahre | Schneeball-Erde, Massenaussterben, Deccan-Trapps bereisbar | Zeitraffer, danach P | fünf große Aussterben: Zeitpunkt Faktor 2, Arten-Verlust Faktor 1,5 |

#### Die Tat zu jeder Zeit

`same.kopplung.zeitreise` · Kopplung (R7) — **HEUTE 0 / 7**

*misst:* Eine Tat zum Zeitpunkt t ist zu jedem anderen Zeitpunkt richtig sichtbar — vorwärts gealtert, verfestigt, vernarbt, verschüttet, erinnert; rückwärts noch nicht da. Koppelt alle gedaechtnis-Kriterien mit entfaltung.akte. Achse: 1 Stunde → 10⁹ Jahre, dann zwischen Welten.

*Beleg:* Lichtung bleibt über Reload, 138/138 Pflanzen nach 1 Spieljahr (feld.K4, stoffe.K5) — headless; rückwärts klemmt _werkAlter die Zeit auf 0: ein Werk vor seinem Akt erscheint ungealtert statt abwesend.

*alte Karte:* stoffe.K5 · feld.K4

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Lichtung aus 10 Fällungen, 1 Spielstunde | bleibt über Reload, wächst nach | P | Baum-Anteil ≤ 30 %, Stümpfe sichtbar, beide Geräte |
| 2 | Tat + 1 Spieljahr vorwärts | Sukzession, Werk gealtert, gleich nach Reload | P | Pflanzen zurück, Sukzessions-Reihe, Alter nach Reload gleich |
| 3 | Sprung 10–100 Jahre vorwärts | Bau gealtert, Pfad verfestigt, Lichtung Wald, Name am Ort | P, Sprung ≤ 5 s bis Bild | alle Spuren gleichzeitig im Soll ihrer Leiter |
| 4 | Sprung rückwärts vor die Tat und zurück | Werk fehlt, Wiese ungetreten — nach Rückkehr wieder da | P, Sprung ≤ 5 s | Bildpaar t₀−1 ↔ t₀+1: Werk-Pixel 0 % ↔ ≥ 95 % |
| 5 | Sprung 10³ Jahre, Megastadt | Tat als Ruine, Schicht und Erzählung, widerspruchsfrei | P, Sprung ≤ 5 s | Grabung bei t+1000 trifft die Tat als Schicht ±1 m; Bewohner nennen sie |
| 6 | jeder Sprung in der Geschichte jedes Planeten (10⁹ a), Milliarden Taten | jede Tat in jeder späteren Epoche an ihrem Ort richtig gealtert, für alle gleich | P, Sprung ≤ 5 s | N = 100 Zufallspaare (Tat, Zeit): richtige Sichtbarkeit und Alters-Stufe = 100 %, Widersprüche = 0 |
| 7 | zwischen Welten: Tat auf Planet A sichtbar auf B (Licht, Signal, Kolonie) | nach der Laufzeit, die das Gesetz verlangt, nie davor | P | 100 Taten: Sichtbarkeit auf B zur richtigen Zeit |

#### Technik formt den Planeten

`same.kopplung.terraform` · Kopplung (R7) — **HEUTE 0 / 6**

*misst:* ob eine Zivilisation jenseits der Gegenwart ihren Planeten — oder einen fremden — sichtbar umformt: Klima lenken, Meere anlegen, Atmosphäre bauen, Rohstoffe aus dem All — über Epochen, mit Gegenlauf. Der Anfang der Kette ist mensch.zukunft.technik; was Rodung, Damm und Industrie der Gegenwart tun, zählt same.kopplung.aufwaerts.

*Beleg:* Stand 0: der Graben des Spielers füllt sich mit Wasser (gelaende.K2) — die einzige Umformung; keine Technik lenkt Klima oder Welt.

| Nr | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | EIN Eingriff, EINE Region: Wetter lenken über einer Stadt | Regen fällt, wo er gesät wird; nebenan fehlt er | P | Bildpaar mit und ohne Eingriff an derselben Saat: Regenmenge im Zielgebiet höher, im Lee tiefer; Bilanz ±10 % |
| 2 | ein Meer anlegen, eine Wüste begrünen: 10⁵ km², 10² Jahre | Küste, Klima und Leben ziehen nach | P · Sprung ≤ 5 s | Sprung +100 a: neues Ufer mit Bewuchs und Siedlung; Gegenlauf ohne Eingriff: die Wüste bleibt |
| 3 | Geo-Technik am ganzen Planeten: Spiegel, Aerosol, Kohlenstoff-Entzug | die Mitteltemperatur folgt dem Eingriff; Nebenfolgen (der Monsun kippt) treten auf | P | Temperatur-Antwort je Eingriff im Band der Klima-Rechnung (2–5 K je Verdopplung); ≥ 1 ungewollte Folge im Bild; Gegenlauf ohne Eingriff |
| 4 | Industrie im All: Bergbau auf Asteroiden, Aufzug, Ring | Stoff fließt sichtbar vom All zur Stadt; die Stadt wächst daran | P | Gegenlauf Aufzug gekappt → die Bautätigkeit der Stadt fällt binnen Jahren; Stoff-Bilanz ±20 % |
| 5 | Terraforming einer toten Welt über 10³–10⁴ Jahre | Druck, Wasser, erstes Leben, dann Wälder — in der Folge, die die Physik verlangt | P · Sprung ≤ 5 s | 10 Halte: Luftdruck, Meeresfläche, Bewuchs im Bild in richtiger Folge; Gegenlauf Eingriff abgebrochen → die Welt fällt zurück |
| 6 | 100 Saaten: jede Zivilisation formt anders | die Art des Eingriffs folgt Technik, Welt und Wille | P | Fremdwelt-Probe (R10): Eingriff aus dem Orbitbild gelesen Rang ≥ 0,7; Gegenlauf je Saat |

---

# Teil 3 — Was entschieden wurde und was offen bleibt

## Zusammengelegt: 29 doppelte Leitern über die Kapitel hinweg

Die fünf Kapitel des Schwarms trugen 259 Leitern mit 1 750 Sprossen. Wo zwei Leitern dasselbe maßen, lebt EINE weiter — nichts Gemessenes fällt, nur die Doppelzählung.

| Leiter fiel | lebt in | warum |
|---|---|---|
| `mensch.menge.schwarm` (6) | `leben.tiere.masse`, `leben.tiere.wanderung` | Tier-Massen und Zugwege haben im Leben ihr Heim; dieselbe Herde zählte zweimal |
| `same.massstab.menge` (6) | `mensch.menge.bild` | beide zählen Menschen in EINEM Blick, 10² → 10⁸; die Anflug-Probe (Punkt der Menge = Einzelner) zieht in den Richter von mensch.menge.bild |
| `planet.zeit.fossil` (6) | `leben.evolution.fossil`, `leben.evolution.zeitreise` | derselbe Fund im Gestein; der Richter braucht den Stammbaum, die Vielfalts-Kurve zählt die Zeitreise des Lebens |
| `same.gedaechtnis.narbe` (6) | `leben.oeko.sukzession`, `planet.geologie.einschlag` | dieselbe Sukzession Brand → Wald; die Oberfläche als Uhr zählt der Einschlag |
| `mensch.bau.gebrauch` (6) | `same.gedaechtnis.alter`, `mensch.zeit.palimpsest` | Alter, Abnutzung und Ruine sind EINE Dosis-Faltung; Umbau und Spolien zählt das Hervorgehen |
| `same.gedaechtnis.gesellschaft` (6) | `erleben.sinn.legenden`, `mensch.kultur.schrift`, `mensch.kultur.glaube` | Erinnern, Weitergeben, Verzerren ist die Legenden-Leiter; Grab, Mal und Name stehen in Schrift und Glaube |
| `planet.zeit.reise` (8) | `erleben.spieler.zeit` | beide messen die Zeit-Achse des Spielers (Spanne, Stetigkeit, Preis); der ungeschnittene Raffer Magma-Ozean → Stadt zieht als Sprosse 8 um |
| `mensch.kopplung.epoche` (6) | `erleben.kopplung.epoche-ganz` | derselbe Richter: Anachronismen über die Kanäle an einem (Ort, Jahr) |
| `mensch.kopplung.kette` (8) | `same.kopplung.stoerung`, `same.kopplung.kohaerenz` | eine Änderung am Anfang läuft durch die Perspektiven — das ist die Störungs-Leiter; ihr Mutanten-Richter zieht dorthin |
| `leben.kopplung.kaskade` (7) | `planet.kopplung.kaskade`, `same.kopplung.stoerung`, `leben.oeko.dynamik` | Glieder einer Ursache zählten in drei Kapiteln; die trophische Kaskade zählt die Dynamik des Netzes |
| `same.kopplung.relief` (6) | `planet.geologie.vulkan`, `planet.geologie.gebirge`, `planet.relief.wandel` | Lava, Kegel, Verwerfung als bleibende Form sind die Leitern der Geologie |
| `mensch.kopplung.ort` (7) | `planet.kopplung.siedlungslage`, `same.kopplung.aufwaerts`, `mensch.netz.gestalt` | Stadt an Furt, Küste, Pass ist derselbe Richter; der Rückweg (Deich, Landgewinn) zählt aufwärts |
| `mensch.kopplung.nutzung` (7) | `same.kopplung.aufwaerts` | Rodung, Erosion, Industrielandschaft: das Kleine schreibt das Große — eine Leiter |
| `planet.kopplung.eingriff` (6) | `same.kopplung.aufwaerts`, `mensch.nahrung.erdbau`, `mensch.fahrzeug.medium` | Graben und Damm zählt der Erdbau, Boote das Fahrzeug, die Megastadt, die Land formt, das Aufwärts |
| `same.massstab.treue` (7) | `erleben.bild.ferne` | derselbe Richter „Ferne = Nähe“; die Galaxie-Sprosse zieht als Sprosse 9 um |
| `erleben.spieler.ort` (7) | `same.massstab.spanne`, `same.entfaltung.reise`, `same.massstab.sprung` | Zoom, Reise und Sprung haben je EIN Heim im Maßstab |
| `planet.kosmos.reise` (7) | `same.entfaltung.reise`, `same.massstab.sprung` | Boden → Orbit → Nachbarwelt → Stern ist die Reise-Leiter (Sprossen 5–8); das Tor ist ein Sprung |
| `planet.relief.massstab` (6) | `same.massstab.spanne`, `same.massstab.nahe`, `erleben.bild.ferne` | Korn bis Orbit ohne Bruch ist die Spanne, das kleine Ende die Tiefe, nah = fern die Fernsicht |
| `mensch.leib.nahfern` (6) | `mensch.menge.bild`, `erleben.bild.ferne` | ein Leib vom Orbit bis 0,5 m derselbe: die Anflug-Probe der Menge |
| `mensch.spieler.leib` (6) | `erleben.spieler.rolle`, `erleben.spieler.praesenz` | jeden Leib bewohnen ist die Rollen-Leiter des Erlebens |
| `mensch.spieler.rolle` (8) | `erleben.spieler.rolle` | jede Rolle, die Welt antwortet: dieselbe Leiter, einmal gezählt |
| `erleben.schoepfen.bleiben` (6) | `same.entfaltung.akte`, `same.gedaechtnis.alter` | Werke über Reload, Geräte und Jahre ist „die Tat bleibt“; Besitz und Erbe ziehen in deren Sprosse 7 |
| `erleben.bild.medium` (6) | `planet.wasser.tiefsee`, `leben.wasser.bild`, `planet.wetter.wolken`, `planet.geologie.unterwelt`, `planet.wasser.seegang` | jede seiner Sprossen (Spiegel, unter Wasser, Wolke, Höhle, Tiefsee) hat schon eine Leiter |
| `mensch.netz.lesbarkeit` (6) | `erleben.spieler.wegfindung`, `mensch.kultur.schrift` | sich zurechtfinden mit Mitteln der Welt ist die Wegfindung; Schilder und Namen zählt die Schrift |
| `mensch.sport.geraet` (7) | `same.physik.flug`, `mensch.sport.regeln` | Flug, Drall und Stoß des Balls sind die Physik der Umströmung |
| `erleben.sinn.wettkampf` (7) | `mensch.sport.arena`, `mensch.sport.regeln`, `mensch.macht.krieg`, `erleben.spieler.rolle` | Wettbewerbe der Welt zählt die Arena, der Kampf den Krieg, der Spieler als Athlet die Rolle |
| `same.kopplung.seuche` (6) | `mensch.menge.seuche`, `leben.oeko.partner` | Ansteckung auf echten Kontakten, 10² → 10¹⁰: eine Leiter; Erreger über Arten zählt die Wechselbeziehung |
| `mensch.kopplung.geschichte` (6) | `same.kopplung.stoerung`, `same.kopplung.aufwaerts` | Natur bricht Geschichte ist die Antwort auf die Störung; Macht formt Land das Aufwärts |
| `mensch.bau.tragwerk` (7) | `same.physik.tragen` | trägt und versagt richtig: EIN Richter (Tragen und Brechen), dort steht „jedes gesäte Haus steht, weil es trägt“ |

Dazu: zwei Sprossen zogen um (der ungeschnittene Raffer Magma-Ozean → Stadt nach `erleben.spieler.zeit` 8, die Galaxie-Sprosse nach `erleben.bild.ferne` 9), zwei Sprachen-Sprossen fielen aus `erleben.klang.stimme` (sie zählen in `mensch.kultur.sprache`), alle Kopplungen stehen in EINEM Kapitel.

## Nach der Prüfung dazugekommen: 23 Leitern

Die Prüfer fanden Worte des Schöpfers ohne Leiter. Diese kamen dazu; der Kosmos wurde ein eigenes Kapitel.

| Leiter | Sprossen | warum |
|---|---:|---|
| `planet.kosmos.eigengesetz` — Welten mit eigenem Naturgesetz | 7 | Planeten, die unsere Vorstellung kaum zu bauen vermag: Welten mit eigenen Konstanten, Chemie und Geometrie — gerichtet an ihrem eigenen Gesetz |
| `planet.kosmos.kunstwelten` — Gebaute Welten — Ring, Schale, Hohlwelt, Scheibe | 6 | gebaute Welten (Ring, Schale, Hohlwelt, Scheibe) hatten keine Leiter |
| `planet.kosmos.galaxien` — Galaxien, Haufen und das junge All — als Ziel | 7 | der Kosmos endete an der eigenen Galaxie und an der Geschichte EINES Planeten |
| `planet.erde.gestalt` — Die echte Erde — erkannt und vermessen | 6 | die echte Erde zählte nirgends als Punkt; jetzt Saat mit Schlüssel, der Schlüssel im Byte-Preis |
| `mensch.sport.medium` — Sport in jedem Medium — Schnee, Brandung, Luft, Motor, Tier | 7 | sämtliche Sportarten: Schnee, Eis, Brandung, Luft, Motor, Tier, anderer Leib, Bildschirm |
| `mensch.geist.innenleben` — Innenleben — Gefühl, Bindung, Kindheit, Alter | 7 | Gefühl, Liebe, Humor, Trauer, Kindheit, Alter — Personen statt Planerfüller |
| `mensch.stadt.habitat` — Siedeln jenseits der Oberfläche | 7 | Siedeln unter der Erde, unter Wasser, auf Mond, Mars, Asteroid, im freien Raum |
| `mensch.stadt.messlatte` — Die Stadt gegen die Besten | 7 | die vom Schöpfer genannten Messlatten (Cyberpunk 2077, Rockstar, Tokio) als Richter der Stadt selbst |
| `mensch.kultur.bildkunst` — Bild, Skulptur, Baukunst | 7 | Malerei, Skulptur, Wandbild, Baukunst fehlten ganz |
| `mensch.kultur.erzaehlkunst` — Buch, Bühne, Film | 7 | Literatur, Theater, Film fehlten ganz |
| `mensch.kultur.strassenleben` — Straßenleben — Küche, Mode, Nacht, Vergnügen | 7 | Küche, Mode, Nachtleben, Vergnügen — das Leben der Straße |
| `mensch.zeit.erde` — Orte und Zeiten der echten Menschheit | 6 | Rom um 100, Edo, Tenochtitlan: Orte der echten Menschheit gegen Plan und Bildquelle |
| `mensch.zukunft.technik` — Technik nach uns — Epochen jenseits der Gegenwart | 7 | die Technik endete beim heutigen Chip |
| `mensch.zukunft.medien` — Rechner, Netz und die Bildschicht der Stadt | 7 | Rechner, Netz, Bildschirm, Hologramm, Werbung als Schicht der Stadt |
| `mensch.zukunft.maschinenwesen` — Roboter, Androiden, KI-Personen | 7 | Roboter, Androiden, KI-Personen |
| `mensch.zukunft.leib` — Der veränderte Leib — Implantat, Prothese, Gentechnik | 7 | Implantat, Prothese, Gentechnik |
| `erleben.spieler.nichtleib` — Sein, was kein Leib ist | 7 | jede erdenkliche Perspektive ist mehr als jeder Leib: Fluss, Wolke, Stadt, Maschine, Planet, Stern |
| `erleben.spieler.forscher` — Instrument und Ursache — der Blick des Forschers | 7 | Instrumente und Feldkarten; die Welt zeigt ihre Ursachen und lehrt die Wirklichkeit |
| `erleben.sinn.sog` — Der Sog — bleiben und wiederkommen | 7 | Fühlbarkeit hatte keinen Richter: freiwillige Spielzeit, Wiederkehr, Wahl gegen das Beste |
| `erleben.sinn.staunen` — Die erlebte Größe — Staunen und Merken | 7 | ob ein Spieler die Größenordnungen merkt, glaubt und bestaunt |
| `erleben.bild.kamera` — Jede Kamera — Foto, Kino, Wiederholung, Zuschauen | 7 | Foto, Kino, Wiederholung, Zuschauen, Übertragung, Kartenblick |
| `same.preis.speicher` — Speicher, Wärme, Akku | 6 | Speicher, Wärme und Akku als Preis-Achse — dort reißt die Megastadt zuerst |
| `same.kopplung.terraform` — Technik formt den Planeten | 6 | Technik der Zukunft formt den Planeten: Kette mit Gegenlauf über Epochen |

Dazu: je eine Sprosse wuchs an `planet.zeit.klimageschichte` (die ferne Zukunft des Planeten) und `same.massstab.spanne` (bis zu fremden Galaxien); eine fiel aus `erleben.spieler.gemeinsam` (10⁸ Mitspieler, siehe offene Fragen). Neu gefasst wurden `mensch.stadt.groesse`, `mensch.zeit.spanne`, `same.entfaltung.vielfalt` und die vier Preis-Leitern Ankunft, Takt, Bytes, Ausdauer.

## EIN Stand, zwei Zahlen

Die Kapitel des Schwarms zählten HEUTE nach fünf Regeln (0 · 4 · 17 · 0 · 12 = 33), die erste Fassung der Karte buchte 5. Diese Fassung bucht 0: ein Punkt entsteht nur aus einer Fahrt des eigenen Richters am Kopf, am Standardgerät, mit P in derselben Fahrt (Z2) — und keine solche Fahrt gibt es. Was die Stationen der alten Karte im echten Spiel an beiden Geräten zeigen, steht als KERN daneben (19 Sprossen in 16 Leitern), nie doppelt (R9): der Tagesplan hebt nur `mensch.geist.tag`, das Wachstum nur `mensch.zeit.palimpsest`, das benutzte Werk nur `erleben.spieler.rolle`. Was nur headless, nur als Code-Zitat, nur an einem Gerät oder ROT belegt ist, steht im Beleg.

| Leiter | Kern | gestützt auf |
|---|---:|---|
| `planet.wasser.kreislauf` | 1 | Pegel nach Sturm im Bild an beiden Geräten (wetter.K3), Bilanz als Zahl headless; Bild-Preis nicht gemessen. |
| `leben.pflanzen.jahreslauf` | 1 | Richter an beiden Geräten grün (vegetation.K5); Bild-Preis nur an der GTX belegt, die Radeon fehlt. |
| `leben.pflanzen.kraft` | 1 | die nahe Böe an beiden Geräten grün (vegetation.K2); Bild-Preis an der Radeon fehlt. |
| `mensch.sport.koerper` | 1 | Tempo und Sprung an beiden Geräten gebucht (leib.K2); Bild-Preis in Bewegung an der Radeon ROT (gehend 66 % der Bilder über 33 ms). |
| `mensch.geist.tag` | 1 | Soll-Orte an beiden Geräten grün (mensch.K2); der Bild-Preis reißt am Dorfplatz (Radeon ≈ 37 ms). |
| `mensch.stadt.siedlungsnetz` | 1 | an beiden Geräten grün (siedlung.K2); Bild-Preis am Hügel an der Radeon nicht gemessen. |
| `mensch.nahrung.erdbau` | 1 | Graben füllt sich im Ausgabe-Bild an beiden Geräten (gelaende.K2); Bild-Preis beim Graben nicht gemessen. |
| `mensch.zeit.palimpsest` | 1 | Wachstum an beiden Geräten grün (siedlung.K4); Bild-Preis nicht gemessen. |
| `erleben.spieler.rolle` | 1 | Werk wird benutzt (bauen.K5), Hieb trifft (halten.K1), Fahrt (fahrzeug.K3/K4) je an beiden Geräten im Bild; Bild-Preis in Bewegung an der Radeon ROT. |
| `erleben.sinn.ziele` | 1 | die Antwort am Ort an beiden Geräten, Tag und Nacht, Ego und Third (affekt.K1); Bild-Preis nicht gemessen. |
| `erleben.klang.raum` | 2 | am Abgriff gemessen (klang.K3); Bild-Preis in der Szene nicht gemessen; das alte Klang-Budget (an der Radeon 0,25 ms gegen 0,2) ist kein Preis mehr (R8). |
| `erleben.klang.ereignis` | 2 | am Abgriff an den Geräten gemessen (klang.K4); Bild-Preis in der Szene nicht gemessen; das alte Klang-Budget ist kein Preis mehr (R8). |
| `erleben.klang.landschaft` | 1 | Zensus am Abgriff, Wind gesehen = gehört an beiden Geräten (klang.K1, klang.K2); Bild-Preis in der Szene nicht gemessen; das alte Klang-Budget ist kein Preis mehr (R8). |
| `same.entfaltung.akte` | 1 | Bildpaar vor ↔ nach Reload an beiden Geräten grün (speicher.K4); der Bild-Preis in dieser Szene ist an der Radeon nicht gemessen. |
| `same.preis.ankunft` | 1 | 0 — kein Lauf des Richters am Kopf (Z2). Kern 1: ≤ 60 s kalt ist an beiden Geräten gemessen. Sprosse 2 nicht im Kern: das ganze Bild (≤ 2 % Lücke) ist nur an der Radeon gebucht (ankunft.K2). |
| `planet.kopplung.wetter-welt` | 2 | die Front im Licht (licht.K5) und die Nässe (wetter.K2) stehen je an beiden Geräten im Bild; als Glieder zählt jede für sich (Z3). Der Wind-Leser ist nur headless; Bild-Preis im Sturm an der Radeon nicht gemessen. |

## Gleichlauf der Höhen (R5), gerechnet

Von 90 Leitern, deren Umfang in mindestens vier Sprossen eine Zehnerpotenz nennt, steigen 45 mit etwa einer Zehnerpotenz je Sprosse (0,75–1,5), 26 mit etwa zwei (1,5–2,5), 4 steiler; bei 15 wächst die genannte Zahl kaum, weil dort Tiefe oder eine andere Einheit steigt. Die steilsten: `same.massstab.sprung` (4,5), `same.massstab.spanne` (3,8), `planet.kosmos.systeme` (2,7), `mensch.bau.innen` (2,7), `same.physik.koerper` (2,5), `planet.relief.wandel` (2,3). Ein Punkt wiegt dort mehr Größenordnung als anderswo; die Karte nennt es, statt es zu glätten (R5). Die Marke „10⁶“ steht in 96 Leitern zum ersten Mal auf Sprosse 2 (2×), 3 (7×), 4 (17×), 5 (35×), 6 (21×), 7 (13×), 8 (1×) — im Median auf Sprosse 5, in 73 von 96 Leitern höchstens eine Sprosse daneben. Gleiche Worte heißen jetzt überall dieselbe Größe (Tafel der Umfangs-Klassen in `REGELN.md`); gleiche Größe steht darum noch nicht überall auf gleicher Sprosse — Menschen laufen eine Dekade vor den Bauten, und `planet.geologie.platten` steigt zwei Dekaden je Sprosse. Die übrigen 163 Leitern steigen in Prüfhärte, Zahl der Glieder oder Achsen — dort ist die Sprossenhöhe ein Urteil, keine Rechnung.

## Offene Fragen (R6 — ohne Richter, darum kein Punkt)

1. Funktion gegen Gedächtnis: ob Meeresströme, Eisschilde, Seuchen, Kriege und Spieler-Eingriffe über Äonen als f(Saat, Ort, Zeit) + Akte bei 33 ms abrufbar sind oder Integration brauchen — und was ein Damm bei −10 ka mit T = 0 tut. Kausalität der bereisten Vergangenheit hat noch keine Regel.
2. Der Schlüssel der Erde: die Erde zählt als Saat mit Schlüssel (R4), aber wie fein sie bei welchem Gewicht sitzt, ist eine Schranke der Information, keine der Kunst — die Decken in planet.erde.gestalt und mensch.zeit.erde (10 kB bis 10 MB) sind gesetzt, nicht abgeschätzt, und ab deren Sprosse 6 wird der Schlüssel am Ort geladen: dort bricht die Erde „0 Byte“, gezählt und mit Absicht.
3. Die Fremdwelt-Probe (R10) braucht zwei Werkzeuge, die es nicht gibt: den eingefrorenen Leser der Ursachen-Probe, geeicht an Erde, Mond, Mars, Venus, Io, Europa, Titan, und den Korpus bekannter Welten für die Neuheit (Sondenbilder, Erd-Epochen, Welten der Vergleichstitel) — beides, ohne dass die Welt auf sie hin gebaut wird.
4. Der Prüfer-Satz (R11) ist gesetzt, aber nicht bestellt: kein Panel ist geworben, kein Modell eingefroren, kein Korpus liegt im Repo (DEM-Kacheln, Fotosätze, Seshat, WALS, Sterbetafeln). Alle Schwellen und Bänder — Blindtest-Quoten, ±-Bänder, Speicher-Decken, Schlüssel-Decken — sind gesetzt, nicht geeicht.
5. Die Messlatte ist nicht vermessen: die vier Zählungen (Dinge je 100 m, Innenräume je Block, Bewohner mit Tagesplan je Straße, Sekunden bis in die Straße) sind in keinem Vergleichstitel gefahren; bis dahin hat mensch.stadt.messlatte ein Protokoll, aber keine Zahl zum Schlagen.
6. Fern-Rechnen: Rede und Erschaffen dürfen in den unteren Sprossen einen Rechner in der Ferne nutzen (Antwortzeit und kB je Antwort stehen in der Spalte Preis); eine Decke für die Rechenkosten je Spielstunde fehlt, und ob Rede für Milliarden am Gerät allein geht (oberste Sprossen von mensch.geist.gespraech und erleben.klang.stimme), entscheidet ein Spike, nicht die Karte.
7. Mitspieler jenseits 10⁶: die Leiter erleben.spieler.gemeinsam endet, wo das Last-Protokoll fahrbar ist. Ob 10⁸ Menschen in EINER ungeteilten Welt zur Vision gehören, steht nicht in den Worten vom 14.11. („Millionen von Personen“ sind Bewohner); die Sprosse ist gestrichen und hier genannt, damit sie nicht still fällt.
8. Gewalt, Seuche, Massensterben als Inhalt und der Schutz Minderjähriger über Rechtsräume sind Fragen von Scope und Ship, kein Richter.
9. G0, der Browser ohne WebGPU (≈ 16 %): mit dem heutigen Boden unerreichbar; same.preis.ankunft 8 und same.preis.takt oben fordern ihn trotzdem. Die Geräte-Verteilung der Menschheit hat keine gefundene Quelle.
10. Physik bei 33 ms: fließende Lava, brechende Wellen, 10⁴ bewegte Fahrzeuge, 10⁵ Stoff-Leiber auf Laptop-Grafik sind Vision ohne Abschätzung; ob die Funktion statt der Simulation reicht, entscheidet ein Spike, nicht die Karte. Das wandernde Standardgerät (Z7) verschiebt die Schranke, hebt sie nicht auf.
11. Gleichlauf der Höhen (R5): die Leitern steigen nicht alle gleich steil — manche eine Zehnerpotenz je Sprosse, manche zwei bis drei; die Karte nennt die Ausreißer und zieht sie nach, wenn der erste Richter der Leiter gefahren wird. Eine Fähigkeit — die Megastadt im Preis — öffnet Sprossen in etwa 30 Leitern zugleich; jede braucht dennoch ihren eigenen Lauf.
12. Sprossen-Doppelte unterhalb der Leiter-Ebene: 29 doppelte Leitern sind zusammengelegt; einzelne Sprossen teilen noch eine Messgröße (z. B. Graben füllt sich, Wölfe → Jungwuchs, Witterung führt zur Beute). Dort gilt R9: EIN Heim, der andere Lauf fehlt.
13. Glieder-Leitern (Z3): neun Kopplungs-Leitern sind als „Glieder“ markiert, weil ihre Sprossen Teilsysteme sind; die Grenze zu Leitern, die wirklich in Größenordnungen steigen, ist ein Urteil, keine Rechnung.
14. Der Stand: kein Richter dieser Karte ist bisher als eigene Station gefahren, darum ist HEUTE 0. KERN ist eine Zuordnung gebuchter Stationen der alten Karte, kein Urteil; „ungemessen“ trennt noch nicht, was fehlt, von dem, was steht und nie gerichtet wurde — das sagt nur der Beleg.

## Was die Prüfer fanden

Drei Gegner haben die erste Fassung geprüft: **ganz** (deckt die Karte die Worte des Schöpfers?), **scharf** (haben die Richter Zähne?), **fair** (stimmen Zählung und Stand?). 66 Mängel, 18 davon schwer. Jeder ist hier entschieden: 58 behoben, 7 in Teilen verworfen (ihr Rest ist behoben), 1 ganz verworfen. Was danach noch offen ist, steht am Ende beim Namen. Die Prüfung hat 127 Richter und 269 Sprossen in 100 bestehenden Leitern geändert, 23 Leitern hinzugefügt und den Kosmos zum eigenen Kapitel gemacht.

### Behoben

**Linse „ganz“ — was die Vision verlangt und fehlte**

- **Zivilisation jenseits der Gegenwart (schwer).** Neue Perspektive „Zukunft“ mit vier Leitern: `mensch.zukunft.technik`, `.medien`, `.maschinenwesen`, `.leib`. Der Richter „Blindtest gegen reale Zukunftsstudien“ (`mensch.stadt.breite` 5) ist ersetzt durch die Fremdwelt-Probe am Bild.
- **Die Messlatten des Schöpfers als Richter (schwer).** Neue Leiter `mensch.stadt.messlatte`: dieselbe Szene im Blindpaar gegen die Stadt aus Cyberpunk 2077, die jüngste Stadt von Rockstar Games und Straßenfotos von Tokio, dazu vier Zählungen nach EINEM Protokoll. Die Worte-Tabelle zeigt darauf.
- **Erfundene Schöpfer-Abhängigkeit (schwer).** R11 ist gesetzt (Panel ≥ 12, 2AFC, geeichtes Modell), der Satz „bis der Schöpfer den Satz setzt“ ist gestrichen; die Frage der Erd-Saat hat die Karte selbst entschieden.
- **Die echte Erde (schwer).** Entscheid in R4: die Erde zählt — als Saat mit Schlüssel, Erd-Daten nur als Parameter derselben Gesetze, ihr Gewicht im Byte-Preis. Neue Leitern `planet.erde.gestalt` (Küste gegen Höhenmodell, Orte gegen Ortsverzeichnis) und `mensch.zeit.erde` (Rom, Edo, Tenochtitlan gegen Plan und Bildquelle); `planet.geologie.platten` 7 richtet ohne Vorbehalt gegen die Paläokarte.
- **Welten jenseits der Erd-Physik (schwer).** Neue Leitern `planet.kosmos.eigengesetz` und `planet.kosmos.kunstwelten`. R10 heißt jetzt Fremdwelt-Probe: Gesetzes-Konsistenz unter dem eigenen Gesetz (Ursachen-Probe, Gegenlauf) plus Neuheit gegen einen Korpus bekannter Welten; „könnte so sein“ ist als Richter gestrichen. `same.entfaltung.vielfalt` ist neu gefasst.
- **Fühlbarkeit ohne Richter (schwer).** Neue Leitern `erleben.sinn.sog` (freiwillige Spielzeit, Wiederkehr, Wahl gegen den Vergleichstitel) und `erleben.sinn.staunen` (ob ein Spieler die Größenordnungen merkt, glaubt, bestaunt). Die offene Frage dazu ist gefallen.
- **Bildende und erzählende Künste (mittel).** `mensch.kultur.bildkunst`, `mensch.kultur.erzaehlkunst`.
- **Perspektiven jenseits des Lebewesens (mittel).** `erleben.spieler.nichtleib`: Fluss, Wolke, Lava, Schwarm, Stadt, Maschine, Planet, Stern.
- **Der Blick des Forschers (mittel).** `erleben.spieler.forscher`: Instrumente, Feldkarten, Versuch und Vorhersage, Lernen an der Welt.
- **Blickweisen jenseits von Ego und Third (mittel).** `erleben.bild.kamera`: freie Kamera, Foto, Wiederholung, Zuschauen, Übertragung, Kartenblick, Kino.
- **Speicher, Wärme, Akku (mittel).** Der Speicher ist Teil von P (Tafel der Preis-Treppe) und hat eine Leiter: `same.preis.speicher`.
- **Gewicht der Kapitel (mittel).** Z1: jedes Kapitel wiegt gleich, darin jede Perspektive, darin jede Leiter; der Kosmos ist ein eigenes Kapitel mit 9 Leitern. Ein Gewicht je Wort wurde nicht gewählt — die genannten Worte sind nach dem Schöpfer selbst nur wenige der Perspektiven.
- **Galaxien und junges All (mittel).** `planet.kosmos.galaxien`; `same.massstab.spanne` reicht bis 10²⁶ m (Sprosse 9), `erleben.spieler.zeit` bis zum ersten Licht.
- **Stadt-Spitze „≥ 1 % begehbar“ (mittel).** `mensch.stadt.groesse` 8: alles Gesehene ist betretbar, gerichtet an 1 000 im Bild gewählten Gebäuden.
- **Sämtliche Sportarten (mittel).** `mensch.sport.medium`: Schnee, Eis, Brandung, Luft, Motor, Tier, anderer Leib, Bildschirm.
- **Innenleben (mittel).** `mensch.geist.innenleben`: Gefühl im Gesicht, Bindung, Humor, Trauer, Kindheit, Alter, seelische Not.
- **Siedeln jenseits der Oberfläche (mittel).** `mensch.stadt.habitat`.
- **Ferne Zukunft des Planeten (leicht).** Neue Sprosse 8 in `planet.zeit.klimageschichte`; der Raffer in `erleben.spieler.zeit` 8 läuft bis +5 Ga.
- **Küche, Mode, Nachtleben (leicht).** `mensch.kultur.strassenleben`.
- **Technik formt den Planeten (leicht).** Kopplung `same.kopplung.terraform`, mit Gegenlauf über Epochen.

**Linse „scharf“ — Richter ohne Zähne**

- **EIN Tor vor jeder Sprosse (schwer).** R3 und R8 neu: der Preis wächst mit dem Umfang (Preis-Treppe), die Ankunft in 5 s gehört erst ab der Klasse Stadt zu P, „ab Sprosse 3“ ist gestrichen. Der Kern steht als zweite Zahl öffentlich neben HEUTE (Z5).
- **Umfang im Saat-Raum gratis (schwer).** R4: Umfang wird im Spiel gezählt (Akkumulationskurve, Chao1 über Wahrnehmungs-Cluster, in EINER Welt). Neu gefasst: `leben.pflanzen.arten` 5–7, `leben.tiere.arten` 5–8, `planet.kosmos.systeme` 5 und 7, `erleben.klang.musik` 7.
- **`mensch.stadt.groesse` (schwer).** Ganze Leiter neu: jede Sprosse zählt die Gebäude, stellt Straßen- und Luftbild im 2AFC gegen Fotos der Stadtklasse und prüft die Statistik des Plans gegen ein Band vieler Städte — nie gegen EINE.
- **Existenz statt Wahrheit in der Zeit (schwer).** `mensch.zeit.spanne` neu: Blind-Datierung, Fehler ≤ 10 % der Spanne, Nachbar-Halte mit benennbarer Ursache.
- **Einseitige Bänder (schwer).** `erleben.spieler.zeit` 3 und `same.entfaltung.abwesenheit` 6 verlangen jetzt Gleichheit bei Wiederholung UND messbare Veränderung am Ziel.
- **Richter gegen den eigenen Code (schwer).** Neu gegen die Welt gefasst: `planet.relief.boden` 1, `planet.geologie.vulkan` 1, `planet.wetter.wolken` 1, `mensch.menge.bevoelkerung` 1, `erleben.sinn.legenden` 1, `planet.kopplung.siedlungslage` 1; R2 sagt es als Regel.
- **Urteilsworte ohne Referenz (mittel).** An der Wurzel: R6 macht „plausibel“, „stimmig“, „glaubhaft“, „echt“ zur Kurzform für EIN Maß, jede Perspektive trägt ihren Referenz-Korpus (über jeder Perspektive in Teil 2, als Tafel in `REGELN.md`). 43 Richter sind dazu einzeln neu gefasst, darunter alle beim Namen genannten.
- **Richter lesen inneren Zustand (mittel).** `leben.oeko.netz` 2 und 3 (Transekt im Spielgang), `planet.relief.boden` 4 (Anschnitt blind klassiert), `erleben.sinne.geruch` 6 (der Spieler als Lachs), `mensch.sport.koennen` 4 und 5 (Wettkampf im Bild), dazu `mensch.zeit.erleben` 5 und `erleben.sinn.tod` 1.
- **Preis-Zahlen in Inhalts-Leitern (mittel).** 102 Preis-Spalten normiert: Budgets je Teilsystem, Ankunfts-Vergleiche und „P+A“ sind gestrichen; die Sprung-Zeit hat ihr Heim in `same.massstab.sprung` (R8).
- **Megastadt-Maß uneinheitlich (mittel).** Tafel der Umfangs-Klassen in `REGELN.md` (Tokio-Maß: 3,7·10⁷ Menschen, ~10⁷ Bauten, 8 500 km² bebaut); die Megastadt- und Tokio-Sprossen der Karte sind auf diese Worte gezogen.
- **Andersheit belohnt Rauschen (mittel).** `same.entfaltung.vielfalt` 7, `leben.evolution.zivilisation` 7, `leben.evolution.fremde-physik` 7 tragen Zahlen und die Ursachen-Probe; `mensch.kopplung.leben` 6 hat den Gegenlauf „dieselben Personen → dieselben Wendepunkte“.
- **Kopplung ohne Gegenlauf (mittel).** `planet.kopplung.siedlungslage` 3–7, `mensch.kopplung.leben` 2 und 5, `mensch.kopplung.antwort` 1 und 3.
- **Rede aus einem Sprachmodell ohne Preis (mittel).** Die Spalte Preis in `mensch.geist.gespraech` und `erleben.sinn.legenden` 2 nennt Antwortzeit und kB je Antwort; die oberste Sprosse verlangt das Gerät allein (R8, Preis-Treppe).
- **Nenner folgt dem Fleiß des Schnitts (mittel).** Z1 gewichtet, Z8 nennt es.
- **Tautologische Statistik (mittel).** `mensch.sport.koennen` 3 und 5 mit Gegenlauf (Teilnehmer ÷ 10, Übung gekappt), `planet.kosmos.systeme` 1 an der Bahn am Himmel.
- **Umfang als Liste oder Bauweise (leicht).** `erleben.klang.musik` 1 (Hörer-Blindtest), `erleben.sinne.geruch` 1 und 2.
- **Sprache (leicht).** `mensch.kultur.sprache` 5 (Linguisten-Blindtest gegen eine unbekannte reale Sprache), 7 (Verständigungs-Probe mit Gegenlauf).
- **Wer urteilt (leicht).** Bruch ist beziffert (Luma > 5 % oder Lage > 1 %) in `mensch.zeit.spanne` 4 und `erleben.bild.auge` 6.
- **Lenker (leicht).** `mensch.fahrzeug.lenker` 1 mit Durchsatz und Reisetempo, 5 mit Wettkampf im Bild.
- **Nachtstadt (leicht).** `mensch.bau.huelle` 4: 2AFC gegen Nachtfoto, erleuchtete Fenster gegen Zählreihen.
- **Punkt auf alter Messung, Ausdauer trotz ROT (leicht).** Siehe „fair“: HEUTE ist 0.
- **„Plausibel“ in Zeit und Abwesenheit (leicht).** `same.entfaltung.abwesenheit` 5 (Zipf, Wachstumskurven), 6 (Paläo-Band).
- **Widerspruchs-Zähler (leicht).** `leben.evolution.zivilisation` 6: Ursachen-Probe mit Gegenlauf (ohne Erz kein Metall im Bild).

**Linse „fair“ — Zählung und Stand**

- **Preis als Tor, zwei feste Geräte (schwer).** Wie oben; dazu Z7: das Standardgerät ist eine Klasse, die mit den Jahren wandert.
- **Prüfer-Satz gesperrt (schwer).** R11 gesetzt.
- **5 Punkte ohne Richter (schwer).** Z2: gebucht wird nur der eigene Richter am Kopf. HEUTE ist 0; `same.preis.bytes` hat keinen Kern mehr (Datei-Summe statt Netz-Mitschnitt), `same.preis.ankunft` 1 steht im Kern.
- **Geschönter Fuß der Preis-Leitern (schwer).** Jede Sprosse der Preis-Leitern richtet an beiden Geräten (Z7); die Sprossen „an 1 Gerät“ sind gefallen.
- **Ankunft Kern 2 (schwer).** Kern 1; `BRUECKE.md` führt ankunft.K2 als „im Spiel an EINEM Gerät“.
- **Punkt aus profiband.K5 (schwer).** `same.preis.ausdauer` steht bei 0, die Messung ist ROT; Sprosse 1 verlangt jetzt eine Heap-Steigung.
- **Kern doppelt gehoben (mittel).** `mensch.menge.rhythmus`, `mensch.kopplung.antwort` auf Kern 0 (R9, Z6); der doppelte Richter „Soll-Orte“ ist aus `mensch.menge.bevoelkerung` 1 gefallen. Kern-Summe 19.
- **„Plausibel“ in 41 Richtern (mittel).** Wie oben, R6 und Korpus.
- **`erleben.sinn.tod` Kern 1 (mittel).** Kern 0: gemessen ist Zustand, nicht das Bild.
- **`mensch.macht.krieg` Kern 1 (mittel).** Kern 0; Sprosse 1 ist jetzt ein Zweikampf zweier Bewaffneter, die Jagd des Rudels zählt bei den Tieren.
- **R5 gegen die Sprossen 1 (mittel).** R5: Sprosse 1 ist der kleinste richtbare Umfang; ob es ihn heute gibt, sagt der Beleg. Das JSON trägt je Leiter den Fuß (Kern · gemessen · ungemessen), der Kopf nennt die drei Zahlen.
- **Nenner nach der Feinheit des Schnitts (mittel).** Z1: Gewicht je Kapitel, Perspektive, Leiter — der Kosmos wiegt so viel wie der Mensch.
- **Kopplungs-Leitern als Listen (mittel).** Z3: neun Glieder-Leitern, jede Sprosse zählt für sich; `planet.kopplung.wetter-welt` trägt Kern 2 (Licht und Nässe).
- **Saat-Statistik im Fenster an zwei GPUs (mittel).** R2: Statistik einer Gestalt darf aus dem Gesetz gerechnet werden, wenn eine Bild-Stichprobe im Fenster sie bestätigt.
- **„Gestrichen“ nur als Text (mittel).** Die Ankunft ab Sprosse 3 ist wirklich gestrichen (R8).
- **Soll-Tafel in den Preis-Leitern (leicht).** Die Tiefe der Preis-Leitern heißt „volles Bild der Auslieferung, keine Klasse abgeschaltet“; wie wahr das Bild ist, richten die Inhalts-Leitern.
- **Bild-Zeit im Stadt-Richter (leicht).** Mit der Neufassung gefallen.
- **Feldname `summe.kern` (leicht).** `kern` ist jetzt Σ kern, `kernDazu` Σ (kern − heute); dazu die gewichteten Anteile.

### Verworfen — mit Begründung

- **Zeilen-Drift `koerper-core.js:4919` (fair, leicht) — ganz verworfen.** Am main steht `var TAGES_GESETZ` in Zeile 4919; Zeile 4891 ist der Kommentar darüber. Der Beleg stimmt.
- **Doppelte Leitern Rolle und Zeitreise (scharf, mittel) — in Teilen.** `mensch.spieler.rolle` und `planet.zeit.reise` waren schon zusammengelegt (Teil 3). Behoben ist der Rest: `mensch.zeit.spanne` misst jetzt die Wahrheit der Epoche statt der Spanne, `same.entfaltung.vielfalt` keine Arten mehr, `erleben.sinne.geruch` 6 nicht mehr die Wanderung.
- **Megastadt als eine Leiter, die alle anderen trägt (scharf, mittel) — in Teilen.** Nicht übernommen: jede Megastadt-Sprosse hat ihren eigenen Richter (Verkehr, Menge, Klima), die Fähigkeit ist nötig, nicht hinreichend. Übernommen: EIN Maß und der Name der Häufung in den offenen Fragen.
- **Gleiche Größe auf gleicher Sprosse (fair, mittel) — in Teilen.** Die Worte sind vereinheitlicht; die Nummern nicht: Menschen laufen eine Dekade vor den Bauten, und `mensch.menge.bild` zählt einen Blick, `mensch.menge.bevoelkerung` eine Welt. Steile Leitern nennt Teil 3.
- **Mitspieler offen lassen, „bis der Schöpfer den Umfang setzt“ (scharf, mittel) — in Teilen.** Das wäre die Abhängigkeit, die ein anderer Mangel streicht. Stattdessen: ein Last-Protokoll (Bots stellen die Menge, gerichtet wird an ≥ 100 echten Fenstern), die Leiter endet bei 10⁶; die Sprosse 10⁸ ist gestrichen und unter den offenen Fragen genannt.
- **Plausibilitäts-Tor „Panel ≥ 70 % könnte so sein“ (scharf, mittel) — in Teilen.** Die Linse „ganz“ zeigt, dass genau dieses Urteil das Unvorstellbare bestraft. Gegen Rauschen steht jetzt die Ursachen-Probe mit Gegenlauf: Rauschen hat keine Ursache.
- **Der Preis als eigene Achse statt als Teil der Sprosse (fair, schwer) — in Teilen.** Nicht übernommen: Umfang, Tiefe und Preis bleiben EIN Urteil — Leistung und Detail kämpfen nie in getrennten Kriterien. Was die eigene Achse leisten sollte, leistet der öffentliche Kern.
- **Eine Leiter für Gesprächstiefe fehle (ganz, leicht) — in Teilen.** Sie stand: `mensch.geist.gespraech`, 7 Sprossen. Es fehlte ihr Preis; der ist gesetzt.

### Offen nach der Prüfung

- **Kein Richter ist gefahren.** HEUTE 0 heißt: die Karte hat noch keine einzige eigene Messung. Der kürzeste Weg zum ersten Punkt ist `same.preis.ankunft` 1 — ein Lauf am Kopf an beiden Geräten.
- **Die Werkzeuge der Richter fehlen:** das Panel ist nicht geworben, kein Modell eingefroren, kein Korpus liegt im Repo, der Leser der Ursachen-Probe ist nicht gebaut, die Vergleichstitel sind nicht vermessen. Alle Schwellen sind gesetzt, nicht geeicht.
- **42 Richter** tragen ihr Urteilswort weiter als Kurzform (R6) statt als eigens ausgeschriebenen Vergleich; der Korpus ihrer Perspektive gilt.
- **Die 23 neuen Leitern** haben am Code nur die genannten Greps gesehen; ihr Beleg sagt „nie gemessen“ oder „Stand 0“, wo mehr nicht geprüft ist.
- **Der Schlüssel der Erde** hat Decken ohne Abschätzung; ab Sprosse 6 der Erd-Leitern wird er am Ort geladen.
- **Der Fuß „ungemessen“** (113 Leitern) trennt nicht, was fehlt, von dem, was steht und nie gerichtet wurde.
- **`BRUECKE.md`** ist an den Zeilen nachgezogen, die diese Prüfung berührt; die Zuordnung der übrigen alten Kriterien ist nicht neu geprüft.

