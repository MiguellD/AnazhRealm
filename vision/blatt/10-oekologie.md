# Ökosysteme, Kreisläufe und Zerfall

## Die Vision hier

Ein Planet, dessen Leben ein einziges Netz ist: Millionen Arten und Milliarden Individuen fressen, bestäuben, besiedeln, wandern, zersetzen und sterben, und ALLES davon schließt sich zu Kreisläufen, deren Bilanz aufgeht, vom Kadaver im Wald bis zum Sauerstoff der Atmosphäre. Der Spieler sieht keine Kulisse aus Tieren, sondern Folgen: der Wolf fehlt, der Fluss ändert seinen Lauf; ein Lavastrom erkaltet, und im Zeitraffer wachsen Flechte, Moos, Farn und Wald darauf; ein Wal sinkt und nährt die Tiefsee für Jahrzehnte; eine Megastadt, größer als jede der Erde, wird von diesem Netz ernährt und vergiftet ihre eigene Flussmündung. Zyklen entstehen, ohne geschrieben zu sein — Luchs und Hase schwingen mit zehn Jahren Periode, Heuschrecken verdunkeln den Himmel, Gnus ziehen dem Regen nach, Pilze schießen nach dem Regen. Auf der Skala der Äonen formt das Leben den Planeten selbst: Cyanobakterien füllen die Luft mit Sauerstoff, Wälder machen Regen und Boden, Korallen bauen Küsten, Kalkschalen werden Gebirge. Aus EINEM Samen — auf jedem Planeten eines Sonnensystems ein eigenes Netz, auch mit fremder Chemie gleich schlüssig.

## Das Beste der Gegenwart

- **Eco** (Strange Loop Games, 2018): jede Art läuft als Bestand in einer Simulation, Rodung zerstört Lebensraum, Aussterben ist endgültig. Grenze: einige Dutzend Arten, Bestände als Zahl, das Bild schlicht; kein Zerfall als Körper, keine planetaren Stoffkreisläufe.
- **Equilinox** (ThinMatrix, 2019): jede Art hat Bedürfnisse an Lebensraum und Nachbarn, Pflanzen machen den Boden fruchtbar. Grenze: eine Insel, handgesetzte Regeln je Art, Spielzeug-Maßstab.
- **Rain World** (Videocult, 2017): über 100 Kreaturen mit Beziehungs-Tafeln, die Welt frisst auch ohne den Spieler. Grenze: 2D, Tafeln von Hand, keine Kreisläufe, kein Zerfall.
- **Red Dead Redemption 2** (Rockstar, 2018): Kadaver verwesen sichtbar in Stufen, Aasfresser kommen, Jagd dünnt Bestände regional aus. Grenze: Stufen und Bestände geschrieben, keine Stoffbilanz, keine Zeitskala jenseits von Tagen.
- **Planet Zoo / Cities: Skylines**: Tier-Wohl und Stadt-Verschmutzung als Felder. Grenze: Stadt und Natur rechnen getrennt, kein gemeinsames Netz.
- **SimEarth** (Maxis, 1990, nach Lovelocks Gaia): Biosphäre koppelt an Atmosphäre und Klima über Äonen. Grenze: Kacheln und Diagramme statt Welt.
- **Wirklichkeit als Richter**: Yellowstone-Wölfe 1995/96 (Ripple & Beschta 2012) · Mount St. Helens 35 Jahre Dauer-Plots (Sukzession auf vielen Pfaden, biologische Erbschaften) · Großes Oxidations-Ereignis ~2,4 Mrd. Jahre · ~8,7 Mio. eukaryotische Arten (Mora et al. 2011), Mikroben bis 10^12 (Locey & Lennon 2016) · Biomasse der Erde ~550 Gt C, davon ~80 % Pflanzen (Bar-On et al. 2018, PNAS) · Serengeti-Zug ~1,3 Mio. Gnus · Star-Murmurationen (Ballerini et al. 2008: jeder Vogel richtet sich nach ~7 Nachbarn). Kein Spiel kommt über ~10^2 vernetzte Arten oder hält eine Stoffbilanz.

## Der Same

**EINE Bilanz von Stoff und Energie je Organismus** — jedes Lebewesen ist ein Wandler: es nimmt Stoff (C, N, P, Wasser) und Energie (Licht oder Nahrung) aus Feld oder Beute, baut Masse, gibt Abfall und am Ende seinen Leib zurück. Wer wen frisst, folgt aus Größe, Kost und Ort (heute schon `beuteMasse` × Masse, tetrapoda-core.js:166); wer wem nützt, folgt aus derselben Bilanz (der Partner verschiebt die Kosten des anderen). Bestände, Zyklen, Kaskaden, Sukzession, Wanderung und planetare Kreisläufe sind keine eigenen Gesetze, sondern das Integral dieser Bilanz über Raum und Zeit — auch der Mensch und seine Stadt sind Wandler in ihr. Die fremden Branchen, die es lösten: die **Erdsystem-Modellierung** (dynamische Vegetationsmodelle wie LPJ, Biogeochemie in CMIP-Modellen) bilanziert Kohlenstoff und Stickstoff planetar in Zellen; die **Stoffwechsel-Ökologie** (Brown et al. 2004, „Metabolic Theory of Ecology") leitet Lebenstempo, Dichte und Umsatz aus Masse^¾ und Temperatur ab — ein Skalengesetz von Mikrobe bis Wal; die **Doppik der Buchhaltung**: jede Buchung hat eine Gegenbuchung, jeder Stoff, der ein Wesen verlässt, kommt irgendwo an.

## Der Preis (gilt für JEDE Sprosse)

**P** = Bild p95 ≤ 33 ms · Ankunft kalt ≤ 5 s · null Download — auf dem Standardgerät (Radeon 890M und GTX 1060), gemessen in genau der Szene, die der Richter zeigt (das Gemessene steht im Bild). Zeitraffer und Zeitreise zahlen zusätzlich: ein Zeitsprung landet in ≤ 5 s, ein Zeitraffer läuft unter P. Eine Sprosse, deren Richter headless grün ist, aber nie unter P im Fenster gefahren wurde, steht als **TEIL**, nie als HEUTE.

## Die Leitern

### L1 Nahrungsnetz: Breite, Wahrheit, Unterscheidbarkeit

Misst, wie viele Arten aus Saaten ein Netz bilden, das sich hält, wie nah seine Statistik an realen Netzen liegt — und ob die Arten wirklich verschieden sind und nicht Farbvarianten.

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | 4 Säuger-Arten, 3 Ebenen, ein Tal | Bestand aus Nahrung × Lebensraum | P · das Tal mit allen 4 Arten im Bild | 8 Saaten im Fenster: jede Art in [⅓×, 3×] des Starts über 6 Spielstunden | TEIL: Mechanik headless (alte K2), unter P nie gefahren |
| 2 | 10^1 Arten, 4 Ebenen, ein Biom | Ebenen und Konnektanz im Band realer Wald-Netze | P · Waldrand, ≥ 5 Arten zugleich sichtbar | 32 Saaten: ≥ 80 % halten 100 Spieljahre ohne Aussterbe-Lawine | |
| 3 | 10^2 Arten je Biom, aus der Saat | Körpergrößen-Verteilung und Räuber-Beute-Massenverhältnis im Band | P | 32 Saaten: Konnektanz, Ebenen, Omnivorie im 90-%-Band von ≥ 20 realen Netzen UND blinde Paarprobe: 50 Zufalls-Artpaare, ≥ 90 % in Gestalt UND Rolle (Kost · Ort · Tageszeit) unterscheidbar | |
| 4 | 10^3 Arten, mehrere Biome eines Kontinents | wandernde Arten verbinden Biome; Insel-Endemiten | P · Zufallsort | 10 Spielminuten am Zufallsort: ≥ 30 sichtbar verschiedene Arten, die fressen oder gefressen werden | |
| 5 | 10^4 Arten, Kontinent mit Meer-Land-Kopplung | Arten-Areal-Kurve S ∝ A^z, z 0,15–0,35 | P an Flächen 1 ha … 10^4 km² | z der Saat im Band in ≥ 80 % der Saaten | |
| 6 | 10^5–10^6 Arten, ein Planet, alle Lebensräume vom Tiefseegraben bis zur Wüste | Breitengrad-Gradient, Endemiten-Zentren | P an jedem Ort | Tropen ÷ Tundra ≥ 10 bei ≥ 80 % der Saaten; Paarprobe ≥ 95 % | |
| 7 | 10^6–10^7 Arten je Planet, jeder Planet eines Sonnensystems mit eigener Biosphäre, Wechsel ohne Laden | fremde Biochemie gleich schlüssig; die Paarprobe hält auch zwischen Planeten | P · Ankunft auf jedem Planeten ≤ 5 s | 64 Saaten × 3 Planetentypen: ≥ 90 % plausibel (Kennzahlen im Band, 1000 Spieljahre ohne Kollaps) UND Paarprobe ≥ 95 % UND Blindprobe: Fachleute trennen Kennzahl-Tafeln der Saat nicht über Zufall von realen | |

### L2 Dynamik: Zyklen, Kaskaden, Ausbrüche

Misst, ob das Netz in der Zeit lebt — Schwingungen, Kaskaden und Ausbrüche entstehen aus der Bilanz, nie aus einem Zeitplan.

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | ein Tal, 6–8 Spielstunden | Wölfe weg → Hirsche +45 %, Jungwuchs −28 % | P · Zeitraffer im Fenster | Kaskaden-Richtungen mit Intervall, das 0 nicht schneidet | TEIL: headless (alte K1), im Fenster nie |
| 2 | ein Tal, 10 Spieljahre, sichtbar | die Kaskade im Bild: Jungwuchs am Fluss | P · Zeitraffer im Fenster | Bildpaar gleicher Kamera vor/nach 10 Spieljahren ohne Wölfe: Jungwuchs-Deckung −≥ 20 % gegen Gegenlauf | |
| 3 | ein Biom, 100 Spieljahre | Räuber-Beute-Schwingung mit Phasenversatz | P · 100 Spieljahre in ≤ 60 s Wanduhr | Periode 8–11 Jahre, Räuber hinkt 1–2 Jahre nach (Hudson's-Bay-Reihen) | |
| 4 | Landschaft 10^3 km² | Massenvermehrung bricht aus und zusammen | P · Szene mitten im Ausbruch | Ausbruch in ≥ 1 von 8 Saaten je 50 Spieljahre; Anteil brauner Waldfläche über die Jahre gegen Luftbild-Reihe eines Borkenkäfer-Ausbruchs | |
| 5 | Kontinent, 10^3 Jahre | eingeschleppte Art breitet sich als Front aus und baut das Netz um | P | Front-Tempo im Band realer Invasionen (Aga-Kröte ~10–60 km/Jahr) | |
| 6 | Planet, 10^7 Jahre | Massenaussterben und Erholung, neue Netze füllen die Nischen | P · Zeitsprung ≤ 5 s | Artenzahl erholt sich in 5–10 Mio. Spieljahren (Fossil-Referenz) | |
| 7 | jeder Planet, 10^9 Jahre | vom Einzeller bis zum Netz von Millionen, durchgehend bereisbar | P · jede Epoche ≤ 5 s | 10 Zufalls-Epochen je Saat: an ≥ 90 % steht ein Netz mit plausiblen Kennzahlen | |

### L3 Zerfall: Aas, Totholz, Pilz und Mikrobe

Misst, ob alles Tote sichtbar, in der Zeit und stofflich in den Kreislauf zurückkehrt.

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | Säuger-Kadaver | gewittert, gefressen, sinkt in die Erde; JEDER Tod düngt die Zelle | P · Kadaver mit Fressern im Bild | Kadaver-Masse sinkt mit Fresser-Zahl; Nährstoff der Zelle steigt nach jedem Tod — Riss durch Wolf, Alter, Spieler | TEIL: Mechanik steht, gedüngt wird nur ein Tod von Spieler-Hand |
| 2 | Kadaver jeder Größe | Verwesungsstufen sichtbar; die Reihenfolge der Aasfresser folgt aus Witterung und Anflug, nicht aus einer Liste | P · 10 Kadaver im Bild | Bildreihe 0/3/10/30 Tage gegen forensische Referenz; Dauer je Stufe nach Temperatur im Band; Ankunftsfolge der Gilde im Band von Kamerafallen-Studien | |
| 3 | Totholz eines Waldes über Jahrzehnte | Zerfallsklasse WÄCHST mit der Zeit, Moos, Konsolen-Pilz, Ammenstamm mit Sämlingen | P · Altwald im Bild | Bildreihe 0/10/40 Spieljahre am selben Stamm: Zerfallsklasse steigt sichtbar; Totholz im Altwald 10–30 % der Biomasse | TEIL: Totholz als Gestalt ohne Zeit (Zerfall aus Feuchte + Zufall, 0–3 Schwämme gewürfelt) |
| 4 | Pilze eines Bioms | Fruchtkörper nach Regen × Temperatur aus dem Boden, Hexenringe | P | Pilz-Dichte 3–10 Tage nach Regen ≥ 5× Trockenzeit, in der Trockenzeit ~0 | |
| 5 | Boden jeder Zelle | Streu → Humus → Profil, Tempo nach Klima | P | Streu-Halbwertzeit im Band (Tropen < 1 Jahr, Boreal > 5 Jahre) | |
| 6 | Mikro-Perspektive | Pilzfäden, Milben, Bakterien-Kolonien beim Herabzoomen, Dichte im Band (~10^9 Zellen je g Boden) | P · Zoom 1 m → 1 mm ohne Ladebalken | Bildvergleich gegen Mikroskop-Aufnahmen am Ende des Zooms | |
| 7 | jeder tote Körper des Planeten | Bilanz geschlossen; Walfall nährt die Tiefsee Jahrzehnte | P | Stoffbilanz eines Bioms über 100 Spieljahre: Fehlbetrag ≤ 1 %; Walfall-Gemeinschaft über 50 Spieljahre in Bildreihe sichtbar | |

### L4 Sukzession: EIN Gesetz für jede Störung

Misst, ob Leben jede Wunde der Welt zurückerobert — und zwar durch DASSELBE Gesetz, nicht je Störung eine geschriebene Abfolge. Der Umfang wächst in Fläche und in der Zahl der Störungsarten, die es trägt.

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | Brand-Zellen um das Dorf | Brand → Asche → Gras → Busch → Wald, Asche düngt | P · Brandfläche im Bild | Halme 477 → Asche 70 → Gras 491, Sämling 0 → 1, im Fenster unter P | TEIL: Mechanik belegt, unter P im Bild ungemessen |
| 2 | 1 km² Waldbrand | Mosaik aus Überlebenden-Inseln, Pionierpflanzen | P · Überflug | Bildpaar nach 1/5/25 Spieljahren gegen die Yellowstone-1988-Fotoreihe | |
| 3 | ein Tal, 5 Störungsarten (Brand, Rodung, Flut, Lawine, Verlassen) | der Pfad hängt an der Ausgangslage: Boden, Samenbank, Überlebende | P | 5 Arten × 8 Saaten: Deckungs-Kurven im Band realer Chronosequenzen in ≥ 80 %; jede Störung, die der Spieler frei auslöst, ebenso | |
| 4 | Primärsukzession auf nacktem Fels: Lava, Gletschervorfeld | Flechte → Moos → Farn → Strauch → Wald über Jahrhunderte | P · 1000 Spieljahre in ≤ 60 s | Deckung nach Alter (10/100/1000 Jahre) im Band der Hawaii-Chronosequenz | |
| 5 | verlassene Metropole (≥ 10^4 Gebäude) | Pflanzen sprengen Asphalt, Dächer fallen, Wald schließt sich | P · die Stadt im Bild | Bildpaar 0/30/100 Jahre nach Verlassen gegen Pripjat-Reihe; Anteil geschlossener Baumkronen steigt | |
| 6 | neue Insel, Kontinent nach Eiszeit | Insel-Biogeographie; Rückwanderung der Wälder | P · Zeitraffer 10^4 Jahre | Artenzahl einer neuen Insel folgt Zuzug × Aussterben nach Größe und Abstand; Wald-Front 100–1000 m/Jahr (Pollen-Profile) | |
| 7 | jeder Planet nach jeder Katastrophe | viele Pfade, Rückschläge, nie gleich zweimal | P · Zeitsprung ≤ 5 s | 16 Saaten × 4 Störungen: ≥ 90 % im Band realer Chronosequenzen UND paarweise verschieden | |

### L5 Stoffkreisläufe: Kohlenstoff, Stickstoff, Sauerstoff, Wasser

Misst, ob das Leben die Chemie des Planeten trägt und ändert.

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | ein Nährstoff-Skalar je Zelle | Ernte und Fällen nehmen, Asche und Leichnam geben | P · Acker im Bild | Ernte 15× → Nährstoff 1 → 0,7, Wuchs sinkt sichtbar | TEIL: Zahl belegt, Wuchs im Bild ungemessen |
| 2 | N und P getrennt je Zelle | Leguminosen und Erle binden N, P aus Gestein | P · beide Wiesen im Bild | Bildpaar Wiese mit Klee neben Wiese ohne nach 5 Spieljahren: Wuchs-Unterschied gemessen | |
| 3 | Kohlenstoff eines Bioms | Biomasse + Boden-C als Bilanz, Brand gibt frei, Moor speichert | P | C-Vorrat je ha im Band (Tropenwald ~200 t C, Steppe ~10 t) | |
| 4 | Kontinent | saisonale CO2-Säge emergent aus dem Laub-Jahr | P · Zeitraffer 1 Jahr | Amplitude nördlich > südlich, Phase mit dem Frühling — gegen die Mauna-Loa-Kurve | |
| 5 | Planet, Jahrhunderte | Wald macht Regen, Rodung trocknet das Land | P | Niederschlag im Lee eines gerodeten Großwalds sinkt gegen Gegenlauf (Intervall ≠ 0) | |
| 6 | Planet, Äonen | O2 steigt aus Photosynthese, verzögert durch Eisen und Methan | P · Zeitsprung ≤ 5 s | Sprung im Fenster ~2,5–2,0 Mrd. Jahre in ≥ 70 % erdähnlicher Saaten; Bändereisen im Gestein sichtbar | |
| 7 | jeder Planet, jede Chemie | Methan-, Schwefel- oder Ammoniak-Biosphären mit geschlossener Bilanz | P | 32 fremde Saaten: Atmosphäre im Ungleichgewicht, das ohne Leben verschwände (Biosignatur), Bilanzfehler ≤ 1 % | |

### L6 Wechselbeziehungen: der Partner verschiebt die Bilanz

Misst, ob Arten einander brauchen und schaden — als EIN Gesetz (der Partner verschiebt Kosten und Ertrag des anderen), geprüft immer durch denselben Richter-Typ: den Partner entfernen, die Folge sehen.

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | Bestäuber an der Mess-Wiese | Dichte folgt Blüten, Pflege und Uhr — Einbahn: die Blüte merkt den Besuch nicht | P · Wiese im Bild | r(Bestäuber, Blüten) ≥ 0,5 | TEIL: r 0,8 gemessen, Gegenrichtung fehlt |
| 2 | eine Wiese | der Besuch entscheidet den Samenansatz | P | Gegenlauf ohne Bestäuber: Blüten-Dichte im Folgejahr −≥ 30 %, im Bildpaar | |
| 3 | ein Wald | Pilz-Partner der Bäume, Schatten-Sämlinge zehren vom Netz | P | Gegenlauf ohne Pilz: Sämlinge im Schatten −≥ 30 % Wuchs | |
| 4 | ein Biom | Parasit und Seuche laufen durch dichte Bestände | P · erkrankte Herde im Bild | Seuche bricht nur über einer Dichte-Schwelle aus (8 Saaten, beide Seiten) | |
| 5 | Kontinent | Koevolution: Blüte und Bestäuber passen in Form und Farbe, aus der Saat | P | Rüssellänge ↔ Kronröhre r ≥ 0,7 über die Arten einer Saat | |
| 6 | Planet | Lebensräume, die auf Symbiose ruhen (Riff, Flechte), kippen als Ganzes | P · Riff im Bild | Wärme-Gegenlauf: Korallenfarbe kippt im Bildpaar, Fisch-Arten −≥ 50 % | |
| 7 | 10^6+ Arten | jede Art hat Partner, Feinde, Gäste | P | 64 Saaten: ≥ 50 % der Arten mit ≥ 1 Mutualist, Verschachtelung im Band realer Netze; 20 Zufallsarten entfernt → Ko-Aussterben im Band der Literatur | |

### L7 Leben formt den Planeten (Kopplung)

Misst, ob das Leben Gelände, Wasser und Fels sichtbar umbaut — die Kopplung nach R7. (Die Chemie — Regen, Sauerstoff — zählt in L5.)

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | ein Weg | Tritt formt Pfad | P · Weg im Bild | Gras-Dichte auf dem Weg −≥ 60 % gegen daneben (17 → 3 Büschel nach 100 Gängen) | TEIL: Zahl belegt, Bildpaar fehlt |
| 2 | Hang | Wurzeln halten den Hang | P · Starkregen im Bild | Gegenlauf: Erosion gerodet ≥ 5× bewaldet, Rutschung sichtbar | |
| 3 | Fluss | Biber staut, Aue entsteht, Wald stirbt im Stau | P | Bildpaar 0/10 Jahre: Wasserfläche und Totholz am Damm gegen Referenz-Luftbild | |
| 4 | Küste | Korallen und Mangroven bauen Land | P · Zeitraffer 10^3 Jahre | Riff wächst mm/Jahr, Lagune entsteht | |
| 5 | Landschaft | Wölfe ändern Flussläufe (weniger Verbiss → stabile Ufer) | P · Zeitraffer | Ufer-Erosion mit Wölfen gegen ohne, Intervall ≠ 0 | |
| 6 | Planet, 10^8 Jahre | Kalkschalen werden Gebirge, Moor wird Kohle | P · Zeitsprung ≤ 5 s | Kalkstein-Anteil der Kruste wächst mit dem Meeresleben; Kohleflöze in der Felswand sichtbar | |
| 7 | jeder Planet | Gaia: das Leben hält und kippt das Klima; die Spur steht in Fels, Luft und Küste | P | 32 Saaten mit und ohne Leben: Oberfläche, Atmosphäre und Küste im Bildvergleich in ≥ 90 % der Paare unterscheidbar | |

### L8 Gewimmel und Wanderung: Individuen im Bild (NEU)

Misst, wie viel Leben der Spieler zugleich sieht und wiederfindet — die „Millionen" als Individuen, nicht als Artenliste. Hier kämpfen Umfang und Preis am härtesten.

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | 10^1 Wirbeltiere zugleich im Bild | Dichte im Band realer Wildbestände | P · Wiese mit Tieren | Zahl sichtbarer Tiere ≥ 10; Dichte je km² im Band (Rothirsch 1–10) | ungemessen |
| 2 | 10^2–10^3: Herde, Vogelschwarm, Fischschwarm | Schwarm aus Nachbar-Regeln | P · der Schwarm füllt das Bild | Nachbarabstand und Polarisierung im Band der Star-Messungen (Ballerini 2008) | |
| 3 | 10^4–10^5: Gnu-Herde, Riff-Fische | die Masse frisst sichtbar | P | Bildpaar vor/nach Durchzug: Grashöhe sinkt messbar | |
| 4 | 10^6 im Bild: Heuschreckenwolke, Vogelzug am Himmel | jedes Individuum folgt dem Gesetz, nah wie fern | P · Fahrt durch den Schwarm | kein sichtbarer Sprung beim Durchfliegen (Bildreihe nah ↔ fern), Zahl im Bild ≥ 10^6 | |
| 5 | Wanderung über einen Kontinent | Route emergent aus Futter und Regen | P · Zeitraffer 1 Jahr | Zug folgt der Regenfront mit Verzug im Band (Serengeti); Vogelzug saisonal | |
| 6 | Planet: Biomasse-Verteilung | Biomasse je Biom und Reich realistisch | P | Anteile im Band (Bar-On 2018: Pflanzen ~80 %, Tiere < 1 %) | |
| 7 | 10^9+ lebende Individuen je Planet, jedes aufsuchbar | Fortdauer: das Tier steht dort, wo seine Bilanz es hinführte | P | 100 markierte Tiere, Rückkehr nach 1 Spieljahr: Verbleib (Tod, Zug, Nachwuchs) plausibel in ≥ 90 % | |

### L9 Mensch und Stadt im Netz (NEU, Kopplung)

Misst, ob Siedlung, Landwirtschaft und Megastadt Wandler in derselben Bilanz sind — die Stadt nimmt aus dem Netz, gibt zurück und wird bewohnt.

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | Ernte, Fällen, Tötung des Spielers | nehmen aus der Bilanz, Bestand und Boden folgen | P | Wuchs am übernutzten Ort sinkt gegen daneben, im Bildpaar | TEIL: Nährstoff-Zahl belegt |
| 2 | ein Dorf mit Feldern und Fang | Überjagung und Überfischung lassen Bestände fallen, Schonung erholt | P | Fang ×3 → Bestand −≥ 50 % in 10 Spieljahren; nach Fangstopp Erholung | |
| 3 | Stadt 10^4 Bewohner | Kulturfolger aus Abfall und Nischen: Tauben, Ratten, Füchse, Möwen | P · Stadt im Bild | Kulturfolger-Dichte in der Stadt > Umland, Scheue-Arten < Umland (Zählprobe) | |
| 4 | Metropole 10^7 | Stoffströme: Nahrung herein, Abwasser hinaus | P · Mündung im Bild | Algenblüte und Sauerstoffloch stromab im Bildpaar gegen eine Saat ohne Stadt | |
| 5 | Landwirtschaft eines Kontinents | Monokultur verdrängt Bestäuber, Hecken halten sie | P | Gegenlauf mit/ohne Hecken: Bestäuber-Dichte und Ernte unterscheiden sich, Intervall ≠ 0 | |
| 6 | Zivilisation über Epochen | Rodung ganzer Landschaften, Megafauna fällt nach Ankunft des Menschen | P · Zeitsprung ≤ 5 s | Waldanteil über Jahrtausende im Band der Pollen-Reihen; Megafauna-Verlust nach Besiedlung | |
| 7 | Megastadt > 10^8 Bewohner, „Tokio ein Witz dagegen" | die Stadt ernährt sich aus dem Netz ihres Planeten und kippt Biome | P · Stadt im Bild | Versorgung der Stadt schließt aus der Saat-Ökologie mit Fehlbetrag ≤ 1 %; Umland-Biome im Bildpaar mit/ohne Stadt verschieden | |

## Stand heute

- **Nahrungsnetz**: 4 Land-Säuger mit Lebensraum-Gesetz (deer, fox, wolf, bear: `tetrapoda-core.js:2052-2064`), Beute nach Masse (`beuteMasse: 2.0`, `tetrapoda-core.js:166` — geprüft), Ethogramm aus Magen und Ruhe (`:2086-2126`). Alte Karte Ökologie K1/K2: Kaskade 8 Saaten, Hirsche +0,448 [0,321; 0,536], Jungwuchs −0,279 — **headless**, unter P im Bild nie verglichen.
- **Zerfall**: Kadaver wird gewittert, gefressen, sinkt in die Erde (`tetrapoda-core.js:168-181`). **Berichtigt:** gedüngt wird nur ein Tod von Spieler-Hand — `_tatSchreiben("riss", …)` steht hinter `source === "player"` (`stamm/kreatur-leben.js:918`); der Riss eines Wolfs oder ein Alterstod düngt nichts. **Berichtigt:** Totholz und Baumpilze gibt es — als Gestalt: `deadwood` (Stumpf, liegender Stamm) mit Zerfallsgrad aus Feuchte + Zufall, Moos und 0–3 gewürfelten Konsolen-Schwämmen (`foundry-core.js:4044-4062, 5155-5165`, `__holzZerfall` :3968). Was fehlt: Zerfall in der ZEIT, Pilze aus Regen, Mikroben (0 Treffer).
- **Sukzession**: Brand → Gras → Busch → Wald und Sämling-Reihe (`stamm/feld-leben.js`); keine Primärsukzession, keine Stadt-Wildnis, keine Störungsart außer Brand.
- **Stoffkreisläufe**: EIN Nährstoff-Skalar (`stamm/feld-leben.js:3736-3744`: Fällen −0,3, Ernte −0,02, Brand +0,4, Riss +0,2 — geprüft). Kein ökologischer Kohlenstoff, Stickstoff, Sauerstoff (Treffer nur im Stahl der Schmiede, `schmiede-core.js:2911-3104`).
- **Wechselbeziehungen**: Bestäuber lesen Blüte, Wind, Feuchte, Tag und das Leben am Ort (`stamm/kreatur-fauna.js:613-650`) — geprüft: der Takt schreibt nichts an die Pflanze zurück, die Bestäubung bewirkt nichts.
- **Leben formt Planet**: Trampelpfad. Sonst nichts.
- **Gewimmel**: Herden, Vögel, Fische, Bestäuber als Pools am Auge; die Zahl gleichzeitig sichtbarer Tiere ist nie gemessen.
- **Mensch im Netz**: Ernte und Fällen entnehmen Nährstoff; die Stadt (300 Häuser, 118 Bewohner der Test-Stadt) hat keine Stoffströme, keine Kulturfolger.
- In Größenordnungen: 10^0,6 Arten gegen 10^6–10^7; ein Tal gegen Planeten; Spielstunden gegen Äonen. Unter R3 hält heute **keine** Sprosse ganz — die acht Sprossen 1 stehen als TEIL, weil keine je unter P im Fenster gefahren wurde.

## Abhängigkeiten

- **Pflanzen und Biome** und **Tiere und Verhalten** zuerst — sie liefern die Wandler; **Evolution und fremdes Leben** liefert Millionen Arten aus der Saat (L1 ab Sprosse 3, L6/5).
- **Verwitterung, Erosion und Boden** (L3/5, L7/2), **Atmosphäre, Wetter und Klima** (L3/4, L5/4–5), **Ozean** und **Leben im Wasser** (L3/7, L6/6, L7/4).
- **Tiefe Zeit** und **Planet und Geologie** (L4/4, L5/6, L7/6) und **Kopplung, Kaskade und Katastrophe** (Störungen als Eingang für L2 und L4).
- **Maßstab-Kontinuum** (L3/6) und **Millionen: Bevölkerung, Masse und Strom** (L8 teilt das Problem: viele Körper unter P).
- **Siedlung und Stadt** und **Nahrung, Landwirtschaft** (L9), **Spur, Verfall und Gedächtnis** (L4/5: dort Bauten, hier das Leben, das sie zurückholt).

## Was die alte Karte hier misst

- Ökologie K1 Trophische Kaskade → L2 Sprosse 1 (TEIL, headless).
- Ökologie K2 Bestand aus Nahrung × Lebensraum → L1 Sprosse 1 (TEIL).
- Ökologie K3 Furcht-Gesetz → **Tiere und Verhalten**; hier nur als Teil der Kaskade (L2).
- Ökologie K4 Spieler im Kreislauf → L9 Sprosse 1; K5 Bindung → **Tiere**.
- Stoffe K5 Nährstoff, Nachwuchs, Sukzession → L4/1 und L5/1.
- Stoffe K4 Verwitterung (Trampelpfad) → L7/1.
- Tiere H3 Kadaver → L3/1.
- Luft und Wasser K4 Bestäuber → L6/1.
Die alte Karte gibt Ökologie 10/10 — gemessen an der Vision steht sie auf der untersten Sprosse jeder Leiter, und auch die nur als TEIL.

## Zweifel

- Die blinde Paarprobe (L1/3, 6, 7) braucht ein Auge: Mensch oder Bild-Merkmal-Abstand. Mit Mensch ist sie teuer, mit Merkmal-Abstand ist sie fälschbar (Farbe allein trennt). Vorschlag: Gestalt-Silhouette UND Rolle müssen beide trennen.
- Die Referenz-Bänder (Konnektanz, z, Periode, Front-Tempo, C-Vorrat, Kamerafallen-Folgen) stammen aus dem Gedächtnis der Literatur und sind vor der Messung an Quellen zu schärfen.
- Bildvergleiche gegen Yellowstone, Pripjat, Hawaii, forensische Reihen setzen eine Bildvergleichs-Methode voraus (welche Kennzahl im Bild, welches Band), die es noch nicht gibt.
- L2/6–7, L5/6, L7/6–7 hängen an **Tiefe Zeit**; L8 an **Millionen**; L9/7 an **Siedlung und Stadt** — Doppelzählung droht, der Schwarm muss die Grenze ziehen.

## Gegenlese — was sich änderte und was strittig bleibt

- **Preis vereinheitlicht:** jede Sprosse trägt jetzt P (33 ms · 5 s · 0 Download in der gemessenen Szene). Bauweisen-Preise sind gestrichen („Schwarm fern als EIN Agent", „Atmosphäre ein Feld", „fern als Zahl, nah als Körper", „CPU ≤ 2 ms", „Zellen sparse").
- **HEUTE → TEIL:** alle acht Sprossen 1 waren headless oder ohne Bild — unter R3 hält keine ganz.
- **Stand berichtigt:** (a) nur der Tod von Spieler-Hand düngt, nicht jeder Leichnam (`kreatur-leben.js:918`); (b) Totholz und Konsolen-Pilze existieren als zeitlose Gestalt (`foundry-core.js:5155-5165`) — die Lücke ist Zerfall in der Zeit, nicht das Ding. Bestätigt: `beuteMasse` 2,0, Nährstoff-Werte, Bestäubung als Einbahn.
- **Fleiß → Fähigkeit:** L4 misst jetzt EIN Gesetz über viele Störungsarten (inkl. frei ausgelöster) statt einer Liste von Orten; L6 misst jede Beziehung mit demselben Entfernungs-Richter; die Aasfresser-Reihenfolge ist emergent zu messen, nicht als Liste.
- **Gehoben:** L1/7 auf jeden Planeten eines Sonnensystems mit Paarprobe gegen Farbvarianten-Inflation; L4/5 auf eine Metropole; L9/7 auf eine Stadt > 10^8.
- **Neu:** L8 Gewimmel und Wanderung (Millionen Individuen, nicht Arten) und L9 Mensch und Stadt im Netz (Kopplung R7 zur Stadt). **Zusammengelegt:** „Wald macht Regen" stand in L5 und L7 — jetzt nur L5; L7/6 trägt Kalk und Kohle.
- **Strittig:** ob L8 hierher oder zu „Millionen" gehört; ob Sprossen mit 10^6–10^9 Spieljahren je einen Richter haben, der in einer Sitzung fahrbar ist; und ob P an jeder Sprosse identisch sein darf, wenn ein Zeitraffer über Äonen eine andere Last ist als ein Blick auf eine Wiese.
