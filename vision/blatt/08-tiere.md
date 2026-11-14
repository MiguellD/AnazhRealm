# Tiere und Verhalten

## Die Vision hier

Jedes Tier wächst aus einem Genom: Bauplan, Größe, Haut, Fell, Feder, Schuppe oder Chitin, Gang, Sinne und Verhalten folgen aus EINEM Vektor, und ein Planet trägt Millionen Arten, wie die Erde geschätzte 7,8 Millionen Tierarten trägt, von der Ameise (1 mg) bis zum Elefanten (6 t), in der Tiefe der Zeit bis zum Sauropoden (≈ 50–70 t) und auf fremden Welten weit darüber hinaus. Kein Tier ist animiert: es läuft, fliegt, schwimmt, gräbt und klettert, weil sein Leib in seiner Schwerkraft und seinem Medium so gehen MUSS, und es tut, was es tut, weil es hungert, friert, fürchtet, wittert, balzt, brütet und erinnert. Keine zwei Individuen gleichen sich. Der Spieler steht im Herbst am Hang und hört die Brunft der Hirsche, sieht eine Million Stare als eine atmende Wolke über dem Ried, folgt einem Lachs 2 000 km stromauf bis zum Kiesbett, in dem er schlüpfte, sieht 1,3 Millionen Gnus als einen Strom über die Savanne ziehen, weil dort der Regen fiel — und in der Stadt mit Millionen Bewohnern Tauben, Ratten, Hunde, Zugpferde früherer Epochen und die Herden, die diese Stadt ernähren. Er reist in die Vergangenheit desselben Planeten und trifft dort die Fauna, die dessen Evolution damals trug, und er kann jedes Tier selbst SEIN: mit seinem Leib laufen, mit seinen Sinnen wittern. Generationen folgen einander sichtbar: Junge gleichen ihren Eltern, Bestände wachsen und brechen ein, aus einer Art wird eine andere. Jenseits der Gegenwart heißt: nicht 200 handgebaute Arten wie das beste Spiel, sondern jede Stichprobe eines Samens eine glaubhafte, eigene Fauna, die auch ohne den Spieler lebt — im Browser ohne Download bei 33 ms.

## Das Beste der Gegenwart

- **Red Dead Redemption 2** (Rockstar 2018): ≈ 200 Arten, ≈ 6 300 Motions in EINEM Fortbewegungs-System, Gangwechsel auf den Fußfall, Utility-Motive (GDC 2021, Kleanthous; aus MEISTERKARTE.md Z. 395). Pferde als Reittier mit eigenem Charakter und Bindung. Grenze: jede Art und jede Bewegung von Hand, keine Fortpflanzung, keine Generationen, Herden im Dutzend, 100+ GB Download.
- **Planet Zoo** (Frontier 2019): 72 Arten im Basisspiel, ≈ 180 mit Erweiterungen; Genetik vererbt Größe, Lebensdauer, Fruchtbarkeit und Immunität, Paarung nach realen Regeln (planetzoogame.com). Grenze: Gehege statt Wildnis, Leiber handmodelliert, der Körperbau evolviert nicht.
- **Horizon Zero Dawn** (Guerrilla 2017): > 25 Maschinen-Typen, Herden mit Rollen über „The Collective", HTN je Maschine (Beij 2017, Berteling GDC 2018). Grenze: Rollen von Hand, keine Biologie.
- **No Man's Sky** (Hello Games 2016): Kreaturen aus wenigen Skelett-Blaupausen kombiniert, Quintillionen Planeten (Game Informer 2014, Kotaku 2016). Grenze: sichtbare Wiederholung, Verhalten flach, Gang nicht aus dem Leib — der Beweis, dass Umfang ohne Tiefe nichts wiegt.
- **Spore** (Maxis 2008): Kreaturen-Editor mit prozeduraler Gang-Animation für beliebige Baupläne. Grenze: Leib vom Spieler gebaut, nicht aus Evolution; Gang plausibel-comichaft, nicht physikalisch.
- **Ecosystem** (Slug Disco, in Entwicklung): Körper UND Gehirn in einer DNA, Schwimmen entsteht aus Drehmomenten an den Gelenken gegen das Wasser (slugdisco.com). Grenze: Aquarium-Maßstab, Dutzende Tiere.
- **Die Wirklichkeit, Vielfalt:** ≈ 7,77 Mio. Tierarten geschätzt, 953 434 beschrieben; 86 % der Landarten unbeschrieben (Mora et al. 2011, PLoS Biology).
- **Die Wirklichkeit, Masse und Raum:** Gnu-Wanderung ≈ 1,3 Mio. Tiere, dem Regen folgend; Star-Murmurationen bis ≈ 1 Mio.; Stare richten sich nach 6–7 topologischen Nachbarn (Ballerini et al. 2008), die Korrelationslänge wächst mit der Schwarmgröße (Cavagna et al. 2010); die Küstenseeschwalbe zieht ≈ 70 000 km im Jahr (Größenordnung aus Sekundärquellen).
- **Die Wirklichkeit, Leib:** Gangwechsel bei gleicher Froude-Zahl über alle Vierbeiner (Alexander & Jayes 1983); eine parametrische Leib-Familie für alle Vierbeiner aus Scans (SMAL, Zuffi et al. 2017).
- **Die Wirklichkeit, Mensch und Tier:** auf der Erde leben heute mehr Nutztiere als Wildsäuger (Biomasse der Nutztiere ≈ 15-fach der wilden Säuger, Bar-On et al. 2018, PNAS) — eine Welt mit Millionen Menschen ohne Nutz- und Stadttiere ist falsch.

## Der Same

**Genom → Entwicklung → Leib → Bewegung → Verhalten, gelesen von der Welt, über die Zeit fortgeschrieben.** Das EINE erzeugende Prinzip ist ein Genom-Vektor über einem Bauplan-Raum (Evo-Devo: wenige Bauplan-Gene, Segmente, Allometrie), aus dem ein Entwicklungs-Programm den Leib wachsen lässt; der Gang folgt aus Leib, Masse, Schwerkraft und Medium (Froude, Strouhal, Reynolds), das Verhalten aus einem Bedürfnis-Budget (Hunger, Ruhe, Durst, Furcht, Fortpflanzung), das Sinnes-Felder der Welt liest; Vererbung mit Mutation schreibt das Genom über Generationen fort, sodass Vergangenheit und Gegenwart desselben Planeten aus DEMSELBEN Samen folgen. Gelöst haben es fremde Branchen in Teilen: die Biologie selbst (Hox-Gene und Allometrie), die Bildverarbeitung (SMAL), Karl Sims (1994, evolvierte Körper UND Steuerung in Physik) und die Ethologie (Ethogramm und Zeitbudget als Messvertrag eines Tiers). Heute steht davon der kleinste Kern: fünf allometrische Dials je Gattung (`tetrapoda-core.js:62`), der Gang aus Froude, das Zeitbudget aus Bedürfnis-Pegeln.

## Die Leitern

**P0** = Preis-Boden jeder Sprosse: Bild p95 ≤ 33 ms, Ankunft ≤ 5 s kalt, null Download, auf dem Standardgerät (Radeon 890M und GTX 1060, Profi-Band). Eine Sprosse gilt nur, wenn Umfang, Tiefe und P0 in DERSELBEN Fahrt gehalten sind. Wo eine Sprosse eine Masse ins Bild bringt (Herde, Schwarm, Horizont), steht P0 ausdrücklich MIT dieser Masse im Bild — nicht in einer leeren Szene daneben. Kein Richter schreibt vor, wie gebaut wird (keine Funktionsnamen, keine Millisekunden-Teilbudgets je Modul): er misst, was der Spieler sieht.

**Breite = Stichprobe (R4):** „N Arten" heißt nie „N Arten gebaut", sondern: N zufällige Saaten des Samens → der Anteil, der den Richter besteht. Eine von Hand gesetzte Art zählt auf keiner Sprosse über 1.

### L1 Arten und Individuen aus dem Samen
Misst, wie viele unterscheidbare UND glaubhafte Arten EIN Same hervorbringt — und dass innerhalb einer Art kein Individuum dem anderen gleicht.

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | ≈ 8 Leib-Typen, von Hand gesetzt | Art passt zum Biom; Individuen einer Art byte-gleich | P0 | Zahl der Arten, die ein Spieler in 1 h Gang an 3 Biomen sieht | HEUTE (halb: Individuen gleich) |
| 2 | 10² Arten aus dem Samen, ein Bauplan (Vierbeiner); jedes Individuum eigen (Alter, Geschlecht, Fell, Narbe) | Fell und Proportion im Third-Bild aus 10 m glaubhaft | P0 mit Herde von 20 im Bild | 1 000 zufällige Saaten → Anteil, den ein Blind-Panel (≥ 5 Menschen) neben Fotos der nächsten realen Gattung als „echt möglich" einstuft ≥ 0,7; Herde von 20: kein Paar im Bild-Embedding näher als zwei Fotos desselben realen Individuums | — |
| 3 | 10³ Arten, 4 Wirbeltier-Klassen (Säuger, Vogel, Reptil, Amphib) | Haut, Feder, Schuppe je Klasse; Nahbild 2 m | P0 | wie 2, je Klasse ≥ 0,7; Paar-Abstand: keine zwei Stichproben-Arten im Bild-Embedding näher als zwei reale Arten derselben Gattung | — |
| 4 | 10⁴ Arten, + Gliederfüßer (Insekt, Spinne, Krebs) | Chitin, Facettenauge, Flügeladern im Makro-Bild | P0 mit Insekten im Makro-Bild | Makro-Bildpaar 0,2 m gegen Insekten-Foto-Korpus, Blind-Panel ≥ 0,7 | — |
| 5 | 10⁵ Arten, alle großen Tierstämme an Land und in der Luft | Größenverteilung je Klade wie die Erde (viele kleine, wenige große) | P0 | 10 000 Saaten: Häufigkeit je Körpermassen-Dekade gegen die reale Arten-Masse-Verteilung, Abweichung ≤ Faktor 2 je Dekade | — |
| 6 | 10⁶ Arten je Planet | jede Art mit Ökologie-Nische, die im Spiel vorkommt | P0 | Stichprobe 1 000 Arten eines Planeten: Anteil glaubhaft ≥ 0,8, Anteil, den der Spieler in ihrer Nische antrifft ≥ 0,9 | — |
| 7 | jeder Same ein Planet mit eigener Fauna von 10⁶ Arten, über beliebig viele Planeten; fremde Baupläne aus fremder Schwerkraft, Atmosphäre und Chemie | Faunen verschiedener Planeten sind verschieden UND je für sich glaubhaft | P0, Ankunft ≤ 5 s auf jedem Planeten | 100 Saaten: Faunen paarweise im Bild-Embedding trennbar ≥ 0,95; Blind-Panel: fremde Art „könnte dort leben" ≥ 0,7 | — |

### L2 Leib und Fortbewegung über die Masse-Dekaden
Misst, über wie viele Größenordnungen der Körpermasse und wie viele Medien ein Tier physikalisch wahr geht, fliegt, schwimmt, gräbt, klettert — an Stichproben-Arten, nicht an gesetzten.

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | 1 Bauplan, 4 Gattungen, ≈ 10–300 kg (1,5 Dekaden), nur laufen | Fuß steht, Gangart wechselt beim Tempo der Natur | P0 | Third-Aufnahme im Spiel: Fußgleiten am Boden ≤ 5 % der Schrittlänge, Gangwechsel bei Froude-Zahl der Natur ±10 % | HEUTE (headless; am Gerät halb) |
| 2 | 3 Dekaden (1–1 000 kg), Vierbeiner + Zweibeiner-Vogel am Boden | Fußfall-Diagramm gegen Muybridge-Reihen ±0,05 | P0 | Fußfall-Diagramm aus dem Ausgabe-Bild gegen Referenzfilm je Gangart | — |
| 3 | + Fliegen, an jeder Stichproben-Vogelart | Schlagfrequenz und Gleitwinkel wie gemessene Vögel gleicher Masse ±20 % | P0 mit Trupp im Bild | Schlagfrequenz im Bild von 100 Stichproben-Arten gegen Pennycuick-Allometrie; Silhouette im Schlag gegen Film | — |
| 4 | + Schwimmen, Kriechen, Springen, Klettern, Graben | Strouhal 0,2–0,4 bei Schwimmern, Sprungweite im Band der Masse | P0 | je Medium 10 Stichproben-Arten: Tempo/Länge und Strouhal im Bild im Band der Natur ≥ 0,8 | — |
| 5 | 6 Dekaden (1 g – 1 t), Insekt bis Bär | Insekten-Tripod-Gang, Flugmuskel-Takt 100–200 Hz sichtbar als Unschärfe | P0 | Makro-Zeitlupe im Spiel gegen Hochgeschwindigkeits-Referenz, Blind-Panel ≥ 0,7 | — |
| 6 | 11 Dekaden (1 mg – 70 t), Ameise bis Sauropode, alle Medien | jede Art im eigenen Gelände: Hang, Fels, Schnee, Schlamm, Strömung | P0 | 1 000 Stichproben-Arten × 5 Gelände: Anteil ohne Durchdringung, Fußgleiten ≤ 5 % und Gang im Band ≥ 0,95 | — |
| 7 | fremde Schwerkraft 0,1–5 g, Atmosphären von dünn bis dicht, Flüssigkeiten jenseits Wasser | Gang und Flug skalieren mit g und Dichte | P0 | gleiche Art auf 3 Planeten: Gangwechsel-Tempo ∝ √(g·L) ±10 %, Flug nur, wo Dichte und g ihn tragen (Gegenprobe: Art in dünner Luft bleibt am Boden) | — |

### L3 Verhalten aus Bedürfnis und Sinn
Misst, ob das Verhalten einer BELIEBIGEN Art aus ihrem Leib, ihren Sinnen und ihrer Welt folgt — gezählt an Stichproben-Arten, nicht an einer Liste von Akten je Art.

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | 4 Gattungen, ≈ 10 Akte (ruhen, äsen, ziehen, trinken, pirschen, hetzen, reißen, fressen, fliehen, folgen), 2 Sinne | Zeitbudget ±20 % am Ethogramm, Riss-Quote nach MacNulty | P0 | Zeitraffer 24 Spielstunden: Budget-Abweichung; Riss-Quote Rudel gegen Hirsch 20–40 % | HEUTE (headless; im echten Spiel nicht gemessen) |
| 2 | eine Art mit vollem Ethogramm: + sichern, Alarmruf, Spiel, Komfort, Markieren, Drohen | Alarm-Kette ≤ 1 s, Fluchtdistanz nach Feldmaß | P0 | 1 h Beobachtung einer Herde: Ethologe protokolliert ≥ 30 distinkte Akte, Häufigkeiten gegen Feld-Ethogramm Rangkorrelation ≥ 0,7 | — |
| 3 | 10² Stichproben-Arten aus dem Samen tragen ein Verhalten, das zu ihrem Leib passt | Räuber pirscht, Beute sichert, Aasfresser kreist — ohne Zuweisung von Hand | P0 | 100 Saaten, je 1 h Beobachtung: Ethologe ordnet die Art blind ihrer Lebensweise zu (Räuber, Weider, Aasfresser, Sammler) ≥ 0,8 | — |
| 4 | 5 Sinne (Gehör mit Richtung, Geruch im Wind, Vibration, Wärme) | Tiere hören den Spieler, wittern gegen den Wind | P0 | Anschleich-Probe: Entdeckungsdistanz mit Wind / gegen Wind ≥ 3, wie Jägerpraxis | — |
| 5 | Lernen und Gedächtnis: Orte, Individuen, Gefahr über Tage | ein Tier, das bedroht wurde, meidet Ort und Spieler Wochen | P0 | Wiederkehr-Probe nach 7 Spieltagen: Meidequote ≥ 0,8 beim Individuum, ≤ 0,2 bei Fremden | — |
| 6 | 10⁴ Stichproben-Arten; Sinne jenseits des Menschen (UV, Magnetfeld, Echo, Elektro) tragen das Verhalten | Fledermaus jagt im Dunkeln, Zugvogel hält Kurs bei Bewölkung | P0 | Nacht-Probe: Fang-Quote der Echo-Jäger bei 0 lux gleich der bei Tag ±20 %; Zuordnung wie 3 an 10⁴ Saaten ≥ 0,8 | — |
| 7 | Kultur entsteht ohne Vorgabe: Werkzeug, Gesangs-Dialekte, Zugrouten werden weitergegeben | Dialekt-Grenzen zwischen Populationen messbar | P0 | Anteil der Saaten, in denen mindestens eine Art eine weitergegebene Tradition zeigt > 0; Klang-Probe: Gesang zweier Populationen im Spektrum trennbar ≥ 0,9, innerhalb nicht | — |

### L4 Lebenszyklus und Generationen
Misst, ob der Spieler Brunft, Balz, Brut, Aufzucht, Altern und Vererbung SIEHT, und über wie viele Generationen.

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | Geburt und Tod als Zahl im Bestand je Revier, Alterstod | Bilanz mit Holling-III-Riss | P0 | Bestand je Revier über 3 Spielstunden im Band | HEUTE |
| 2 | sichtbares Jungtier, das wächst | Proportion Jung ↔ Alt allometrisch (großer Kopf, lange Beine beim Kitz) | P0 | Bildpaar Kitz/Hirsch gegen Fotopaar, Blind-Panel ≥ 0,7; Jungtiere ≥ 10 % einer Herde im Frühsommer | — |
| 3 | Brunft, Balz, Revierkampf zur Jahreszeit der Art | Röhren im Herbst, Balzflug im Frühling | P0 | Jahres-Zeitraffer: Brunft-Ereignisse im Bild je Monat, Gipfel im Monat der Natur ±1 | — |
| 4 | Nest, Bau, Brut und Brutpflege, Laich | Nest aus Stoffen des Orts, Eltern füttern | P0 | 10 Spielstunden Frühling: Anteil der Brutpaare mit sichtbarem Nest ≥ 0,8, Fütterungsflüge je Stunde im Band der Art | — |
| 5 | Vererbung: Junge tragen das Genom der Eltern | Ähnlichkeit Kind–Eltern > Kind–Fremde | P0 | Bild-Embedding: Abstand Jungtier–Eltern / Jungtier–fremde Alttiere ≤ 0,5 über 100 Würfe | — |
| 6 | 10² Generationen im Zeitraffer, Drift und Selektion | Fellfarbe folgt dem Boden, Größe dem Klima (Bergmann) | P0, Zeitraffer ohne Bild-Riss | nach 100 Generationen: Korrelation Fellhelligkeit ↔ Bodenhelligkeit ≥ 0,5, ohne Selektion ≈ 0 (Gegenprobe) | — |
| 7 | 10⁵ Generationen: neue Arten entstehen (Naht zu L9 und zum Blatt Evolution) | getrennte Populationen werden unterscheidbar | P0 | Insel-Probe: zwei getrennte Bestände nach Zeitraffer im Bild-Embedding trennbar ≥ 0,9 | — |

### L5 Herde, Schwarm, Pulk: die Masse im Bild
Misst, wie viele einzeln lebende Glieder ein Kollektiv im Bild trägt und wie wahr seine Form ist. EINZIGE Leiter für „Leiber im Bild" (L7 zählt Arten, nicht Leiber).

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | 10 Glieder: Rudel 3–6, Kahlwild 3–7 | Kohäsion wandernd ≥ 0,9, Flucht ≥ 0,8, Ausrichtung Φ ≥ 0,8 | P0 | Ego auf 40 m: Herde flieht als EIN Pulk im Bild, an beiden Geräten | HEUTE (halb: headless 0,981, Radeon ROT) |
| 2 | 10² Glieder: Star-Trupp 60–140 | Dichte-Welle, Leittier, kein Glied im anderen | P0 mit dem Trupp im Bild | Bildvergleich Silhouette gegen Murmuration-Film; Bild p95 am Standardgerät mit Trupp | — (gebaut, am Gerät ungemessen) |
| 3 | 10³: Gnu-Herde am Fluss, Fischschwarm | Ausrichtung topologisch (6–7 Nachbarn) | P0 mit der Herde im Bild | wie 2, + Φ und Nachbarzahl im Band Ballerini | — |
| 4 | 10⁴ | Korrelationslänge wächst mit der Schwarmgröße | P0 mit dem Schwarm im Bild | Korrelationslänge / Schwarmgröße konstant ±20 % über 10²–10⁴ (Cavagna) | — |
| 5 | 10⁵: Gnu-Strom bis zum Horizont, Vogelfelsen | Staubfahne, Flussquerung mit Stau, Lärm des Felsens | P0 mit dem Strom im Bild | Horizont-Bild gegen Serengeti-Luftfoto bzw. Vogelfelsen-Foto, Blind-Panel ≥ 0,7 | — |
| 6 | 10⁶: Murmuration über dem Ried, Gnu-Wanderung ganz | Dichtewellen 20–40 m/s, Raubvogel schneidet Löcher | P0 mit der ganzen Wolke im Bild | Wellentempo im Band der Messung; Zoom-Probe: an 10 zufälligen Stellen der Wolke zeigt der Nahblick ein Einzeltier mit eigenem Schlag; der Falke reißt ein Loch, das sich schließt | — |
| 7 | 10⁹: Heuschreckenschwarm, Krill-Wolke im Meer | Schwarm-Front frisst messbar (Kopplung Pflanzen) | P0 mit der Front im Bild | Horizont-Bild gegen Schwarm-Foto, Blind-Panel ≥ 0,7; Kahlfraß-Fläche je Stunde im Band der FAO-Werte; Zoom-Probe wie 6 | — |

### L6 Wanderung und Raum
Misst, über welche Strecken ein Tier im Spiel zieht und ob es heimfindet.

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | 10 m: Leine um den Geburtsort | — | P0 | Aufenthaltsfläche eines Individuums über 1 Spieltag | — |
| 2 | 10² m: Revier, Flucht-Strecke | Wildwechsel zur Tränke aus Durst | P0 | Streifgebiet eines Individuums über 1 Spieltag (m²) | HEUTE |
| 3 | 10³ m: Streifgebiet nach Feldmaß (Rothirsch 1–10 km²) | Wildwechsel als Pfad im Boden sichtbar (Kopplung Spur) | P0 | Spur eines Tiers über 7 Spieltage: Streifgebiet im Band der Telemetrie ±Faktor 2 | — |
| 4 | 10⁴ m: saisonaler Wechsel Sommer- ↔ Wintereinstand | Höhenwanderung folgt Schnee | P0 | Jahres-Zeitraffer: Höhen-Median der Art Winter vs. Sommer, Differenz im Band | — |
| 5 | 10⁵ m: Gnu-Zug folgt dem Regen, Lachs zieht stromauf | Route aus Gras und Regen, nie aus Skript (Kopplung Wetter) | P0 | Regen verlegt → Zugroute verlegt sich (Gegenprobe); Lachs-Heimkehr in den Geburtsbach ≥ 0,9 | — |
| 6 | 10⁶–10⁷ m: Vogelzug über Kontinente | Kurs aus Magnet-, Sternen- und Sonnenkompass, Rast an Feuchtgebieten | P0; Ankunft ≤ 5 s an jedem Ort der Route, Tier am Ort, wo der Zug es hingeführt hat | Zugvogel-Individuum über 1 Spieljahr: Strecke, Rastplätze, Ankunft im Brutgebiet ±7 Spieltage | — |
| 7 | 7×10⁷ m: planetare Wanderung (Küstenseeschwalbe ≈ 70 000 km/Jahr) | Zugrouten verschieben sich mit dem Klima (Kopplung Tiefe Zeit) | P0 | Klima-Zeitraffer: Zugscheide verschiebt sich messbar mit der Isotherme | — |

### L7 Artenreichtum am Ort
Misst, wie viele Arten der Spieler an einem Ort je Zeit antrifft und ob die Fauna mit Ort, Uhr und Jahr wechselt — Arten, nicht Leiber (die zählt L5).

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | ≥ 3 Tier-Sichtungen je 10 Spielminuten | Art passt zum Lebensraum (Hirsch Wiese, Bär Fluss) | P0 | Spielgang 10 min, Tier im Bild ≥ 200 px | HEUTE |
| 2 | Herde ≥ 20 im Bild in 30 min, 150 Tiere im 500-m-Ring | Fauna des Rings lebt, auch wenn sie nicht im Bild ist | P0 mit 150 Tieren im Ring, Ego und Third, beide Geräte | Spielgang 30 min: Herden-Sichtung ≥ 20; Bild p95 ≤ 33 ms | — |
| 3 | 10 Arten je Hektar (mit Vögeln, Insekten) | Fauna wechselt mit Biom und Uhr (Dämmerungs-Arten) | P0 | Arten je Hektar in 10 min gegen Feldkartierung desselben Biomtyps ±Faktor 2 | — |
| 4 | 10² Arten je Hektar | Insekten an Blüte, Rinde, Boden sichtbar und hörbar | P0 | Makro-Gang 10 min: Arten-Akkumulationskurve gegen Feldkurve | — |
| 5 | Zusammensetzung wechselt mit Jahr und Uhr | Zugvögel fehlen im Winter, Nacht-Fauna anders als Tag | P0 | Arten-Liste eines Orts Tag/Nacht und Sommer/Winter: Überlappung (Jaccard) im Band der Feldkartierung ±0,15 | — |
| 6 | 10³ Arten je Hektar Regenwald (meist Gliederfüßer) | Kronendach anders als Boden | P0 | Arten-Zählung je Hektar Stichprobe gegen Regenwald-Inventur ±Faktor 2 | — |
| 7 | jeder Ort jedes Planeten trägt seine Fauna, ohne dass der Spieler sie ruft | Fauna läuft ohne Spieler weiter | P0, Ankunft ≤ 5 s an beliebigem Ort | Rückkehr nach 1 Spieljahr: Bestand verändert gemäß Saison und Jagd, nicht zurückgesetzt | — |

### L8 Tier und Mensch: Begegnung, Haustier, Nutztier, Stadttier, Tier-Sein
Misst, wie tief der Spieler mit Tieren umgehen kann und ob die Städte der Millionen die Tiere tragen, die zu ihnen gehören (Kopplung Stadt, Epoche, Wirtschaft).

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | Wildtier reagiert auf den Spieler | Fluchtdistanz je Art im Feldband | P0 | Annäherungs-Probe an 4 Gattungen: Fluchtdistanz im Band der Feldmaße ±50 % | — |
| 2 | Spieler liest Fährten, beobachtet, jagt | Spur und Losung führen zum Tier | P0 | Fährten-Probe: einer frischen Spur folgen führt in ≤ 10 min zum Tier ≥ 0,8 | — |
| 3 | Haus- und Reittier: Hund folgt, Pferd reitbar | Gang des Reittiers aus seinem Leib, nicht als Fahrzeug | P0 mit Reiter in Bewegung | Ritt-Probe: Gangarten des Pferds unter Reiter gegen Referenzfilm (Fußfall ±0,05); Hund hält Abstand und kehrt auf Ruf ≥ 0,9 | — |
| 4 | Stadttiere: Tauben, Ratten, Katzen, Hunde | Dichte folgt den Menschen und dem Abfall | P0 in der Stadt mit Bewohnern | Dichte je km² gegen Stadtzählungen ±Faktor 3; Stadtkern dichter als Rand (Gegenprobe) | — |
| 5 | Nutztiere tragen die Bevölkerung: Herden, Weiden, Hirten, Zugtiere je Epoche | Herden je Kopf und Weidefläche plausibel; Zugpferd in der Stadt des 19. Jh., Traktor heute | P0 | Stadt mit N Bewohnern: Nutztiere und Weidefläche im Umland gegen historische Agrarstatistik derselben Epoche ±Faktor 3 | — |
| 6 | Domestikation aus der Wildform über Generationen | Hund aus Wolf, Rind aus Ur sichtbar abgeleitet | P0, Zeitraffer ohne Bild-Riss | Bild-Embedding: Haustier liegt näher an seiner Wildform derselben Saat als an jeder anderen Art ≥ 0,9 | — |
| 7 | der Spieler WIRD jedes Tier einer Stichprobe | Steuerung, Tempo, Sicht und Sinne aus dessen Leib (Adler sieht scharf, Hund riecht, Maulwurf tastet) | P0 im Wechsel ohne Ladepause | 100 Saaten: jede Art spielbar; Tempo und Sprung des gespielten Tiers gleich dem wilden derselben Art ±10 %; Blind-Panel erkennt die Art an der Ego-Aufnahme ≥ 0,7 | — |

### L9 Fauna der tiefen Zeit
Misst, ob der Spieler in die Vergangenheit DESSELBEN Planeten reisen und dort die Fauna antreffen kann, die dessen Evolution damals trug — aus demselben Samen, nicht als Museums-Kulisse.

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | eine Epoche zurück (10⁴ Jahre) | Fauna unterscheidbar von heute, verwandt mit heute | P0, Zeitsprung-Ankunft ≤ 5 s | Blind-Panel ordnet Bildpaare Gegenwart/Epoche richtig zu ≥ 0,8 | — |
| 2 | Eiszeit-Megafauna (10⁵ Jahre) | Größenverteilung zur Kälte passend (Bergmann, Megafauna) | P0 | Körpermassen-Median der Epoche über dem der Gegenwart, wie im realen Pleistozän | — |
| 3 | 10⁷ Jahre: andere Ordnungen dominieren | Linien verfolgbar: heutige Art hat einen sichtbaren Vorfahren | P0 | 100 heutige Arten: Anteil mit auffindbarem Vorfahren in der Epoche, im Bild-Embedding näher als jede andere Art ≥ 0,8 | — |
| 4 | 10⁸ Jahre: Riesen bis 70 t | ihr Gang trägt ihre Masse (Naht L2-6) | P0 mit Riesen im Bild | Fußfall und Tempo der Riesen im Band paläobiomechanischer Schätzungen ±Faktor 2 | — |
| 5 | 5×10⁸ Jahre: erste Tierstämme im Meer (Naht Leben im Wasser) | wenige Baupläne, schnelle Radiation | P0 | Zahl der Baupläne je Epoche steigt früh steil und flacht ab, wie der Fossilbericht | — |
| 6 | Massenaussterben aus Ereignissen der Welt (Vulkan, Einschlag, Klimasturz) | Aussterbe-Rate und Erholungsdauer im Band der fünf großen Aussterben | P0 | Ereignis-Probe: Anteil verlorener Arten und Generationen bis zur Erholung im Band; ohne Ereignis keine Welle (Gegenprobe) | — |
| 7 | jede Epoche jedes Planeten bereisbar, Fauna stetig von Anbeginn bis heute | Gegenwart ist das Ergebnis der Vergangenheit, nicht unabhängig gesetzt | P0, jeder Zeitsprung ≤ 5 s | Saat-Probe: Fauna der Gegenwart ändert sich, wenn ein Ereignis der Vergangenheit verlegt wird (Gegenprobe), und bleibt byte-gleich, wenn nicht | — |

## Stand heute

Am main geprüft (zp-main-bild, 14.11.):
- **Arten:** vier Säuger-Gattungen (Wolf, Fuchs, Bär, Hirsch) aus fünf allometrischen Dials (`tetrapoda-core.js:62`); je Gattung EINE Gestalt, alle Individuen gleich (`tetrapoda-core.js:39` `GESTALTEN_JE_REZEPT = 1`, angewandt `:5041`) — bestätigt. Dazu Singvogel-Reviere und Star-Schwärme (`VOGEL_GESETZ`, `:2229`; Teile als Doppelkeil, `:2225`), die Bachforelle als Doppelkeil/Oktaeder 0,3 m (`FISCH_GESETZ`, `:2671`, `leib.groesse [0.06, 0.075, 0.3]` `:2690`), die Hummel als Doppelkeil ≈ 2 cm (`BESTAEUBER_GESETZ`, `:2761`) — bestätigt. Zusammen ≈ 8 Leib-Typen, gesetzt, nicht aus Genom.
- **Leib und Gang:** Gang aus Froude für die vier Säuger, Schlupf max 0,011 in 25 Läufen (MEISTERKARTE.md Z. 403–404, headless). Vogel und Fisch tragen Bild-Schlag, nicht Physik.
- **Verhalten:** `VERHALTEN` (`tetrapoda-core.js:99`) mit Jagd-Kreislauf, Furcht mit Riss-Gedächtnis, Lebensraum, Ethogramm aus Bedürfnis-Pegeln, Durst. Gemessen headless: Rudel reißt 18/60, Budget Hirsch ruhen 0,409/0,4.
- **Lebenszyklus:** Geburt und Tod je Revier-Takt, Holling-III-Riss (`BESTAND_GESETZ`, `tetrapoda-core.js:2177` — bestätigt), Alterstod. Brunft, Balz, Nest, sichtbares Wachstum, Vererbung: nichts.
- **Masse:** Wurf 3–6 (Wolf) und 3–7 (Hirsch) (`tetrapoda-core.js:289`, `wurf` — bestätigt), Star-Trupp 60–140 Glieder (`:2279` — bestätigt), gezeichnete Leiber höchstens 20 (`stamm/dirigent-kern.js:282` `maxCreatures: 20` — bestätigt). Kohäsion fliehend 0,981 headless, Radeon ROT (MEISTERKARTE.md Z. 402).
- **Raum:** Leine 18 m × Körpergröße (`tetrapoda-core.js:225` `leashBaseM: 18` — bestätigt); Wanderung: nichts.
- **Mensch und Tier, tiefe Zeit:** Reit-, Haus-, Nutz-, Stadttiere: nichts; Fauna vergangener Epochen: nichts.

Einordnung: L1 Sprosse 1 halb, L2 1 (headless), L3 1 (headless), L4 1, L5 1 halb, L6 2, L7 1, L8 0, L9 0 — von 63 Sprossen tragen 7 eine HEUTE-Marke, davon 5 nur headless oder halb.

## Abhängigkeiten

- **Pflanzen und Biome** zuerst für L7 und L4 (Äsung, Nistplatz, Deckung) und L5-7 (Kahlfraß).
- **Atmosphäre, Wetter und Klima** für L6 (Zug folgt Regen, Höhenwanderung folgt Schnee), L4 (Jahreszeit der Brunft), L9-2 (Eiszeit).
- **Ozean, Wasser und Eis** für L6-5 (Lachs stromauf) — das Tier im Meer selbst gehört dem Blatt **Leben im Wasser** (L9-5 ist die Naht).
- **Evolution und fremdes Leben** teilt den Genom-Raum: dieses Blatt misst das Tier als Individuum, Art und Fauna einer Epoche, jenes die Entstehung der Arten (L4-7 und L9 sind die Naht).
- **Geologie: Platten und Vulkane** für L9-6 (Aussterben aus Ereignissen der Welt).
- **Städte, Bewohner, Epochen und Wirtschaft** für L8-4/5 (Stadttiere, Nutztiere je Epoche).
- **Ökosysteme, Kreisläufe und Zerfall** besitzt Nahrungsnetze und Kaskaden; hier nur, was das Tier zeigt.
- **Millionen: Bevölkerung, Masse und Strom** liefert die Massen-Technik, auf der L5 ab 10⁴ steht.
- **Physik und Stoff** für L2; **Licht, Bild und Horizont** für L5-5/6/7; **Klang, Stimme und Musik** für L3-7 und L4-3; **Spur, Verfall und Gedächtnis** für L6-3 und L8-2; **Fremde Sinne und Zeitmaßstäbe** für L3-6 und L8-7.
- **Ankunft, Geräte und Zugang**: P0 trägt jede Sprosse; ohne Ankunft ≤ 5 s steht keine.

## Was die alte Karte hier misst

Domäne 7 Tiere, 8/10 (MEISTERKARTE.md Z. 388–409):
- **K1 Verband** (Kohäsion, Φ, Alarm-Kette ≤ 1 s, Verbands-ID 600 s), 1/2 → L5 Sprosse 1 und L3 Sprosse 2 (Alarm-Kette).
- **K2 Jagd-Kreislauf** (Pirsch bis Aas, Riss-Quote nach MacNulty), 2/2 → L3 Sprosse 1.
- **K3 Gang und Leib** (Schlupf, Froude-Gangwechsel, Labor = Welt, Querhang), 2/2 → L2 Sprosse 1.
- **K4 Lebensraum und Tagesrhythmus** (Geburt in der Boden-Klasse, Zeitbudget ±20 %, Durst), 2/2 → L3 Sprosse 1 und L7 Sprosse 1.
- **K5 Begegnung, Dichte, Kosten** (≥ 3 Sichtungen/10 min, Herde ≥ 20 in 30 min, Kosten bei 150 Tieren), 1/2 → L7 Sprossen 1 und 2.
Die alte Karte misst die unterste Sprosse von fünf der neun Leitern; L1 (Arten aus dem Samen), L4 (Lebenszyklus), L6 (Wanderung), L8 (Tier und Mensch) und L9 (tiefe Zeit) misst sie nicht. Ihre 8/10 entsprechen hier ≈ 7 von 63 Sprossen, die meisten nur headless.

## Zweifel

- **Der Glaubhaftigkeits-Richter** (L1, L4-2, L5-5/7, L8-7, L9-1): ein Blind-Panel ist ehrlich und misst das Ergebnis, aber nicht in ≤ 3 min CI fahrbar; ein Bild-Embedding gegen einen Foto-Korpus ist fahrbar, misst aber Nähe zum Korpus, nicht Möglichkeit — für fremde Arten (L1-7) und vergangene Faunen eines fremden Samens (L9) fehlt jede Foto-Referenz. Dort tragen nur Verteilungs-Richter (Masse je Dekade, Bauplan-Kurve) und Gegenproben.
- **Die Zahlen der Wirklichkeit** (Murmuration, Gnu, Seeschwalbe, Nutztier-Biomasse, Sauropoden-Masse) sind Größenordnungen aus Sekundärquellen.
- **L9 gegen das Blatt Evolution:** ob die Fauna der tiefen Zeit hierher oder dorthin gehört, ist eine Naht-Frage; hier steht sie, weil der Spieler dort TIERE trifft.
- **Offene Fragen ohne Richter (R6, kein Punkt):** Erleben Tiere (Schmerz, Bindung, Trauer) so, dass der Spieler es spürt? Wie misst man „Würde" einer Tierbegegnung? Ob ein Spieler 10⁶ Arten je wahrnimmt, oder ob ab 10⁴ nur die Stichprobe zählt.

## Gegenlese — was sich änderte und was strittig bleibt

- **Zwei Leitern neu:** L8 Tier und Mensch (Begegnung, Reittier, Stadt- und Nutztiere je Epoche, der Spieler WIRD das Tier — „jede erdenkliche Perspektive" und die Millionenstadt fehlten ganz) und L9 Fauna der tiefen Zeit („Zeiten bereisen" fehlte ganz).
- **Dieselbe Leiter zweimal:** alte L5 und L7 zählten beide „Leiber im Bild" (L7-5 10⁴ Leiber gegen L5-5 10⁵); L5 trägt jetzt allein die Masse, L7 allein die Arten am Ort.
- **Fleiß → Fähigkeit:** L3 zählte Akte je Art (30 → 100 → 300, eine Liste); jetzt zählt L3 Stichproben-Arten, deren Verhalten ohne Zuweisung zu ihrem Leib passt (Sprossen 3, 6, 7). L1 trägt Individualität (heute byte-gleich, `GESTALTEN_JE_REZEPT = 1`).
- **Bauweise aus Richtern gestrichen:** „gate:tier-gang Welt − Labor", „updateCreatures ≤ 1 ms", „≤ 2 ms CPU für alle Tiere", „ferne Tiere ohne Bild-Kosten", „Leib aus Isofläche", „Flügelschlag aus Masse und Spannweite" — ersetzt durch Bild-Ergebnisse und P0 MIT der Masse im Bild.
- **Gehobene Spitzen:** L1-7 (jeder Same ein Planet mit eigener Fauna), L2-6/7 (bis 70 t, 0,1–5 g, fremde Flüssigkeiten), L5-7 (+ Krill), L3-7 (Kultur entsteht ohne Vorgabe).
- **HEUTE-Marken ehrlicher:** L1-1, L5-1 halb; L5-2 (Star-Trupp) ohne Marke, da am Gerät ungemessen; L2-1 und L3-1 als headless markiert. Sechs Code-Behauptungen am main nachgeprüft, alle stimmen.
- **Strittig bleibt:** ob ein Blind-Panel als Richter der Karte taugt (nicht CI-fahrbar), ob L9 diesem Blatt oder dem Blatt Evolution gehört, und ob P0 auf L5-6/7 (10⁶–10⁹ Glieder) überhaupt eine physikalische Grenze des Standardgeräts trifft — die Zoom-Probe misst dann, ob die Masse wahr ist, nicht ob jedes Glied einzeln rechnet.
