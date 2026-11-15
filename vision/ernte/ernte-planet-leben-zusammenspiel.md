# Ernte-Liste Meisterkarte 2: planet (26) · leben (33) · zusammenspiel (33)

Stand 2026-11-15 21:11 (Get-Date). Nur gelesen: Gruppen-JSON, `stationen/g1–g6.js`, `stand.json` (je Station die letzte Zahl), Spiel `origin/main` 9b3750ba und `origin/w28-reise-ort` eb8f82c7. Während des Lesens zog main auf a996d0ae (V18.546.296, 20:50), und der trägt w28-reise-ort. Die Zeilen in Spiel-Dateien sind gegen a996d0ae nachgezählt, die in `g*.js` stammen aus dem Quell-Ordner. Kein Lauf, keine GPU.

## 1) Zählung (132 geprüfte Sprossen: 92 Sprossen 1, dazu 40 Sprossen 2/3 hinter einer heute wahren Vorgängerin)

| T | N(S) | N(M) | N(L) | F | P |
|---|---|---|---|---|---|
| 4 (2 neu, 2 stehen schon in der Tafel) | 6 | 27 | 4 | 77 (davon 25 „unklar“) | 14 |

Je Gruppe: planet 34 Zeilen (T 0 · N(S) 2 · N(M) 6 · N(L) 0 · F 18 · P 8) · leben 49 (T 3 · N(S) 4 · N(M) 6 · N(L) 3 · F 27 · P 6) · zusammenspiel 49 (T 1 · N(S) 0 · N(M) 15 · N(L) 1 · F 32 · P 0).

Lesart: Läuft eine Station headless, also mit Null-Renderer, und misst sie genau den Richter, heißt das N, nicht T, denn nach R2 hebt headless keine Sprosse. Gemeint ist dann eine Station im Fenster (GPU). Klasse aller T und N ist **Ort**, mit einer Ausnahme: `planet.relief.grossform` S1 verlangt „Flussnetz bis zum Horizont“, die Sicht reicht dort über 1 km hinaus, das ergibt die Klasse **Stadt** und damit Ankunft kalt ≤ 5 s, also PFLICHT B. Kopplungs-Sprossen in zusammenspiel brauchen nach R7 zusätzlich den Gegenlauf im selben Lauf, und der gehört in jede ihrer Proben.

**Die zwei Kern-Sprossen ohne Tafel-Zeile:**
- `planet.wasser.kreislauf` S1, alt wetter.K3: **kein T**. Den Teil „Pegel nach Sturm im Bild“ misst `wetter.K3#2` an der GPU genau (g1.js:2401-2449, Radeon +0,2 m und Wasser ×2,62, GTX ×3,82). Die Bilanz misst nur die headless-Hälfte `wetter.K3#2` (g1.js:2351-2399), Messwert 1,006 / 0,98, die Schwelle der Station ist aber ±30 % statt ±10 %. Der „Scheitel-Verzug im Erd-Band“ hat kein Band: gemessen ist Lag 1 ↔ 1,9 Spielstunden bei A 0,16 ↔ 0,8 km². Ein Erd-Lag nach SCS für 0,16 km² läge grob bei 0,2–0,5 h; ob die Spielstunde eine Erd-Stunde ist, ist ungeklärt. Urteil: **F (unklar)**. Zu prüfen wäre zuerst ein eingefrorenes Erd-Band für Lag(A), danach die Ganglinie in derselben GPU-Sitzung wie das Bild am Bach.
- `planet.kopplung.wetter-welt` S1, alt wetter.K2, wetter.K5, licht.K5: **kein T**. `licht.K5#1` (g3.js:2664-2697) misst den Sprung (≤ 0,1 EV/s) und den Hub der Leuchtdichte, nicht „Richtlicht gedimmt“ und nicht „Himmel grau“, und einen Gegenlauf hat er auch nicht. wetter.K2 misst Nässe, wetter.K5 misst Wind, beide gehören zu anderen Gliedern. Wahr ist die Sprosse im Spiel trotzdem: Die Deckung steigt von 0,12 (klar) auf 0,9 (Regen), Beleg `stamm/bild-himmel.js:1743-1747`, die Sonne wird über `tint.lightMul` gedämpft, Beleg `stamm/bild-himmel.js:1760`, und der Hub misst 0,38 EV (Radeon) bzw. 0,94 EV (GTX). Urteil: **N(M)**.

**w28-reise-ort (seit a996d0ae in main):** Der Zweig macht in diesen drei Gruppen **keine** S1 wahr. Die Heimat bleibt byte-gleich (103/103), deshalb folgt die Palme dort weiter dem Rauschen (leben.pflanzen.biome S1 bleibt F). Die Feuchte luvwärts (`planet-core.js:1853`) und die Neigung `kp.neigungRad` (`planet-core.js:2052`) leben auf Planeten-Maßstab und kommen nur als Differenz des Orts in die Welt. Ein Luv/Lee an einer Kammlinie im Bild oder Saaten mit anderer Neigung sind nicht belegt.

## 2) Tabelle

| leiter | sprosse | urteil | klasse | station oder probe | beleg (Datei:Zeile) | aufwand |
|---|---|---|---|---|---|---|
| planet.geologie.platten | 1 | P | – | Blindpaar Schummerung; im Spiel auch F: keine Tektonik in der Welt | Karte beleg (gelaende-core.js:361-391) | – |
| planet.geologie.vulkan | 1 | P | – | Blindpaar Glutbild (2AFC) | – | – |
| planet.geologie.gebirge | 1 | P | – | Blindpaar Felswand; im Spiel auch F: keine Faltung | – | – |
| planet.geologie.unterwelt | 1 | F (unklar) | – | Höhlen gibt es im Spiel (leib.K3#2: Höhle 0,07 Licht-Abfall), aber Mündungen je km² und „Mund im Fels“ sind im Bild nie gezählt, und das Band ist nicht eingefroren | stand leib.K3#2; g5.js:4495 | – |
| planet.geologie.lagerstaette | 1 | P | – | Jury trennt drei Genesen | – | – |
| planet.geologie.inneres | 1 | F | – | kein Magnetfeld, kein Kompass | Karte beleg | – |
| planet.geologie.einschlag | 1 | F | – | keine Krater als Form, nur Grab-Edits | Karte beleg | – |
| planet.relief.grossform | 1 | N(M) | Stadt | 20 Orte im Fenster: dem Lauf des gezeichneten Wassers bis See oder Meer folgen (Probe `laeufe` aus diag-wasser-leben als Leser, je Ort ein Bild); heute 293/293 Läufe headless | g1.js:1967-1975 (`diag-wasser-leben.cjs --nur …,laeufe`), stand gelaende.K4#2 | M |
| planet.relief.grossform | 2 | F (unklar) | – | Hack-Gesetz und Bifurkation im sichtbaren Netz nie gemessen | – | – |
| planet.relief.formschatz | 1 | P | – | Blind-Klassifikation (Panel oder geeichtes Modell, R11) | – | – |
| planet.relief.boden | 1 | P | – | Blindpaar gegen Foto (2AFC) | – | – |
| planet.relief.wandel | 1 | F | – | das Wasser im Graben gräbt nicht, keine Sediment-Bilanz | Karte beleg | – |
| planet.wasser.seegang | 1 | F (unklar) | – | spiegelTreue nur an EINER Pose gemessen (GTX 0,73), an derselben Pose Radeon ROT; 12 Posen (Uhr × Wetter) nie | stand gelaende.K3#1 | – |
| planet.wasser.gezeiten | 1 | F | – | Meeresspiegel konstant | gelaende-core.js:2687 (Karte) | – |
| planet.wasser.stroemung | 1 | **N(S)** | Ort | GPU-Fassung von `treibt`: an 4 Fluss-Orten Schwimmer, Boot, Tier > 0,5 m in 90 Takten, je Ort ein Bild; heute headless 4/4 | g1.js:1970-1975 (`--nur …,treibt`), stand gelaende.K4#2 „Strömung 4 von 4“ | S |
| planet.wasser.stroemung | 2 | N(M) | Ort | optischer Fluss aus zwei Bildern im Abstand 0,5 s an 12 Fluss-Posen, Verhältnis längs/quer und Richtung; der Shader trägt das Bild stromab (`aFlow`). Risiko: die ±20° sind ungemessen | stamm/bild-sicht.js:213-215 | M |
| planet.wasser.stroemung | 3 | F | – | Ozean ohne Strömung, kein Rip | Karte beleg | – |
| planet.wasser.eis | 1 | N(M) | Ort | 10 Posen × 4 Jahreszeiten: Schneegrenze im Bild gegen die Nullgrad-Höhe des Temperatur-Felds, dazu Fuß-Einsinken (headless 0,204 m). R9: dieselbe Fahrt kann klimazonen S1 und bahn-klima S1 nur mit getrennter Messgröße tragen | gelaende-core.js:1300-1307, :1435-1443; stand wetter.K4#1; g1.js:937-990 | M |
| planet.wasser.eis | 2 | N(M) | Ort | See bei Frost begehen, bei Tauwetter einbrechen, im Fenster; heute headless 1 151 Schritte auf dem Eis und schwimmend bei +10 °C (Stefan) | g1.js:3275 (stoffe.K3#1), stand „1151 Schritte … 1003 Schritte schwimmend“ | M |
| planet.wasser.eis | 3 | F | – | kein Meereis | Karte beleg | – |
| planet.wasser.kreislauf | 1 | F (unklar) | – | siehe Kopf: Pegel im Bild T-fähig, Bilanz nur headless mit ±30 %, Erd-Band des Verzugs fehlt | g1.js:2351-2449 | – |
| planet.wasser.tiefsee | 1 | N(M) | Ort | Tauchen auf 5 m am See: Rot-Anteil des Bilds gegen 0,5 m (Gesetz kd rot 0,45/m, ergibt etwa 0,1); Sicht gegen Secchi ±30 %. Die Probe LEIB_K3_BILD von leib.K3#2 misst heute nur Luma bis 2,5 m | foundry-core.js:176 (`koerper` je Kanal), g5.js:2452-2480, g5.js:4495 | M |
| planet.wasser.tiefsee | 2 | P | – | Blindtest gegen Taucherfotos | – | – |
| planet.wetter.lagen | 1 | **N(S)** | Ort | GPU-Fassung von gate:wetter-wache (F): `_wetterAmOrt` an A und B 3 km windab über 20 min, Regen an A bei trockenem B und Lag, dazu ein Regenbild an A | g1.js:2145-2160 (`diag-wetter-wache.cjs`), stand wetter.K1#2 „40 % · Lag 240 s (Soll 273 s ±20 %)“ | S |
| planet.wetter.lagen | 2 | F | – | das Wetter besteht aus drei Sinus-Wellen, ohne Druck und ohne Gattungsfolge | phyto-core.js:4067-4091 (Karte) | – |
| planet.wetter.wolken | 1 | P | – | 2AFC Zeitraffer gegen Film | – | – |
| planet.wetter.klimazonen | 1 | N(M) | Ort | Temperatur am Meer zu Sommer- und Winter-Mitte aus dem Feld am Spieler-Ort (18 / −4 °C), dazu die Schneegrenze im Bild an 4 Jahreszeiten | gelaende-core.js:1300-1307; stand stoffe.K3#2 „Grenze 178 m übers Jahr“ | M |
| planet.wetter.klimazonen | 2 | F | – | Höhe gestaucht (0,11 K/m), Baum- und Schneegrenze nie auf Erd-Höhe | gelaende-core.js:1292 | – |
| planet.wetter.extreme | 1 | F | – | keine Flut, der Fluss verlässt das Bett nie | Karte beleg | – |
| planet.wetter.vorhersage | 1 | F (unklar) | – | die Wolkendeckung wird aus dem Wetter am Ort gemischt (bild-himmel.js:1747) und kommt nicht als Feld aus Luv; licht.K4#1 (Zug des Wolken-Musters) an der Radeon ROT r 0,15 | stamm/bild-himmel.js:1743-1758; stand licht.K4#1 | – |
| planet.wetter.fremde-atmosphaeren | 1 | F (unklar) | – | Himmels-Ton mittags misst ferne.K1#2 (222° ±15° gegen die CIE-Tageslicht-Ortskurve, GRÜN an beiden Geräten), Abend gegen Foto ungemessen, Foto-Korpus fehlt | spec/farbe/luft-referenz.json `himmel`; stand ferne.K1#2 | – |
| planet.zeit.klimageschichte | 1 | F | – | keine Drift, Meer fest | Karte beleg | – |
| planet.zeit.archiv | 1 | F (unklar) | – | Kliff 60–85° an Tafelland-Saaten nie gemessen; ob eine Tafelland-Saat es zeichnet, ist offen | gelaende-core.js:374-375 (Karte) | – |
| planet.erde.gestalt | 1 | F | – | es gibt keine Erd-Saat (der Richter trägt auch ein Panel) | Karte beleg | – |
| leben.pflanzen.arten | 1 | P | – | Blindtest Gattung | – | – |
| leben.pflanzen.biome | 1 | F | – | Palme folgt dem Rauschen `lebendig` statt der Wärme; nach w28-reise-ort unverändert (Heimat byte-gleich) | stamm/feld-leben.js (Karte) | – |
| leben.pflanzen.lebenslauf | 1 | F (unklar) | – | Höhenhistogramm aus dem Bild nie gemessen; vegetation.K3#1 an der Radeon ROT (215 Stämme/ha) | stand vegetation.K3#1 | – |
| leben.pflanzen.jahreslauf | 1 | T (steht) | Ort | vegetation.K5#2 | Tafel heute | – |
| leben.pflanzen.jahreslauf | 2 | F | – | keine Phänologie je Art (Grep Austrieb/Phänolog ohne Treffer in phyto-core und vegetation-*) | – | – |
| leben.pflanzen.dichte | 1 | F | – | Saum springt, Wald zu licht, Laub-Kante 0,2635 (PFLICHT A) | stand vegetation.K1#1, lod.K1#1 | – |
| leben.pflanzen.kraft | 1 | T (steht) | Ort | vegetation.K2#1 | Tafel heute | – |
| leben.pflanzen.kraft | 2 | F (unklar) | – | keine Station vegetation.K2#2; wetter.K5#2 nennt gras als Leser des Winds, keine Krone | stand wetter.K5#2 | – |
| leben.tiere.arten | 1 | N(L) | Ort | 1 h Spielgang über Wiese, Wald und Bach, je Art die Klassen-Maske ≥ 200 px zählen; gezeichnet werden Wolf, Fuchs, Bär, Hirsch, „wesen“, Vogel, Fisch | stand tiere.K4#1 (4 Gattungen), luftwasser.K1#1 (20 Vogel-Leiber), luftwasser.K3#1 (28 Fische, tier:fisch), tiere.K5#1 (wesen, wolf, baer ≥ 200 px) | L |
| leben.tiere.arten | 2 | P | – | Blind-Panel „echt möglich“ | – | – |
| leben.tiere.bewegung | 1 | N(M) | Ort | Fußgleiten und Gangwechsel aus einer Third-Bildserie (Fuß-Pixel je Bild); heute Gangart 49/49 und Schlupf nur aus diag-tier-gang (headless), das Bild zeigt nur Füße am Boden | g2.js:4001-4045 (tiere.K3#2), stand tiere.K3#1 „Schlupf max 0.011“ | M |
| leben.tiere.bewegung | 2 | F | – | Fisch ein starrer Leib mit 2,5 Hz, keine Körperwelle | tetrapoda-core.js:2685 (Karte) | – |
| leben.tiere.verhalten | 1 | N(M) | Ort | 24 Spielstunden Zeitraffer im Fenster am Wolfsrevier: Zeitbudget je Akt und Riss-Quote Rudel (headless 18/60 = 30 %, MacNulty 20–40 %) | g2.js:4334 (tiere.K2#1), g2.js:4410 (tiere.K4#2), stand | M |
| leben.tiere.verhalten | 2 | F | – | kein volles Ethogramm mit ≥ 30 Akten | Karte beleg | – |
| leben.tiere.lebenszyklus | 1 | N(M) | Ort | Bestand je Revier über 3 Spielstunden im Fenster (BESTAND_GESETZ), heute headless an 8 Saaten (min 6,84) | g2.js:4877 (oekologie.K2#1), stand | M |
| leben.tiere.lebenszyklus | 2 | P | – | Panel Kitz/Hirsch | – | – |
| leben.tiere.masse | 1 | F | – | tiere.K1#2 misst genau den Richter (Pulk = 1 Fleck aus 40–50 m, Kohäsion, Φ), aber der Wurf trägt 3–7 Glieder, die Sprosse verlangt 10. Beide GPU-Hälften heute ungemessen | g2.js:3874-3900, g2.js:111, stand tiere.K1 | – |
| leben.tiere.wanderung | 1 | N(M) | Ort | Spur eines Individuums über 1 Spieltag im Fenster: Fläche und Anteil im Lebensraum (headless 431/431 im Lebensraum) | g2.js:4368 (tiere.K4#1), stand; tetrapoda-core.js:225 (Karte) | M |
| leben.tiere.wanderung | 2 | F (unklar) | – | Streifgebiet ohne Soll, Wildwechsel zur Tränke nie gemessen | – | – |
| leben.tiere.mensch | 1 | F (unklar) | – | Fluchtdistanz je Art gegen ein Feldband nie gemessen; oekologie.K3 misst nur geschlagen gegen Kontrolle (96,95 / 36,22 m) | stand oekologie.K3#1 | – |
| leben.wasser.lebensraeume | 1 | **N(S)** | Ort | Bild am Bach-Kolk mit Klassen-Maske tier:fisch, Lebensräume mit eigener Fauna zählen (Soll 1); heute headless 28 Fische gegen die Strömung | g2.js:5937 (luftwasser.K3#1), stand | S |
| leben.wasser.lebensraeume | 2 | F (unklar) | – | See- und Küsten-Fauna unbelegt, das Meer ist kein Lebensraum | Karte beleg | – |
| leben.wasser.bild | 1 | N(M) | Ort | waagrechte Sicht unter Wasser an fester Pose: Ziel in Schritten, Restkontrast 2 % gegen das Band je Gewässertyp. leib.K3#2 misst nur den Abfall mit der Tiefe (K 0,22/m), luftwasser.K3#2 nennt 19,56 m aus dem Gesetz | g5.js:2452-2480, foundry-core.js:167-176, stand luftwasser.K3#2 | M |
| leben.wasser.bild | 2 | P | – | Blindtest Art | – | – |
| leben.wasser.netz | 1 | F | – | Fisch-Hub 0,081 m = 0,39 × Pegel-Hub 0,207 m (Soll ≥ 0,8). Die Station schwächt das Soll auf „0,8 · tiefe · Pegel-Hub“ ab | stand luftwasser.K3#2 „Pegel 25.815 → 26.022, Fische 25.166 → 25.247“ | – |
| leben.wasser.rhythmen | 1 | **N(S)** | Ort | GPU-Fassung der Bach-Probe von luftwasser.K3#2: Trupp stören, Heimkehr ≥ 60 % (headless 12/13), ein Bild mit tier:fisch | g2.js:5977 (luftwasser.K3#2), stand „heim 12 … heim ≥ 60 %“ | S |
| leben.wasser.rhythmen | 2 | F | – | kein Plankton, keine Vertikalwanderung | Karte beleg | – |
| leben.oeko.netz | 1 | N(L) | Ort | 8 Saaten im Fenster mit Zeitraffer 6 Spielstunden: jede Art in [⅓×, 3×]; heute headless 0,35–1,35×, außer Band 0 | g2.js:4954 (oekologie.K1#1), stand | L |
| leben.oeko.netz | 2 | F | – | 4 Säuger, keine 10 Arten auf 4 Ebenen | Karte beleg | – |
| leben.oeko.vielfalt | 1 | **T** | Ort | tiere.K5#1, ≥ 3 Sichtungen ≥ 200 px je 10 Spielminuten in Ego und Third (Radeon 6 und 4). Die Station fährt nur an der Radeon, `geraet` braucht "gtx" | g2.js:4567-4603, stand tiere.K5#1 | – |
| leben.oeko.vielfalt | 2 | F | – | höchstens 20 gezeichnete Leiber, keine Insekten- und Pflanzen-Arten je ha | dirigent-kern.js maxCreatures (Karte) | – |
| leben.oeko.dynamik | 1 | N(L) | Ort | Kaskade im Fenster mit Zeitraffer an 8 Saaten: Intervalle von Hirschen und Jungwuchs ohne 0 (headless 0,448 [0,321; 0,536], −0,279 [−0,325; −0,194]) | g2.js:4982 (oekologie.K1#2), stand | L |
| leben.oeko.dynamik | 2 | F (unklar) | – | ob die Jungwuchs-Zahl gezeichnete Pflanzen am Fluss steuert, ist ungemessen | – | – |
| leben.oeko.zerfall | 1 | F | – | gedüngt wird nur ein Tod von Spieler-Hand | stamm/kreatur-leben.js:918 (Karte) | – |
| leben.oeko.sukzession | 1 | **N(S)** | Ort | GPU-Fassung von stoffe.K5#2: Halm-, Asche- und Sämling-Zahlen der Brand-Zellen über die Zeit, dazu ein Bild je Stufe (headless Halme 477 → 70 → 491, Sämling 0 → 1) | g1.js:3498 (stoffe.K5#2), stand | S |
| leben.oeko.sukzession | 2 | P | – | Bildpaar gegen die Yellowstone-Fotoreihe | – | – |
| leben.oeko.stoffe | 1 | N(M) | Ort | Bildpaar Acker vor und nach 15 Ernten (headless Nährstoff 1 → 0,7, Wuchs 0,748 → 0,698). Die Schwelle für „sichtbar“ muss vor dem Lauf stehen, −7 % Wuchs ist ein Risiko | g1.js:3498 (stoffe.K5#2), stamm/feld-leben.js:3736 (Karte) | M |
| leben.oeko.stoffe | 2 | F | – | ein Skalar, kein N und P | Karte beleg | – |
| leben.oeko.partner | 1 | **N(S)** | Ort | GPU-Fassung von luftwasser.K4#1: r(Bestäuber, Blüten-Anteil) an ≥ 6 Orten der Wiese aus dem Bild (headless gerendert r 0,8 an 9 Orten) | g2.js:5957 (luftwasser.K4#1), stand | S |
| leben.oeko.partner | 2 | F | – | Einbahn, die Blüte merkt den Besuch nicht | Karte beleg | – |
| leben.evolution.stammbaum | 1 | F | – | keine Abstammung, Würfe = Hash | stamm/kreatur-fauna.js:125 (Karte) | – |
| leben.evolution.erbe | 1 | F | – | kein Erbe | Karte beleg | – |
| leben.evolution.muster | 1 | F | – | keine Selektion | Karte beleg | – |
| leben.evolution.zeitreise | 1 | P | – | Panel Gegenwart/Epoche (im Spiel auch F) | – | – |
| leben.evolution.bauplan | 1 | F | – | kein Genom, 4 Gestalten von Hand | tetrapoda-core.js:3826 (Karte) | – |
| leben.evolution.fremde-physik | 1 | F | – | g fest | Karte beleg | – |
| leben.evolution.zivilisation | 1 | F | – | Verhalten nicht erblich | Karte beleg | – |
| leben.evolution.mikroben | 1 | F | – | kein mikrobielles Leben | Karte beleg | – |
| leben.evolution.fossil | 1 | F | – | keine Fossilien | Karte beleg | – |
| planet.kopplung.siedlungslage | 1 | N(M) | Ort | Bildpaar an 50 Punkten: Kern-Spiegel +1 m, dann Ufer, Schilf, Steg, Boot, Fuß im Bild gegen den Lauf ohne Hebung; heute headless 10/10 Leser an 50 Punkten, Kontrolle 0 | g1.js:1913 (gelaende.K4#1), stand | M |
| planet.kopplung.siedlungslage | 2 | F | – | keine Bodenarten | stamm/gelaende-boden.js:2459-2556 (Karte) | – |
| planet.kopplung.land-meer-luft | 1 | F | – | kein Luv/Lee am Ort; nach w28 rechnet planet-core die Feuchte luvwärts (planet-core.js:1853), der Ort liest sie nur als Spende-Verhältnis | origin/w28-reise-ort:planet-core.js:1853 | – |
| planet.kopplung.bahn-klima | 1 | N(M) | Ort | Schneelinie im Bild an derselben Pose zu 4 Jahreszeiten, Gegenlauf mit gehaltener Jahres-Welle | gelaende-core.js:1306, :1319; stand stoffe.K3#2 | M |
| planet.kopplung.bahn-klima | 2 | F (unklar) | – | nach w28: `kp.neigungRad` im Planeten (planet-core.js:2052); ob eine Saat die Neigung wechselt und die Jahres-Welle des Orts sie liest, ist ungeprüft | origin/w28-reise-ort:planet-core.js:2052 | – |
| planet.kopplung.wetter-welt | 1 | N(M) | Ort | Bildpaar klar/Sturm an EINER Pose: Richtlicht aus besonnt gegen Schatten-Luma, Himmel-Sättigung in der Himmels-Maske; Gegenlauf: Wort gehalten, Bild bleibt | stamm/bild-himmel.js:1743-1747, :1760; g3.js:2664-2697 | M |
| planet.kopplung.wetter-welt | 2 | F (unklar) | – | Glieder-Leiter, darum geprüft: eine Richtung im Bild je Beweger nie gemessen; wetter.K5#2 nennt gras, wasser, regen, tuch, rauch, wagen, keine Bäume | stand wetter.K5#2 | – |
| planet.kopplung.wetter-welt | 3 | N(M) | Ort | die Tafel-Zeile „fehlt“ von heute: die Pfützen-Korrelation (headless r 0,785 / 0,736) gehört in die GPU-Probe naesseWiese, dazu Gegenlauf Regen gekappt | g1.js:2244-2300, Tafel heute | M |
| planet.kopplung.stadtklima | 1 | F | – | kein Stadtklima | Karte beleg | – |
| planet.kopplung.kaskade | 1 | F | – | kein Ereignis formt Gelände | Karte beleg | – |
| planet.kopplung.ereignis-spur | 1 | F | – | keine Ausbrüche | Karte beleg | – |
| planet.kopplung.gegenwart | 1 | F | – | Findlinge ohne Eis | stamm/vegetation-baum.js:3246 (Karte) | – |
| leben.kopplung.leben-formt-planet | 1 | N(M) | Ort | Bildpaar Weg gegen daneben nach 100 Gängen mit Klassen-Maske Gras (headless 13 → 3 Büschel, daneben 17 → 17, −77 %) | g1.js:3763 (stoffe.K4#2), stand | M |
| leben.kopplung.leben-formt-planet | 2 | F | – | das Wasser gräbt nicht, keine Erosion | Karte beleg planet.relief.wandel | – |
| leben.kopplung.evolution-planet | 1 | N(M) | Ort | Würfe im Bild zählen, Anteil in der Boden-Klasse der Gattung, Gegenlauf andere Boden-Klasse (headless 431/431, Gegenprobe 405/405) | g2.js:4368 (tiere.K4#1), stand | M |
| leben.kopplung.evolution-planet | 2 | F | – | kein Erbe | Karte beleg | – |
| leben.kopplung.stadt-im-netz | 1 | **T** | Ort | vegetation.K4#1: Halm-, Boden- und Büschel-Pixel 0 in jeder gesehenen Haus-Box des Start-Dorfs, ≥ 90 % gesehen, Gegenprobe vor der Tür > 0 (die Gegenprobe ist der Gegenlauf). Heute GTX GRÜN, Radeon ROT, darum endet die Prüfung bei S1 | g2.js:4142-4208, stand vegetation.K4#1 | – |
| mensch.kopplung.leib | 1 | F | – | Tracht nur nach Epoche | Karte beleg | – |
| mensch.kopplung.sport | 1 | F | – | keine Freizeit im Tagesplan | koerper-core.js:5057 (Karte) | – |
| mensch.kopplung.leben | 1 | F | – | kein „Regen → drinnen“ (Grep Unterstand/Schutz ohne Verhaltens-Treffer) | – | – |
| mensch.kopplung.antwort | 1 | N(M) | Ort | Ring neuer Häuser binnen 1 500 s (GPU heute 9 neu, Median 22 m), dazu der Gegenlauf derselben Saat ohne Spielerhaus in derselben Probe | g5.js:4049 (siedlung.K4#2), stand | M |
| mensch.kopplung.antwort | 2 | F (unklar) | – | Bebauung entlang einer Trasse des Spielers nie gemessen | – | – |
| mensch.kopplung.kultur | 1 | F | – | Region per Zufall (Zwilling) | worlds/fachwerk/fachwerk.js:621 (Karte) | – |
| mensch.kopplung.kreislauf | 1 | F | – | niemand isst | Karte beleg | – |
| erleben.kopplung.emergenz | 1 | F (unklar) | – | Kaskade nur als Zahl; ob der Jungwuchs im Bild dünner wird, ist ungemessen | stand oekologie.K1#2 | – |
| erleben.kopplung.wahrnehmung | 1 | F (unklar) | – | Witterungs-Gegenlauf nur in der alten Karte headless; Station nicht gefunden. R9: die Messgröße zählt bei erleben.sinne.geruch S1 | – | – |
| erleben.kopplung.bild | 1 | F (unklar) | – | 2-km-Gang mit Sprung je Stufenwechsel nie gemessen; lod.K4#1 2,42 % an einem Ort (Radeon ROT), licht.K3#1 bis 7 % | stand lod.K4#1, licht.K3#1 | – |
| erleben.kopplung.klang | 1 | F | – | Regen nur als Textur, kein Klang je Dachstoff | Karte beleg | – |
| erleben.kopplung.geteilter-sinn | 1 | N(M) | Ort | zwei Seiten derselben Saat, A setzt eine Tat, Bildpaar am Ort bei B (headless Abdruck byte-gleich) | g1.js:2779 (feld.K2#1), stand | M |
| erleben.kopplung.geteilter-sinn | 2 | F (unklar) | – | Zeugen bei B, die die Tat nennen, unbelegt | – | – |
| erleben.kopplung.ein-ereignis | 1 | F (unklar) | – | Knistern am Ohr existiert (`_glutAmOhr`), Versatz Bild ↔ Abgriff und Quellort ±10° nie gemessen | stamm/feld-leben.js:3895 | – |
| erleben.kopplung.epoche-ganz | 1 | F (unklar) | – | „0 Widersprüche“ zwischen Sonne, Chor und Tag ohne Probe; der Chor nachts ist nicht belegt | – | – |
| same.kopplung.aufwaerts | 1 | F (unklar) | – | ein Haus aus 400 m nie gemessen, Pegel, Wuchs und Wild ändern sich nicht nach einer Tat | Karte beleg | – |
| same.kopplung.kaskade | 1 | N(M) | Ort | Bildpaar Brand-Zelle im Regen gegen trocken an beiden Geräten; der Regen löscht jede Zelle | stamm/feld-leben.js:2645, :2831; g1.js:2863 (feld.K1#1) | M |
| same.kopplung.kaskade | 2 | N(M) | Ort | Spielgang Sturm: Glieder Regen → Nässe → Stoff → Brand → Licht im Bild, je Glied den Vorgänger festhalten (headless Tiefe 4 mit Festhalte-Probe) | g1.js:2891 (feld.K1#2), stand | M |
| same.kopplung.kaskade | 3 | F | – | kein Bruch und kein Fluid mit Impuls | Karte beleg | – |
| same.kopplung.kohaerenz | 1 | N(L) | Ort | 100 Saaten × 50 Punkte: Wasserläufe bergab in Senke oder Meer (heute 1 Saat, 293/293) | g1.js:1967-1975, stand gelaende.K4#2 | L |
| same.kopplung.kohaerenz | 2 | F (unklar) | – | Pflanzen-Dichte gegen Abstand zum Wasser nie gemessen | – | – |
| same.kopplung.gewalt | 1 | F | – | kein Blitz | Karte beleg | – |
| same.kopplung.stoerung | 1 | N(M) | Ort | Bildpaar Zelle vor und nach dem Brand an beiden Geräten (Brand als Tat, gleiche Kamera, Luma der Zelle) | g1.js:3498 (stoffe.K5#2), stand | M |
| same.kopplung.stoerung | 2 | N(M) | Ort | Sprung 1 Spieljahr im Fenster: Nachwuchs auf Asche, r(Tempo, Feuchte × Licht) (headless 0,825, Mutante −0,517) | g1.js:3426 (stoffe.K5#1), stand | M |
| same.kopplung.stoerung | 3 | F | – | keine Antwort von Tier und Wasser | Karte beleg | – |
| same.kopplung.ereignis | 1 | N(M) | Ort | Bild der Lava-Zelle in Glut und erstarrt an beiden Geräten (headless „Lava ✓ erstarrt Land Takt 2“) | g1.js:3327 (stoffe.K3#2), gelaende-core.js:1787-1801 (Karte) | M |
| same.kopplung.ereignis | 2 | F (unklar) | – | Flucht der Bewohner vor der Front nie gemessen | – | – |
| same.kopplung.erdsaat | 1 | F | – | keine Erd-Saat | Karte beleg | – |
| same.kopplung.zeitreise | 1 | N(M) | Ort | Lichtung aus 10 Fällungen, Reload, Bild an beiden Geräten: Baum-Anteil und Stümpfe (headless 3/13 = 23 %, 10 Stümpfe) | g1.js:2914 (feld.K4#1), stand | M |
| same.kopplung.zeitreise | 2 | N(M) | Ort | Tat + 1 Spieljahr, Reload, Pflanzen zurück, Alter gleich (headless 30/30 nach 36 h, 138/138 nach 8 767 h) | g1.js:2929 (feld.K4#2), g1.js:3426 (stoffe.K5#1), stand | M |
| same.kopplung.zeitreise | 3 | F | – | `_werkAlter` klemmt rückwärts auf 0 | Karte beleg | – |

## 3) JSON

```json
{
  "tafel": [
    { "station": "tiere.K5#1", "leiter": "leben.oeko.vielfalt", "sprosse": 1, "richter": "gleich" },
    { "station": "vegetation.K4#1", "leiter": "leben.kopplung.stadt-im-netz", "sprosse": 1, "richter": "gleich" }
  ],
  "_tafel_steht_schon": [
    { "station": "vegetation.K5#2", "leiter": "leben.pflanzen.jahreslauf", "sprosse": 1, "richter": "gleich" },
    { "station": "vegetation.K2#1", "leiter": "leben.pflanzen.kraft", "sprosse": 1, "richter": "gleich" }
  ]
}
```

Vorbedingung für `tiere.K5#1`: Die Station steht in g2.js:4569 nur mit `geraet: "radeon"` und braucht "gtx" dazu, sonst gibt es keine Akte beider Geräte. Für `vegetation.K4#1` ist das Urteil „gleich“ unter einer Lesart: Eine verdeckte Box trägt kein Pixel, also gilt „0 in jeder Box“ dort trivial. Die Station verlangt zusätzlich Boden 0, sie ist damit strenger.

```json
{
  "klassen": [
    { "leiter": "leben.oeko.vielfalt", "sprosse": 1, "klasse": "Ort" },
    { "leiter": "leben.kopplung.stadt-im-netz", "sprosse": 1, "klasse": "Ort" },
    { "leiter": "leben.pflanzen.jahreslauf", "sprosse": 1, "klasse": "Ort" },
    { "leiter": "leben.pflanzen.kraft", "sprosse": 1, "klasse": "Ort" },
    { "leiter": "planet.wasser.stroemung", "sprosse": 1, "klasse": "Ort" },
    { "leiter": "planet.wetter.lagen", "sprosse": 1, "klasse": "Ort" },
    { "leiter": "leben.wasser.lebensraeume", "sprosse": 1, "klasse": "Ort" },
    { "leiter": "leben.wasser.rhythmen", "sprosse": 1, "klasse": "Ort" },
    { "leiter": "leben.oeko.sukzession", "sprosse": 1, "klasse": "Ort" },
    { "leiter": "leben.oeko.partner", "sprosse": 1, "klasse": "Ort" },
    { "leiter": "planet.relief.grossform", "sprosse": 1, "klasse": "Stadt" },
    { "leiter": "planet.wasser.stroemung", "sprosse": 2, "klasse": "Ort" },
    { "leiter": "planet.wasser.eis", "sprosse": 1, "klasse": "Ort" },
    { "leiter": "planet.wasser.eis", "sprosse": 2, "klasse": "Ort" },
    { "leiter": "planet.wasser.tiefsee", "sprosse": 1, "klasse": "Ort" },
    { "leiter": "planet.wetter.klimazonen", "sprosse": 1, "klasse": "Ort" },
    { "leiter": "leben.tiere.bewegung", "sprosse": 1, "klasse": "Ort" },
    { "leiter": "leben.tiere.verhalten", "sprosse": 1, "klasse": "Ort" },
    { "leiter": "leben.tiere.lebenszyklus", "sprosse": 1, "klasse": "Ort" },
    { "leiter": "leben.tiere.wanderung", "sprosse": 1, "klasse": "Ort" },
    { "leiter": "leben.wasser.bild", "sprosse": 1, "klasse": "Ort" },
    { "leiter": "leben.oeko.stoffe", "sprosse": 1, "klasse": "Ort" },
    { "leiter": "planet.kopplung.siedlungslage", "sprosse": 1, "klasse": "Ort" },
    { "leiter": "planet.kopplung.bahn-klima", "sprosse": 1, "klasse": "Ort" },
    { "leiter": "planet.kopplung.wetter-welt", "sprosse": 1, "klasse": "Ort" },
    { "leiter": "planet.kopplung.wetter-welt", "sprosse": 3, "klasse": "Ort" },
    { "leiter": "leben.kopplung.leben-formt-planet", "sprosse": 1, "klasse": "Ort" },
    { "leiter": "leben.kopplung.evolution-planet", "sprosse": 1, "klasse": "Ort" },
    { "leiter": "mensch.kopplung.antwort", "sprosse": 1, "klasse": "Ort" },
    { "leiter": "erleben.kopplung.geteilter-sinn", "sprosse": 1, "klasse": "Ort" },
    { "leiter": "same.kopplung.kaskade", "sprosse": 1, "klasse": "Ort" },
    { "leiter": "same.kopplung.kaskade", "sprosse": 2, "klasse": "Ort" },
    { "leiter": "same.kopplung.stoerung", "sprosse": 1, "klasse": "Ort" },
    { "leiter": "same.kopplung.stoerung", "sprosse": 2, "klasse": "Ort" },
    { "leiter": "same.kopplung.ereignis", "sprosse": 1, "klasse": "Ort" },
    { "leiter": "same.kopplung.zeitreise", "sprosse": 1, "klasse": "Ort" },
    { "leiter": "same.kopplung.zeitreise", "sprosse": 2, "klasse": "Ort" },
    { "leiter": "leben.tiere.arten", "sprosse": 1, "klasse": "Ort" },
    { "leiter": "leben.oeko.netz", "sprosse": 1, "klasse": "Ort" },
    { "leiter": "leben.oeko.dynamik", "sprosse": 1, "klasse": "Ort" },
    { "leiter": "same.kopplung.kohaerenz", "sprosse": 1, "klasse": "Ort" }
  ]
}
```

## 4) Die fünf billigsten N(S)

1. **leben.wasser.rhythmen S1, Heimkehr ≥ 60 % im Fenster.** Die headless-Station `luftwasser.K3#2` (g2.js:5977) trägt das Soll „heim ≥ 60 %“ schon wörtlich und misst 12 von 13. Die neue GPU-Station fährt dieselbe Bach-Probe als `PW.torBefehl(...)` in der warmen Sitzung am Bach −309,8/−822,5: Spieler an den Stand, 8 s warten, dann den Anteil heimgekehrter Fische zählen und ein Bild mit `--klasse '^tier:fisch'` schießen. Urteil heim ≥ 0,6 und Trupp-Pixel > 0, dazu eine Tafel-Zeile `{station:"luftwasser.K3#3", leiter:"leben.wasser.rhythmen", sprosse:1, richter:"gleich"}`.
2. **planet.wasser.stroemung S1, Treibgut > 0,5 m in 90 Takten an 4 Fluss-Orten, im Spiel mit Bild.** Die Zahl druckt heute `diag-wasser-leben.cjs --nur treibt` (g1.js:1970-1975, „Strömung 4 von 4 Fluss-Orten“), die Fahrt ist headless. Die GPU-Station ruft denselben Treib-Code per `werkbank eval` an den 4 Orten, die die Linse wählt, im echten Takt und schießt je Ort ein Bild 1920×1080, auf dem Schwimmer, Boot und Tier zu sehen sind. Urteil: 4/4 Orte mit Weg > 0,5 m und Gegenprobe ohne Strömung ≤ 0,5 m, alle Bilder mit Abnahme ok.
3. **leben.oeko.partner S1, r(Bestäuber, Blüten) ≥ 0,5 aus dem Bild.** `luftwasser.K4#1` (g2.js:5957) misst headless gerendert r 0,8 an 9 Orten, Soll ≥ 6 Orte und r ≥ 0,5, das ist schon der Richter. Die Station hebt die Probe in die GPU-Sitzung an der Mess-Wiese: je Ort ein Bild, darin Bestäuber-Leiber und Blüten-Anteil über die Klassen-Maske gezählt, dazu r über die Orte. Weil Kamera und Ort dieselben bleiben, ist das Urteil der headless-Station 1:1 übertragbar.
4. **leben.oeko.sukzession S1, Halm-, Asche- und Sämling-Zahlen über die Zeit im Fenster.** `stoffe.K5#2` (g1.js:3498) druckt die Reihe schon (Halme 477 → Asche 70 → Gras 491, Sämling 0 → 0,06 → 0,18 → 0,7 → 1), allerdings headless. Die GPU-Station setzt in der warmen Sitzung am Dorfrand einen Brand und springt die Spielzeit in denselben Stufen weiter, an jeder Stufe liest sie die Zählung und schießt ein Bild gleicher Kamera. Urteil wie die Station: Asche < Halme vorher, Gras danach ≥ vorher, Sämling am Ende 1.
5. **planet.wetter.lagen S1, Regen an A bei trockenem B ≥ 20 % der Zeit, Lag ±20 %.** `diag-wetter-wache.cjs` (g1.js:2145-2160) druckt die Zeile wörtlich: 40 %, Lag 240 s gegen Soll 273 s ±20 %, der Lauf ist headless. Die GPU-Station fährt in der Sitzung 20 min Welt-Uhr in Ereignis-Takten von 5 s, liest `_wetterAmOrt` am Spieler A und an B (3 km windab) und schießt am Regenbeginn bei A ein Bild, in dem der Regen sichtbar ist. Das Urteil liest dieselbe Regex wie die headless-Station.

Die sechste N(S) wäre `leben.wasser.lebensraeume` S1: ein Bild am Bach mit Klassen-Maske tier:fisch, Soll 1 Lebensraum mit eigener Fauna, Beleg luftwasser.K3#1.
