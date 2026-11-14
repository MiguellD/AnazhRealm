# Atmosphäre, Wetter und Klima

## Die Vision hier

Jenseits der Gegenwart heißt: der Himmel ist kein Zustand, den ein Regisseur umschaltet, sondern die sichtbare Folge eines ganzen Planeten. Aus der Saat folgen Sonne, Bahn, Achsneigung, Rotation, Land und Meer; daraus der Strahlungshaushalt, daraus die Zellen der Zirkulation, Jetstreams, Passate und Monsune, daraus Tiefdruckwirbel mit Warm- und Kaltfront, Gewittertürme mit Amboss in 12 km Höhe, Hurrikane mit Auge, Sandstürme über der Wüste und Polarnacht über dem Eis. Jeder Ort hat sein Klima, gemessen wie die Erde gemessen wird, und jedes Wetter am Ort ist dasselbe Feld, das man vom Orbit als Wolkenspirale sieht und am Boden als Schauer auf der Haut. Die Megastadt — größer als jede Stadt der Gegenwart — macht ihr eigenes Wetter: Wärmeinsel, Dunstglocke, Gewitter im Lee, und Millionen Bewohner, die unter dem Regen die Straßen räumen. Der Himmel ist LESBAR: wer die Wolken kennt, sieht das Wetter von morgen kommen — und stößt, wie auf der Erde, an die Grenze des Chaos nach zwei Wochen. Der Spieler reist durch die Zeit und sieht das Klima der Zeitalter: die Eiszeit mit 120 m tieferem Meer, das Treibhaus der Kreide, den Schneeball-Planeten; er reist durch ein ganzes Sonnensystem, dessen Atmosphären aus denselben Gesetzen mit anderen Zahlen folgen — Superrotation wie auf der Venus, Bänder wie auf dem Jupiter, die Tag-Nacht-Grenze eines gebundenen Planeten — und deren Wetter weiterläuft, während er fliegt. Alles aus EINEM Samen, im Browser, ohne Download, in jedem Bild unter 33 ms.

## Das Beste der Gegenwart

- **Horizon Zero Dawn / Forbidden West** (Guerrilla, Nubis; Schneider, SIGGRAPH 2015/2017/2022, GDC 2023 „Real-Time Volumetric Superstorms"): volumetrische Wolken aus Rauschen + 2D-Wetterkarte, ≈ 2 ms auf PS4, durchfliegbar, Superzellen-Stürme. Grenze: von Hand geformt, keine Physik der Entstehung, ein Klima je Karte. ([nubis evolved](https://www.guerrilla-games.com/read/nubis-evolved), [Superstorms GDC](https://gdcvault.com/play/1027688/The-Real-Time-Volumetric-Superstorms))
- **Microsoft Flight Simulator 2024**: ganzer Planet, volumetrische Wolken, Live-Wetter aus einem Wettermodell. Grenze: das Wetter wird importiert, nicht erzeugt; Gemeinde meldet falsche Deckung gegen Radar; Daten in Gigabytes, keine Zeitreise, keine Stadt mit eigenem Klima. ([Live-Wetter-Vergleich](https://forums.flightsimulator.com/t/live-weather-how-accurate-is-it-in-msfs-2024-a-comparison/686675))
- **Red Dead Redemption 2** (Bauer, SIGGRAPH 2019): Wolken, Nebel und Licht in EINEM Froxel-Volumen, Nässe/Schlamm/Schnee an Figur und Pferd. Grenze: Wetter je Region als Zustandsautomat, Jahreszeiten fehlen.
- **Forza Horizon 4**: vier Jahreszeiten, Seen frieren befahrbar. Grenze: vier gebaute Kartenzustände, getauscht im Wochentakt.
- **Wissenschaft — globale Sturm-auflösende Modelle** (GFDL X-SHiELD, E3SM-SCREAM): Jahre bei 3,25 km Gitter global, Konvektion explizit. Grenze: Supercomputer, Tage Rechnung für Tage Klima. ([X-SHiELD AMS 2024](https://ams.confex.com/ams/104ANNUAL/webprogram/Paper435489.html))
- **Stadtklima-Forschung**: Wärmeinsel nachts 2–10 K über Umland, Niederschlags-Mehrung im Lee großer Städte (METROMEX, St. Louis, 1970er: grob +5–25 %). Grenze: Messkampagnen, kein Spiel zeigt es.
- **Vorhersagbarkeit**: die Grenze deterministischer Wettervorhersage liegt bei etwa zwei Wochen (Lorenz; heutige Ensembles). Ein ehrliches Wetter MUSS diese Grenze haben — ein Spielwetter ohne Chaos oder ohne Vorlauf ist falsch.
- **Paläoklima**: Milanković-Zyklen (23/41/100 ka), letztes glaziales Maximum ~21 ka (≈ −6 °C global, Meeresspiegel ≈ −120 m), PETM (+5–8 °C), Schneeball-Erde (720–635 Ma). Grenze: Proxies, keine Bilder.
- **Exoplaneten-GCMs**: dieselben Gleichungen mit anderen Parametern ergeben fremde Zirkulationen. Grenze: niemand hat sie je begehbar gemacht.

## Der Same

**EIN Strahlungs-Zirkulations-Gesetz: Energie rein (Stern × Breite × Saison × Albedo) minus Energie raus (Treibhaus-Strahlung), transportiert von einem rotierenden Fluid.** Aus dem Gefälle Äquator → Pol und der Coriolis-Kraft folgen Zellen, Jets, Fronten, Wirbel; aus Temperatur und Feuchte über Clausius-Clapeyron Wolke und Niederschlag; aus der Bahn das Klima der Zeitalter; aus der Oberfläche (Meer, Eis, Wald, Asphalt) das Mikroklima bis in die Gasse. Die Mehrskalen-Kaskade ist der Kniff: grobes Feld planetar, synoptische Wirbel als Muster auf diesem Feld, Wolke und Böe am Schirm. Gelöst haben es **die Meteorologie** (Parametrisierung des Unaufgelösten — was das Gitter nicht trägt, zeichnet eine Funktion) und **die Filmbranche** (Wolken aus Feld + Rauschen zum Preis von Millisekunden). Neu und unser: dieselbe Funktion für Ort × Zeit × Zeitalter × Planet, abrufbar ohne Simulation der Vergangenheit — und eine Prüfung, die nicht Dinge zählt, sondern Zufallsproben gegen die Physik hält.

## Die Leitern

**Preis P0 (gilt in JEDER Sprosse, mit dem Ergebnis zusammen gemessen):** Bild p95 ≤ 33 ms · Ankunft kalt ≤ 5 s · null Download über das Skript hinaus — am Standardgerät (Radeon 890M und GTX 1060). Ein Zeitsprung oder Planetenwechsel zählt als Ankunft. Die Spalte „Preis" nennt nur, was über P0 hinaus gilt. **Breite (R4)** wird an Zufallsproben gemessen: N Saaten × M Zufallsorte × K Zufallsmomente; ein Richter nennt die Probe.

### L1 Wetterlagen — wie wahr das synoptische Wetter ist, vom Orbit bis zum Ort

| Sprosse | Umfang | Tiefe | Preis | Richter (im echten Spiel, misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | 5 Wetter-Zeilen, Bänder ziehen windab über wenige km | Wetter wandert, kein Druckfeld | P0; Abruf ≤ 0,3 ms CPU | Regen an A bei trockenem B ≥ 20 % der Zeit, Lag ±20 % (alt K1) | HEUTE |
| 2 | Region 10² km | Frontpassage in Erd-Abfolge (Cirrus → Nimbostratus → Schauer, Druckfall, Winddrehung, Temperatursprung) | P0 | Zeitreihe am Ort über 50 Frontpassagen aus 50 Saaten: Abfolge stimmt ≥ 80 % | |
| 3 | Kontinent 10³ km | Tief mit Lebenslauf (Geburt, Okklusion, Tod in 3–7 Tagen) | P0, Draufsicht 400 km ohne Ladepause | Blindtest 20 Draufsichten Spiel vs. Satellitenbild: Trefferquote der Prüfer ≤ 60 % | |
| 4 | Planet 10⁴ km | Wolkenbänder, Wüstengürtel, Passat an der Breite, die Rotation und Neigung verlangen | P0, Orbit ↔ Boden ohne Bruch | Breitenprofil der Bedeckung r ≥ 0,7 gegen Satelliten-Mittel; Bodenwind in den Passatbreiten aus der Passatrichtung ±30° in ≥ 70 % von 500 Zufallsproben | |
| 5 | Planet × Jahr | Monsun, Blockierlagen, tropische Wirbelstürme mit Auge | P0 auch im Zeitraffer | Zahl und Bahnen der Wirbelstürme je Spieljahr gegen IBTrACS-Statistik ±30 %, 100 Saaten mit Erd-Parametern | |
| 6 | Planet, jede Skala zugleich (10⁷ m bis 1 m) | Superzelle mit Amboss, Böenfront, Hagel, Blitz, Tornado — aus demselben Feld | P0 unter der Superzelle | Blindtest gegen Sturmfotos ≤ 60 %; Donner-Lag = Abstand ÷ 343 m/s ±10 %; Böenfront hebt sichtbar Staub vor dem Regen | |
| 7 | 10⁶ Saaten = 10⁶ Wetter-Planeten | bei Erd-Parametern statistisch ununterscheidbar von einer Reanalyse | P0 je Saat | 1.000 Saaten: Verteilungen von Druck, Wind, Niederschlag weichen im Kolmogorov-Test nicht von ERA5 ab in ≥ 90 % | |

### L2 Wolken, Niederschlag und Luft im Bild — was das Auge sieht, vom Boden bis durch die Wolke

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | EINE Wolkenschicht auf 800 m, Karte ≈ 8 km, Deckung nach Wetter | Licht der Wolke aus der Atmosphäre (Lambert auf der Oberseite), Schatten ziehen | P0 | Schattenkante versetzt sich um Wind × Δt (alt licht.K4) | HEUTE |
| 2 | Himmel bis zum Horizont, tiefe/mittlere/hohe Wolken getrennt | Wolke hat Körper im Licht: Silberrand, dunkle Basis, Gegenlicht | P0 | Blindtest 20 Himmelsbilder (Mittag, Abend, Gegenlicht) vs. Foto ≤ 70 %; Gattung vom Bildmodell erkannt ≥ 80 % | |
| 3 | jede Wolke entsteht und vergeht | Gattung FOLGT aus Feuchte, Hebung, Stabilität; Tagesgang der Quellwolke | P0 | 200 Zufallsmomente × 20 Saaten: sichtbare Gattung = Gattung, die der Zustand am Ort verlangt, ≥ 80 %; Zeitraffer Sommertag: Cumulus-Gipfel 14–17 Uhr in ≥ 80 % der Saaten | |
| 4 | Niederschlag jeder Phase, sichtbar aus 2–20 km | Phase FOLGT aus dem Temperaturprofil | P0 | 200 Zufallsmomente mit Niederschlag: Phase am Boden passt zum Profil ≥ 90 %; Regenvorhang auf 5 km Kontrast ≥ 0,1 | |
| 5 | die Luft selbst: Sicht 10 m bis 200 km | Dunst, Talnebel, Staub, Rauch und Lichterscheinungen (Regenbogen, Halo, Blitz) genau dort, wo die Physik sie verlangt | P0 | Sichtweite im Bild (Kontrastabfall) gegen Feuchte und Aerosol am Ort ±30 %; 100 Proben: 0 Erscheinungen ohne Ursache, ≥ 80 % der Ursachen zeigen ihre Erscheinung | |
| 6 | durchfliegbar, Boden bis Orbit | dieselbe Wolke vom Orbit und von unten; innen Sicht < 50 m | P0 im Flug | Zoom 400 km → 2 m: Positionsfehler ≤ 1 % der Höhe, kein Sprung > 5 % Luma je Bild | |
| 7 | 10⁶ Wolken zugleich sichtbar, an jedem Ort jeder Saat jeder Epoche | ununterscheidbar von Fotografie | P0 | 100 Himmelsbilder aus Zufallsorten und -saaten vs. Fotos: Trefferquote ≤ 60 % (Zufall 50 %) | |

### L3 Klimazonen und Jahreszeiten — wie viele Klimata die Welt trägt und wie wahr sie verteilt sind

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | 1 Klima, Höhe gestaucht (160 m tragen, was die Alpen in 3 km tragen) | Jahres- und Tagesgang, Schneegrenze | P0 | Temperatur am Meer 18/−4 °C, Schneegrenze folgt Saison (alt K4) | HEUTE |
| 2 | 1 Gebirge in Erd-Höhe | Höhenstufen wie auf der Erde | P0 | Baum- und Schneegrenze im Bild auf Erd-Höhe ihrer Breite ±20 % | |
| 3 | 3 Klimata in einer Welt | Kontinentalität, Regenschatten | P0 | Niederschlag Luv/Lee ≥ 2:1; im Bild grün/braun getrennt an der Kammlinie | |
| 4 | Jahreszeiten aller Systeme, nach Breite | Tageslänge, Sonnenhöhe, Laub, Eis | P0 | Bildpaar Juli/Januar an 3 Breiten, derselben Pose: alle vier Zeichen ändern sich in die richtige Richtung | |
| 5 | Klimaraum eines Planeten | Klasse aus Breite, Meer, Höhe | P0 | 50 Zufallsorte: Köppen-Klasse aus Spieldaten = Klasse aus Lage ≥ 80 %; Flächenanteile der Hauptklassen über 100 Saaten ±50 % der Erde | |
| 6 | ganzer Planet im Orbit-Bild | Farbe des Landes folgt dem Klima, gelesen nicht gemalt | P0 | Farbverteilung je Breite r ≥ 0,7 gegen Blue-Marble-Mosaik | |
| 7 | 10⁶ Planeten-Klimata | plausibel ohne Erd-Parameter | P0 je Planet | 1.000 Saaten × 50 Zufallsorte: kein sichtbarer Widerspruch (Eis bei > +5 °C, Wüste unter Dauerregen, Regen ohne Feuchtequelle) in ≥ 95 % | |

### L4 Extreme und Wiederkehr — Dürre, Flut, Sturm und ihre Statistik

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | Schnee mit Tiefe | Decke trägt und gibt nach | P0 | Winter-Deckung ≥ 60 %, Fuß sinkt ≥ 5 cm (alt K4) | halb |
| 2 | Pegel folgt Regen, Dürre senkt ihn | Lag wächst mit Einzugsgebiet | P0; ≤ 0,3 ms CPU | Bach +0,2 m nach 20 min Sturm, Bilanz 1,0, 14 Tage Dürre senken (alt K3) | HEUTE |
| 3 | Dürre über Monate, Flut über Tage | Bodenfeuchte als Gedächtnis; Fluss verlässt das Bett | P0 | nach 60 Tagen ohne Regen: Wiese braun (Farbe gegen Dürrefoto), Fluss ≥ 50 % Querschnitt verloren; nach 100 mm Starkregen: Überflutung ≥ Aue | |
| 4 | Wiederkehr über 100 Jahre | Jahrhundertflut, Hitze- und Kältewelle | P0, Zeitsprung 100 a ≤ 5 s | GEV-Anpassung der Jahresmaxima: 100-a-Flut innerhalb Faktor 2 der Erd-Erwartung für das Klima | |
| 5 | Schwankung über Jahrzehnte | Telekonnektion: Ozean warm hier → Dürre dort | P0 | Index ↔ Regen 5.000 km entfernt |r| ≥ 0,3 über 100 Saaten | |
| 6 | Katastrophe mitten in der Megastadt | Hurrikan landet, Sandsturm verschluckt Stadt | P0 im Sturm über ≥ 10⁵ sichtbaren Dingen | Blindtest gegen Sturmfotos ≤ 60 %; Sicht im Sandsturm < 100 m; p95 ≤ 33 ms über die ganze Durchfahrt | |

### L5 Klima über Zeitalter — der Spieler reist durch die Klimageschichte

Stand: unter Sprosse 1 (das Jahr wiederholt sich ohne Drift).

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | 10² Jahre | Treibhaus-Drift verschiebt Schneegrenze und Pegel | P0, Sprung ≤ 5 s | Sprung +100 a bei +2 °C: Schneegrenze steigt ≈ 300 m (Erd-Höhe), Bildpaar der Gletscher | |
| 2 | 10⁴ Jahre | Eiszeit aus der Bahn | P0 | Sprung auf −21 ka: Meeresspiegel −120 m ±20 %, Eisrand im Orbit-Bild, global −6 °C ±2 | |
| 3 | 10⁶ Jahre | Glazial-Folge, 41-ka- und 100-ka-Takt | P0 | Spektrum der Temperaturreihe aus 1.000 Sprüngen: Gipfel bei 23/41/100 ka | |
| 4 | 10⁸ Jahre | Treibhaus- und Kühlhaus-Zeitalter aus Kontinentlage und CO₂ | P0 | Sprung in die Kreide: kein Poleis, Palmen an 60° (Bild), Pol-Äquator-Gefälle ≤ 20 K | |
| 5 | 4·10⁹ Jahre | Schneeball, Sauerstoff-Wende, schwache junge Sonne | P0 | −700 Ma: Eis bis zum Äquator im Orbit-Bild; −4 Ga: Dunst-Himmel gegen wissenschaftliche Rekonstruktion | |
| 6 | jede Epoche jeder Saat, nahtlos | Klimageschichte konsistent mit Geologie | P0 je Sprung | Sprung heute → Eiszeit → heute: Moränen liegen heute am Eisrand der Eiszeit (Lagefehler ≤ 5 %), 100 Saaten | |

### L6 Fremde Atmosphären — dasselbe Gesetz, andere Welten

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | 1 Atmosphäre (Erde), Streuung parametrisch | Rayleigh, Aerosol, Ozon | P0 | Himmelsfarbe Mittag/Abend gegen Foto (alt Licht) | HEUTE (nur Erde gezeigt) |
| 2 | Gas, Druck, Stern als Zufallsparameter, keine Vorlagen | Himmelsfarbe folgt aus ihnen | P0 | Mars-Parameter: blauer Sonnenuntergang, butterfarbener Tag gegen Rover-Fotos; Titan-Parameter: oranger Dunst gegen Huygens-Bild | |
| 3 | Zirkulation aus Rotation | Zahl der Zellen folgt der Rotation | P0 | Rotation ×0,1 / ×1 / ×5: Bänder je Halbkugel 1 / 3 / ≥ 4, im Orbit-Bild zählbar | |
| 4 | gebundene Planeten, dichte Atmosphären | Tag-Nacht-Grenze, Superrotation | P0 | Venus-Parameter: Wolkendecke umläuft ≈ 60× schneller als der Boden (Zeitraffer) | |
| 5 | Gasriesen | Bänder, langlebige Wirbel, fremder Regen | P0 | Jupiter-Parameter: Bänder + ein Wirbel, der ≥ 100 Spieljahre lebt; Blindtest gegen Raumsonden-Bilder ≤ 70 % | |
| 6 | ein ganzes Sonnensystem zugleich | Wetter jedes Planeten läuft, während der Spieler reist | P0 im Flug, ≤ 5 s je Landung | Orbit → Landung auf zwei Planeten nacheinander: die Wolke über dem Landeplatz steht dort, wo man sie vom Orbit sah (≤ 1 %) | |
| 7 | 10⁶ Planeten | jede Saat eine geschlossene, plausible Atmosphäre | P0 je Ankunft | 1.000 Zufallsplaneten × 20 Orte: kein sichtbarer Widerspruch (Himmelsfarbe zu Stern und Gas, Eis/Flüssigkeit zur Temperatur) in ≥ 95 % | |

### L7 Kopplung — wie weit eine Front durch die Welt läuft (R7)

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | Wetter ändert Licht und Himmel | dieselbe Front dimmt Sonne, färbt Himmel | P0 | Bildpaar klar/Sturm an derselben Pose: Richtlicht gedimmt, Himmel grau | HEUTE |
| 2 | Wind liest jeder Beweger | Lee schwächer, Tal-Düse stärker | P0; ≤ 0,3 ms | Ein Sturmbild: Gras, Bäume, Wolken, Rauch, Wasser zeigen dieselbe Richtung ±20°, Stärke Lee < frei < Düse | halb (6 Leser im Code; der Bild-Richter ist nie gefahren) |
| 3 | Nässe, Pfützen, Pegel | poröse Stoffe dunkler, Pfützen in Senken | P0 | Luma porös 0,5–0,8, Pfützen r ≥ 0,5, Bach +0,2 m (alt K2/K3) | HEUTE |
| 4 | Lebewesen und Bewohner reagieren | Tiere suchen Schutz, Bewohner fliehen den Regen | P0 | Anteil im Freien bei Sturm ≤ 30 % des klaren Werts, Bildpaar Marktplatz | |
| 5 | Wetter formt Gelände | Starkregen gräbt Rinnen, Dünen wandern, Sturmflut versetzt Küste | P0, Zeitsprung ≤ 5 s | Bildpaar vor/nach 10 Spieljahren oder Landfall an derselben Pose: Dünenversatz in Windrichtung, Rinnen, Küstenlinie messbar verändert | |
| 6 | Zivilisation passt sich an | Bauform und Siedlungslage folgen dem Klima | P0 | 100 Zufallsorte: Dachneigung ↔ Schneelast r ≥ 0,5; Innenhof, Stelzen, Windturm treten in der Klimazone, in der die Erde sie trägt, ≥ 3× häufiger auf | |
| 7 | Vollkreis: Klima formt Planet, Planet formt Klima | Ausbruch kühlt das Jahr; Gebirge hebt sich → Regenschatten → Steppe → Stadt wandert | P0 je Sprung | Ausbruch: Folgejahr global −0,3 bis −1 °C; Bildpaar Region vor/nach Hebung (grün → Steppe) | |

### L8 Stadt- und Mikroklima — die Megastadt macht ihr eigenes Wetter (NEU)

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | ein Platz, eine Gasse | Gasse lenkt den Wind, Schatten kühlt, Asphalt hält Wärme | P0 | Wind in der Gasse folgt der Gasse ±20°; Pfütze trocknet im Schatten später als in der Sonne | |
| 2 | Stadt 10² Häuser | Wärmeinsel | P0 | Klare Winternacht: Stadtkern ≥ 2 K wärmer als Umland; Bildpaar: Schnee taut im Kern zuerst | |
| 3 | Stadt 10⁴ Häuser | Dunstglocke bei Inversion, Fallwind am Turm | P0 | vom Hügel: Sichtweite im Kern ≤ 50 % des Umlands bei Inversion; Böe am Turmfuß ≥ 1,5× des freien Winds | |
| 4 | Stadt mit 10⁶ Bewohnern | Millionen reagieren auf Regen: Schirme, leere Straßen, langsamer Verkehr | P0 mit allen 10⁶ in der Welt | Anteil im Freien bei Regen ≤ 30 % des klaren Werts an 50 Zufallskreuzungen; Bildpaar Kreuzung | |
| 5 | Megastadt ≥ 10⁷ (über Tokio) | die Stadt macht Wetter: Gewitter und Regen im Lee | P0 | 100 Saaten: Niederschlag im Lee der Stadt ≥ +10 % gegen Luv | |
| 6 | Städte aller Epochen auf einem Planeten | Stadtklima der Epoche (Kohlesmog, Neon-Regen der Megastadt) | P0 je Sprung | Sprung Industriestadt 1850 ↔ heute an derselben Pose: Sichtweite und Himmelsfarbe gegen historische Messreihen ±30 % | |

### L9 Der lesbare Himmel — das Wetter kündigt sich an, bis an die Grenze des Chaos (NEU)

| Sprosse | Umfang | Tiefe | Preis | Richter | Stand |
|---|---|---|---|---|---|
| 1 | Stunden | Regen kommt aus der Windrichtung, Bewölkung wächst vorher | P0 | 100 Regenbeginne: Bedeckung stieg in den 60 min davor aus der Windrichtung in ≥ 70 % | |
| 2 | ein Tag | Zeichen der Front 6–24 h vorher (hohe Schleier, Halo, sinkende Basis) | P0 | Ein Bildmodell, das NUR den Himmel sieht, sagt Regen in 12 h mit Skill ≥ 0,3 über Persistenz | |
| 3 | Tage | Druck und Wind am Ort lesbar | P0 | Vorhersage aus Spiel-Beobachtung: Skill ≥ 0,2 über Klimatologie bei 3 Tagen | |
| 4 | Wochen | ehrliches Chaos | P0 | derselbe Lauf mit winziger Störung: Skill fällt bis 14 Tage auf ≈ 0 (nie perfekt vorhersagbar, nie Zufall ohne Vorlauf) | |
| 5 | Planet | Sturmbahnen lesbar vom Orbit | P0 | Bahn-Vorhersage 48 h aus dem Orbit-Bild: Fehler ≤ 300 km | |

## Stand heute (nachgeprüft am Code von main)

- **Wetterfront**: `phyto-core.js:3993` Tafel WX_GESETZ mit 5 Zeilen (klar, bewoelkt, nebel, sturm, regen); `phyto-core.js:4019` WIND_FELD; `phyto-core.js:4067-4091` `wetterAt` = Summe von drei Sinus-Wellen längs der Hauptrichtung der Saat, die Front gebogen (`biegeM`), dazu EINE vierte Sinus-Welle der Feuchte, die den Nebel schaltet — kein Druckfeld, kein Wirbel, keine Front-Abfolge. Verteilung über 300 Saaten × 400 Orte (Kommentar 4014): klar 27 % · nebel 15 % · bewoelkt 21 % · regen 25 % · sturm 13 %.
- **Klima**: `gelaende-core.js:1285-1305` EIN Klima (gemäßigt-kontinental, Sommer 18 °C, Winter −4 °C, Tagesgang ±5 °C), Höhe gestaucht (0,11 K/m); `gelaende-core.js:1548` Abflussspende 330 mm/Jahr fest. Keine Breite, kein Strahlungshaushalt, keine Klimazone.
- **Atmosphäre**: `foundry-core.js:283-308` ATMO_GESETZ nach Hillaire 2020 — physikalisch, parametrisch, gezeigt nur die Erde.
- **Wolken**: die Tafel `WOLKEN_SCHICHT` steht in `welt-licht.js:850` (Höhe 800 m, Karte 512 Texel × 16 m ≈ 8 km, Deckung klar 0,12 / Regen 0,9), Licht auf der Oberseite aus der Atmosphäre (`welt-licht.js:994-1003`, Lambert); `stamm/bild-himmel.js` liest sie (Schattenkarte, Zug mit der Hauptrichtung des Winds aus phyto-core). Keine Volumen-Wolken, keine Gattungen, kein Niederschlag als Vorhang, keine Lichterscheinungen.
- **Gewitter, Blitz, Hagel, Monsun, Stadtklima, Zeitalter, fremde Atmosphären**: nichts (kein Treffer für Blitz/Gewitter/Donner im Wetter-Pfad von `stamm/`).
- **Alte Karte**: Wetter und Klima 9/10 (MEISTERKARTE.md:88, 249 ff.). Gegen die Vision ist das die unterste Sprosse von vier Leitern: 9/10 EINES Ortes mit EINEM Klima und einer Wolkenschicht über 8 km.

## Abhängigkeiten

- **Himmel, Sonnensysteme und fremde Welten**: Bahn, Achsneigung, Sternspektrum (Eingang des Strahlungshaushalts, L5/L6).
- **Planet und Geologie**: Land-Meer-Verteilung, Gebirge in Erd-Höhe (L3-2 setzt voraus, dass die Welt die Stauchung aufgibt), Vulkan als Quelle (L7-7); **Tiefe Zeit** liefert die Zeitachse von L5.
- **Ozean, Wasser und Eis**: Wärmetransport des Meeres, Meereis-Albedo, El-Niño-Kopplung (L4-5) — ohne Ozean kein ehrliches Klima.
- **Maßstab-Kontinuum** und **Licht, Bild und Horizont**: Orbit ↔ Boden ohne Bruch (L1-4, L2-6, L6-6).
- **Siedlung und Stadt** und **Bewohner**: L8 braucht die Megastadt und ihre Millionen; L8-4 zählt nur, wenn die Bewohner dort wirklich leben.
- **Der Same**: Abrufbarkeit einer Epoche ohne Simulation der Vergangenheit (L5) — und zugleich ehrliches Chaos (L9-4): beides aus derselben Funktion ist die härteste Probe des Samens.
- Abgrenzung: Ozean-Strömung gehört „Ozean", Lichttransport „Licht", Vulkanismus „Geologie", Katastrophen-Kaskaden „Kopplung/Katastrophe" — hier zählt nur die atmosphärische Antwort.

## Was die alte Karte hier misst

MEISTERKARTE.md §2 „Wetter und Klima" (9/10), K1–K5:
- **K1** Wetter = f(Saat, Ort, Zeit), Front am Ort → **L1 Sprosse 1**.
- **K2** Nässe → **L7 Sprosse 3**.
- **K3** Wasserkreislauf → **L4 Sprosse 2**.
- **K4** Temperatur und Schneedecke mit Tiefe (1/2) → **L3 Sprosse 1** und **L4 Sprosse 1** (halb).
- **K5** Wind als EIN Feld, 6 Leser → **L7 Sprosse 2** (halb: die alte Prüfung mutierte das Feld und sah die Leser stehen — sie bewies Verdrahtung, nicht das Bild).
- Aus §13 „Licht, Himmel, Wolken" die Himmelsfarbe → **L6 Sprosse 1**, die Wolkenschicht → **L2 Sprosse 1**; aus §14 „Ferne" die Sicht im Wetter → Teil von **L2 Sprosse 5**.

## Zweifel

- Die Blindtest- und Bildmodell-Richter brauchen einen Prüfer, der im Projekt noch nicht gebaut ist; baut man ihn, gehört er in eine bestehende Linsen-Familie, sonst wird er Apparat.
- Alle Richter „gegen ERA5/IBTrACS/Köppen der Erde" setzen voraus, dass die Welt Erd-Parameter annehmen kann — heute ist sie gestaucht (160 m statt 3 km). Bis dahin sind diese Sprossen messbar, aber unerreichbar.
- Ob eine geschlossene Funktion synoptische Wirbel mit Lebenslauf, Telekonnektion UND ehrliches Chaos (L9-4) trägt, ist offen; ohne Zeitintegration könnten L1-5, L4-5 und L9-3/4 unter R6 fallen.
- Die Zahlen der oberen Sprossen (Wirbelsturm-Statistik, −120 m, Milanković-Takte, Venus ×60, METROMEX +5–25 %) stammen aus Fachwissen, im Lauf nicht je einzeln nachgeschlagen.
- L8 überlappt mit dem Stadt-Blatt, L7-5 mit Geologie/Katastrophe, L6 mit Himmel/fremde Welten; der Verdichter streicht doppelte Sprossen.

## Gegenlese — was sich änderte und was strittig bleibt

- **Preis überall**: P0 (33 ms · 5 s · null Download) gilt jetzt in jeder Sprosse; vorher fehlten Ankunft und Download in fast allen, L5-1 hatte gar keinen Preis. Der Teil-Etat „Wolken ≤ 2 ms GPU" fiel — er schrieb eine Aufteilung vor statt das Bild zu messen.
- **Fleiß → Fähigkeit**: „alle 10 WMO-Gattungen", „Niederschlag in allen Formen", „3 Parametersätze Erde/Mars/Titan" waren Listen; jetzt urteilen Zufallsproben, ob Gattung, Phase und Himmelsfarbe aus dem Zustand FOLGEN.
- **Bauweise im Richter gestrichen**: „volumetrisch", „Höhenstufe 0,11 K/m", „eine Quelle (WX_GESETZ)", „Mutation stoppt alle Leser" maßen den Weg; ersetzt durch Blindtest, Erd-Höhe der Baumgrenze, ein Sturmbild mit sechs Lesern.
- **Gehoben**: L6 bis zum ganzen Sonnensystem in Reise, L2 bis jedem Ort jeder Saat jeder Epoche, L7-4 und L8-4 auf Millionen Bewohner.
- **Neu**: L8 Stadt- und Mikroklima (die Megastadt macht Wetter — die Vision „Tokio ein Witz" hatte hier keine Leiter), L9 lesbarer Himmel (Vorhersagbarkeit bis an die Chaos-Grenze prüft die Dynamik, nicht die Dinge). Luftoptik (Dunst, Regenbogen, Halo) wurde als Fähigkeit in L2-5 aufgenommen.
- **Dieselben**: alte L4-7 (Folgen des Landfalls) und L7-5 (Gelände geformt) waren eine Leiter — zusammengelegt in L7-5; Jahreszeiten wanderten von L4 nach L3. L5-1 („Jahr ohne Drift") war keine Sprosse ohne Richter — gestrichen, Stand „unter Sprosse 1".
- **Stand berichtigt**: `wetterAt` trägt eine vierte Welle (Feuchte → Nebel); die Wolkentafel steht in `welt-licht.js:850`, nicht in `bild-himmel.js` (800 m, ≈ 8 km Karte); L7-1 war HEUTE, ohne so zu stehen; L4-1 und L7-2 sind halb, nicht ganz.
- **Strittig**: ob Kolmogorov- und Skill-Richter „im echten Spiel" zählen (sie lesen Spieldaten über viele Läufe, nicht ein Bild); ob L9-4 Chaos mit einer geschlossenen Funktion überhaupt vereinbar ist; ob L8 hierhin oder ins Stadt-Blatt gehört.
