# Pflanzen und Biome

## Die Vision hier

Jede Pflanze jedes Planeten (vom Moos in der Felsritze bis zum 100-m-Mammutbaum, vom Kelpwald bis zur Kaktee, vom Farnwald des Karbons bis zur Flora eines Doppelsterns) ist eine Lösung EINES Wachstumsgesetzes. Ihre Parameter folgen aus Licht, Wasser, Boden, Temperatur, Konkurrenz und Zeit, nicht aus einer Tabelle von Arten. Aus diesem einen Gesetz entstehen Millionen unterscheidbarer Arten über viele Planeten, mehr als die etwa 390 000 Gefäßpflanzen der Erde. Fremde Sterne, Atmosphären und Schwerkräfte ergeben Pflanzen, die niemand gezeichnet hat und die trotzdem als lebendig gelesen werden. Biome (Regenwald, Taiga, Steppe, Wüste, Tundra, Mangrove, Seegraswiese und Biome ohne irdisches Vorbild) werden nirgends gesetzt: sie FOLGEN aus Klima und Boden. Sie wandern über Jahrtausende, und wer durch die Zeit reist, sieht die ersten Landpflanzen des Devon, Steinkohlewälder, die erste Blüte der Kreide, die Ausbreitung des Graslands und die Eiszeit-Tundra. Jede Pflanze keimt, wächst, blüht, wirft Laub, beugt sich im Sturm, weicht dem Stiefel, brennt, stirbt und verrottet; eine verlassene Stadt verwildert, ein gerodeter Hang rutscht. Man sieht es im Zeitraffer und betritt es Halm für Halm, ohne Download und bei 33 ms auf dem Laptop.

## Das Beste der Gegenwart

- **Ghost of Tsushima** (GDC 2021): Halme je Kachel im Compute-Pass, Wind als gescrolltes Feld, Gras weicht dem Pferd. Grenze: ein Biom-Stil, von Hand gemalte Dichtekarten, kein Wuchs und kein Lebenslauf.
- **Red Dead Redemption 2** (Rockstar 2018): Wälder mit Unterholz und Lichtstrahlen durch Kronen in derselben Atmosphäre, mehrere handgebaute Biome, Pflanzen zum Sammeln. Grenze: alles von Hand gesetzt, etwa 100 GB Download, keine Zeit, kein Wachstum.
- **Forza Horizon 4** (2018): vier Jahreszeiten im Wochentakt. Grenze: je Saison eine eigene, von Hand gebaute Fassung der Welt statt eines Gesetzes.
- **No Man's Sky** (Hello Games, seit 2016): deterministische Flora aus einem Samen auf 18 Trillionen Planeten. Grenze: in der Regel ein Biom je Planet, Teile-Baukasten, Planeten verschwimmen nach einigen Dutzend Besuchen (Fan-Berichte).
- **Unreal 5 PCG + Procedural Vegetation Editor, SpeedTree**: Pflanzen-Assets aus Wachstums-Knoten, Biome per Regel-Graph. Grenze: Werkzeug für Künstler, das Assets ausgibt (GB), kein Laufzeit-Gesetz, kein Klima-Bezug.
- **Synthetic Silviculture** (Makowski et al., SIGGRAPH 2019), **GroIMP/LIGNUM** (funktional-strukturelle Pflanzenmodelle): Gestalt aus Lichtkonkurrenz über Jahrzehnte. Grenze: Offline, Minuten je Bestand, wenige Arten.
- **Dynamische Vegetationsmodelle LPJ / LPJ-GUESS** (Sitch et al. 2003): die globale Verteilung der Biome folgt aus Klima, Boden und Feuer über ~10 Pflanzen-Funktionstypen. Grenze: kein Bild, keine einzelne Pflanze, Gitter 0,5°.
- **Die Wirklichkeit**: ~350 000 bekannte Gefäßpflanzen (Kew 2023), ~73 000 Baumarten geschätzt (PNAS 2022); tropischer Regenwald bis ~300 Baumarten je Hektar. Das ist die Messlatte für EINEN Planeten und für EIN Bild.

## Der Same

**Eine Pflanze ist die Antwort eines Modul-Wachstumsgesetzes (Meristem → Internodium + Blatt + Knospe, Phyllotaxis 137,5°, Rohrmodell) auf ein Budget aus Licht, Wasser, Nährstoff, Temperatur und Kraft (Wind, Last, Tritt). Art ist ein Punkt im Merkmalsraum (Wuchsform, Blattökonomie, Phänologie, Lebensdauer), der sich unter Selektion einstellt. Biom ist die Häufigkeitsverteilung dieser Punkte, die ein Klima gewinnen lässt; Zeitalter ist dieselbe Selektion unter anderem Rahmen (CO₂, erfundene Organe: Samen, Blüte, C4-Gras).** Gelöst haben es fremde Branchen getrennt: die Morphologie die algorithmische Botanik (L-Systeme, GroIMP/LIGNUM), die Biom-Verteilung die Erdsystemforschung (LPJ, merkmalsbasiert LPJmL-FIT), der Merkmalsraum die Pflanzenökologie (Wright et al. 2004; Díaz et al. 2016: zwei Achsen erklären drei Viertel der Variation). Neu wäre die Verbindung: dieselbe Funktion ergibt im Gitter das Biom, im Bestand den Wald, vor der Nase den Halm und im Zeitstrahl die Flora des Karbons.

**Preis-Kürzel.** P = Frame p95 ≤ 33 ms auf dem Standardgerät (Radeon 890M UND GTX 1060), Ankunft ≤ 5 s kalt, 0 Byte Download über das Skript hinaus. Jede Sprosse nennt die SZENE, unter der P gehalten wird; eine Sprosse gilt nur, wenn Umfang, Tiefe und P in derselben Fahrt stehen.

## Die Leitern

### L1 · Arten aus einem Gesetz

Wie viele unterscheidbare, plausible Arten der Spieler über Stichproben von Saaten antrifft und wie viele davon ein einziges Bild zugleich trägt.

| Sprosse | Umfang | Tiefe | Preis | Richter (misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | ~10 Gestalten, je von Hand parametrisiert | Silhouette als Gattung lesbar; Rinde/Blatt nah gegen Herbarfoto | P am Waldrand | Blindtest 10 Bilder je Art → Gattung ≥ 80 %; Herbar-Paar je Art ≥ 0,7 | HEUTE teils: 12 Gestalten + Mammut im Wirt, Blindtest nie gefahren |
| 2 | 100 Arten, gezogen aus EINEM Merkmalsraum (Saat → Art), keine Tabelle | 90 % der Stichprobe als echte Wuchsform erkannt (Baum, Strauch, Gras, Kletterer, Sukkulente, Farn, Moos) | P; Ankunft mit 100 Arten ≤ Ankunft mit 10 + 0,2 s | 100 Saaten → Blindtest Wuchsform; Silhouetten-Paare unterscheidbar ≥ 95 % | |
| 3 | 1 000 Arten auf einem Planeten, ≥ 50 verschiedene zugleich im Bild | Merkmalsverteilung (Höhe, Blattgröße, Holzdichte) im Band der Erde (TRY/Díaz) | P in der artenreichsten Szene | Histogramm-Distanz Spiel ↔ Erde ≤ 0,2; Artenzahl im Bild gezählt per Blindbenennung | |
| 4 | 10 000 Arten; Tropenwald-Hektar mit ~300 Baumarten im Blick | Nahbild jeder Stichprobe von Foto nur zu ≤ 60 % unterscheidbar | P im Regenwald-Hektar | Blindtest Foto ↔ Spiel, 200 Paare | |
| 5 | 100 000 Arten, Endemiten je Insel und Tal | Arten-Areal-Kurve wie auf der Erde | P | N Saaten × Fläche → S = cA^z mit z 0,15–0,35 | |
| 6 | 1 000 000 Arten über alle Planeten, fremde ohne irdisches Vorbild | ≥ 80 % als „lebendig, plausibel" bewertet | P auf fremdem Planeten | Blindbewertung 500 fremder Arten; paarweise unterscheidbar ≥ 95 % | |
| 7 (Vision) | ≥ 10 Mio. Arten aus EINEM Samen, Erde ≥ 390 000 darunter | Gestalt, Phänologie, Standort jeder Art folgen aus dem Gesetz | 0 Byte je Art; P an jedem Ort jeder Saat | 1 000 Saaten: plausibel ≥ 95 %, Duplikate (im Bild ununterscheidbar) ≤ 1 % | |

### L2 · Biome aus Klima, Boden und Licht

Ob die Vegetationsdecke aus dem Klima FOLGT, auf wachsender Fläche und über den ganzen Klimaraum. Gezählt wird nicht, wie viele Biome benannt sind, sondern wie viel des Klimaraums die Welt richtig besetzt.

| Sprosse | Umfang | Tiefe | Preis | Richter (misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | ein Klima; Standortmosaik Wald ↔ Lichtung ↔ Ufer ↔ Gipfel | Waldgrenze unter dem Sommer-Schnee; feuchte Arten am Wasser; nie Palme neben Tanne | P an Gipfel und Ufer | Bild am Gipfel baumfrei; Arten-Stichprobe: Uferarten am Wasser ≥ 90 %, Wärme-Arten nur im Warmen | HEUTE teils: Waldgrenze + Feuchte GRÜN, Palme folgt Rauschen statt Wärme (ROT) |
| 2 | Region 100 km² mit Klimagradient (Höhe, Luv/Lee) | Höhenstufen kollin → alpin in richtiger Folge; Übergang als Ökoton | P im Flug über die Region | Luftbild: scharfe Biom-Kanten ≤ 10 %; Höhenstufen-Folge an 50 Hängen korrekt ≥ 90 % | |
| 3 | Kontinent 10⁶ km² | Biome folgen Temperatur × Niederschlag; ≥ 80 % des Whittaker-Raums besetzt | P, Ankunft an 20 zufälligen Orten ≤ 5 s | Kappa ≥ 0,6 zwischen Biom-Bild und Klima-Zuordnung (Whittaker/Köppen) | |
| 4 | ein ganzer Planet ~10⁸ km² inkl. Mangrove, Moor, Küstenwüste | Kontinentalgefälle, Regenschatten; Orbitbild wie die Erde | P im Orbit | 1 000 Punkte: Biom passt zum lokalen Klima ≥ 90 %; Orbitbild ↔ Satellit (Blue Marble) ≥ 0,7 | |
| 5 | 100 Planeten, fremde Klimata (Stern, Achse, Atmosphäre) | Biome ohne irdisches Vorbild, doch klimakonsistent | P je Planet | Anteil Planeten, deren Biom-Verteilung aus ihrem Klima vorhersagbar ist ≥ 90 % | |
| 6 (Vision) | jeder Planet jeder Saat | ≥ 30 % der Biome fremder Planeten ohne irdisches Gegenstück und doch als Lebensraum gelesen | P an jedem Punkt jeder Welt | 1 000 Saaten × 10 Punkte: Konsistenz ≥ 95 %, Blindbewertung „lebendige Welt" ≥ 80 % | |

### L3 · Lebenslauf: Keimung, Wuchs, Alter, Tod

Ob der Spieler Pflanze, Bestand und Landschaft wachsen, sterben und nachwachsen sieht, auch dort, wo er gerade nicht war.

| Sprosse | Umfang | Tiefe | Preis | Richter (misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | statische Altersverteilung, stehendes Totholz | reverse-J-Größen, Selbstastung | P im Wald | Höhenhistogramm eines Bestands gegen Ertragstafel | HEUTE |
| 2 | 1 Pflanze im Zeitraffer vom Keimling zum Altbaum | Form-Wechsel jung → alt (Kronenform, Borke) | P im Zeitraffer | Bildreihe 0/10/50/150 Jahre vs. Fotoreihe derselben Art | |
| 3 | 1 ha über 100 Jahre | Lückendynamik: Tod → Lichtschacht → Verjüngung | P, Zeitraffer 1 Jahrhundert ≤ 60 s | Stämme/ha und Basalfläche über Zeit gegen Ertragstafel ±20 % | |
| 4 | 100 km²: Sukzession und Störung (Brache → Wald; Feuer, Sturm, Fraß) | Altersklassen-Mosaik; Narben heilen in der richtigen Zeit | P im Flug | Zeitraffer-Luftbild: Deckung je Stufe nach 5/20/80 Jahren; Mosaik gegen Waldinventur | |
| 5 (Vision) | jede Pflanze jedes Planeten, vom Tag (Blüte öffnet) bis zum Jahrhundert, auch ungesehen | wer nach 50 Jahren zurückkehrt, findet den gewachsenen Wald, nicht den alten | P; Kosten an Schirm, nie an Weltgröße | Rückkehr-Test an 100 Orten × 5 Zeitabständen: Anteil plausibler Zustände ≥ 90 % | |

### L4 · Der Jahreslauf: Austrieb, Blüte, Frucht, Laubfall

| Sprosse | Umfang | Tiefe | Preis | Richter (misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | Laubbäume + Wiese, drei Saisonphasen an einem Ort | Kronendeckung Winter ≤ 0,3 × Sommer, Wiese Winter ≤ 0,5 × Sommer | P | Zeitraffer-Pixelanteil der Krone (gemessen 0,037 Radeon / 0,113 GTX) | HEUTE |
| 2 | Phänologie je Art gestaffelt | Reihenfolge gegen Phänologie-Netz (Hasel vor Buche) | P | Kalender des Spiels gegen Beobachtungsreihe: Rangkorrelation ≥ 0,8 | |
| 3 | Blüte und Frucht als Ereignis (Wiesenblüte, Kirschblüte, Mast) | Farbe/Deckung im Wochentakt gegen Foto | P in der Blüte | 12-Wochen-Bildreihe gegen Webcam-Zeitreihe | |
| 4 | Phänologie aus Klima: Höhe und Breite verschieben den Kalender | Grünwelle 3–4 Tage je 100 m Höhe | P | Austriebsdatum über Höhe/Breite gegen Satelliten-NDVI | |
| 5 | Planet: Hemisphären, Trockenzeit, Monsun-Grün | NDVI-Jahreskurve je Biom | P im Orbit | Orbit-Zeitraffer gegen MODIS-NDVI, r ≥ 0,8 | |
| 6 (Vision) | fremde Planeten: Jahre von Tagen bis Jahrhunderten, Doppelsterne | Jahreslauf folgt der Bahn, nicht dem Erdkalender | P | 100 Planeten: Phänologie folgt Einstrahlung (r ≥ 0,8) | |

### L5 · Dichte und Ferne zum Preis

Wie viel Pflanze der Spieler auf einmal sieht und wie wahr sie wirkt, vom Halm vor dem Stiefel bis zum Orbit. Der Richter misst das Bild und die Bildzeit, nie Dreiecke oder Befehle.

| Sprosse | Umfang | Tiefe | Preis | Richter (misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | Wiese dicht bis ~20 m, Wald licht | Boden-Sicht-Anteil je Ring 2–5/5–10/10–20 m wie im Wiesenfoto | P stehend an der Wiese | Ring-Bildanteil gegen Foto; Bildpaar gegen REF real-mischwald | HEUTE: P GRÜN (GTX p95 16,8 ms), Tiefe ROT (Saum springt, Wald 24 Stämme/ha, Laub-Kante 0,2635 > 0,22) |
| 2 | Wiese 0–40 m ohne Saum; Wald von innen (370–900 Stämme/ha, Unterholz 0,25–0,78) | Lichtflecken wandern mit der Sonne | P im Wald-Innern, beide Geräte, gehend | Bildpaar Wald-innen gegen REF; Ring-Bildanteil 20–40 m wie 0–20 m | |
| 3 | jede Pflanze bis 1 km ohne Sprung | Waldrand und Hang auf 1 km gegen Foto ≥ 0,7 | P gehend und fahrend | Pop-Zähler unter Bewegung = 0 (Bild-Differenz ohne Kamera-Anteil); Bildpaar 1 km | |
| 4 | Horizont 10 km, Wald als Wald bis zum Kamm | Textur und Farbe am Hang gegen Landschaftsfoto | P im Flug | Blindtest Landschaftsfoto ↔ Spiel ≤ 70 % Trefferrate | |
| 5 | Kontinent, ~10¹¹ Pflanzen, jede adressierbar | jede angeflogene Pflanze steht dort, wo man sie aus der Ferne sah | P im Anflug | Anflug 10 km → 1 m: Lage- und Farbabweichung der Ziel-Pflanze 0 | |
| 6 (Vision) | Planet vom Orbit bis zum Halm, ~10¹⁴ Individuen | Orbitbild gegen Satellit, Nahbild gegen Foto | P im durchgehenden Flug Orbit → Halm | Frame p95 ≤ 33 ms über den Flug; Bildvergleich je Maßstab ≥ 0,7 | |

### L6 · Kopplung: Pflanze formt die Welt

| Sprosse | Umfang | Tiefe | Preis | Richter (misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | Pflanzen lesen Hang, Höhe, Schnee, Bodenfeuchte, Siedlungsrand | Einweg: Welt → Pflanze | P | Natur-Wand: Halme 0 px im Haus; Waldsaum 25–40 m am Ort | HEUTE |
| 2 | Spieler/Tier wirkt: Trittpfad, Fraß, Fällen bleibt | Spur heilt im Takt der Jahreszeiten | P | Bild vor/nach 100 Durchgängen: Pfadbreite und Wiederbewuchs | |
| 3 | Pflanze ↔ Boden ↔ Wasser: Wurzeln halten Hang | Erosion mit/ohne Wald Faktor ≥ 10 | P im Zeitraffer | gerodeter Hang vs. Waldhang: Rinnen und Rutschung im Bild | |
| 4 | Feuer: Brennstoff aus Pflanzen, Wind, Asche, Nachwuchs | Feuer-Regime je Biom | P im Brand | Brandfläche/Jahr je Biom gegen Satellitenstatistik | |
| 5 | Stadt ↔ Pflanze: Straßenbaum, Park, Ruderalflur; die verlassene Stadt verwildert | Ruderal → Pionierwald → Wald in der Zeit der Wirklichkeit | P in der Megastadt | Zeitraffer einer verlassenen Stadt über 50 Jahre gegen Fotoreihen verlassener Orte | |
| 6 | Pflanzen formen das Klima: Verdunstung, Albedo, Regenwald-Regen | Entwaldung ändert den Niederschlag im Lee | P | Rodung 10⁴ km² → Niederschlagsänderung messbar und gerichtet | |
| 7 (Vision) | Vulkan → Asche → Pionierflora → Wald → Torf → Kohle → Stadt heizt | Kette über Äonen geschlossen, an jedem Glied sichtbar | P an jedem Glied | Zeitreise an einem Ort über 10⁶ Jahre: jedes Kettenglied im Bild belegt | |

### L7 · Flora der Zeitalter (neu)

Ob dasselbe Gesetz unter dem Rahmen einer anderen Zeit die Flora dieser Zeit erzeugt, wenn der Spieler in sie reist.

| Sprosse | Umfang | Tiefe | Preis | Richter (misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | eine Epoche der Erde (z. B. Karbon) aus demselben Gesetz mit anderem Rahmen | Bärlapp- und Schachtelhalm-Wald ohne Blüte und Gras | P, Ankunft in der Epoche ≤ 5 s | Blindtest gegen paläobotanische Rekonstruktionen ≥ 70 % als Epoche erkannt | 0 |
| 2 | 5 Wendepunkte: Landeroberung (Devon), Karbon, Blüte (Kreide), Gras (Miozän), Eiszeit | Biom-Anteile je Epoche gegen Paläo-Rekonstruktion | P je Epoche | Biom-Anteile je Epoche: Abweichung ≤ 20 % | |
| 3 | jeder Zeitpunkt der letzten 450 Mio. Jahre, Wälder wandern | Wanderung 100–1 000 m/Jahr nach Eiszeiten | P, Zeitsprung beliebiger Länge ≤ 5 s | Front-Lage zu Zeitpunkten gegen Pollenrekonstruktion | |
| 4 (Vision) | jede Epoche jedes Planeten, eigene Evolution je Saat | Zeitalter-Folge aus Selektion, nicht aus Skript | P in jeder Epoche | 100 Saaten × 10 Epochen: Anteil konsistenter Folgen (keine Blüte vor Samen, Organe nur nach ihrem Erfinden) ≥ 95 % | |

### L8 · Pflanze unter Kraft und Berührung (neu)

Ob Pflanzen auf Wind, Last und Körper antworten, sichtbar und überall im Blick.

| Sprosse | Umfang | Tiefe | Preis | Richter (misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | Böe über Gras und Krone | Böe als wandernde Front, nicht als gleiches Schwingen | P | Bildreihe: Böen-Front sichtbar über Gras und Krone (alte K2) | HEUTE teils (K2 1/2) |
| 2 | Halme und Sträucher weichen dem Körper und richten sich auf; Schnee beugt Äste | Rückstellzeit und Spur wie im Video | P gehend durch Wiese und Gebüsch | Bildreihe Durchgang gegen Video derselben Lage | |
| 3 | Sturm: Astbruch, Windwurf, fliegendes Laub | Windwurf folgt Windstärke und Wurzelboden | P im Sturm | Anteil geworfener Bäume über Windstärke gegen Sturm-Statistik; Bild gegen Sturm-Video | |
| 4 (Vision) | jede Pflanze im Blick antwortet auf jede Kraft, vom Halm bis zum Horizont | das Feld eines Sturms ist über 10 km lesbar | P im Sturm, Orbit bis Halm | Blindtest Sturm-Video ↔ Spiel ≤ 60 %; Frame p95 über den Sturm | |

### L9 · Flora des Wassers und des Meers (neu)

| Sprosse | Umfang | Tiefe | Preis | Richter (misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | Uferflora (Schilf, Erle, Weide) am gezeichneten Wasser | nur Arten mit Ufer-Band im Wasser | P am Ufer | Ufer-Stichprobe: Uferarten am Wasser ≥ 90 %, Landarten im Wasser 0 | HEUTE teils |
| 2 | Unterwasser-Wiese, Kelpwald, Mangrove | Kelp nur an kalten, nährstoffreichen Küsten; Seegras nach Lichttiefe | P unter Wasser | Tauchbild gegen Unterwasserfoto ≥ 0,7; Lage-Stichprobe gegen Meeresklima ≥ 90 % | |
| 3 (Vision) | Meeresflora aller Planeten bis zur Planktonblüte im Orbitbild | Blüten folgen Nährstoff und Licht | P im Orbit | Orbit-Zeitraffer gegen Satelliten-Chlorophyll-Karten, r ≥ 0,7 | |

## Stand heute

- **Arten:** 12 Gestalten in `stamm/vegetation-baum.js:3179-3233` (`SPECIES_TREE_PARAMS`: Tanne, Kiefer, Buche, Birke, Eiche, Erle, Karst, Hasel, Farn, Blume groß, Palme, Zypresse) und `baum_mammut` in `phyto-core.js:3423-3429`. `FOREST_SPECIES` (`phyto-core.js:3012-3031`) ist eine Namens-Übersetzung Labor ↔ Wirt (fichte → baum_kiefer, weide → baum_erle), keine sechs weiteren Arten. Die Nah-Streu trägt dazu Farn, Gestrüpp, Blume, Schilf und liegendes Totholz aus dem Boden-Gesetz (`vegetation-wiese.js:1723`, `:1795-1797`). `baum_totholz` als Art fiel W1 (`vegetation-streu.js:219`); Totholz lebt als Gestalt eines Individuums (`phyto-core.js:2255`) und als Sub-Spawn `TOTHOLZ_RATE 0,1` nur außerhalb des Studio-Regimes (`vegetation-baum.js:1286`). Ein Gesetz, das Arten erzeugt, gibt es nicht.
- **Biome:** keine. Die Baumart folgt zwei Bändern (`vegetation-streu.js:196-215`): Bodenfeuchte (> 0,6 → Erle/Birke) und das Rauschen `lebendig` (`feld-leben.js:1815`, vier Simplex-Schichten, „keine Biome-Tabelle"). Die „milde Zone" der Palme ist dieses Rauschen, nicht Wärme. Die Bodenfeuchte aus der Hydrosphäre (`_feuchteAt`, Regen-Basis `WUCHS.wasserBasis`) treibt Dichte, Wuchs und Art (`vegetation-wiese.js:2559-2570`, `:2949`); die Waldgrenze liest den Sommer-Schnee des Gelände-Kerns (`phyto-core.js:2934-2948`). Ein Klimafeld Temperatur × Niederschlag je Region fehlt.
- **Lebenslauf:** `alter` als statischer Parameter, reverse-J-Größen (`phyto-core.js:2899-2901`), stehendes Totholz; Verjüngung und Schattenverdrängung nur im Labor (`phyto-core.js:2991`, `:3003`: „Host has no pass"). Kein Keimen, kein Sterben in der laufenden Welt; Narben gefällter Bäume heilen (`vegetation-wiese.js:3644`).
- **Jahreslauf:** Gestalt gehalten (alte Karte Vegetation K5 2/2): Krone Winter 0,037 × Sommer (Radeon), 0,113 (GTX). Keine Blüte als Ereignis.
- **Dichte:** Wald 24 Stämme/ha gegen REF 370–900, Unterholz 0,029 gegen 0,25–0,78 (K3 ROT). Wiese bis ~20 m, Saum springt (K1 ROT). Laub-Kante 0,2635 > 0,22 (PFLICHT-OFFEN A).
- **Zeitalter, Meer, Kraft:** keine Epochen-Flora; keine Unterwasser-Flora; Böe 1/2 (K2), Ausweichen unter dem Körper ungeprüft.

## Abhängigkeiten

- **Zuerst:** Atmosphäre, Wetter und Klima (Temperatur- und Niederschlagsfeld je Ort und Saison für L2, L4). Boden und Erosion (L1–L3, L6.3). Sonnensysteme (Einstrahlung, Jahreslänge für L4.6). Meer (Lichttiefe, Nährstoff für L9).
- **Gemeinsam:** Ökosysteme und Zerfall (L3, L6). Evolution und fremdes Leben (Artbildung; hier die Gestalt, dort die Abstammung — L7.4 teilt den Richter). Tiefe Zeit (L7). Stadt (L6.5).
- **Kosten:** Maßstab-Kontinuum und Licht tragen L5 und L8. Ohne GPU-seitige Instanzwahl und Pflanzen-LOD ohne Sprung hält keine Sprosse über 2.
- **Abnehmer:** Tiere, Nahrung und Kulturland, Siedlung (Holz, Rodung), Katastrophe (Feuer, Sturm).

## Was die alte Karte hier misst

Meisterkarte II · 6 Vegetation (4/10), `MEISTERKARTE.md:361-386`:
- K1 Wiese dicht und bunt 0–40 m (0/2) → L5.2.
- K2 die sichtbare Böe (1/2) → L8.1.
- K3 der Wald von innen (0/2) → L5.2 und L3.3.
- K4 die Natur-Wand (1/2) → L6.1.
- K5 Jahreszeit als Gestalt (2/2) → L4.1.
- LOD K1 laub-kante → Tiefe von L5.1; Material K1 Albedo rinde/laub → Tiefe von L1.1.

Die alte Karte misst den gemäßigten Mischwald an wenigen Posen; Arten, Biome, Lebenslauf, Zeitalter, Meer kommen nicht vor.

## Zweifel

- Die Schwellen der Bildvergleiche (≥ 0,7, Blindtest ≤ 60–70 %) sind gesetzt, nicht kalibriert; jeder Richter braucht zuerst ein Referenz-Fotokorpus je Biom, Art und Epoche.
- „Duplikat = im Bild ununterscheidbar" verlangt einen Bild-Richter über Millionen Paare; ob eine Stichprobe von 1 000 das No-Man's-Sky-Problem erkennt, ist offen.
- L5.5–L5.6 (10¹¹–10¹⁴ adressierbare Pflanzen bei P) könnten mit Laptop-Grafik unerreichbar sein; ob sie Frage bleiben müssen (R6), entscheidet erst der Same, der Pflanzen als Funktion statt als Liste liefert.
- Paläo-Richter (L7) setzen voraus, dass die Tiefe-Zeit-Perspektive eine Erde nachbauen kann; für fremde Planeten gibt es nur Konsistenz, keine Wahrheit.
- L1.6/L7.4 und das Blatt „Evolution" könnten doppelt zählen; L6.4 (Feuer) und das Blatt „Katastrophe" ebenso.

## Gegenlese — was sich änderte und was strittig bleibt

- **Richter:** L5 schrieb Bauweise vor („4 Befehle / 51k Dreiecke", „≤ 40 Befehle / 150k"); ersetzt durch Bildzeit P in benannter Szene und Bild-Anteil gegen Foto. Jede Sprosse trägt jetzt P mit SZENE statt „dto." — der Regenwald-Hektar mit 300 Arten im Bild ist die eigentliche Preisfrage von L1.
- **Fleiß statt Fähigkeit:** L1.1/L1.2 zählten handgebaute Arten (zusammengelegt; ab L1.2 nur noch Arten, die aus einer Saat gezogen sind); L2 zählte benannte Biome (3 → 9 → 14) — jetzt Fläche × Anteil des richtig besetzten Klimaraums.
- **Doppelt:** L2.7 (Biome wandern), L3.6 (Wälder wandern) und L3.7 maßen dasselbe → in die neue L7 „Flora der Zeitalter"; L3.4 und L3.5 zusammengelegt.
- **Lücken:** neu L7 Zeitalter (das „Zeiten bereisen" des Schöpfers hatte keine eigene Leiter), L8 Kraft und Berührung (Sturm, Tritt, Schnee — die alte K2 hing heimatlos), L9 Meeresflora („Meer bis Wüste" fehlte unter Wasser), L6.5 Stadt ↔ Pflanze (Kopplung an die Megastadt).
- **Stand berichtigt:** Feuchte geht sehr wohl ein (Dichte, Wuchs, Art), nur ein Klimafeld fehlt; `FOREST_SPECIES` sind Namen, keine sechs Arten; Totholz ist keine Art mehr; L1.2 „HEUTE" war ungemessen → HEUTE steht unter L1.1 teils; L2.1 trägt ein benanntes ROT (Palme folgt Rauschen statt Wärme).
- **Strittig:** ob „Blindtest" als Richter im echten Spiel reproduzierbar ist ohne menschliche Jury (ein Bild-Klassifikator als Stellvertreter wäre selbst ungeeicht); ob L5.6 und L8.4 physikalisch im Preis liegen; ob L7 hierher oder ins Blatt „Tiefe Zeit" gehört.
