# Kapitel: Das Leben

Pflanzen, Tiere, Leben im Wasser, Ökosysteme und Evolution — verdichtet aus den Blättern 07 bis 11 (45 Leitern). Die oberste Sprosse jeder Leiter ist die Vision: Millionen Arten je Planet aus EINEM Samen, Milliarden Individuen, jede Epoche bereisbar, fremdes Leben unter fremder Physik, bei 33 ms ohne Download. Darunter steht ehrlich, wie wenig davon heute im echten Bild steht.

## Die Bilanz

- **33 Kriterien** und **4 Kopplungs-Kriterien**, zusammen **251 Sprossen**.
- **HEUTE erreicht: 4 Sprossen** — je Sprosse 1 in leben.pflanzen.jahreslauf, leben.pflanzen.kraft, leben.oeko.vielfalt und leben.kopplung.stadt-im-netz. Alle anderen Leitern stehen auf 0 (unter der Leiter).
- **9 doppelte Leitern** fielen in andere (Tabelle unten); dazu kam eine neue Kopplung (leben.kopplung.kaskade). 45 − 9 + 1 = 37.
- Die alte Karte gab Vegetation 4/10, Tiere 8/10, Ökologie 10/10, Leben in Luft und Wasser 10/10. Gegen die Vision sind das 4 von 251 Sprossen.

## Die Regeln dieses Kapitels

**Preis-Treppe** (R3, je Sprosse mit der Szene des Richters):

- **P1** — Bild p95 ≤ 33 ms an EINEM Standardgerät (Radeon 890M oder GTX 1060), gemessen in der Szene des Richters; die Ankunft wird erst ab Sprosse 2 gerichtet.
- **P2** — Bild p95 ≤ 33 ms an Radeon 890M UND GTX 1060 in der Szene des Richters, Ankunft kalt ≤ 10 s, 0 Download.
- **P** — Bild p95 ≤ 33 ms an beiden Geräten in der Szene des Richters, Ankunft kalt ≤ 5 s, 0 Download; Orts- und Zeitsprung ≤ 5 s, Zeitraffer läuft unter P.

Sprosse 1 trägt P1, Sprosse 2 P2, jede höhere das volle P. Der Preis wird in DERSELBEN Fahrt und an der dichtesten Pose gemessen, die der Richter verlangt (Herde, Riff, Schwarm im Bild), nie in einer leeren Szene daneben.

**HEUTE** heißt: Umfang, Tiefe und Preis dieser Sprosse sind im echten Spiel belegt. Ein Beleg, der nur headless steht, zählt nicht (R2); die Leiter steht dann auf 0.

**Breite ist eine Stichprobe** (R4): „N Arten“ heißt nie „N Arten gebaut“, sondern N zufällige Saaten → der Anteil, der den Richter besteht. Eine von Hand gesetzte Art zählt über Sprosse 1 nirgends.

**Gegenlauf**: wo ein Gesetz behauptet wird (Selektion, Kaskade, Partner), richtet der Gegenlauf mit — Ursache aus, Folge weg.

## Zusammengelegt

| Leiter aus dem Blatt | lebt jetzt in |
|---|---|
| 09-meeresleben L1 | leben.tiere.arten |
| 09-meeresleben L2 | leben.tiere.masse |
| 09-meeresleben L7 | leben.tiere.bewegung |
| 09-meeresleben L8 | leben.kopplung.stadt-im-netz |
| 10-oekologie L8 | leben.tiere.masse (+ Wanderung, Vielfalt, Erbe) |
| 07-pflanzen L6 | auf die Kopplungen, leben.oeko.sukzession und leben.oeko.stoffe verteilt |
| 07-pflanzen L7 | leben.evolution.zeitreise |
| 07-pflanzen L9 | leben.wasser.lebensraeume + leben.wasser.netz |
| 08-tiere L9 | leben.evolution.zeitreise |

Teil-Überschneidungen (einzelne Sprossen) sind in der Quelle jedes Kriteriums genannt.

## Pflanzen und Biome

### leben.pflanzen.arten — Pflanzenarten aus EINEM Wachstumsgesetz

Wie viele unterscheidbare, plausible Pflanzenarten zufällige Saaten tragen und wie viele davon ein Bild zugleich zeigt.

**Stand: 0 (unter der Leiter).** 12 Gestalten von Hand (stamm/vegetation-baum.js SPECIES_TREE_PARAMS) + baum_mammut (phyto-core.js); kein Gesetz erzeugt Arten; der Blindtest von Sprosse 1 wurde nie gefahren.

*Quelle:* 07-pflanzen L1 · *alte Karte:* Material K1 (Albedo rinde/laub, Tiefe)

| Sprosse | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 10 Gestalten, je von Hand parametrisiert | Gattung an der Silhouette lesbar; Rinde und Blatt nah gegen Herbarfoto | P1 · Waldrand | Blindtest 10 Bilder je Gestalt: Gattung ≥ 80 % richtig; Herbar-Bildpaar je Gestalt ≥ 0,7 |
| 2 | 10² Arten, gezogen aus EINEM Merkmalsraum (Saat → Art), keine Tabelle | ≥ 90 % als echte Wuchsform erkannt (Baum, Strauch, Gras, Kletterer, Sukkulente, Farn, Moos) | P2 · Ankunft mit 10² Arten ≤ Ankunft mit 10 Arten + 0,2 s | 100 Saaten → Wuchsform-Blindtest; Silhouetten-Paare unterscheidbar ≥ 95 % |
| 3 | 10³ Arten je Planet, ≥ 50 zugleich im Bild | Merkmalsverteilung (Höhe, Blattgröße, Holzdichte) im Band der Erde (TRY, Díaz 2016) | P · artenreichste Szene | Histogramm-Distanz Spiel ↔ Erde ≤ 0,2 aus Bild-Morphometrie; Artenzahl im Bild per Blindbenennung |
| 4 | 10⁴ Arten; Tropen-Hektar mit ~300 Baumarten im Blick | Nahbild jeder Stichprobe vom Foto kaum zu trennen | P · Regenwald-Hektar | Blindtest Foto ↔ Spiel, 200 Paare: Trefferquote ≤ 60 % |
| 5 | 10⁵ Arten je Planet | Schwesterarten derselben Gattung im Nahbild trennbar, nicht bloß umgefärbt | P | 1 000 Zufallsarten: Paar-Unterscheidbarkeit innerhalb der Gattung ≥ 95 % bei Gestalt UND Standort |
| 6 | 10⁶ Arten über alle Planeten, fremde ohne irdisches Vorbild | ≥ 80 % als lebendig und plausibel gelesen | P · fremder Planet | Blindbewertung 500 fremder Arten ≥ 80 %; paarweise unterscheidbar ≥ 95 % |
| 7 (Vision) | ≥ 10⁷ Arten aus EINEM Samen, die Erde (~3,9·10⁵ Gefäßpflanzen) darunter | Gestalt, Phänologie und Standort jeder Art folgen aus dem Gesetz | P an jedem Ort jeder Saat, 0 Byte je Art | 1 000 Saaten: plausibel ≥ 95 %, im Bild ununterscheidbare Duplikate ≤ 1 % |

### leben.pflanzen.biome — Biome folgen aus Klima, Boden und Licht

Wie viel des Klimaraums die Vegetationsdecke auf wachsender Fläche richtig besetzt, ohne dass ein Biom gesetzt wird.

**Stand: 0 (unter der Leiter).** Waldgrenze unter dem Sommer-Schnee und Feuchte-Arten GRÜN, aber die Palme folgt dem Rauschen `lebendig` (stamm/feld-leben.js) statt Wärme: ROT an Sprosse 1; ein Klimafeld Temperatur × Niederschlag fehlt.

*Quelle:* 07-pflanzen L2

| Sprosse | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | ein Klima; Mosaik Wald ↔ Lichtung ↔ Ufer ↔ Gipfel | Waldgrenze unter dem Sommer-Schnee; Uferarten am Wasser; Wärme-Arten nur im Warmen | P1 · Gipfel und Ufer | Bild am Gipfel baumfrei; Stichprobe: Uferarten am Wasser ≥ 90 %, Wärme-Arten außerhalb der Wärme 0 |
| 2 | Region 10² km² mit Höhen- und Luv/Lee-Gradient | Höhenstufen kollin → alpin in richtiger Folge, Ökoton statt Kante | P2 · Flug über die Region | 50 Hänge: Stufenfolge richtig ≥ 90 %; scharfe Biom-Kanten im Luftbild ≤ 10 % |
| 3 | Kontinent 10⁶ km² | Biome folgen Temperatur × Niederschlag; ≥ 80 % des Whittaker-Raums besetzt | P · 20 Zufallsorte | Kappa ≥ 0,6 zwischen Biom-Bild und Klima-Zuordnung (Whittaker/Köppen) |
| 4 | ein Planet ~10⁸ km², mit Mangrove, Moor, Küstenwüste | Kontinentalgefälle, Regenschatten | P · Orbit | 1 000 Punkte: Biom passt zum lokalen Klima ≥ 90 %; Orbitbild ↔ Satellitenmosaik ≥ 0,7 |
| 5 | 10² Planeten mit fremden Klimata (Stern, Achse, Atmosphäre) | Biome ohne irdisches Vorbild, doch klimakonsistent | P je Planet | Anteil Planeten, deren Biom-Verteilung aus ihrem Klima vorhersagbar ist ≥ 90 % |
| 6 (Vision) | jeder Planet jeder Saat | ≥ 30 % der fremden Biome ohne irdisches Gegenstück und doch als Lebensraum gelesen | P an jedem Punkt jeder Welt | 1 000 Saaten × 10 Punkte: Konsistenz ≥ 95 %, Blindbewertung „lebendige Welt“ ≥ 80 % |

### leben.pflanzen.lebenslauf — Keimen, Wachsen, Altern, Sterben — auch ungesehen

Ob der Spieler Pflanze und Bestand wachsen und sterben sieht und bei der Rückkehr den gewachsenen, nicht den alten Wald findet.

**Stand: 0 (unter der Leiter).** reverse-J-Größen und Selbstastung stehen als statischer Parameter (phyto-core.js:2899); Verjüngung nur im Labor („Host has no pass“); der Ertragstafel-Richter wurde nie gefahren.

*Quelle:* 07-pflanzen L3 (ohne Sukzession) · *alte Karte:* Vegetation K3 (teils)

| Sprosse | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Bestand: statische Altersverteilung, stehendes Totholz | reverse-J-Größen, Selbstastung | P1 · im Wald | Höhenhistogramm aus dem Bild gegen Ertragstafel |
| 2 | 1 Pflanze im Zeitraffer vom Keimling zum Altbaum | Formwechsel jung → alt (Kronenform, Borke) | P2 · Zeitraffer | Bildreihe 0/10/50/150 Jahre gegen Fotoreihe derselben Art |
| 3 | 1 ha über 10² Jahre | Lückendynamik: Tod → Lichtschacht → Verjüngung | P · Jahrhundert in ≤ 60 s Wanduhr | Stämme/ha und Basalfläche über die Zeit gegen Ertragstafel ±20 % |
| 4 | 10² km² leben ungesehen weiter | wer nach 50 Jahren zurückkehrt, findet den gewachsenen Wald | P · Flug | Rückkehr an 20 Orte nach 50 Spieljahren: Zustand plausibel ≥ 90 % |
| 5 | Kontinent: Zeitskalen vom Tag (Blüte öffnet) bis zum Jahrtausend (Grannenkiefer) | Lebensdauer je Wuchsform im Band (Kraut 1 Jahr bis Baum 10³ Jahre) | P | 1 000 Pflanzen: Alter-Größe-Beziehung je Wuchsform im Band der Literatur |
| 6 (Vision) | jede Pflanze jedes Planeten, auch ungesehen | Zustand an jedem Ort ist eine Funktion der Zeit, nie ein Speicherstand | P; Kosten am Schirm, nie an der Weltgröße | 100 Orte × 5 Zeitabstände: plausibel ≥ 90 % |

### leben.pflanzen.jahreslauf — Der Jahreslauf: Austrieb, Blüte, Frucht, Laubfall

Ob die Jahreszeit die Gestalt der Pflanzen ändert, je Art gestaffelt, aus dem Klima und auf fremden Bahnen.

**Stand: Sprosse 1.** Alte Vegetation K5 2/2 im echten Bild: Krone Winter 0,037 × Sommer (Radeon), 0,113 (GTX); Wiese niedriger; Mess-Wiese, GTX stehend p95 16,8 ms.

*Quelle:* 07-pflanzen L4 · *alte Karte:* Vegetation K5

| Sprosse | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 **HEUTE** | Laubbäume + Wiese, 3 Saisonphasen an einem Ort | Kronendeckung Winter ≤ 0,3 × Sommer, Wiese Winter ≤ 0,5 × Sommer | P1 · Mess-Wiese | Pixelanteil der Krone im Zeitraffer (Klassen-Maske) |
| 2 | 10 Arten, Phänologie je Art gestaffelt | Reihenfolge gegen Phänologie-Netz (Hasel vor Buche) | P2 | Kalender des Spiels gegen Beobachtungsreihe: Rangkorrelation ≥ 0,8 |
| 3 | Blüte und Frucht als Ereignis (Wiesenblüte, Kirschblüte, Mast) an 10² Arten | Farbe und Deckung im Wochentakt | P · in der Blüte | 12-Wochen-Bildreihe gegen Webcam-Zeitreihe |
| 4 | Region: Höhe und Breite verschieben den Kalender | Grünwelle 3–4 Tage je 100 m Höhe | P | Austriebsdatum über Höhe und Breite gegen Satelliten-NDVI |
| 5 | Planet: Hemisphären, Trockenzeit, Monsun-Grün | NDVI-Jahreskurve je Biom | P · Orbit | Orbit-Zeitraffer gegen MODIS-NDVI, r ≥ 0,8 |
| 6 (Vision) | fremde Planeten: Jahre von Tagen bis Jahrhunderten, Doppelsterne | der Jahreslauf folgt der Bahn, nicht dem Erdkalender | P | 100 Planeten: Phänologie folgt der Einstrahlung, r ≥ 0,8 |

### leben.pflanzen.dichte — Dichte und Ferne: vom Halm am Stiefel bis zum Orbit

Wie viel Pflanze der Spieler auf einmal sieht und wie wahr sie wirkt — gemessen am Bild und an der Bildzeit, nie an Dreiecken.

**Stand: 0 (unter der Leiter).** P an der Wiese GRÜN (GTX p95 16,8 ms), Tiefe ROT: Saum springt (alte Vegetation K1 0/2), Wald 24 Stämme/ha gegen 370–900, Unterholz 0,029 gegen 0,25–0,78 (K3 0/2), Laub-Kante 0,2635 > 0,22 (PFLICHT-OFFEN A).

*Quelle:* 07-pflanzen L5 · *alte Karte:* Vegetation K1, Vegetation K3, LOD K1 laub-kante, PFLICHT-OFFEN A (laub-kante)

| Sprosse | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Wiese dicht bis ~20 m, Wald licht | Boden-Sicht-Anteil je Ring 2–5/5–10/10–20 m wie im Wiesenfoto; Laub-Kante im Band | P1 · stehend an der Wiese | Ring-Bildanteil gegen Foto; Bildpaar gegen REF real-mischwald |
| 2 | Wiese 0–40 m ohne Saum; Wald von innen (370–900 Stämme/ha, Unterholz 0,25–0,78) | Lichtflecken wandern mit der Sonne | P2 · im Wald-Innern, gehend | Bildpaar Wald-innen gegen REF; Ring-Bildanteil 20–40 m wie 0–20 m |
| 3 | jede Pflanze bis 1 km ohne Sprung | Waldrand und Hang auf 1 km gegen Foto ≥ 0,7 | P · gehend und fahrend | Pop-Zähler unter Bewegung = 0 (Bild-Differenz ohne Kamera-Anteil); Bildpaar 1 km |
| 4 | Horizont 10 km, Wald als Wald bis zum Kamm | Textur und Farbe am Hang wie im Landschaftsfoto | P · Flug | Blindtest Landschaftsfoto ↔ Spiel: Trefferquote ≤ 70 % |
| 5 | Kontinent, ~10¹¹ Pflanzen, jede adressierbar | jede angeflogene Pflanze steht dort, wo man sie aus der Ferne sah | P · Anflug | Anflug 10 km → 1 m: Lage- und Farbabweichung der Ziel-Pflanze 0 |
| 6 (Vision) | Planet vom Orbit bis zum Halm, ~10¹⁴ Individuen | Orbitbild gegen Satellit, Nahbild gegen Foto | P im durchgehenden Flug Orbit → Halm | Frame p95 ≤ 33 ms über den ganzen Flug; Bildvergleich je Maßstab ≥ 0,7 |

### leben.pflanzen.kraft — Pflanze unter Wind, Last und Berührung

Ob Pflanzen auf Wind, Schnee und Körper sichtbar antworten — vom Halm am Stiefel bis zum Sturmfeld über 10 km.

**Stand: Sprosse 1.** Alte Vegetation K2 1/2: die Böe nah (0–15 m) an einem Gerät als zeitliche Luma-Varianz über dem Rausch-Boden mit Böen-Laufzeit; Staffel 2 (bis 300 m, Gras ↔ Krone, beide Geräte) offen.

*Quelle:* 07-pflanzen L8 · *alte Karte:* Vegetation K2

| Sprosse | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 **HEUTE** | Böe nah 0–15 m | Böe als wandernde Front, nicht als gleiches Schwingen | P1 · Mess-Wiese | zeitliche Luma-Varianz über dem Rausch-Boden mit Böen-Laufzeit |
| 2 | Böe über jeden Ring bis 300 m, Gras und Krone gekoppelt | Gras ↔ Krone r ≥ 0,6 längs der Windrichtung; Ruhe → Sturm hebt die Varianz ≥ 3× | P2 · Ego und Third | Kreuzkorrelation Gras ↔ Krone mit Laufzeit ±20 % |
| 3 | Halme und Sträucher weichen dem Körper und richten sich auf; Schnee beugt Äste | Rückstellzeit und Spur wie im Video | P · gehend durch Wiese und Gebüsch | Bildreihe Durchgang gegen Video derselben Lage |
| 4 | Sturm über 1 km²: Astbruch, Windwurf, fliegendes Laub | Windwurf folgt Windstärke und Wurzelboden | P · im Sturm | Anteil geworfener Bäume über Windstärke gegen Sturm-Statistik |
| 5 | Sturmfeld über 10 km lesbar | Front und Böenwalzen über Wald und Feld | P · Flug im Sturm | Blindtest Sturm-Video ↔ Spiel: Trefferquote ≤ 60 % |
| 6 (Vision) | jede Pflanze im Blick antwortet auf jede Kraft, Orbit bis Halm, unter fremder Schwere und Luftdichte | Biegung skaliert mit Last, g und Dichte | P über den ganzen Sturm | gleiche Art auf 3 Planeten: Biegung ∝ Last ±20 %; Frame p95 über den Sturm |

## Tiere: Leib, Verhalten, Masse

### leben.tiere.arten — Tierarten aus dem Samen — Land, Luft und Wasser

Wie viele unterscheidbare UND glaubhafte Tierarten ein Same in allen Medien hervorbringt, und dass kein Individuum dem anderen gleicht.

**Stand: 0 (unter der Leiter).** ≈ 8 Leib-Typen von Hand: Wolf, Fuchs, Bär, Hirsch aus fünf Dials (tetrapoda-core.js:62), Singvogel, Star, Bachforelle als Oktaeder, Hummel als Doppelkeil; Individuen byte-gleich (GESTALTEN_JE_REZEPT = 1); der Richter von Sprosse 1 wurde im Fenster nie gefahren.

*Quelle:* 08-tiere L1 · 09-meeresleben L1 · *alte Karte:* Tiere K4 (teils), Leben in Luft und Wasser K1

| Sprosse | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | ≈ 10 Leib-Typen von Hand in Land, Luft, Wasser | Art passt zum Lebensraum | P1 | Spielgang 1 h an 3 Biomen: ≥ 5 Arten im Bild (Klassen-Maske ≥ 200 px) |
| 2 | 10² Arten aus dem Samen, ein Bauplan je Medium; jedes Individuum eigen (Alter, Geschlecht, Fell, Narbe) | Fell, Schuppe, Proportion aus 10 m glaubhaft | P2 · Herde von 20 im Bild | 1 000 Saaten: Blind-Panel „echt möglich“ ≥ 0,7; Herde: kein Paar im Bild-Embedding näher als zwei Fotos desselben realen Tiers |
| 3 | 10³ Arten, alle Wirbeltier-Klassen | Haut, Feder, Schuppe je Klasse; die Form folgt der Lebensweise | P · Riff mit ≥ 30 Arten im Bild | je Klasse Panel ≥ 0,7; aus Silhouetten: Schlankheit ↔ Reisetempo Rangkorrelation ≥ 0,6 |
| 4 | 10⁴ Arten, + Gliederfüßer, Weichtiere, Nesseltiere | Chitin, Facettenauge, Tentakel im Makrobild; Farbe folgt dem Lichtklima (Gegenschattierung, Rot in der Tiefe) | P · Makro 0,2 m | Makro-Bildpaar gegen Foto-Korpus Panel ≥ 0,7; Klassifikator ordnet Tiefenzone ≥ 80 % |
| 5 | 10⁵ Arten, alle großen Stämme in allen Medien | Größenverteilung je Klade wie die Erde (viele kleine, wenige große) | P | 10 000 Saaten: Häufigkeit je Massen-Dekade gegen die reale Verteilung, Abweichung ≤ Faktor 2 |
| 6 | 10⁶ Arten je Planet | jede Art mit Nische, in der der Spieler sie antrifft; Lebensweise in 60 s benennbar | P | 1 000 Arten: glaubhaft ≥ 0,8, in ihrer Nische angetroffen ≥ 0,9, paarweise trennbar ≥ 95 % |
| 7 | 10⁷ Arten je Planet (Erd-Maß ≈ 7,8·10⁶ Tierarten) | Faunen verschiedener Planeten verschieden UND je für sich glaubhaft | P · Ankunft auf jedem Planeten | 100 Saaten: Faunen paarweise im Bild-Embedding trennbar ≥ 0,95 |
| 8 (Vision) | jeder Same eine eigene Fauna ohne Decke; fremde Baupläne aus fremder Schwere, Atmosphäre und Chemie | fremde Art „könnte dort leben“ | P an jedem Ort | 100 fremde Saaten: Blind-Panel ≥ 0,7; im Bild ununterscheidbare Duplikate ≤ 1 % |

### leben.tiere.bewegung — Leib und Fortbewegung über Masse-Dekaden und Medien

Über wie viele Größenordnungen der Körpermasse und wie viele Medien ein Tier physikalisch wahr läuft, fliegt, schwimmt, gräbt, klettert.

**Stand: 0 (unter der Leiter).** Gang aus Froude für 4 Säuger, Schlupf max 0,011 in 25 Läufen — headless (alte Tiere K3), am Gerät halb; der Fisch pendelt als starrer Leib 2,5 Hz (tetrapoda-core.js:2685).

*Quelle:* 08-tiere L2 · 09-meeresleben L7 · *alte Karte:* Tiere K3

| Sprosse | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Bauplan, 4 Gattungen, 10–300 kg, laufen | Fuß steht (Gleiten ≤ 5 % der Schrittlänge), Gangwechsel bei der Froude-Zahl der Natur ±10 % | P1 · Third aus 10 m | Fußgleiten und Gangwechsel aus der Third-Aufnahme im Fenster |
| 2 | 3 Dekaden 1–10³ kg: Vierbeiner, Laufvogel, Fisch mit Körperwelle | Fußfall gegen Muybridge ±0,05; Strouhal 0,2–0,4 | P2 · Schwarm von 300 im Bild | Fußfall-Diagramm und St = f·A/U aus dem Ausgabe-Bild |
| 3 | + Fliegen und 5 Schwimmweisen (Aal, Barsch, Thun, Rückstoß, Flossenflug) aus der Körperform | Schlagfrequenz ±20 % zur Allometrie; die Weise folgt dem Leib, nicht einer Zuweisung | P · Trupp oder Schwarm von 3 000 | 100 Stichproben-Arten: Frequenz gegen Pennycuick; Blindtest Schwimmweise ≥ 80 % |
| 4 | + Kriechen, Springen, Klettern, Graben; Säuger und Vögel im Wasser (Fluke, Stoßtauchen) | Sprungbahn ballistisch ±10 %; das Medium antwortet (Bugwelle, Staub, Sediment) | P | je Medium 10 Arten im Band ≥ 0,8; Spur folgt der Bahn ±0,5 m |
| 5 | 6 Dekaden 1 g – 1 t, Insekt bis Bär | Tripod-Gang, Flügelschlag 100–200 Hz als Unschärfe | P · Makro-Zeitlupe | Panel gegen Hochgeschwindigkeits-Referenz ≥ 0,7 |
| 6 | 11 Dekaden 1 mg – 70 t, alle Medien und Gelände (Hang, Fels, Schnee, Schlamm, Strömung) | ohne Durchdringung, Gang im Band | P | 1 000 Arten × 5 Gelände: Anteil ohne Durchdringung, Gleiten ≤ 5 %, Gang im Band ≥ 0,95 |
| 7 | 10³ Zufalls-Arten je Saat, jede bewegt sich nach ihrem Leib | Reynolds-Skalierung: Kleinstes kriecht ohne Gleiten, Großes gleitet | P | Gleitstrecke nach Schlag-Stopp ±30 % zur Re-Theorie; St im Band bei ≥ 95 % |
| 8 (Vision) | fremde Schwere 0,1–5 g, dünne bis dichte Atmosphären, Flüssigkeiten jenseits Wasser | Gang ∝ √(g·L); Flug nur, wo Dichte und g ihn tragen | P | gleiche Art auf 3 Planeten: Gangwechsel-Tempo ±10 %; Gegenprobe: in dünner Luft bleibt sie am Boden |

### leben.tiere.verhalten — Verhalten aus Bedürfnis, Sinn und Leib

Ob das Verhalten einer BELIEBIGEN Art aus ihrem Leib, ihren Sinnen und ihrer Welt folgt — an Stichproben-Arten, nie an Akt-Listen.

**Stand: 0 (unter der Leiter).** Jagd-Kreislauf, Furcht mit Gedächtnis, Ethogramm aus Bedürfnis-Pegeln (tetrapoda-core.js VERHALTEN): Rudel reißt 18/60, Budget Hirsch ruhen 0,409/0,4 — headless, im Fenster nie gemessen.

*Quelle:* 08-tiere L3 (ohne Kultur) · *alte Karte:* Tiere K1 (Alarm-Kette), Tiere K2, Tiere K4, Ökologie K3

| Sprosse | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 4 Gattungen, ≈ 10 Akte, 2 Sinne | Zeitbudget ±20 % am Ethogramm; Riss-Quote Rudel gegen Hirsch 20–40 % (MacNulty) | P1 · Wolfsrevier | Zeitraffer 24 Spielstunden im Fenster |
| 2 | eine Art mit vollem Ethogramm (≥ 30 Akte: sichern, Alarmruf, Spiel, Komfort, Markieren, Drohen) | Alarm-Kette ≤ 1 s, Fluchtdistanz nach Feldmaß | P2 · Herde im Bild | 1 h Beobachtung: Häufigkeiten gegen Feld-Ethogramm, Rangkorrelation ≥ 0,7 |
| 3 | 10² Stichproben-Arten aus dem Samen | Räuber pirscht, Beute sichert, Aasfresser kreist — ohne Zuweisung von Hand | P | 100 Saaten, je 1 h: Ethologe ordnet die Lebensweise blind zu ≥ 0,8 |
| 4 | 5 Sinne: Richtungsgehör, Geruch im Wind, Vibration, Wärme, Sicht | Tiere hören den Spieler, wittern gegen den Wind | P | Anschleich-Probe: Entdeckungsdistanz mit Wind / gegen Wind ≥ 3 |
| 5 | Gedächtnis über Wochen: Orte, Individuen, Gefahr | ein bedrohtes Tier meidet Ort und Spieler | P | nach 7 Spieltagen: Meidequote ≥ 0,8 beim Individuum, ≤ 0,2 bei Fremden |
| 6 | 10⁴ Stichproben-Arten; Sinne jenseits des Menschen (UV, Magnetfeld, Echo, Elektro) | Fledermaus jagt im Dunkeln, Zugvogel hält Kurs bei Bewölkung | P | Fang-Quote der Echo-Jäger bei 0 lux = Tag ±20 %; blinde Zuordnung an 10⁴ Saaten ≥ 0,8 |
| 7 (Vision) | jede Art jedes Planeten | Verhalten folgt aus Leib, Sinn und Welt, auch unter fremden Sinnen | P | 100 fremde Saaten: Lebensweise blind benannt ≥ 0,8; Gegenprobe Sinn aus → Verhalten bricht |

### leben.tiere.lebenszyklus — Lebenszyklus: Geburt, Aufzucht, Balz, Brut, Tod

Ob der Spieler Brunft, Balz, Brut, Aufwachsen und Altern SIEHT — von einer Art bis zu den Lebenszyklen aller Klassen.

**Stand: 0 (unter der Leiter).** Geburt und Tod als Zahl je Revier mit Holling-III-Riss und Alterstod (BESTAND_GESETZ, tetrapoda-core.js:2177) — headless; sichtbares Wachstum, Brunft, Nest: nichts.

*Quelle:* 08-tiere L4 (Sprossen 1–4; Erbe → leben.evolution.erbe, Selektion → leben.evolution.muster) · *alte Karte:* Ökologie K2 (teils)

| Sprosse | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Geburt und Tod als Bestand je Revier | Bilanz mit Holling-III-Riss, Alterstod | P1 | Bestand je Revier über 3 Spielstunden im Band, im Fenster |
| 2 | sichtbares Jungtier, das wächst | Proportion jung ↔ alt allometrisch (großer Kopf, lange Beine beim Kitz) | P2 | Bildpaar Kitz/Hirsch Panel ≥ 0,7; Jungtiere ≥ 10 % einer Herde im Frühsommer |
| 3 | Brunft, Balz, Revierkampf zur Jahreszeit der Art | Röhren im Herbst, Balzflug im Frühling | P · Jahres-Zeitraffer | Ereignisse im Bild je Monat, Gipfel im Monat der Natur ±1 |
| 4 | Nest, Bau, Brut, Laich, Brutpflege | Nest aus Stoffen des Orts, Eltern füttern | P | 10 Spielstunden Frühling: Brutpaare mit sichtbarem Nest ≥ 0,8, Fütterungsflüge je Stunde im Band |
| 5 | Lebenszyklen aller Klassen an 10² Stichproben-Arten: Metamorphose, Larve, Laichzug | Stadien in Reihenfolge, Dauer ±50 % | P | Stadienfolge plausibel ≥ 0,9 |
| 6 | 10⁴ Stichproben-Arten, Fortpflanzungs-Strategie aus dem Genom | viele kleine ↔ wenige große Junge folgt Masse und Umwelt | P | Wurfgröße und Brutpflege über Körpermasse im Band der realen Allometrie |
| 7 (Vision) | jedes Tier jedes Planeten, fremde Fortpflanzung (Knospung, Generationswechsel) | der Bestand erneuert sich ohne Skript | P | 100 fremde Saaten: Bestand über 100 Generationen getragen; Gegenprobe Fortpflanzung aus → Aussterben |

### leben.tiere.masse — Herde, Schwarm, Pulk: die Masse im Bild

Wie viele einzeln lebende Glieder ein Kollektiv im Bild trägt und wie wahr seine Form ist — an Land, in der Luft und im Wasser; die EINZIGE Leiter für Leiber im Bild.

**Stand: 0 (unter der Leiter).** Kohäsion fliehend 0,981 headless, Radeon ROT (alte Tiere K1 1/2); Star-Trupp 60–140 gebaut, am Gerät ungemessen; ~30 Fische einzeln, kein Fischschwarm; höchstens 20 gezeichnete Leiber (dirigent-kern.js maxCreatures).

*Quelle:* 08-tiere L5 · 09-meeresleben L2 · 10-oekologie L8 (Sprossen 1–4) · *alte Karte:* Tiere K1, Tiere K5, Leben in Luft und Wasser K2, Leben in Luft und Wasser K5

| Sprosse | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 10 Glieder: Rudel, Kahlwild | Kohäsion wandernd ≥ 0,9, Flucht ≥ 0,8, Ausrichtung Φ ≥ 0,8 | P1 · Ego auf 40 m | Herde flieht als EIN Pulk im Bild |
| 2 | 10² Glieder: Star-Trupp, Fischschwarm | Dichte-Welle, Leittier, kein Glied im anderen | P2 · der Trupp im Bild | Φ und Kohäsion aus den gezeichneten Leibern; Silhouette gegen Murmuration-Film |
| 3 | 10³: Köderball, Gnu-Herde am Fluss | Räuber teilen den Schwarm (Fontäne, Vakuole); topologisch 6–7 Nachbarn | P · Angriff im Bild | Konvexität und Lückenfläche gegen Unterwasser-Film; Nachbarzahl im Band Ballerini |
| 4 | 10⁴ | Korrelationslänge wächst mit der Schwarmgröße; Fluchtwelle mit realem Tempo | P · während der Welle | Korrelationslänge/Größe konstant ±20 % über 10²–10⁴ (Cavagna); Wellentempo ±30 % |
| 5 | 10⁵: Gnu-Strom bis zum Horizont, Vogelfelsen, Krillwolke im Sichtkegel | keine Kante zwischen nahen Leibern und ferner Wolke; die Masse frisst sichtbar | P · Fahrt durch die Wolke | Bild-Flicker an der Sichtgrenze < 1 % der Pixel; Grashöhe nach Durchzug sinkt messbar |
| 6 | 10⁶: Murmuration über dem Ried, Sardinenzug über 10 km | Dichtewellen 20–40 m/s, der Falke reißt ein Loch, das sich schließt | P · die ganze Wolke im Bild | Zoom-Probe an 10 Stellen: Einzeltier mit eigenem Schlag; Draufsicht gegen Luftbild des Sardinenzugs |
| 7 | 10⁹: Heuschreckenschwarm | die Front frisst messbar | P · die Front im Bild | Kahlfraß je Stunde im Band der FAO-Werte; Horizont-Bild Panel ≥ 0,7 |
| 8 (Vision) | Krill-Maß 10¹⁴ Leiber auf dem Planeten, jeder nah betauchbar | die Dichte stimmt auf jeder Höhe | P als p95 über die ganze Fahrt | Zoom Orbit → Taucherbrille: Dichte je Zelle ±10 % über alle Stufen, keine Ladepause |

### leben.tiere.wanderung — Wanderung und Raum

Über welche Strecken ein Tier im Spiel zieht, ob die Route aus Futter und Wetter folgt und ob es heimfindet.

**Stand: 0 (unter der Leiter).** Leine 18 m × Körpergröße (tetrapoda-core.js:225), Wildwechsel zur Tränke aus Durst — headless; Streifgebiet im Fenster nie gemessen; keine Wanderung.

*Quelle:* 08-tiere L6 · 10-oekologie L8 (Sprosse 5)

| Sprosse | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 10 m: Leine um den Geburtsort | Aufenthalt folgt dem Lebensraum | P1 | Aufenthaltsfläche eines Individuums über 1 Spieltag im Fenster |
| 2 | 10² m: Revier, Fluchtstrecke, Wildwechsel zur Tränke | Weg aus Durst | P2 | Streifgebiet eines Individuums über 1 Spieltag |
| 3 | 10³ m: Streifgebiet nach Feldmaß (Rothirsch 1–10 km²) | Wildwechsel als Pfad im Boden sichtbar | P | Spur über 7 Spieltage: Streifgebiet im Band der Telemetrie ±Faktor 2 |
| 4 | 10⁴ m: Sommer- ↔ Wintereinstand | Höhenwanderung folgt dem Schnee | P · Jahres-Zeitraffer | Höhen-Median der Art Winter vs. Sommer im Band |
| 5 | 10⁵ m: Gnu-Zug folgt dem Regen, Lachs zieht stromauf | Route aus Gras und Regen, nie aus Skript | P | Regen verlegt → Zugroute verlegt sich (Gegenprobe); Lachs findet den Geburtsbach ≥ 0,9 |
| 6 | 10⁶–10⁷ m: Vogelzug über Kontinente | Kurs aus Magnet-, Sternen- und Sonnenkompass, Rast an Feuchtgebieten | P · Ankunft an jedem Ort der Route | Individuum über 1 Spieljahr: Strecke, Rastplätze, Ankunft im Brutgebiet ±7 Spieltage |
| 7 (Vision) | 7·10⁷ m: planetare Wanderung (Küstenseeschwalbe ≈ 70 000 km/Jahr), auf jedem Planeten | Zugrouten verschieben sich mit dem Klima | P | Klima-Zeitraffer: Zugscheide verschiebt sich mit der Isotherme |

### leben.tiere.mensch — Tier und Spieler: Begegnung, Reittier, Domestikation, Tier-Sein

Wie tief der Spieler mit Tieren umgehen kann — bis dahin, dass er jedes Tier einer Stichprobe mit dessen Leib und Sinnen SPIELT.

**Stand: 0 (unter der Leiter).** Fluchtdistanz aus dem Furcht-Gesetz und ein gebundenes Tier folgt 600 s (alte Ökologie K3/K5) — headless; Reit-, Haus-, Spiel-Tiere: nichts.

*Quelle:* 08-tiere L8 (Stadt- und Nutztiere → leben.kopplung.stadt-im-netz) · *alte Karte:* Ökologie K5 (Bindung)

| Sprosse | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Wildtier reagiert auf den Spieler, 4 Gattungen | Fluchtdistanz je Art im Feldband ±50 % | P1 | Annäherungs-Probe im Fenster |
| 2 | Fährte, Losung, Beobachten, Jagd | Spur und Losung führen zum Tier | P2 | einer frischen Spur folgen → Tier in ≤ 10 min ≥ 0,8 |
| 3 | Haus- und Reittier: Hund folgt, Pferd reitbar | Gang des Reittiers aus seinem Leib, nicht als Fahrzeug | P · Reiter in Bewegung | Fußfall des Pferds unter Reiter ±0,05; Hund kehrt auf Ruf ≥ 0,9 |
| 4 | Domestikation aus der Wildform über Generationen | Hund aus Wolf, Rind aus Ur sichtbar abgeleitet | P · Zeitraffer | Bild-Embedding: Haustier liegt näher an seiner Wildform als an jeder anderen Art ≥ 0,9 |
| 5 | der Spieler WIRD ein Tier (10 Arten) | Steuerung, Tempo, Sprung aus dessen Leib | P · Wechsel ohne Ladepause | Tempo und Sprung ±10 % zum wilden Artgenossen |
| 6 | 10² Stichproben-Arten spielbar mit ihren Sinnen (Adler sieht scharf, Hund riecht, Maulwurf tastet) | die Wahrnehmung ist die des Tiers | P | Blind-Panel erkennt die Art an der Ego-Aufnahme ≥ 0,7 |
| 7 (Vision) | jedes Tier jedes Planeten spielbar, fremde Sinne als Perspektive | Leib und Sinn aus dem Samen | P | 100 fremde Saaten: jede Art spielbar, Tempo ±10 %, Panel ≥ 0,7 |

## Leben im Wasser

### leben.wasser.lebensraeume — Lebensräume im Wasser entstehen aus Physik

Welcher Anteil der Wasser-Lebensräume (Messliste 15: Bach, See, Küstenflachwasser, Ästuar, Kelp, Seegras, Mangrove, Riff, offene See, Polarmeer, Tiefsee-Ebene, Hydrothermalquelle, Walfall, Höhle, Gezeitenzone) aus der Physik einer Saat entsteht, samt seiner Flora.

**Stand: 0 (unter der Leiter).** 1 von 15: der Bach-Kolk mit Forellen am Strömungsschatten — headless, Preis an der Fisch-Pose nie gemessen; Uferflora teils; das Meer ist Höhe und Wasserkörper, kein Lebensraum.

*Quelle:* 09-meeresleben L3 · 07-pflanzen L9 (Sprossen 1–2) · *alte Karte:* Leben in Luft und Wasser K3 (teils)

| Sprosse | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 von 15: Bach-Kolk mit eigener Fauna | Stand am Strömungsschatten (Fausch 1984) | P1 · am Bach | Lebensräume mit eigener Fauna im Bild zählen |
| 2 | 3 von 15: Bach, See, Küstenflachwasser mit Uferflora (Schilf, Erle, Weide) | See-Fauna ohne Strömung; Ufer-Zonierung; Landarten im Wasser 0 | P2 je Lebensraum | Klassifikator erkennt den Lebensraum ≥ 80 %; Ufer-Stichprobe ≥ 90 % |
| 3 | 7 von 15: + Kelpwald, Seegras, Mangrove, Gezeitenzone | sie stehen, wo die Physik sie verlangt (Kelp kalt mit Auftrieb, Seegras nach Lichttiefe) | P · im Kelpwald | 50 Saaten: Lage gegen Meeresklima ≥ 90 %; Tauchbild gegen Unterwasserfoto ≥ 0,7 |
| 4 | 11 von 15: + Riff, offene See, Polarmeer, Ästuar | das Riff nur, wo es warm, klar und flach ist | P · am Riff | 50 Saaten: Fehlplatzierung < 5 % der Riff-Fläche; Klassifikator erkennt das Riff ≥ 80 % |
| 5 | 15 von 15, auch die dunklen | Leben ohne Licht von Chemie, Biolumineszenz | P · im Abstieg 0 → 4 000 m | Faunenwechsel je Zone gegen das Referenz-Profil (Epi- bis Bathypelagial) |
| 6 | Erd-Maß: 30–100 unterscheidbare Provinzen je erdähnlicher Saat (Erde 62) | Grenzen folgen Temperatur, Salz, Licht, Tiefe | P | 200 Saaten: Lebensraum-Karte gegen das Nischenfeld, Fehlplatzierung < 5 % |
| 7 (Vision) | fremde Ozeane: Methan-Seen, Ozeane unter Eis, Superdruck-Meere | eigene Lebensräume aus fremder Chemie durch dieselben Gesetze | P je Saat | ≥ 50 % der fremden Saaten mit bewohntem Lebensraum ohne Erd-Gegenstück; 0 % bewohnte Zonen ohne Energiequelle |

### leben.wasser.bild — Das Bild unter Wasser: Licht, Trübe, Leib

Wie wahr Licht, Wasserfarbe und Lebewesen unter Wasser aussehen, von der Bachforelle bis zur Tiefsee fremder Planeten.

**Stand: 0 (unter der Leiter).** Sicht 19,6 m am Bach, Absorption und Rückstreuung je Kanal nach Gordon 1975 (stamm/bild-sicht.js:217) — headless; 3 feste Wasserkörper, das Meer liest den See-Körper; Fischleib ein Oktaeder.

*Quelle:* 09-meeresleben L4 · *alte Karte:* Gelände K3 / H2 Wasser-Bild (Bühne), Material H3 Spiegel (Bühne)

| Sprosse | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Sicht unter Wasser an Bach, See, Fluss | Absorption und Rückstreuung je Kanal | P1 | Sichtweite in m an fester Pose gegen das Band des Gewässertyps |
| 2 | Fischleib als Art lesbar | Flossen, Schuppenglanz, Seitenlinie | P2 · 1 m vor einem Schwarm | Bildpaar 1 m vor dem Fisch: Blindtest erkennt die Art ≥ 80 % |
| 3 | Lichtfinger und Kaustik im Flachwasser | folgen Welle und Sonnenstand | P · bei Seegang | Richtung der Lichtfinger ±5° zur Sonne; Kaustik-Kontrast im Band des Fotos |
| 4 | Wasserfarbe je Ort: alle 14 Jerlov-Typen | Plankton und Schwebstoff AM ORT färben, die Mündung trübt | P | Farbmessung gegen die Jerlov-Klasse des Orts: ΔE ≤ 10 je Typ |
| 5 | Tiefe 0 → 1 000 m | Rot fällt, dann Grün, dann alles; Biolumineszenz trägt das Dunkel | P · im Abstieg | Spektrum am Auge je 100 m gegen Ozean-Profil, Fehler ≤ 20 % |
| 6 | Riff und Kelpwald im Nahbild: Tausende Formen je Bild, Meeresschnee | kaum vom Foto zu trennen | P · am Riff | Panel unterscheidet Spiel und Foto in ≤ 60 % |
| 7 (Vision) | jedes Wasserbild jedes Planeten | Fotorealismus unter jeder Sonne und Chemie | P je Szene | erdähnlich: Blindtest 100 Szenen ≤ 55 %; fremd: gegen offline spektrales Path-Tracing ΔE ≤ 5 |

### leben.wasser.netz — Primärproduktion und Größenspektrum im Wasser

Ob Licht und Nährstoff das Plankton tragen, das Plankton die Fische und die Fische die Räuber — bis zum Größenspektrum vom Plankton zum Wal.

**Stand: 0 (unter der Leiter).** Fische folgen dem Pegel (0,335 → 0,363) und fliehen ≥ 3 m — headless; Plankton nur als Kommentar zur Trübe des See-Körpers (foundry-core.js:163), kein Feld.

*Quelle:* 09-meeresleben L5 (Kaskade → leben.oeko.dynamik, Kette → leben.kopplung.kaskade) · 07-pflanzen L9 (Sprosse 3) · *alte Karte:* Leben in Luft und Wasser K3

| Sprosse | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Fisch liest Pegel und Spieler | Fisch-Hub ≥ 0,8 × Pegel-Hub, Fluchtabstand ≥ 3 m | P1 · am Bach | Hub und Flucht aus dem Bild |
| 2 | Licht × Nährstoff → Plankton-Feld | Blüte im Frühjahr, wo Auftrieb oder Mündung Nährstoff bringt | P2 · Zeitraffer | Chlorophyll-Feld über ein Spieljahr gegen Ozeanfarben-Zeitreihe: Phase der Blüte ±1 Monat |
| 3 | Plankton → Schwarmfisch → Räuber | Fischdichte folgt der Primärproduktion | P | räumliche Korrelation Fischbiomasse ↔ Plankton r ≥ 0,6 an 50 Orten |
| 4 | volles Größenspektrum vom Plankton bis zum Wal | Biomasse je logarithmischer Größenklasse etwa gleich (Sheldon) | P | normalisiertes Biomasse-Spektrum log-log: Steigung −1 ±0,2 |
| 5 | Planet: Planktonblüten im Orbitbild | Blüten folgen Nährstoff und Licht | P · Orbit | Orbit-Zeitraffer gegen Satelliten-Chlorophyll-Karten, r ≥ 0,7 |
| 6 (Vision) | jeder Ozean jedes Planeten, fremde Primärproduktion (Chemosynthese, fremdes Licht) | das Größenspektrum hält auch fremd | P | 100 fremde Saaten: Spektrum-Steigung −1 ±0,3; Leben nur, wo Energie fließt |

### leben.wasser.rhythmen — Rhythmen des Wasserlebens: Tag bis Jahrtausend

Über welche Zeitspannen das Wasserleben wahr wirkt — von der Flucht in Sekunden bis zu Bestands-Regimen über Jahrzehnte.

**Stand: 0 (unter der Leiter).** Sekunden: Schwanzschlag, Flucht, Heimkehr nach 8 s — headless, Preis nie gemessen; keine Tagesuhr für Fische.

*Quelle:* 09-meeresleben L6 (Sprossen 0–3; Atoll → leben.kopplung.leben-formt-planet, Äonen → leben.evolution.zeitreise)

| Sprosse | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Sekunden: Schwanzschlag, Flucht, Heimkehr | Fisch kehrt nach Ruhezeit heim | P1 | Heimkehr ≥ 60 % im Fenster |
| 2 | Tag: Vertikalwanderung (die größte tägliche Tierwanderung der Erde) | Zooplankton steigt nachts, sinkt am Tag | P2 | Tiefe der Streuschicht Mittag gegen Mitternacht, Hub ≥ 200 m |
| 3 | Jahr: Blüte, Laichzug, Walwanderung | Lachse ziehen flussauf, Wale zwischen Pol und Tropen | P · Zeitraffer | Ankunft der Züge in ihrem Monat ±1 |
| 4 | Jahrzehnt: Riff-Bleiche und Erholung | Erholung über 10–15 Jahre, wenn die Wärme weicht | P · Zeitraffer | Korallendeckung über die Zeit gegen Feld-Zeitreihen ±50 % |
| 5 | Jahrhundert: Bestands-Regime wechseln (Sardine ↔ Sardelle) | Wechsel mit Wassertemperatur, ohne Skript | P · Zeitraffer | Periode des Regimewechsels 40–80 Spieljahre; Gegenprobe ohne Temperatur-Schwankung kein Wechsel |
| 6 (Vision) | jeder Rhythmus jedes Ozeans jedes Planeten (Gezeiten fremder Monde, Jahre anderer Bahnen) | der Takt folgt Bahn und Gezeit | P | 100 Planeten: Wanderung und Blüte folgen Einstrahlung und Gezeit r ≥ 0,8 |

## Ökosysteme, Kreisläufe, Zerfall

### leben.oeko.netz — Das Nahrungsnetz: Breite, Stabilität, Wahrheit

Wie viele Arten aus Saaten ein Netz bilden, das sich hält, wie nah seine Kennzahlen an realen Netzen liegen und ob die Arten in Gestalt UND Rolle verschieden sind.

**Stand: 0 (unter der Leiter).** 4 Land-Säuger mit Beute nach Masse (beuteMasse 2,0, tetrapoda-core.js:166), Bestand aus Nahrung × Lebensraum (alte Ökologie K2 2/2) — headless, unter P im Fenster nie gefahren.

*Quelle:* 10-oekologie L1 (Verteilungsgesetze → leben.oeko.vielfalt) · *alte Karte:* Ökologie K2

| Sprosse | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 4 Säuger-Arten, 3 Ebenen, ein Tal | Bestand aus Nahrung × Lebensraum | P1 · Tal mit allen 4 Arten im Bild | 8 Saaten im Fenster: jede Art in [⅓×, 3×] des Starts über 6 Spielstunden |
| 2 | 10¹ Arten, 4 Ebenen, ein Biom | Konnektanz im Band realer Wald-Netze | P2 · Waldrand, ≥ 5 Arten im Bild | 32 Saaten: ≥ 80 % halten 100 Spieljahre ohne Aussterbe-Lawine |
| 3 | 10² Arten je Biom aus der Saat | Ebenen, Omnivorie, Räuber-Beute-Massenverhältnis im Band | P | 32 Saaten: Kennzahlen im 90-%-Band von ≥ 20 realen Netzen UND 50 Zufallspaare in Gestalt UND Rolle trennbar ≥ 90 % |
| 4 | 10³ Arten, mehrere Biome eines Kontinents, Wanderer verbinden sie | sichtbares Fressen und Gefressenwerden | P · Zufallsort | 10 Spielminuten am Zufallsort: ≥ 30 sichtbar verschiedene Arten, die fressen oder gefressen werden |
| 5 | 10⁴ Arten, Meer und Land gekoppelt (Lachs düngt Wald, Seevögel düngen Inseln) | Stoff fließt über die Grenze | P | Gegenlauf ohne Lachszug: Wuchs am Ufer sinkt, Intervall ohne 0 |
| 6 | 10⁶ Arten, ein Planet, vom Tiefseegraben bis zur Wüste | das Netz hält über 1 000 Spieljahre | P an jedem Ort | 64 Saaten: kein Kollaps; Paarprobe ≥ 95 % |
| 7 (Vision) | 10⁷ Arten je Planet, jeder Planet eines Systems mit eigener Biosphäre, fremde Biochemie | gleich schlüssig wie die Erde | P · Ankunft auf jedem Planeten | 64 Saaten × 3 Planetentypen ≥ 90 % plausibel; Fachleute trennen Kennzahl-Tafeln nicht über Zufall von realen |

### leben.oeko.vielfalt — Vielfalt am Ort und ihre Gesetze

Wie viele Arten der Spieler an einem Ort je Zeit antrifft und ob die Verteilung den Gesetzen der Natur gehorcht (Arten-Areal, Breitengradient, Rang-Häufigkeit, Biomasse-Anteile).

**Stand: Sprosse 1.** Alte Tiere K5 Staffel 1: ≥ 3 Tier-Sichtungen im Ausgabe-Bild je 10 Spielminuten an einem Gerät (Klassen-Maske tier ≥ 200 px); Herde ≥ 20 und 150 Tiere im Ring offen.

*Quelle:* 08-tiere L7 · 10-oekologie L1 (Sprossen 5–6) · 10-oekologie L8 (Sprosse 6) · 07-pflanzen L1 (Sprosse 5) · 09-meeresleben L1 (Sprosse 4) · 11-evolution L1 (Sprossen 4–5) · *alte Karte:* Tiere K5

| Sprosse | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 **HEUTE** | ≥ 3 Tier-Sichtungen je 10 Spielminuten | Art passt zum Lebensraum (Hirsch Wiese, Bär Fluss) | P1 | Spielgang 10 min, Tier im Bild ≥ 200 px |
| 2 | 10¹ Arten je Hektar mit Vögeln, Insekten, Pflanzen; 150 Tiere im 500-m-Ring | Fauna wechselt mit Biom und Uhr | P2 · Ego und Third | Arten je ha in 10 min gegen Feldkartierung ±Faktor 2 |
| 3 | 10² Arten je Hektar; ≥ 50 Pflanzenarten zugleich im Bild | Tag ≠ Nacht, Sommer ≠ Winter | P | Arten-Akkumulationskurve gegen Feldkurve; Jaccard Tag/Nacht und Sommer/Winter ±0,15 |
| 4 | 10³ Arten je Hektar Regenwald, Kronendach anders als Boden | Gliederfüßer tragen die Masse der Arten | P · Regenwald-Hektar | Zählung je Hektar gegen Regenwald-Inventur ±Faktor 2 |
| 5 | Flächen 1 ha … 10⁴ km² | Arten-Areal S = c·A^z (Land z 0,15–0,35, Meer 0,15–0,4); Rang-Häufigkeit lognormal | P · Flug über die Flächen | z aus Zählungen im Spiel, im Band bei ≥ 80 % der Saaten |
| 6 | Planet längs eines Meridians, Land und Meer | Breitengradient Tropen ÷ Tundra ≥ 10; Biomasse Pflanzen ~80 %, Tiere < 1 % | P · Flug längs des Meridians | Arten je Fläche über die Breite; Biomasse-Anteile gegen Bar-On 2018 |
| 7 | Endemiten-Zentren: Inseln, Täler, Becken | Artenwechsel zwischen getrennten Räumen größer als innerhalb | P | 200 Saaten: Beta-Diversität getrennt > verbunden; Endemiten-Anteil Insel > Festland |
| 8 (Vision) | jeder Ort jedes Planeten trägt seine Vielfalt, ohne dass der Spieler sie ruft | sie lebt ohne den Spieler weiter | P · Ankunft an beliebigem Ort | Rückkehr nach 1 Spieljahr an 100 Orte: Bestand verändert nach Saison und Jagd, nie zurückgesetzt |

### leben.oeko.dynamik — Dynamik: Zyklen, Kaskaden, Ausbrüche, Invasionen

Ob das Netz in der Zeit lebt — Schwingungen, Kaskaden und Ausbrüche entstehen aus der Bilanz, nie aus einem Zeitplan.

**Stand: 0 (unter der Leiter).** Wölfe weg → Hirsche +0,448 [0,321; 0,536], Jungwuchs −0,279 über 8 Saaten (alte Ökologie K1 2/2) — headless, im Fenster nie.

*Quelle:* 10-oekologie L2 (Massenaussterben → leben.evolution.zeitreise und leben.kopplung.evolution-planet) · 09-meeresleben L5 (Sprosse 5) · *alte Karte:* Ökologie K1, Ökologie K3 (teils)

| Sprosse | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | ein Tal, Spielstunden | Wölfe weg → Hirsche hinauf, Jungwuchs hinab | P1 · Zeitraffer im Fenster | Kaskaden-Richtungen mit Intervall, das 0 nicht schneidet |
| 2 | ein Tal, 10 Spieljahre, sichtbar | die Kaskade im Bild: Jungwuchs am Fluss | P2 · Zeitraffer | Bildpaar gleicher Kamera vor/nach 10 Spieljahren ohne Wölfe: Jungwuchs-Deckung −≥ 20 % gegen Gegenlauf |
| 3 | ein Biom, 10² Spieljahre | Räuber-Beute-Schwingung mit Phasenversatz | P · 100 Spieljahre in ≤ 60 s Wanduhr | Periode 8–11 Jahre, Räuber hinkt 1–2 Jahre nach (Hudson-Bay-Reihen) |
| 4 | Landschaft 10³ km² | Massenvermehrung bricht aus und zusammen | P · mitten im Ausbruch | Ausbruch in ≥ 1 von 8 Saaten je 50 Spieljahre; braune Waldfläche gegen Luftbild-Reihe eines Borkenkäfer-Ausbruchs |
| 5 | Küste und Meer: Kaskade Otter ↔ Seeigel ↔ Kelp, Überfischung → Quallen | eine Störung läuft 3 Glieder weit | P · Zeitraffer | Räuber entfernt: Kelpfläche fällt nach dem Muster der Feldstudien (Estes & Palmisano 1974) |
| 6 | Kontinent, 10³ Jahre | eingeschleppte Art breitet sich als Front aus und baut das Netz um | P | Front-Tempo im Band realer Invasionen (10–60 km/Jahr) |
| 7 (Vision) | jeder Planet, 10⁴ Jahre, alle Dynamiken zugleich | Zyklen, Ausbrüche, Kaskaden emergent und ohne Skript | P · Zeitsprung ≤ 5 s | 64 Saaten: Bestandsreihen schwingen nur, wo Räuber-Beute-Paare es tragen (Gegenprobe Paar entfernt → Zyklus weg) |

### leben.oeko.zerfall — Zerfall: Aas, Totholz, Pilz, Boden

Ob alles Tote sichtbar, in der Zeit und stofflich in den Kreislauf zurückkehrt.

**Stand: 0 (unter der Leiter).** Kadaver wird gewittert, gefressen, sinkt (tetrapoda-core.js:168); gedüngt wird nur ein Tod von Spieler-Hand (stamm/kreatur-leben.js:918); Totholz und Konsolen-Pilze als zeitlose Gestalt (foundry-core.js:5155).

*Quelle:* 10-oekologie L3 (Mikro-Perspektive → leben.evolution.mikroben) · *alte Karte:* Tiere H3 Kadaver

| Sprosse | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Säuger-Kadaver | gewittert, gefressen, sinkt in die Erde; JEDER Tod düngt die Zelle | P1 · Kadaver mit Fressern im Bild | Kadaver-Masse sinkt mit Fresser-Zahl; Nährstoff steigt nach jedem Tod (Wolf, Alter, Spieler) |
| 2 | 10 Kadaver jeder Größe zugleich | Verwesungsstufen; Ankunftsfolge der Aasfresser emergent aus Witterung und Anflug | P2 · 10 Kadaver im Bild | Bildreihe 0/3/10/30 Tage gegen forensische Referenz; Gilde-Folge im Band von Kamerafallen-Studien |
| 3 | Totholz eines Waldes über Jahrzehnte | Zerfallsklasse WÄCHST, Moos, Konsolen-Pilz, Ammenstamm mit Sämlingen | P · Altwald im Bild | Bildreihe 0/10/40 Spieljahre am selben Stamm; Totholz 10–30 % der Biomasse |
| 4 | Pilze eines Bioms | Fruchtkörper nach Regen × Temperatur, Hexenringe | P | Pilzdichte 3–10 Tage nach Regen ≥ 5× Trockenzeit |
| 5 | Boden jeder Zelle eines Kontinents | Streu → Humus → Profil, Tempo nach Klima | P | Streu-Halbwertzeit Tropen < 1 Jahr, Boreal > 5 Jahre |
| 6 (Vision) | jeder tote Körper jedes Planeten; der Walfall nährt die Tiefsee Jahrzehnte | Bilanz geschlossen | P | Stoffbilanz eines Bioms über 100 Spieljahre: Fehlbetrag ≤ 1 %; Walfall-Gemeinschaft über 50 Spieljahre in der Bildreihe |

### leben.oeko.sukzession — Sukzession: EIN Gesetz für jede Wunde

Ob das Leben jede Störung durch DASSELBE Gesetz zurückerobert — wachsend in Fläche, Zeit und Zahl der Störungsarten, bis zur verlassenen Metropole.

**Stand: 0 (unter der Leiter).** Brand → Asche → Gras → Busch → Wald, Halme 477 → 70 → 491, Sämling 0 → 1 (stamm/feld-leben.js) — Mechanik belegt, unter P im Bild ungemessen.

*Quelle:* 10-oekologie L4 · 07-pflanzen L3 (Sprosse 4) · 07-pflanzen L6 (Sprossen 4–5) · *alte Karte:* Stoffe K5 (Sukzession)

| Sprosse | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Brand-Zellen um das Dorf | Brand → Asche → Gras → Busch → Wald, Asche düngt | P1 · Brandfläche im Bild | Halm-, Asche- und Sämling-Zahlen über die Zeit im Fenster |
| 2 | 1 km² Waldbrand aus Brennstoff und Wind | Mosaik mit Überlebenden-Inseln; Feuer-Regime je Biom | P2 · Überflug | Bildpaar nach 1/5/25 Spieljahren gegen die Yellowstone-1988-Fotoreihe |
| 3 | ein Tal, 5 Störungsarten (Brand, Rodung, Flut, Lawine, Verlassen), auch frei ausgelöst | der Pfad hängt an der Ausgangslage: Boden, Samenbank, Überlebende | P | 5 Arten × 8 Saaten: Deckungs-Kurven im Band realer Chronosequenzen ≥ 80 % |
| 4 | Primärsukzession auf nacktem Fels über 10³ Jahre: Lava, Gletschervorfeld | Flechte → Moos → Farn → Strauch → Wald | P · 1 000 Spieljahre in ≤ 60 s | Deckung nach 10/100/1 000 Jahren im Band der Hawaii-Chronosequenz |
| 5 | verlassene Metropole ≥ 10⁴ Gebäude | Pflanzen sprengen Asphalt, Dächer fallen, Wald schließt sich | P · die Stadt im Bild | Bildpaar 0/30/100 Jahre gegen Fotoreihen verlassener Städte; Kronendeckung steigt |
| 6 | neue Insel, Kontinent nach der Eiszeit, 10⁴ Jahre | Insel-Biogeographie; Rückwanderung der Wälder | P · Zeitraffer 10⁴ Jahre | Artenzahl folgt Zuzug × Aussterben nach Größe und Abstand; Wald-Front 100–1 000 m/Jahr gegen Pollen-Profile |
| 7 (Vision) | jeder Planet nach jeder Katastrophe | viele Pfade, Rückschläge, nie gleich zweimal | P · Zeitsprung ≤ 5 s | 16 Saaten × 4 Störungen: ≥ 90 % im Band realer Chronosequenzen UND paarweise verschieden |

### leben.oeko.stoffe — Stoffkreisläufe: Kohlenstoff, Stickstoff, Sauerstoff, Wasser

Ob das Leben die Chemie seines Planeten trägt und ändert — vom Nährstoff einer Zelle bis zur Biosignatur fremder Atmosphären.

**Stand: 0 (unter der Leiter).** EIN Nährstoff-Skalar je Zelle (stamm/feld-leben.js:3736: Fällen −0,3, Ernte −0,02, Brand +0,4, Riss +0,2); Ernte 15× → 1 → 0,7 belegt, Wuchs im Bild ungemessen; kein ökologischer C, N, O.

*Quelle:* 10-oekologie L5 · 07-pflanzen L6 (Sprosse 6) · *alte Karte:* Stoffe K5 (Nährstoff)

| Sprosse | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | ein Nährstoff je Zelle | Ernte und Fällen nehmen, Asche und Leichnam geben | P1 · Acker im Bild | Ernte 15× → Nährstoff 1 → 0,7, Wuchs sinkt sichtbar im Bildpaar |
| 2 | N und P getrennt je Zelle | Leguminosen und Erle binden N, P aus Gestein | P2 · beide Wiesen im Bild | Bildpaar Wiese mit Klee neben Wiese ohne nach 5 Spieljahren: Wuchs-Unterschied |
| 3 | Kohlenstoff eines Bioms | Biomasse + Boden-C als Bilanz; Brand gibt frei, Moor speichert | P | C-Vorrat je ha im Band (Tropenwald ~200 t C, Steppe ~10 t) |
| 4 | Kontinent, ein Jahr | saisonale CO₂-Säge emergent aus dem Laub-Jahr | P · Zeitraffer 1 Jahr | Amplitude nördlich > südlich, Phase mit dem Frühling gegen die Mauna-Loa-Kurve |
| 5 | Planet, Jahrhunderte | Wald macht Regen, Rodung trocknet das Lee | P | Niederschlag im Lee eines gerodeten Großwalds sinkt gegen Gegenlauf, Intervall ohne 0 |
| 6 | Planet, Äonen | O₂ steigt aus Photosynthese, verzögert durch Eisen und Methan | P · Zeitsprung ≤ 5 s | Sauerstoff-Sprung im Fenster 2,5–2,0 Mrd. Jahre in ≥ 70 % erdähnlicher Saaten; Bändereisen im Gestein sichtbar |
| 7 (Vision) | jeder Planet, jede Chemie: Methan-, Schwefel-, Ammoniak-Biosphären | geschlossene Bilanz, Atmosphäre im Ungleichgewicht | P | 32 fremde Saaten: Biosignatur, die ohne Leben verschwände; Bilanzfehler ≤ 1 % |

### leben.oeko.partner — Wechselbeziehungen: der Partner verschiebt die Bilanz

Ob Arten einander brauchen und schaden — Bestäubung, Pilzpartner, Seuche, Ko-Evolution — geprüft stets durch denselben Richter: den Partner entfernen, die Folge sehen.

**Stand: 0 (unter der Leiter).** Bestäuber folgen den Blüten, r 0,8 an 9 Orten (alte Leben in Luft und Wasser K4) — headless gerendert, Preis im Fenster nie; Einbahn: die Blüte merkt den Besuch nicht.

*Quelle:* 10-oekologie L6 · 11-evolution L8 (Sprosse 2) · 11-evolution L9 (Sprosse 2) · *alte Karte:* Leben in Luft und Wasser K4

| Sprosse | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Bestäuber an der Mess-Wiese | Dichte folgt Blüten, Pflege und Uhr (Einbahn) | P1 · Wiese im Bild | r(Bestäuber, Blüten) ≥ 0,5 aus dem Bild |
| 2 | eine Wiese, beide Richtungen | der Besuch entscheidet den Samenansatz | P2 | Gegenlauf ohne Bestäuber: Blüten-Dichte im Folgejahr −≥ 30 % im Bildpaar |
| 3 | ein Wald | Pilz-Partner der Bäume; Schatten-Sämlinge zehren vom Netz | P | Gegenlauf ohne Pilz: Sämlinge im Schatten −≥ 30 % Wuchs |
| 4 | ein Biom: Parasit, Erreger, Seuche | Ausbruch nur über einer Dichte-Schwelle; Bestand und Verhalten antworten | P · erkrankte Herde im Bild | 8 Saaten beidseits der Schwelle; Ausbruchskurve mit R₀ im Band, Gegenlauf ohne Kontakt |
| 5 | Kontinent: Ko-Evolution | Blüte ↔ Bestäuber in Form und Farbe, Räuber ↔ Beute im Wettrüsten | P · Zeitraffer ≤ 60 s | Rüssellänge ↔ Kronröhre r ≥ 0,7; Laufgeschwindigkeit beider steigt korreliert |
| 6 | Planet: Lebensräume auf Symbiose (Riff, Flechte) kippen als Ganzes | Kipp-Punkt sichtbar | P · Riff im Bild | Wärme-Gegenlauf: Korallenfarbe kippt im Bildpaar, Fischarten −≥ 50 % |
| 7 (Vision) | 10⁶+ Arten: jede hat Partner, Feinde, Gäste | Verschachtelung wie reale Netze | P | 64 Saaten: ≥ 50 % der Arten mit ≥ 1 Mutualist; 20 Zufallsarten entfernt → Ko-Aussterben im Band der Literatur |

## Evolution und fremdes Leben

### leben.evolution.stammbaum — Stammbaum: Arten mit Abstammung, lebend und ausgestorben

Ob die Arten eines Samens einen Baum bilden, dessen Verwandtschaft im Bild SICHTBAR ist, und ob jedes Blatt — auch ein ausgestorbenes — als Körper besuchbar ist.

**Stand: 0 (unter der Leiter).** keine Abstammung: Würfe sind Hash(Saat, Zelle) (stamm/kreatur-fauna.js:125); `STAMMBAUM` ist der Name eines Studios (tetrapoda-core.js:5185); Ankunft 11–17 s.

*Quelle:* 11-evolution L1 (Arten-Areal und Breitengradient → leben.oeko.vielfalt)

| Sprosse | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 10 Arten mit gemeinsamem Ahn | Verwandtschaft ist sichtbar | P1 | Gestalt-Baum aus Third-Bildern gegen den Baum des Samens: Robinson-Foulds ≤ 0,3; Mutante „Erbe aus“ → Zufall |
| 2 | 10² Arten | Baumgestalt wie reale Kladen (Colless-Unbalance im Band) | P2 · Baum-Blick öffnet ≤ 1 s | Colless aus 100 Saaten gegen reale Kladen |
| 3 | 10³ Arten | jedes Blatt hat Ort und Nische | P · Blatt → Körper ≤ 2 s | 100 Zufallsblätter: als laufender Körper an plausiblem Ort ≥ 90 % |
| 4 | 10⁴ Arten | Gestalt-Abstand wächst mit Baum-Abstand | P | Mantel-Korrelation Bild-Deskriptoren ↔ Baum-Distanz r ≥ 0,5 |
| 5 | 10⁶ lebende Arten je Planet | Stichprobe plausibel (bewegt sich, frisst, passt zur Nische) | P · Ankunft mit 10⁶ vs. 10³ Arten ≤ 10 % Unterschied | Zufallsstichprobe 1 000 ≥ 95 %; Ankunft-ABAB 10⁶ ↔ 10³ |
| 6 | 10⁹ Arten über die Zeit (> 99 % ausgestorben) | jede je gelebte Art an ihrem Ort in ihrer Epoche | P · Sprung ≤ 5 s | 100 Zufallsblätter der ganzen Geschichte: nach Sprung als Körper in der Epoche ≥ 95 % |
| 7 (Vision) | 10⁹ (Mikroben bis 10¹²) × unbegrenzt viele Planeten-Saaten | Natur-Foto und Spiel-Bild in der Breite nicht zu trennen | P | 1 000 Blätter aus 10 Saaten, Kladen-gewichtet: Blindtest ≤ 60 % |

### leben.evolution.erbe — Individuum und Erbe: keines dem anderen gleich

Ob Kinder ihren Eltern sichtbar gleichen, jedes Individuum wiedererkennbar und beständig ist — bis zu Milliarden je Planet mit Ahnenlinie.

**Stand: 0 (unter der Leiter).** Bestand als Zahl je Revier, kein Erbe; Individuen einer Gattung bis auf Würfe gleich (GESTALTEN_JE_REZEPT = 1).

*Quelle:* 11-evolution L2 · 08-tiere L4 (Sprosse 5) · 10-oekologie L8 (Sprosse 7)

| Sprosse | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Linie über ≥ 10 Generationen | Kind gleicht Eltern im Bild | P1 | Morphometrie aus Third-Bildern: Eltern-Kind-Regression 0,2–0,8; Mutante „Erbe aus“ → ≈ 0 |
| 2 | 10² Individuen einer Herde | jedes wiedererkennbar an Muster, Größe, Narbe, Gang | P2 | ein Individuum nach 1 Spieltag aus 100 wiedererkannt ≥ 90 % |
| 3 | der Spieler züchtet über 10 Generationen | Antwort auf Selektion R = h²·S ±20 % | P · Zeitraffer ≤ 60 s | Merkmalsmittel vorher ↔ nachher im Bild der Herde |
| 4 | 10⁴ Individuen im Schirm | Merkmals-Streuung wie in der Natur | P mit 10⁴ im Bild | Variationskoeffizient der Körpermaße aus dem Bild im Band |
| 5 | 10⁶ in einer Region, beständig | dasselbe Tier morgen am selben Ort, mit Spuren seines Lebens | P · Bildzeit bei 10⁶ vs. 10³ ≤ 10 % | 100 markierte Tiere nach Abreise und Rückkehr wiedergefunden ≥ 99 %, Verbleib (Tod, Zug, Nachwuchs) plausibel ≥ 90 % |
| 6 (Vision) | 10¹⁰⁺ je Planet (Erde ≈ 5·10¹⁰ Vögel allein) | jedes mit Ahnenlinie, die zu seinen Nachbarn passt | P | 100 Zufallsindividuen: Ahnenlinie zurück bis zur Klade; Verwandte im Revier gleichen ihm messbar mehr als Fremde |

### leben.evolution.muster — Die Experimente der Natur aus EINEM Gesetz

Den Anteil eines VOR dem Bau eingefrorenen Kanons K30 von 30 evolutiven Mustern (Selektion, Drift, Artbildung, Bergmann, Insel-Regel, Radiation, Konvergenz, Rote Königin, Mimikry, Neuheit, Kontingenz …), die mit Gegenlauf in 100 Saaten erscheinen.

**Stand: 0 (unter der Leiter).** 0 von 30; die ökologischen Muster (Kaskade, Holling III) zählen in leben.oeko.

*Quelle:* 11-evolution L3 · 08-tiere L4 (Sprossen 6–7) · 09-meeresleben L1 (Sprosse 5, Konvergenz)

| Sprosse | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1/30: Antwort auf Selektion | Steigung im Band der Natur | P1 · Zeitraffer 10³ Generationen ≤ 60 s | Räuberdruck auf große Hirsche → Größe sinkt im Bild; Gegenlauf ohne Räuber |
| 2 | 3/30: + Drift, Isolation → Art | Varianz ∝ 1/N; nach Trennung Paarungs-Anteil < 5 % | P2 · Zeitraffer 10⁵ Generationen ≤ 60 s | Insel N = 20 vs. 2 000; getrennte Bestände im Bild-Embedding trennbar ≥ 0,9 |
| 3 | 10/30 | jedes im Band der Literatur | P | Statistik aus 100 Saaten, je Muster mit Gegenlauf |
| 4 | 20/30 mit Konvergenz und Neuheit | Spindelform in ≥ 2 getrennten Linien; Merkmal, das nicht im Start-Bauplan stand | P | Konvergenz in ≥ 80 % der Saaten; Anteil Saaten mit neuer Funktion |
| 5 | 30/30 + Kontingenz | gleicher Same, andere Mutations-Folge → andere Neuheit | P | Wiederholungs-Paare: gleiche Folge → byte-gleiches Bild, andere Folge → anderes |
| 6 (Vision) | 30/30 auf 10 fremden Physiken | dieselben Gesetze, andere Erscheinung | P | K30 auf 10 Planeten-Saaten mit g, Licht, Lösungsmittel außerhalb der Erde |

### leben.evolution.zeitreise — Zeitreise durch die Geschichte des Lebens

Ob der Spieler an jeden Punkt der Geschichte DESSELBEN Planeten reisen und dort Flora und Fauna antreffen kann, die dessen Evolution damals trug — und ob die Kurve der Vielfalt stimmt.

**Stand: 0 (unter der Leiter).** nur Gegenwart, Arten fest; keine Epochen-Flora oder -Fauna; Ankunft 11–17 s.

*Quelle:* 11-evolution L4 · 07-pflanzen L7 · 08-tiere L9 · 09-meeresleben L6 (Sprossen 5–6) · 10-oekologie L2 (Sprossen 6–7)

| Sprosse | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 10⁴ Jahre zurück, eine Epoche | Flora und Fauna unterscheidbar von heute und verwandt mit heute | P1 · Zeitsprung | Panel ordnet Bildpaare Gegenwart/Epoche ≥ 0,8; Hin- und Rücksprung byte-gleiches Bild |
| 2 | 10⁵ Jahre: Eiszeit | Megafauna, Tundra-Flora, Wälder in Refugien | P2 · Sprung ≤ 10 s | Körpermassen-Median über dem der Gegenwart; Biom-Anteile gegen Paläo-Rekonstruktion ±20 % |
| 3 | 10⁶ Jahre | Ahnen und Schwestern der heutigen Arten | P · Sprung ≤ 5 s | 20 Arten am Zielpunkt: Ahn oder Schwester einer heutigen = 100 % |
| 4 | 10⁷ Jahre: andere Ordnungen, Grasland breitet sich aus | Linien verfolgbar | P | 100 heutige Arten: Vorfahr auffindbar und im Bild-Embedding näher als jede andere Art ≥ 0,8 |
| 5 | 10⁸ Jahre: andere Ära, Riesen bis 70 t, Steinkohlewald ohne Blüte und Gras | Organe nur nach ihrem Erfinden (keine Blüte vor Samen) | P · Riesen im Bild | Blind-Sortierung von Bildern aus 10 Epochen nach Alter ≥ 90 % |
| 6 | 5·10⁸ Jahre: Kambrium-Meer, Landeroberung im Devon | wenige Baupläne, schnelle Radiation | P | Baupläne je Epoche steigen früh steil und flachen ab wie im Fossilbericht; Panel ordnet 20 Unterwasserbilder ≥ 70 % |
| 7 | 4·10⁹ Jahre durchgehend: Einzeller → Vielzeller → Land → Luft | Vielfaltskurve mit Einbrüchen ≥ 50 % und Erholung über 5–10 Mio. Jahre | P · Sprung ≤ 5 s | Diversität an 50 Zeitpunkten gegen die Gestalt der Sepkoski-Kurve, Rangkorrelation ≥ 0,6 |
| 8 (Vision) | jeder Zeitpunkt jedes Planeten, eigene Evolution je Saat | die Gegenwart ist das Ergebnis der Vergangenheit | P · jeder Sprung ≤ 5 s | Ereignis der Vergangenheit verlegt → Gegenwart ändert sich, sonst byte-gleich; 100 Saaten × 10 Epochen konsistent ≥ 95 % |

### leben.evolution.bauplan — Bauplan-Raum: wie fremd und vielfältig die Körper werden

Das Volumen des Morphoraums aus Silhouetten- und Bewegungs-Deskriptoren von 1 000 Zufalls-Wesen gegen heute und gegen Natur-Bildsätze (Disparität).

**Stand: 0 (unter der Leiter).** 4 Säuger-Gestalten über 5 Dials, gemischt per Gauß-Gewicht (ART_GESTALT, tetrapoda-core.js:3826), dazu je ein Gesetz für Vogel, Fisch, Bestäuber — die Punkte setzt der Mensch.

*Quelle:* 11-evolution L5 · *alte Karte:* Tiere K3 (Gang als Boden)

| Sprosse | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Volumen ×10 gegen heute | jede Form bewegt sich ohne Schlupf, ohne Durchdringung | P1 | 1 000 Zufalls-Genome: Bewegungs-Anteil ≥ 95 % |
| 2 | ×10²: Laufen, Schwimmen, Fliegen, Schlängeln ENTSTEHEN | Abdeckung des irdischen Tetrapoden-Morphoraums ≥ 50 % | P2 | Deskriptoren gegen Natur-Bildsatz der Tetrapoden |
| 3 | ×10³ über Stämme (Gliederfüßer, Weichtiere, Pflanzen-Wuchsformen) | Abdeckung irdischer Tier- und Pflanzen-Morphoräume ≥ 50 % | P | wie Sprosse 2, über alle Natur-Bildsätze |
| 4 | Bewegung lebendig | gewachsen, nicht Bausatz | P | Blindtest Spiel-Video ↔ Natur-Video in Bewegung ≤ 60 % |
| 5 | fremd: ≥ 30 % der Stichprobe außerhalb der irdischen Hülle | davon ≥ 90 % physikalisch tragend (Statik, Gang, Atmung) | P | Hüllen-Abstand + Physik-Proben im Spiel |
| 6 (Vision) | Millionen Körperformen, keine zwei gleich, mehr Disparität als die Erde | jedes Wesen liest als gewachsen, auch das nie Gesehene | P | 1 000 Wesen aus 10 Planeten: Volumen > Erde, Plausibilität ≥ 95 %, Blindtest ≤ 60 % |

### leben.evolution.fremde-physik — Dieselbe Evolution unter fremdem Stern, Schwere und Chemie

Ob Leben unter anderer Schwerkraft, Luftdichte, Strahlung und anderem Lösungsmittel den Gesetzen folgt — oder ob seine Leere erklärt ist.

**Stand: 0 (unter der Leiter).** ein Planet, g fest, eine Sonne.

*Quelle:* 11-evolution L6

| Sprosse | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | g 0,3–3 | Bein-Querschnitt folgt Masse·g | P1 | Regression aus 50 Saaten je g aus Bildern: Steigung im Band der Statik |
| 2 | Luftdichte 0,1–10 bar | Flieger-Anteil steigt mit Dichte/g | P2 | Anteil fliegender Arten über 20 Saaten, Kurve monoton |
| 3 | Stern M bis F, Doppelsterne, gezeitengebundene Welten | Pflanzenfarbe folgt dem Licht; Leben sammelt sich an der Dämmerzone | P | Laubfarbe gegen Absorptions-Optimum; Biomasse-Profil über die Terminator-Linie |
| 4 | Lösungsmittel und Temperatur: Wasser, Ammoniak, Methan-Kälte, Eis-Ozean | Lebenstempo folgt der Temperatur (Q10) | P | Bewegungs- und Lebensdauer-Tempo gegen Arrhenius |
| 5 | 10³ Planeten-Saaten | Biosphäre passt zur Physik, oder Leere ist erklärt | P je Planet | Prüfliste aus Sprossen 1–4 auf 1 000 Saaten ≥ 95 % |
| 6 | Bewohnbarkeits-Rand | Leben dünn am Rand, reich im Optimum | P | Artenzahl gegen Energiefluss je Planet: Korrelation positiv, Intervall ohne 0 |
| 7 (Vision) | unbegrenzte Welten bis zu Gasriesen-Schwebern | jede Welt mit eigener Geschichte des Lebens, keine eine umgefärbte Erde | P | 100 Welten: Prüfliste ≥ 95 %; Morphoraum-Abstand zur Erde über der Schwelle bei ≥ 50 % |

### leben.evolution.zivilisation — Bis zur Zivilisation: Verhalten, Kultur, fremde Personen

Ob Verhalten, Tradition und Kultur als Ergebnis der Evolution entstehen — bis zu nicht-menschlichen Zivilisationen, deren Bauten aus Körper und Geschichte folgen.

**Stand: 0 (unter der Leiter).** Temperament je Gattung von Hand, Verhalten als Daten, nicht vererbt; die „Evolution“ in stamm/feld-nexus.js mutiert DSL-Programme der KI, nicht Leben.

*Quelle:* 11-evolution L7 · 08-tiere L3 (Sprosse 7, Kultur)

| Sprosse | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Verhalten erblich | Kinder scheuer Eltern sind scheu | P1 | Fluchtdistanz Eltern ↔ Kind korreliert; Räuberdruck macht scheuer, Gegenlauf |
| 2 | Sozialität evolviert | Herde oder Einzelgänger aus Selektion | P2 · Zeitraffer ≤ 60 s | Gruppengröße steigt mit Räuberdichte über 100 Saaten |
| 3 | Tradition wird weitergegeben: Gesangs-Dialekte, Zugrouten, Werkzeug | Dialekt-Grenzen zwischen Populationen | P | Gesang zweier Populationen im Spektrum trennbar ≥ 0,9, innerhalb nicht; Werkzeug in ≥ 10 % der Saaten im Bild |
| 4 | kumulative Kultur | Werkzeuge werden schneller besser, als Gene es könnten | P · Zeitraffer ≤ 60 s | Werkzeug-Komplexität über Generationen, Gegenlauf ohne Weitergabe |
| 5 | erste nicht-menschliche Siedlung | Bau folgt dem Körper (Türhöhe ∝ Körper, Flieger ohne Treppen, Wasserwesen unter Wasser) | P | Bau-Maße gegen Körper-Maße der Erbauer im Band |
| 6 | Zivilisation mit Epochen | Technik aus ihrer Welt (kein Metall ohne Erz, kein Feuer unter Wasser) | P · Sprung zwischen Epochen ≤ 5 s | Stoff ↔ Welt: 0 Widersprüche in 100 Saaten |
| 7 (Vision) | Milliarden nicht-menschlicher Personen je Planet, Städte jenseits 10⁷ Einwohnern, je Planet eigene Kultur | unterscheidbar und erklärt aus Körper, Sinnen und Geschichte | P | 10 Zivilisationen aus 10 Saaten: Blind-Sortierung nach Herkunft ≥ 90 %; Bauten-Abstand zur menschlichen Architektur über der Schwelle |

### leben.evolution.mikroben — Mikroben und Ursprung: die unsichtbare Mehrheit

Ob die mikrobielle Welt sichtbar ist (Matten, Zoom bis zur Kolonie), die Kreisläufe trägt und ob Leben dort entsteht, wo Energie und Chemie es erlauben.

**Stand: 0 (unter der Leiter).** kein mikrobielles Leben (0 Treffer).

*Quelle:* 11-evolution L9 (Krankheit → leben.oeko.partner) · 10-oekologie L3 (Sprosse 6)

| Sprosse | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Matten, Biofilme, Algenbeläge sichtbar | Farbzonen folgen Temperatur und Licht (heiße Quelle, Watt, Fels) | P1 | Bildvergleich der Zonierung gegen Natur-Fotos |
| 2 | Zoom 1 m → 1 mm: Pilzfäden, Milben, Kolonien | Dichte im Band (~10⁹ Zellen je g Boden, sichtbar als Kolonien) | P2 · Zoom ohne Ladebalken | Bildvergleich am Ende des Zooms gegen Mikroskop-Aufnahmen |
| 3 | Zoom auf 10⁻⁵ m an jedem Ort | die Gemeinschaft passt zum Milieu | P · Zoom ≤ 1 s | 100 Zufallsorte: plausibel ≥ 90 % |
| 4 | 10⁶ Mikroben-Arten je Planet als Funktion | Mikroben tragen die Kreisläufe | P | Mutante „Mikroben aus“ → Streu bleibt liegen, Kreisläufe brechen sichtbar |
| 5 | Ursprung: Leben entsteht in einem Teil der Saaten | abhängig von Energie und Chemie | P · Sprung ≤ 5 s | Anteil Planeten-Saaten mit Leben steigt monoton mit dem Energiefluss |
| 6 (Vision) | bis 10¹² Mikroben-Arten je Planet, jeder Zoom-Ort jedes Planeten | unsichtbare Mehrheit, sichtbar auf Zuruf | P | Zoom-Stichprobe 1 000 Orte auf 10 Planeten ≥ 95 % |

### leben.evolution.fossil — Die Spur: das Leben im Gestein lesen

Ob der Spieler im Gestein Fossilien findet, die Arten des Baums sind, in richtiger Schichtfolge — und sie an ihrem Zeitpunkt lebend wiedertrifft.

**Stand: 0 (unter der Leiter).** keine Fossilien.

*Quelle:* 11-evolution L10

| Sprosse | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Fossil an der Fundstelle | Funde sind ausgestorbene Arten des Baums | P1 | 100 Funde: Anteil im Baum des Samens = 100 % |
| 2 | Schichtfolge | tiefere Schicht trägt ältere Formen, Leitfossilien | P2 | 100 Aufschlüsse: Superposition ≥ 99 % |
| 3 | Spurenfossilien: Fährten, Bauten, Koprolithen | die Fährte passt zum Gang der Art | P | Schrittlänge und Fußfall der Fährte ±10 % zum lebenden Gang derselben Art |
| 4 | über Kontinente | dieselbe Schicht trägt beidseits eines Ozeans dieselben Leitfossilien | P | Paar-Aufschlüsse an getrennten Küsten |
| 5 | lückenhafter Bericht wie die Natur | Hartteile über-, Weichkörper unterrepräsentiert | P | Erhaltungs-Anteile je Bauplan gegen die Natur |
| 6 (Vision) | jeder Ort jedes Planeten | was gegraben wird, lebt am Zeitpunkt der Schicht in identischer Gestalt | P · Sprung ≤ 5 s | 100 Funde, dann Sprung an ihren Zeitpunkt: Fossil ↔ lebender Körper deckungsgleich ≥ 95 % |

## Kopplungen des Lebens (R7)

### leben.kopplung.leben-formt-planet — Leben formt Gelände, Wasser und Fels

Ob das Leben die Oberfläche sichtbar umbaut — vom Trampelpfad über Biberdamm und Atoll bis zu Kalkgebirge und Kohle; die Chemie zählt leben.oeko.stoffe.

**Stand: 0 (unter der Leiter).** Trampelpfad: 17 → 3 Büschel nach 100 Gängen (alte Stoffe K4) — Zahl belegt, Bildpaar im Fenster fehlt.

*Quelle:* 10-oekologie L7 · 07-pflanzen L6 (Sprossen 2–3, 7) · 09-meeresleben L6 (Sprosse 4, Atoll) · 11-evolution L8 (Sprosse 5) · *alte Karte:* Stoffe K4 (Trampelpfad)

| Sprosse | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | ein Weg | Tritt formt Pfad | P1 · Weg im Bild | Gras-Dichte auf dem Weg −≥ 60 % gegen daneben im Bildpaar |
| 2 | ein Hang | Wurzeln halten den Hang | P2 · Starkregen im Bild | Gegenlauf: Erosion gerodet ≥ 5× bewaldet, Rutschung sichtbar |
| 3 | ein Fluss | Biber staut, Aue entsteht, Wald stirbt im Stau | P | Bildpaar 0/10 Jahre: Wasserfläche und Totholz gegen Referenz-Luftbild |
| 4 | eine Landschaft | Wölfe → weniger Verbiss → stabile Ufer | P · Zeitraffer | Ufer-Erosion mit Wölfen gegen ohne, Intervall ohne 0 |
| 5 | eine Küste über 10³ Jahre | Korallen und Mangroven bauen Land: Saum → Barriere → Atoll | P · Sprung ≤ 5 s | Riffdicke gegen Akkretionsraten; Rifftyp in Draufsicht ≥ 75 % richtig |
| 6 | Planet über 10⁸ Jahre | Kalkschalen werden Gebirge, Moor wird Kohle | P · Sprung ≤ 5 s | Kalkanteil der Kruste wächst mit dem Meeresleben; Kohleflöze in der Felswand sichtbar |
| 7 (Vision) | jeder Planet: Vulkan → Asche → Pionierflora → Wald → Torf → Kohle; das Leben hält und kippt das Klima | die Spur steht in Fels, Luft und Küste | P an jedem Glied | 32 Saaten mit und ohne Leben im Bildvergleich unterscheidbar ≥ 90 %; Zeitreise an einem Ort über 10⁶ Jahre: jedes Kettenglied im Bild belegt |

### leben.kopplung.evolution-planet — Evolution liest den Planeten

Ob Gelände, Klima, Platten und Katastrophen die Arten formen — und der Spieler mit einem Eingriff eine andere Fauna erzeugt.

**Stand: 0 (unter der Leiter).** Gattung wählt Boden-Klasse: 431/431, Gegenprobe 405/405 (alte Tiere K4) — headless, im Bild nie.

*Quelle:* 11-evolution L8 (ohne Sprossen 2 und 5) · 08-tiere L4 (Sprosse 6) · 08-tiere L9 (Sprosse 6) · *alte Karte:* Tiere K4

| Sprosse | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | Lebensraum aus dem Gelände | Gattung wählt Boden-Klasse, Gegenprobe bei anderer Saat | P1 | ≥ 0,9 der Würfe in der Boden-Klasse der Gattung, im Bild gezählt |
| 2 | Merkmal aus Klima und Boden über 10² Generationen | Fell folgt der Bodenhelligkeit, Größe dem Klima (Bergmann) | P2 · Zeitraffer | Korrelation Fell ↔ Boden ≥ 0,5, ohne Selektion ≈ 0; Bildvergleich Nord ↔ Süd |
| 3 | Vikarianz | Platten trennen → Schwesterarten beidseits | P · Sprung ≤ 5 s | Baum-Distanz wächst mit dem Trennungsalter der Kontinente |
| 4 | Katastrophe | Vulkan-Provinz oder Einschlag → Einbruch, selektiv (Kleine, Grabende, Generalisten überleben) | P · Sprung ≤ 5 s | Überlebenden-Profil gegen das Muster der Kreide-Paläogen-Grenze; ohne Ereignis keine Welle |
| 5 | Eingriff des Spielers: Gebirge heben, Meerenge öffnen | nach Zeitraffer andere Arten, deterministisch | P · Zeitraffer 10⁶ Jahre ≤ 10 s | Paar mit/ohne Eingriff: Baum-Distanz über der Schwelle, Wiederholung byte-gleich |
| 6 (Vision) | geschlossener Kreis über Äonen auf jedem Planeten | jede Art erklärt sich aus Ort und Geschichte | P | Zufallsort auf 10 Planeten: Ahnenlinie und Ereignis 100 % konsistent mit Baum und Geologie |

### leben.kopplung.stadt-im-netz — Mensch, Stadt und Meer im Netz des Lebens

Ob Siedlung, Landwirtschaft, Fischerei und Megastadt Wandler in derselben Bilanz sind — sie nehmen aus dem Netz, geben zurück, werden von Tieren besiedelt und ernährt.

**Stand: Sprosse 1.** Alte Vegetation K4 Staffel 1 an einem Gerät: 42 Häuser des Start-Dorfs, 47/51 Boxen im Bild, Halm 0 px, Boden 0 px; Staffel 2 (jedes Haus, jedes Wasser, beide Geräte) offen. Fischer, Hafen, Kulturfolger, Stoffströme der Stadt: nichts.

*Quelle:* 10-oekologie L9 · 09-meeresleben L8 · 07-pflanzen L6 (Sprosse 1) · 08-tiere L8 (Sprossen 4–5) · *alte Karte:* Vegetation K4, Ökologie K4 (teils)

| Sprosse | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 **HEUTE** | Siedlungsrand: die Natur-Wand | kein Halm im Haus, Waldsaum am Ort | P1 · Start-Dorf | Halm- und Büschel-Pixel 0 in jeder Haus-Box (Klassen-Maske) |
| 2 | Ernte, Fällen, Jagd und Fischen des Spielers | Wuchs, Bestand und Fang folgen Nutzung und Dichte | P2 | Bildpaar übernutzter Ort gegen daneben; Fang je Stunde ↔ Fischdichte an 20 Orten r ≥ 0,6 |
| 3 | ein Dorf mit Feldern, Weiden und Fang | Lage folgt Fischgründen und Boden; Überjagung lässt Bestände fallen, Schonung erholt | P · am Dorf | 50 Saaten: ≥ 70 % der Fischerdörfer am produktivsten Drittel der Küste; Fang ×3 → Bestand −≥ 50 % in 10 Spieljahren, Erholung nach Stopp |
| 4 | Stadt 10⁴ Bewohner: Kulturfolger und Nutztiere | Tauben, Ratten, Füchse, Möwen; Herden und Zugtiere der Epoche tragen die Bevölkerung | P · Stadt mit Bewohnern im Bild | Kulturfolger-Dichte Stadt > Umland, Scheue < Umland; Nutztiere und Weidefläche gegen Agrarstatistik der Epoche ±Faktor 3 |
| 5 | Metropole 10⁶–10⁷: Stoffströme | Nahrung herein, Abwasser hinaus | P · Mündung im Bild | Algenblüte und Sauerstoffloch stromab im Bildpaar gegen eine Saat ohne Stadt |
| 6 | Landwirtschaft eines Kontinents und Hafen-Megastädte | Monokultur verdrängt Bestäuber, Hecken halten sie; Stadtgröße folgt Ertrag und Hafengunst | P | Gegenlauf mit/ohne Hecken, Intervall ohne 0; Rangkorrelation Küstenstadt-Größe ↔ Meeres-Ertrag + Hafengunst ≥ 0,6 an 50 Saaten |
| 7 | Zivilisation über Epochen | Rodung ganzer Landschaften; Megafauna fällt nach Ankunft des Menschen; Fischerei-Technik je Epoche | P · Zeitsprung ≤ 5 s | Waldanteil über Jahrtausende gegen Pollen-Reihen; Panel ordnet Fischerei und Hafen ihrer Epoche ≥ 70 % |
| 8 (Vision) | Megastadt > 10⁸ Bewohner | die Stadt ernährt sich aus dem Netz ihres Planeten und kippt Biome | P · Stadt im Bild | Versorgung schließt aus der Saat-Ökologie mit Fehlbetrag ≤ 1 %; Umland mit/ohne Stadt im Bildpaar verschieden |

### leben.kopplung.kaskade — Reichweite einer Ursache durch Leben und Welt

Wie viele Glieder weit eine Ursache durch Physik, Pflanzen, Tiere, Netz und Siedlung läuft und dabei an jedem Glied im Bild sichtbar ist — der Vulkan formt die Küste formt das Leben formt die Stadt.

**Stand: 0 (unter der Leiter).** 1 Kante: Strömung → Fischstand, Ausrichtung 0,955, umgekehrt 0,973 (alte Leben in Luft und Wasser K3) — headless, Preis an der Fisch-Pose nie gemessen.

*Quelle:* NEU aus 09-meeresleben L5 (Sprossen 0, 6) · 07-pflanzen L6 (Kette) · 10-oekologie L2 · *alte Karte:* Leben in Luft und Wasser K3 (Strömung → Fisch)

| Sprosse | Umfang | Tiefe | Preis | Richter |
|---|---|---|---|---|
| 1 | 1 Kante sichtbar | Strömung → Fischstand; umgekehrte Strömung dreht die Fische | P1 · am Bach | Ausrichtung gegen die sichtbare Strömung ≥ 0,8, auch nach Umkehr |
| 2 | 2 Glieder | Wolf → Hirsch → Jungwuchs | P2 · Zeitraffer | Bildpaar mit/ohne Wolf: beide Folgeglieder im Bild verschoben, Intervall ohne 0 |
| 3 | 3 Glieder über zwei Perspektiven | Regen → Gras → Gnu-Zug | P | Regen verlegt → Zugroute verlegt (Gegenprobe) |
| 4 | 5 Glieder über Domänen | Störung an einem Ort (Vulkan, Abfluss, Fang) → Biomasse, Wasserfarbe, Küstenform | P · Zeitraffer | Messung 5 Glieder weiter: ≥ 4 von 5 ändern sich beobachtbar |
| 5 | ein geschlossener Kreis | Vulkan → Asche → Pionierflora → Weide → Herde → Siedlung → Rodung → Erosion | P · Zeitraffer | jedes Glied mit Gegenlauf: Glied aus → Kette bricht an genau dieser Stelle |
| 6 | 10² Zufalls-Störungen je Saat | Folgen laufen ohne Skript, Reichweite im Band der Natur | P | Anteil Störungen mit ≥ 3 beobachtbaren Folgegliedern ≥ 80 % |
| 7 (Vision) | jede Ursache jedes Planeten durch alle Perspektiven (Stern → Klima → Leben → Stadt → Verkehr) | die Welt als EIN Netz | P | 100 Saaten: Störung an einem Zufallsort zeigt Folgen in ≥ 5 Domänen |

## Offene Fragen (R6 — kein Richter, darum kein Punkt)

- Staunen und Würde: ob der Spieler Tiere als fühlend erlebt (Schmerz, Bindung, Trauer) und ob eine Begegnung Würde trägt — kein Richter misst das Erleben, nur das Verhalten.
- Wahrnehmung der Breite: ob ein Spieler 10⁶ Arten je als Breite erlebt oder ob ab ~10⁴ nur die Stichprobe zählt — die Karte misst Stichproben, nicht das Gefühl der Fülle.
- Die Erde als Ziel oder als ein Same unter vielen: „Zeiten bereisen, wie unser Planet sie schrieb“ verlangt eine erkennbare Erdgeschichte (Kambrium, Saurier, Säuger) und widerspricht der Kontingenz (leben.evolution.muster Sprosse 5) — welche Saat die Erde nachspielt, entscheidet der Schöpfer, kein Richter.
- Kontingenz fühlen: dass der Spieler die Einmaligkeit seiner Saat SPÜRT, misst keiner der Richter.
- Plausibilität fremden Lebens ohne Referenz: für fremde Arten, Biome und Zivilisationen gibt es kein Foto; tragen können nur Gesetzes-Richter (Verteilungen, Physik-Proben, Gegenläufe), Fachleute-Panels bleiben Zweitrichter.
- Ob ein Bild-Klassifikator das menschliche Blind-Panel fair ersetzt: ungeeicht misst er Nähe zum Korpus, nicht Möglichkeit; mit Menschen ist der Richter nicht in ≤ 3 min fahrbar.
- Ob Evolution als Funktion (Koaleszenz rückwärts, Kosten an den angesehenen Blättern) die Selektions-Muster hält, ohne zur Würfel-Breite eines Teile-Baukastens zu verflachen — das entscheidet ein Spike, nicht die Karte.

## Strittig

- Preis-Treppe (Angriff auf R3): Sprosse 1 richtet nur das Bild an EINEM Gerät (P1), Sprosse 2 beide Geräte mit Ankunft ≤ 10 s (P2), ab Sprosse 3 das volle P. Ohne die Treppe stünde wegen Ankunft 11–17 s jede Leiter auf 0, und die Karte könnte den Stand nicht ordnen; der Preis wächst mit dem Umfang, die Vision trägt immer das volle P.
- Headless zählt nicht (R2): Belege der alten Karte „an … headless“ gelten nicht als HEUTE. Darum fällt Tiere (alt 8/10) und Ökologie (alt 10/10) hier auf 0 — nur vier Sprossen stehen im echten Bild.
- Die Artenzahl erscheint in vier Kriterien mit je anderem Richter: Gestalt (leben.pflanzen.arten, leben.tiere.arten), Netz-Stabilität (leben.oeko.netz), Abstammung (leben.evolution.stammbaum). Bewusst getrennt, weil 10⁶ Farbvarianten ohne Netz oder ohne Baum nichts wiegen; ein Prüfer könnte es als Doppelzählung lesen.
- Nähte zu anderen Kapiteln: leben.wasser.bild könnte ins Bild-Kapitel, leben.evolution.zeitreise in die Tiefe Zeit, leben.tiere.masse zu „Millionen“, leben.kopplung.stadt-im-netz ins Stadt-Kapitel; hier stehen sie, weil der Täter (das Lebewesen) hier lebt.
- Oberste Sprossen jenseits des Geräts: 10¹⁴ Pflanzen oder Krill-Leiber bei P (leben.pflanzen.dichte 6, leben.tiere.masse 8) — die Zoom-Probe richtet, ob die Masse wahr ist, nicht ob jedes Glied einzeln rechnet; ob das physikalisch im Preis liegt, ist unbelegt.
- Schwellen und Bänder (Blindtest ≤ 60 %, z, Colless, R₀, Erholungszeiten, Fluchtwelle) stehen aus dem Gedächtnis der Literatur und sind vor der ersten Linse an Quellen zu eichen; K30 muss eingefroren sein, bevor der erste Schnitt landet.
