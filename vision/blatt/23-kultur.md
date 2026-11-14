# Kultur, Sprache, Glaube und Wissen

## Die Vision hier

Jenseits der Gegenwart heißt: Kein Volk der Welt steht in einer Liste. Jede Kultur ist ein Ast, gewachsen aus dem EINEN Samen, aus Boden, Klima, Nachbarn und Zeit. Ihre Sprache hat Laute, Wörter und Grammatik, und mit ihren Schwestersprachen teilt sie eine rekonstruierbare Ursprache. Eine Schrift entsteht aus Bilderzeichen, wird zum Alphabet und schließlich zur Leuchtreklame. Sie steht auf dem Meilenstein, dem Grabstein, dem Ladenschild und der Hauswand, und man kann sie lesen. Glaube formt die Landschaft: heilige Berge, Prozessionswege, Friedhöfe, die über Jahrhunderte wachsen, Feste, die der Kalender einer Ernte oder eines Gestirns trägt, und Bewohner, die das Ritual ausführen. Wissen wächst, wird aufgeschrieben, gelehrt, vergessen und neu erfunden. Auf einem Planeten mit Milliarden Bewohnern sprechen sie Tausende Sprachen. In einer Megastadt, gegen die Tokio ein Dorf ist, mischen sich hundert Herkünfte zu Vierteln, deren Schilder in zwanzig Schriften leuchten — kein Asset-Katalog, sondern eine Ausbreitung, die man vom Hügel aus sieht. Der Spieler kann einer fremden Sprache begegnen, sie Wort für Wort lernen und am Ende verstehen, was auf der Hauswand steht. Wer durch die Zeit reist, hört, wie aus derselben Sprache in tausend Jahren eine andere wird, und auf fremden Planeten spricht Leben, das kein Mensch je erdacht hat.

## Das Beste der Gegenwart

- **Dwarf Fortress** (Bay 12, worldgen): Es erzeugt Götter mit Sphären, Religionen, die sich über Zivilisationen ausbreiten, und Geschichte. Ein mittlerer Weltlauf über 150 Jahre ergibt 90 Religionen und 39 Orden. **Grenze:** Die vier Sprachen sind feste Wortlisten, die nur Alphabet und Lexeme tauschen (Relexifikation), Schrift sieht man nie. Alles ist Text, kein Bild ([DF-Wiki Deity](https://dwarffortresswiki.org/Deity), [Bay 12 dev](https://bay12games.com/dwarves/dev.html), [CEUR Vol-3626](https://ceur-ws.org/Vol-3626/paper3.pdf)).
- **Crusader Kings III** (Paradox): Kulturen spalten sich ab (Divergenz) und verschmelzen (Hybrid), Glaubensrichtungen tragen Lehrsätze und heilige Stätten. Das stärkste spielbare Modell für Mischung und Abspaltung. **Grenze:** Ein Karten-Zustand; die Ausgangskulturen sind handgeschrieben, die Mischung ändert Zahlen, nicht Gebäude, Schrift oder Sprache im Bild ([PC Gamer](https://pcgamer.com/crusader-kings-3-ck3-hybrid-culture)).
- **Cyberpunk 2077 / Night City und Yakuza / Kamurocho**: die beste Schrift-Dichte der Großstadt, Leuchtreklame, Mehrsprachigkeit, Werbung passend zum Viertel. **Grenze:** von Hand gezeichnet, eine Stadt, eine Gegenwart; kein Schild entsteht aus dem Laden dahinter.
- **Heaven's Vault** (inkle): der Spieler entziffert eine fremde Schrift Glyphe für Glyphe, Hypothesen werden durch neue Inschriften bestätigt oder widerlegt — das einzige Spiel, in dem Lesen-Lernen die Mechanik ist. **Grenze:** eine handgebaute Sprache, wenige hundert Inschriften.
- **Assassin's Creed Origins/Odyssey, Discovery Tour**: Rituale, Tempel und Bestattung der Antike sind wissenschaftlich beraten. **Grenze:** Eine Kultur und eine Epoche je Titel, als Asset gebaut, in Gigabytes.
- **Die Wirklichkeit:** 7 164 lebende Sprachen (Ethnologue, 27. Ausgabe 2024), Glottolog zählt 7 674. Papua-Neuguinea allein hat über 840. Die Zahl der Schriften liegt in der Größenordnung von Hunderten (unbestätigt). Tokio-Yokohama trägt ~37 Mio. Menschen ([Our World in Data](https://ourworldindata.org/grapher/living-languages)).
- **Die Wissenschaft der Herkunft:** Bayessche Phylogenetik datiert Sprachfamilien aus Wortlisten (Gray und Atkinson 2003, Bouckaert u. a. 2012); Lautgesetze (Grimm, Verner) machen Sprachwandel regelhaft. **Grenze:** Analyse, kein Generator; niemand hat daraus je eine lebende Welt gezogen.

## Der Same

**Kultur ist Erbe mit Mutation auf einem Raum-Zeit-Feld.** Jedes Merkmal einer Gemeinschaft — Laut und Wort, Schriftzeichen, Bauform, Tracht, Ritus, Gottheit, Wissen — ist ein Gen, das mit einer Rate driftet, von Nachbarn entlehnt wird (Diffusion über Wege und Handel) und an der Umwelt selektiert wird: Baustoff aus Geologie, Kalender aus Gestirn und Ernte, heilige Orte aus auffälliger Landschaft. Sprachen, Schriften und Glauben sind Äste EINES Stammbaums; Mischung ist die Überlagerung zweier Erbfelder; die Epoche ist der Ort auf der Zeitachse desselben Baums.

**Gelöst haben es fremde Branchen:** die **historische Linguistik** und **Bayessche Phylogenetik**, die **Populationsgenetik** (Drift, Migration, Isolation durch Distanz, Mantel-Korrelation), die **kulturelle Evolution** (Cavalli-Sforza und Feldman, Boyd und Richerson) und die **parametrische Typografie** (Metafont, variable Fonts: eine Glyphe als Funktion weniger Regler).

## Die gemeinsamen Maße (gelten in jeder Sprosse)

- **P (Preis):** Bild p95 ≤ 33 ms an der Pose der Sprosse, Ankunft ≤ 5 s kalt, null Download über das Skript hinaus — auf beiden Geräten des Profi-Bands (Radeon 890M, GTX 1060). Eine Sprosse, die P nicht hält, gilt nicht. Wo eine Sprosse mehr verlangt (Jahreswechsel, Festmenge), steht es dabei.
- **U_eff (unterscheidbarer Umfang):** Umfang zählt nie Namen, sondern was der Spieler unterscheiden kann. U_eff = Zahl der Klassen, die ein blinder Klassifikator aus Spiel-Bildern oder Spiel-Tönen von N zufälligen Saaten mit ≥ 80 % Treffer trennt (hochgerechnet über die Kanal-Information, 2^I). Zehn Namen auf einer Liste sind U_eff = 1, wenn sie gleich aussehen.
- **Saat-Probe:** Jede Breiten-Sprosse misst an N ≥ 50 zufälligen Saaten; ein handverlesener Ort zählt nicht.

## Die Leitern

### L1 Sprachen der Welt: wie viele unterscheidbare Sprachen aus dem Samen entstehen, wie wahr sie klingen und ob ihre Verwandtschaft aus dem hörbar Gesprochenen rekonstruierbar ist

| Sprosse | Umfang | Tiefe | Preis | Richter (im echten Spiel, misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| S0 | 1 Sprache: Orts-, Straßen- und Personennamen | Namen eines Orts klingen aus einem Guss | P an der Dorf-Station | Klassifikator ordnet 100 in der Welt gelesene Namen (Schild, Bewohner-Akte) aus 2 Saaten der richtigen Saat zu (≥ 90 %) | unter der Leiter: keine Welt-Sprache, nur die UI in DE/EN |
| S1 | U_eff ≥ 10 Sprachen auf einer Welt | Laut-Inventar, Silbenbau, Wortschatz; Bewohner-Namen folgen ihrer Sprache | P an der Dorf-Station | Saat-Probe: Klassifikator trennt die Sprachen an 20 gelesenen Sätzen je Sprache (≥ 85 %) | |
| S2 | U_eff ≥ 100, ≥ 5 Familien | Lautgesetze erzeugen Kognaten | P | Aus den im Spiel gelesenen Wortlisten rekonstruiert ein Standard-Phylogenie-Werkzeug den Stammbaum; Treffer gegen den Samen-Baum (Robinson-Foulds ≤ 0,3) in ≥ 70 % der Saaten | |
| S3 | U_eff ≥ 1 000, Dialekt-Kontinua | Typologie (Wortstellung, Morphologie) in den Häufigkeiten des WALS; Dialektgrenzen an Gebirgen und Flüssen | P | Typologie-Verteilung gegen WALS (KL ≤ 0,2); ≥ 70 % der Isoglossen auf Gelände-Barrieren | |
| S4 | U_eff ≥ 7 000 auf einem Planeten im Erdmaß, Milliarden Sprecher | Bewohner sprechen HÖRBAR und mit Sinn: der gesprochene Satz passt zur Handlung (Handel, Gruß, Streit) | P an einem Markt mit ≥ 500 sprechenden Bewohnern im Blick | Hörprobe: Muttersprachler-Panel bewertet die Lautung natürlicher Sprachen-Familien ≥ 4/5; Sinn-Probe: ein Modell ordnet 100 gehörte Sätze der gesehenen Handlung zu (≥ 80 %) | |
| S5 | ≥ 10^5 Sprachstufen über alle Epochen eines Planeten | Zeitreise zeigt Sprachwandel: aus der Ursprache wird hörbar die Tochter | P; Jahreswechsel ≤ 1 s | Swadesh-200 an derselben Stelle, Jahr t und t + 1 000: Retention 70–86 %; die Ursprache aus den Töchtern rekonstruiert trifft die in der Vergangenheit gehörte (≥ 60 % der Wurzeln) | |
| S6 | ≥ 10^6 Sprachen über Planeten, nicht-menschliche Sprecher | Fremde Sprachen in fremden Medien (Licht, Duft, Infraschall), aus dem Sinnesapparat der Art | P | Saat-Probe fremder Arten: der Kanal passt zum Sinnesorgan (≥ 90 %); Zeichen-Entropie im Band natürlicher Sprachen (Zipf-Exponent 0,8–1,2) | |

### L2 Die geschriebene Welt: wie viel Schrift der Spieler im Bild liest, von der Inschrift bis zur Leuchtreklame, und ob sie aus dem Ort folgt

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| S0 | Schrift als Form ohne Zeichen | Schriftband sichtbar, nicht lesbar | P | Bild: Schriftband an einem Bau der Welt | unter der Leiter: die Stele mit Schriftband lebt NICHT im Spiel (worlds/neuntes-buch/stele-core.js, weder in cores.manifest.json noch in stamm/); lesbarer Text in der Welt nur als Peer-Namensschild (stamm/netz-p2p.js:2232) |
| S1 | 1 Schrift, Schilder an Sonderbauten | Schmiede, Gasthaus und Kultbau tragen Zeichen und Namen in der Schrift des Orts | P an der Dorf-Station | Bild: Anteil der Sonderbauten mit lesbarem, zur Rolle passendem Schild ≥ 90 % | |
| S2 | U_eff ≥ 10 Schrift-Typen aus dem Samen (Bilder-, Silben-, Lautschrift als Stufen eines Gesetzes); Grab- und Meilensteine | Schrift-Typus folgt Epoche und Kultur; Grabsteine tragen Namen und Jahre aus den Bewohner-Akten | P an einem Friedhof mit 500 Steinen im Blick | OCR in der erzeugten Schrift liest ≥ 80 % der Grabsteine zu ihren Akten zurück; Saat-Probe trennt die Schrift-Typen blind (≥ 80 %) | |
| S3 | Jede Hauswand einer Stadt trägt Zeichen, U_eff ≥ 100 Schriften | Ladenschild entsteht aus dem Gewerbe dahinter; Abnutzung, Graffiti, Plakat über Plakat | P an der Marktgasse | Text-Pixel-Anteil im Bild gegen Fotoreferenz (Pompeji-Wand, Altstadtgasse, Shibuya) je ±25 %; ≥ 90 % der Ladenschilder nennen das Gewerbe hinter der Tür | |
| S4 | Megastadt: ≥ 10^5 leuchtende Schilder im Blick, ≥ 20 Schriften in einem Viertel | Nachts lesbar mit eigenem Licht, gespiegelt auf nassem Asphalt; Sprache des Schilds folgt dem Viertel | P bei Nacht und Regen an der Gipfel-Pose der Stadt | Nachtbild gegen Shinjuku/Hongkong: Leuchtdichte-Histogramm und Schrift-Dichte im Band; Zahl lesbarer Schilder im Blick ≥ 2× Night City an vergleichbarer Pose | |
| S5 | Schrift über alle Epochen und Planeten, fremde Träger (Pigment, Biolumineszenz, Duftspur) | Schriftgeschichte als lesbare Stufen; Träger folgt Material und Sinnen der Kultur | P | Saat-Probe N = 100: Schrift-Typus, Träger und Epoche fallen plausibel zusammen (Panel ≥ 85 %) | |
| S6 | Jeder lesbare Text eines Planeten ist WAHR über ihn | Inschrift, Chronik, Grabstein und Karte stimmen mit der simulierten Geschichte überein — Schrift ist ein Archiv der Welt | P | Saat-Probe: 200 zufällig gelesene Texte gegen das Ereignis-Protokoll; ≥ 90 % widerspruchsfrei, ≥ 50 % verweisen auf ein reales Welt-Ereignis | |

### L3 Glaube, Ritual, heilige Orte und Bestattung: wie viele unterscheidbare Glaubenssysteme die Welt trägt und wie sichtbar sie Landschaft und Leben formen

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| S0 | 1 Markbau je Ort | Ab einer Schwelle trägt der Ort einen Markbau seiner Epoche und Region | P an der Dorf-Station | Bild: Markbau am Platz ab 8 Häusern | HEUTE als Form ohne Glaube: Rolle `kirche` (fachwerk-core.js:3697-3700), Form je Region (gotisch, barock, chinesisch, römisch, norwegisch, :3696), 1 Bewohner (:8163); kein Ritus, kein Kalender |
| S1 | 1 Glaube mit Kalender | Glocke, Ritus-Stunde, Bewohner gehen hin; ein Fest im Jahr füllt den Platz | P zur Ritus-Stunde | Zählung: im Kultbau zur Ritus-Stunde ≥ 30 % der Gläubigen, sonst ≤ 5 %; Festtag: Platz-Belegung ≥ 3× Werktag | |
| S2 | U_eff ≥ 10 Glaubenssysteme aus dem Samen | Kultbau-Form, Ausrichtung und Ritus folgen der Lehre des Glaubens, nicht einer Liste realer Bauten | P bei 500 Feiernden im Blick | Ausrichtung aller Kultbauten ≤ 5° von der eigenen Glaubensregel; blinde Trennung der Glauben an Kultbau- und Ritus-Bildern (≥ 80 %) | |
| S3 | Bestattung: ≥ 10^3 Gräber je Stadt, Friedhöfe, Nekropolen | Gräberfeld wächst mit der Sterblichkeit der Bewohner; Grabform je Glaube und Epoche | P am Friedhof | Gräber-Zahl gegen Bevölkerung × Sterberate × Jahre (±20 %); Zeitreise: dieselbe Parzelle 1320 und 1860 zeigt Schichtung | |
| S4 | U_eff ≥ 100, heilige Landschaft | Heilige Berge, Quellen, Haine an den Landschafts-Extremen; Pilgerwege verbinden sie | P am Wallfahrtsort zum Fest mit ≥ 10^4 Pilgern im Blick | Saat-Probe: ≥ 70 % der heiligen Orte an Landschafts-Extremen (Prominenz, Wasser, Vulkan); Pilgerstrom vom Hügel sichtbar (Bild) | |
| S5 | ≥ 10^3 Glaubensrichtungen über Epochen, Spaltung, Mission, Synkretismus | Reform und Abspaltung als Erbe mit Mutation | P; Jahreswechsel ≤ 1 s | Glaubens-Stammbaum aus den im Spiel beobachtbaren Merkmalen rekonstruierbar (RF ≤ 0,3); ≥ 30 % der Grenzorte tragen Mischriten | |
| S6 | Glaube auf jedem besiedelten Planeten, fremdes Heiliges | Mythos erklärt die Welt, die der Same wirklich baute (Vulkan als Gott, Doppelsonne als Paar) | P | Saat-Probe: ≥ 80 % der Hauptgötter entsprechen einem realen Phänomen ihrer Saat | |

### L4 Kultur als Stil-Raum: wie viele unterscheidbare Kulturen aus dem Samen wachsen, sichtbar in Bau, Tracht, Speise und Fest

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| S0 | U_eff = 1 Baukultur | ein Haus-Typus | P | Bild: das Dorf ist einheitlich | |
| S1 | U_eff ≥ 10, aus einer geschriebenen Liste | Bauart, Material, Tracht je Kultur und Epoche unterscheidbar | P an der Dorf- und der Stadt-Station | Zwei Epochen im Bild ≥ 50 % Leib-Pixel anders; blinde Trennung von 10 Kulturen an Häuser-Bildern (≥ 80 %) | HALB: Liste von 32 Archetypen (fachwerk-core.js:2012), Tracht je Epoche (:3295-3303), 72,3 % Leib-Pixel (alte Karte K4). Die Häuser-Trennung ist ungemessen, am 14.11. lasen Häuser als weiße Kästen; P reißt (Ankunft 11–17 s) |
| S2 | U_eff ≥ 100 aus dem Samen, keine Namensliste | Kultur ist ein Merkmalsvektor (Bau, Tracht, Farbe, Speise, Musik) aus dem Erbfeld | P | Saat-Probe: blinde Trennung ≥ 80 % und ≥ 90 % der Bilder plausibel menschlich | |
| S3 | U_eff ≥ 1 000 auf einem Kontinent | Erdmaß-Kulturen halten Fotovergleich nah und fern (Riad, Machiya) | P an Nah- und Fern-Pose | Merkmalsabstand (DINO) zum realen Gegenstück im Band realer Fotos derselben Kultur | |
| S4 | U_eff ≥ 10^4 planetenweit, Fest und Alltag | Feste, Speise, Musik, Tanz folgen der Kultur | P bei 10^4 Feiernden im Blick | Festtag: ≥ 60 % in Fest-Tracht und Fest-Handlung; Musik-Klassifikator ordnet die Kultur zu (≥ 70 %) | |
| S5 | U_eff ≥ 10^5 über alle Epochen der Menschenzeit | dieselbe Landschaft trägt in −8 000, 0, 1500, 2026 die passende Kultur | P; Jahreswechsel ≤ 1 s | Saat-Probe N = 100 (Ort, Jahr): Panel nennt die Kombination plausibel (≥ 85 %) | |
| S6 | U_eff ≥ 10^6 über Planeten und Spezies | Ästhetik folgt Leib, Sinnen und Gravitation | P | Saat-Probe: ≥ 90 % der fremden Bauten passen zu Leibgröße und Gravitation (Statik- und Anatomie-Probe) | |

### L5 Wanderung, Diffusion und Mischung: ob Merkmale über Wege wandern, Kulturen sich berühren und mischen, sichtbar im Raum

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| S0 | Ablösung in der Zeit an einem Ort | Stile folgen einander je Region nach Jahreszahl | P | Zeitreise: derselbe Ort 1320 und 1935 zeigt andere Stile | HEUTE (fachwerk-core.js:3281ff: Zeitbänder je Region, keine Wanderung im Raum) |
| S1 | 2 Kulturen an einer Grenze | Grenzdörfer tragen Mischformen | P | Grenzstreifen ≥ 30 % Häuser mit Merkmalen beider Kulturen, abseits ≤ 5 % | |
| S2 | ≥ 10 Kulturen, Diffusion über Wege | Merkmale UND Lehnwörter wandern entlang Weg und Handel, nicht Luftlinie | P | Saat-Probe: Mantel-r (Merkmalsabstand gegen Weg-Distanz) ≥ 0,4 und größer als gegen Luftlinie; Lehnwort-Anteil fällt mit Weg-Distanz (r ≤ −0,5) | |
| S3 | Diaspora-Viertel: ≥ 10 Herkünfte in einer Stadt | Viertel tragen Schrift, Speise, Kultbau, Tracht der Herkunft; die zweite Generation mischt | P im Viertel | Herkunft des Viertels aus Straßenbildern blind ≥ 75 %; Tracht-Mischanteil steigt mit der Generation | |
| S4 | Megastadt ≥ 10^7 Bewohner (Tokio-Maß), ≥ 100 Herkünfte | Hybride Kultur entsteht und wird Quelle (Kreolsprache, Fusion-Küche, Neubau-Stil) | P an der Gipfel-Pose der Stadt | über 100 Spieljahre ≥ 1 neues Hybrid-Merkmal, das blind als eigene Klasse trennbar ist und messbar ins Umland wandert | |
| S5 | Völkerwanderungen über Jahrtausende | Wanderwellen folgen Klima, Hunger, Krieg; die Sprachkarte trägt ihre Spur | P; Jahreswechsel ≤ 1 s | Wanderrichtung aus Sprach- und Merkmalsverteilung rekonstruiert trifft die simulierte (±30°) | |
| S6 | Stadt ≥ 10^8 Bewohner mit Herkünften mehrerer Planeten; interplanetare Diaspora | Kolonien driften, Rückkontakt mischt | P | Divergenz der Kolonie-Kultur folgt Zeit × Abstand gemäß Driftrate (Fit r ≥ 0,7); Herkunfts-Planet im Viertel blind trennbar (≥ 75 %) | |

### L6 Kopplung: ob Kultur aus der Welt folgt — Baustoff aus dem Boden, Glaube aus der Landschaft, Kalender aus dem Himmel

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| S0 | Kultur gewählt, nicht gefolgert | Region gezogen, Gesetz liegt brach | P | Eingriff-Probe: Klima der Saat ändern → Bauweise im Spiel unverändert (ROT erwartet) | HEUTE: das Ort-Gesetz zieht die Region per Zufall (fachwerk-core.js:3647); das Gesetz Klima → Dachneigung, Baustoff, Bogen, Hof (metaParams, fachwerk-core.js:8103) existiert im Kern, liest aber nur das Fachwerk-Studio (worlds/fachwerk/fachwerk.js:621), nie die Welt |
| S1 | 1 Kopplung: Baustoff aus Boden und Klima | Lehm im Trockenen, Holz im Wald, Stein im Gebirge | P | Saat-Probe: ≥ 85 % der Orte mit biom-passendem Baustoff (gegen reale Verteilung vernakulärer Bauweisen) | |
| S2 | 3 Kopplungen: Baustoff, Dachneigung zum Niederschlag, Speise aus Landwirtschaft | Schneelast macht Steildach, Trockenheit Flachdach | P | Saat-Probe: Dachneigung ↔ Niederschlag r ≥ 0,5; Speise ↔ Anbau ≥ 80 % | |
| S3 | Kalender und Fest aus Himmel und Ernte | Feste fallen auf Sonnenwende, Ernte, Mondphase DER WELT | P | Saat-Probe: ≥ 80 % der Feste auf ein astronomisches oder agrarisches Ereignis der Saat | |
| S4 | Heiliger Ort und Sprachgrenze aus Gelände | Grenzen und Heiliges folgen Relief und Wasser | P | Eingriff: Gebirge verschieben → Sprachgrenze und heiliger Ort folgen (beide ≠ vorher, Mutante = 0) | |
| S5 | Volle Kaskade: Vulkan → Küste → Stadt → Kultur → Glaube → Sprache | eine Änderung der Geologie ändert sichtbar Glaube und Sprache | P; neue Kaskade ≤ 1 s nach Eingriff am Schirm | Eingriff: Vulkan an andere Stelle → heiliger Ort, Baustoff, Sprachgrenze, Mythos alle ≠ vorher; Mutante (Kopplung gekappt) = 0 Änderung | |
| S6 | Kopplung über Planeten und Zeitalter | Kultur fremder Welten folgt ihrer Physik | P | Saat-Probe N = 100 Planeten: Kultur-Merkmale gekoppelt an Gravitation, Licht, Klima (Panel ≥ 85 %) | |

### L7 Wissen, Erfindung und Weitergabe: ob Wissen in der Welt wächst, aufgeschrieben, gelehrt, verloren und wiedergefunden wird — sichtbar in Werkzeug, Bau und Buch

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| S0 | Technikstand als Funktion der Jahreszahl | Epoche setzt Bauart und Werkzeug | P | Zeitreise: 1320 und 1935 zeigen andere Werkzeuge und Bauten | HEUTE nur über die Epoche (fachwerk-core.js:8105 Epoche aus Jahr) |
| S1 | Technikstand je Ort, nicht je Jahr | Wissen wächst mit Größe und Vernetzung; zwei Orte desselben Jahres stehen verschieden | P | Saat-Probe: Technikstand ↔ Bevölkerung × Vernetzung r ≥ 0,5 | |
| S2 | Schule, Bibliothek, Werkstatt als Orte des Wissens | Bewohner lernen; Können eines Bewohners folgt Lehrer und Buch | P | Akten-Probe: Können der Schüler eines Meisters > Mittel der Nicht-Schüler (≥ 1 SD) | |
| S3 | Bücher und Medien sind lesbar und wahr | Buch, Zeitung, Bildschirm zeigen Wissen und Ereignisse der eigenen Welt (Gewitter von gestern, Stau) | P; Text erst am Blick erzeugt | ≥ 70 % der gelesenen Medien-Inhalte verweisen auf ein reales Ereignis der letzten Spieltage | |
| S4 | Verlust und Wiederfindung | Katastrophe vernichtet Wissen; Ruinen tragen es; Wiederentdeckung hebt den Stand | P; Jahreswechsel ≤ 1 s | Zeitreise: Technikstand fällt nach Vulkan oder Krieg messbar und steigt nach Fund der Bibliothek | |
| S5 | Erfindung emergiert, unabhängige Mehrfach-Erfindung | Rad, Schrift, Metall entstehen, wo Bedarf und Stoff zusammenkommen, mehrfach unabhängig | P | Saat-Probe: ≥ 60 % der Schlüssel-Erfindungen entstehen ≥ 2× unabhängig; Erfindungs-Ort korreliert mit Stoff-Vorkommen (r ≥ 0,5) | |
| S6 | Wissenschaft fremder Arten über Planeten | Ihre Physik-Tafeln stimmen mit der Physik ihrer Welt | P | Saat-Probe: in fremden Archiven gelesene Naturgesetze widerspruchsfrei zur Simulation (≥ 90 %) | |

### L8 Verständigung: ob der Spieler einer fremden Sprache und Kultur begegnen, sie lernen und verstehen kann

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| S0 | Kein Kontakt | Bewohner sprechen nicht mit dem Spieler | P | — | HEUTE: unter der Leiter (keine Welt-Sprache) |
| S1 | Grüße und Gesten | Bewohner reagieren in ihrer Sprache und Gestik auf den Spieler | P am Markt | Bewohner-Probe: ≥ 90 % der angesprochenen Bewohner antworten kulturgemäß (Gruß-Form je Kultur blind trennbar ≥ 80 %) | |
| S2 | Wort für Wort lernbar | Wörter lassen sich aus Zeigen, Schild und Kontext erschließen (Heaven's-Vault-Prinzip, aus dem Samen) | P | Probe mit unbefangenem Spieler: nach 30 min ≥ 20 Wörter einer fremden Sprache richtig gedeutet | |
| S3 | Schrift entziffern | Inschriften einer toten Sprache sind aus Bilinguen und Kontext lösbar | P | Probe: ein Spieler oder Modell entziffert aus im Spiel gefundenen Texten ≥ 50 % einer Inschrift | |
| S4 | Kultur-Regeln als Spiel | Sitte, Tabu, Gastrecht wirken: wer sie bricht, wird anders behandelt | P | Saat-Probe: Verhalten der Bewohner nach Tabu-Bruch messbar anders (Ablehnung ≥ 3× Normalfall) | |
| S5 | Verständigung in jeder Epoche und Megastadt | Dolmetscher, Handelssprache, Pidgin entstehen, wo Sprachen aufeinanderstoßen | P | Saat-Probe: Handelsorte tragen eine Verkehrssprache (≥ 70 %), deren Wörter aus den Kontaktsprachen stammen | |
| S6 | Kontakt mit nicht-menschlicher Sprache | eine fremde Art in fremdem Medium wird durch Beobachtung verständlich | P | Probe: ein Spieler erschließt ≥ 10 Bedeutungen einer fremden Art aus Verhalten und Signal | |

## Stand heute (nachgelesen am main-Baum)

- **Kultur als Stil-Liste:** 32 handgeschriebene Archetypen (fachwerk-core.js:2012, `kulturFromSeed` :2020 wählt per Hash aus der Liste), 6 Regionen mit Zeitbändern (REGION_HIST :3281), Epochen mit Tracht (:3295-3303). Gemessen: zwei Epochen 72,3 % andere Leib-Pixel (alte Karte K4). Am 14.11. lasen die Häuser als weiße Kästen mit Fenstern. U_eff der Häuser ist ungemessen. Die Kultur ist eine Liste, nicht gewachsen.
- **Kopplung (BERICHTIGT):** Das Gesetz Klima × Jahr × Personen × Wohlstand → Dachneigung, Baustoff, Bogen, Hof steht im Kern (metaParams, fachwerk-core.js:8103-8129) — aber der einzige Leser ist das Fachwerk-Studio (worlds/fachwerk/fachwerk.js:621). Das Ort-Gesetz der Welt zieht die Region per Zufallsanteil (fachwerk-core.js:3647). Die Welt konsumiert ihre eigene Kopplung nicht.
- **Glaube (BERICHTIGT):** Die Rolle `kirche` ist ein Markbau der Region (gotisch, barock, chinesisch, römisch, norwegisch, fachwerk-core.js:3696-3700) mit 1 Bewohner (:8163). Kein Ritus, Kalender, Fest, Friedhof. Die Treffer zu „ritual" in stamm/ sind die Tagebuch-Kategorie des Spielers (stamm/netz-identitaet.js:269), keine Kultur.
- **Sprache und Schrift:** Keine Welt-Sprache. UI DE/EN ist Bedienung. Lesbarer Text in der Welt nur das Peer-Namensschild (stamm/netz-p2p.js:2232). Die Stele mit „Schriftband" steht weder in cores.manifest.json noch in stamm/.
- **Migration, Wissen, Medien, Verständigung:** nichts im Raum.

## Abhängigkeiten

- **Der Mensch** und **Millionen: Bevölkerung, Masse und Strom** — ohne Bewohner mit Tag, Akte und Tod kein Ritus, kein Grab, keine Diaspora, kein Lernen (L3 S1/S3, L5 S3, L7 S2, L8).
- **Siedlung und Stadt**, **Architektur** — Kultbauten, Schilder, Viertel sind ihre Träger (L2, L3, L4).
- **Menschenzeit: Epochen und Geschichte** — die Zeitachse und das Ereignis-Protokoll, gegen das L2 S6 und L7 S3 prüfen.
- **Klang, Stimme und Musik** — hörbare Sprache (L1 S4), Festmusik (L4 S4).
- **Licht, Bild und Horizont** — Leuchtreklame nachts (L2 S4).
- **Netze, Verkehr**, **Arbeit, Technik und Handel** — Diffusion (L5 S2), Technikstand (L7).
- **Macht, Recht und Konflikt** — Mission, Eroberung, Vertreibung (L5 S5), Tabu (L8 S4).
- **Planet, Geologie, Klima, Himmel** — Quellen der Kopplung (L6).
- **Evolution, fremdes Leben, fremde Sinne** — L1 S6, L4 S6, L6 S6, L8 S6.
- **Ankunft, Geräte und Zugang** — Lexikon und Schrift müssen in ≤ 5 s ohne Download entstehen (P überall).

## Was die alte Karte hier misst

- **Spielgang K5 „Die Welt spricht die Sprache des Spielers" (1/2):** UI-Text DE/EN — keine Sprosse hier, gehört zu **Ankunft** bzw. **Der Spieler**.
- **Haar, Fell, Kleidung K4 „Kleidung aus der Epoche" (2/2):** Beleg der Tracht-Hälfte von L4 S1.
- **Siedlung K4 „Durch die Jahrhunderte" (2/2):** Beleg von L5 S0, L3 S0 und L7 S0.
- **Offener Punkt „Bau-Kulturen jenseits des Fachwerks":** geht in L4 S2/S3 auf.
- Sprache, Schrift, Glaube, Ritual, Bestattung, Migration, Wissen, Medien und Verständigung misst die alte Karte **gar nicht**.

## Zweifel

- **Panel- und Modell-Richter** belohnen Erdähnlichkeit. Auf Erdmaß-Sprossen ist das gewollt (der Planet soll die Realität zeigen); für fremde Sprossen (S6) prüfen die Richter daher Konsistenz mit der eigenen Physik und dem eigenen Samen, nicht Ähnlichkeit — wo das nicht greift, bleibt die Sprosse eine offene Frage nach R6.
- **U_eff** ersetzt die Anzahl; ob ein Klassifikator 10^4 Kulturen trennen kann, ist selbst ungeprüft — die Hochrechnung über 2^I ist der Kompromiss.
- **Swadesh-Retention** (L1 S5) ist in der Linguistik umstritten; hier Plausibilitäts-Richter, keine Wahrheit.
- **L8 S2/S3** brauchen einen unbefangenen Spieler; ein Modell als Spieler ist reproduzierbar, aber nicht dasselbe.
- Grenze zu **Menschenzeit** und **Siedlung** bleibt unscharf (Markbau, Epochen-Stile in beiden Blättern).

## Gegenlese — was sich änderte und was strittig bleibt

- **Stand berichtigt:** L6 S0 — das Kopplungs-Gesetz existiert (metaParams, fachwerk-core.js:8103), nur liest die Welt es nicht; das ist eine Zwillings-Lage (Gesetz im Studio, Zufall in der Welt), kein Fehlen. L3 S0 — der „Kirche" ist ein Region-Markbau ohne Glauben. L4 S1 von HEUTE auf HALB, weil die Häuser-Trennung ungemessen ist und P reißt. Bestätigt: KULTNAMES 32, Stele außerhalb von Manifest und stamm/.
- **Fleiß → Fähigkeit:** Jede Anzahl ist jetzt U_eff (blind trennbar an Saat-Proben), nie Länge einer Liste; L2 S2 und L3 S2 messen Schrift-Typen und Glauben aus dem Samen statt „Tempel, Moschee, Pagode".
- **Bauweise aus den Richtern gestrichen:** dc-Grenzen, Atlas-MB, „lazy", „Instanz-Satz", „Strom statt Einzelagent", „Stimme aus dem Klang-Gesetz" — ersetzt durch P an einer Pose. Eine gemeinsame P-Klausel steht über allen Leitern.
- **Gehoben:** L5 oben auf 10^7- und 10^8-Städte (Tokio-Maß und darüber), L2 S6 „jeder Text ist wahr über die Welt", L1 S5 hört die Ursprache.
- **Neu:** L7 Wissen (aus L6 S4 und L2 S5 herausgelöst — sie war in der Kopplung versteckt) und L8 Verständigung (die Perspektive des Spielers: lernen, entziffern, Tabu).
- **Dieselbe Leiter:** Lehnwort entlang Handelswegen (alt L1 S4) und Isolation durch Distanz (alt L5 S2) sind dasselbe Diffusions-Gesetz — jetzt eine Sprosse L5 S2.
- **Strittig:** ob U_eff bei 10^4+ messbar ist; ob L8 einen Menschen als Richter braucht; ob L6 S4 (Gelände → Sprachgrenze) nicht in L1 S3 doppelt steht.
