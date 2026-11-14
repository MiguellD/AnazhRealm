# Physik und Stoff — Festkörper, Flüssigkeit, Gas, Feuer, Reaktion, Bruch, Verformung, Statik, Umströmung und Wärme als EINE Physik

## Die Vision hier

Jenseits der Gegenwart heißt: es gibt im Ultiversum kein Ding, das nur Kulisse ist — auf keinem Planeten, in keinem Zeitalter. Jeder Stein, jedes Fass, jede Brücke, jedes Hochhaus einer Stadt, gegen die Tokio ein Dorf ist, trägt Masse, Steifigkeit, Festigkeit, Wärme, Brennbarkeit und Chemie aus EINER Stoff-Zeile — und folgt denselben Erhaltungssätzen für Masse, Impuls und Energie, ob es ein Kiesel ist, der in einen Bach fällt, ein Fußball, der sich im Freistoß um die Mauer dreht, oder ein Wolkenkratzer, der im Erdbeben knickt. Wasser bricht durch einen Damm und reißt Wagen mit, Rauch steigt nach dem Gesetz der Fahne aus einem Stadtbrand, Lava kühlt und wird Fels, Erz wird im Ofen Bronze, weil der Ofen heiß genug ist, Stahl biegt sich, Holz splittert längs der Faser, Glas springt radial — und die Trümmer bleiben, bis jemand sie räumt, auch hundert Jahre später. Die Statik ist nicht Schmuck, sondern Grenze und Gestaltgeber: was eine Saat baut, steht, weil es tragen kann, und auf einem Planeten mit doppelter Schwerkraft wachsen andere Türme, fliegen Bälle kürzer und Vögel mit breiteren Flügeln. Und all das kostet nur, was der Schirm zeigt: die Physik ist überall wahr, aber sie rechnet nur, wo sie gesehen oder berührt wird — und der Spieler findet die Naht zwischen wach und schlafend nie.

**Der Preis in jeder Sprosse** (R3, gilt zusammen mit Umfang und Tiefe, sonst zählt die Sprosse nicht):
- **P** = Bild p95 ≤ 33 ms auf dem Standardgerät (Laptop-Grafik, heute Radeon 890M und GTX 1060), gemessen im **Ereignis-Fenster** (die 10 s, in denen es bricht, brennt, fließt — nicht im ruhigen Stand), Ego und Third, null Byte Asset-Download.
- **P+A** = P und dazu Ankunft ≤ 5 s kalt an der Szene, in der das Ereignis wirkt (auch in einer Ruinen-, Brand- oder Flutstadt).

## Das Beste der Gegenwart

- **Teardown** (Tuxedo Labs 2022): Voxel von 10 cm, jeder zerstörbar, abgetrennte Mengen werden Starrkörper, Feuer frisst Holz. Grenze: Karten von wenigen hundert Metern, Voxel-Optik, kein Fluid mit Impuls, keine Statik über „hängt am Rest oder fällt".
- **The Finals** (Embark 2023, Server-Physik): Gebäude zerfallen ungeskriptet, eine Integritäts-Schicht bricht Abschnitte, die Trümmer bleiben schwach verbunden und schwanken. Grenze: wenige Gebäude auf kleinen Arenen, die Rechnung sitzt im Rechenzentrum, nicht auf dem Gerät.
- **BeamNG.drive**: Soft-Body aus ≈ 400 Knoten und 4 000 Balken je Wagen bei 2 000 Hz — die Referenz für Knautschen. Grenze: eine Handvoll Wagen, die Welt drumherum ist starr.
- **Zelda: Breath of the Wild / Tears of the Kingdom** (Nintendo): die Chemie-Engine aus wenigen Regeln (Feuer, Wind, Elektrizität, Metall), ein Starrkörper-System für jedes Ding. Grenze: handgetaggte Objekte einer festen Karte, keine Verformung, kein Bruch, Chemie als Etikett statt als Stoff.
- **Noita** (Nolla 2019): jedes Pixel simuliert — Sand, Flüssigkeit, Gas, Feuer, Reaktionen zwischen Stoffen. Grenze: 2D.
- **Kerbal Space Program / Microsoft Flight Simulator**: Bahnmechanik und Flugphysik aus Profil, Dichte und Schwere; KSP zeigt dieselbe Rakete auf Welten verschiedener Schwere. Grenze: wenige Fahrzeuge, die Welt reagiert nicht.
- **Sportspiele (EA FC, Rocket League)**: Ballflug mit Drall, Abprall nach Fläche. Grenze: ein Ball, eine Fläche, eine Schwere — der Ball ist ein Sonderfall, kein Stoff.
- **Material Point Method im Film** (Stomakhin et al. 2013, Disney „Frozen"; Houdini FLIP/Vellum): Schnee, Sand, Schlamm, Wasser aus EINER Diskretisierung. In Echtzeit auf der GPU: Größenordnung 10⁶ Partikel auf diskreter Grafik, 10⁵ mit WebGPU auf integrierter Grafik (Forschungs-Demos, nicht nachgeprüft). Grenze: Würfel von Metern, nicht Städte.
- **Ingenieurwesen und Wirklichkeit**: FEM rechnet Tragwerke und Crashs auf Rechenclustern in Stunden; Brandschutz rechnet nach der Einheits-Temperaturzeitkurve (ISO 834); Rothermel 1972 sagt Flächenfeuer voraus; die Ritter-Lösung (1892) die Front eines Dammbruchs mit 2·√(g·h); Hopkinson-Cranz-Skalierung den Radius einer Druckwelle mit W^(1/3). Die Wirklichkeit ist der Maßstab, nicht die Obergrenze — fremde Planeten mit Methan-Meeren und Eis-Vulkanen stehen in keinem Handbuch, aber in den Phasendiagrammen.

## Der Same

**EINE Stoff-Zeile × die drei Erhaltungssätze × die Konstanten des Planeten, gelöst in der Auflösung, die der Schirm verlangt.** Jeder Stoff ist eine Zeile konstitutiver Größen in SI (Dichte, E-Modul, Querkontraktion, Streck- und Bruchgrenze, Bruchzähigkeit, Viskosität, Wärmeleitung, Wärmekapazität, Zünd-, Schmelz- und Siedepunkt, Phasendiagramm, Reaktions-Partner und Aktivierungs-Energie), und es gibt nur EIN Gesetz: Masse, Impuls und Energie bleiben erhalten. Fest, flüssig, gasförmig, brennend, reagierend, brechend, fließend, umströmt sind keine getrennten Systeme, sondern Zustände desselben Kontinuums, die die Zeile beim jeweiligen Druck, der Temperatur und der Schwere auswählt. Der Planet setzt nur drei Zahlen dazu — g, Dichte und Zusammensetzung der Atmosphäre — und alles Weitere (Wurfweite, Turmhöhe, Feuer ja oder nein) folgt. Die Auflösung ist eine Funktion der Aufmerksamkeit: im Blick fein (Partikel, Starrkörper, Balken), im Mittelfeld gemittelt (Höhenfeld, Lastgraph), in der Ferne ein schlafender Zustand mit Gedächtnis — und der Übergang ist selbst ein Richter (die Naht ist unsichtbar).

Die fremden Branchen, die es gelöst haben: der **Film** (EIN Löser für Schnee, Sand, Schlamm, Lava), das **Bauingenieurwesen und die Crash-Simulation** (jede Stoff-Zeile ein Datenblatt), die **Wetter- und Klimamodelle** (Mehr-Skalen-Gitter, fein nur, wo es zählt), die **Verbrennungs- und Metallurgie-Chemie** (Reaktions-Tempo nach Arrhenius, Ellingham-Diagramme: welches Erz bei welcher Temperatur Metall gibt) und die **Werkstoff-Forschung** (Eigenschaften aus Zusammensetzung statt Tafel — der Weg zu den Stoffen fremder Welten).

## Die Leitern

Jede Sprosse: Umfang × Tiefe × Preis (P oder P+A, oben definiert) zugleich, gemessen im echten Spiel. „Stand" nennt nur, was im echten Spiel mit Bild belegt ist; headless Belegtes steht als „headless" und zählt nicht als Sprosse.

### Leiter 1 · Freie Körper — wie viele Dinge der Welt gleichzeitig der Physik folgen und sich erinnern

Misst die Zahl der losen Dinge (Kisten, Fässer, Trümmer, Möbel, Steine, Waren), die bei einem Ereignis im Bild zugleich reagieren, ohne Durchdringen, und dort liegen bleiben, wo die Rechnung sie ließ.

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | 1 Körper | fällt, ruht, Masse = Volumen × ρ | P | ein Fass fällt vom Dach: Ruhe ≤ 2 s, Zittern ≤ 1 cm, Spalt zum Boden im Bild ≤ 5 cm | headless |
| 2 | 10 | Stapel, Stoß nach Massenverhältnis | P | ein Wagen fährt in 10 Kisten: 0 Durchdringen im Bild, Δv der Kisten ±10 % gegen Impulsbilanz, Ruhe ≤ 3 s | |
| 3 | 10² | Trümmerfeld eines Einsturzes, liegt über Reload | P | Einsturz eines Werks: 100 Trümmer im Bild, nach Reload jede Lage ±1 cm | headless (Werkstatt) |
| 4 | 10³ | jedes lose Ding einer Gasse der GESÄTEN Stadt ist ein Körper (nicht nur Werkstatt-Werke) | P | Explosion in einer Gasse der Stadt: 1 000 Körper fliegen, 0 Durchdringen im Bild | |
| 5 | 10⁵ | ein Viertel im Sturm oder Beben, Kippen nach Schwerpunkt und Reibung | P | Böe 30 m/s: Anteil der Dinge, die laut Kipp-Kriterium kippen müssen und im Bild kippen, ≥ 95 %; Fehl-Kipper ≤ 2 % | |
| 6 | 10⁶ im Blick betroffen, 10⁹ in einer Megastadt mit Gedächtnis | jedes Ding einer Stadt jenseits Tokio, ab dem ersten Bild | P+A | Flug über die Stadt nach einem Beben: Stichprobe 1 000 sichtbare Dinge an der gerechneten Lage ±1 cm; keine Naht wach/schlafend im Bild (Bildreihe beim Annähern) | |
| 7 | jedes lose Ding eines Planeten (≥ 10¹²), über Jahrhunderte | Gedächtnis über Zeitalter: bewegt nur, wer eine Ursache hatte (Mensch, Flut, Wind, Fäulnis) | P+A | Rückkehr nach 100 Spieljahren an 100 zufällige Orte: ≥ 99 % der Dinge am Ort oder ihre Bewegung einer benannten Ursache zuordenbar | |

### Leiter 2 · Tragen und Brechen — wie große Bauwerke stehen, weil sie tragen, und versagen, wie ihr Stoff versagt

(Gegenlese: die alten Leitern „Statik" und „Bruch" sind EINE — Stehen und Versagen sind dasselbe Gesetz bei verschiedener Last; ihre Sprossen 1–2 waren doppelt.) Misst die größte Struktur, deren Stehen, Durchbiegen, Schwingen und Brechen aus Stoff-Zeile, Querschnitt und Last folgt, absolut wahr gegen Rechnung und Messwert — nicht geeicht auf einen Wunsch-Anblick.

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | 1 Glied | knickt nach Euler, zerdrückt nach Druckfestigkeit — absolut, ohne Eichfaktor | P | Säule realer Schlankheit unter wachsender Last: Versagens-Last gegen Euler-Rechnung ±20 %; halbes E knickt früher | relativ ja (halbes E knickt), absolut nein: Euler ÷ 500 geeicht |
| 2 | ein Werk (≈ 10 Glieder) | Teile ohne Lastpfad fallen, die übrigen stehen, Trümmer bleiben | P | zufälliger Pfosten entfernt: gefallene Teile = Teile ohne Lastpfad (100 %), Trümmer liegen 10 min | headless/Werkstatt |
| 3 | ein Haus (10³ m³) | Balken biegen sichtbar; Teile brechen IN sich: Holz längs der Faser, Mauer in Fugen, Glas radial | P | 1 m Schnee auf flachem Holzdach: Durchbiegung im Bild ±20 % gegen Balkenformel; Bruchbild-Paar je Stoff gegen Fotos: Jury „echt" ≥ 70 % | |
| 4 | jedes gesäte Haus einer Stadt (10³ Bauten) | steht, weil es trägt — nicht, weil es gesetzt ist | P+A | N = 1 000 Saaten: 100 % stehen unter Eigenlast; mit E/2 in der Zeile fallen ≥ 10 % (Konsum) | |
| 5 | ein Hochhaus (10⁵–10⁶ m³, 300 m) | Wind-Schwingung, fortschreitender Kollaps, Staub aus derselben Masse | P | Turmspitze im Sturm: Periode gegen Faustregel T ≈ H/46 s ±25 %; Kollaps-Zeit gegen reale Einstürze ±30 % | |
| 6 | Stadtteil bis Megastadt (10⁷–10⁹ m³) | Beben bricht je Bauweise und Boden-Stoff | P+A | Beben Stärke 7: Schadensgrad je Bau gegen EMS-98-Verteilung ±1 Grad bei ≥ 70 % | |
| 7 | Megastrukturen auf fremden Welten (km, 0,3–3 g) | die Statik setzt die Grenze und Silhouette der Stadt selbst | P+A | N = 100 Planeten-Saaten: Höhe der höchsten Bauten skaliert mit σ/(ρ·g) ±30 %; Blind-Jury ordnet Silhouetten-Bilder der richtigen Schwere zu ≥ 80 % | |
| 8 | Ruinen über Zeitalter | jeder Bruch bleibt, Ruinen altern weiter nach Stoff, werden geräumt oder überwachsen | P+A | Rückkehr nach 1 und nach 1 000 Spieljahren: 1 000 Trümmer an ihrem Ort oder nachweislich geräumt/überwachsen; die Ruinenstadt lädt ≤ 5 s | |

### Leiter 3 · Flüssigkeit und Gas — wie viel Fluid mit Impuls und freier Oberfläche sichtbar fließt

Misst das Volumen Wasser, Schlamm, Lava, Rauch, Gas, das mit Impuls fließt und Körper mitnimmt (der Ozean als Ganzes gehört dem Blatt „Ozean, Wasser und Eis", die Atmosphäre dem Wetter — hier der Löser und seine Wahrheit im Kleinen).

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 0 | Zellen-Wasser ohne Impuls | eine gegrabene Grube unter dem Pegel füllt sich, kein Schwall | P | Grube unter dem Pegel gegraben füllt sich im Bild | belegt (Code; Bild im Spiel nicht gesehen) |
| 1 | 1 m³ (Eimer, Brunnen) | Schwall, Spritzer mit Impuls | P | gekippter Eimer: Front gegen Ritter 2·√(g·h) ±15 % | |
| 2 | 10³ m³ (Becken, Bach-Stau) | Dammbruch, Strömung trägt Körper mit | P | Holzdamm gebrochen: Front ±15 %, Fässer treiben mit der Strömung | |
| 3 | 10⁶ m³ (Stausee) | Flutwelle durch eine Stadt, Wagen und Trümmer schwimmen | P+A | Ankunftszeit in 1 km ±20 % gegen Flachwasser-Rechnung; Bildpaar gegen Flutvideo, Jury ≥ 60 % | |
| 4 | Gas: Stadtbrand-Fahne, Gaswolke | Auftrieb, Wind, Verdünnung; schwere Gase sammeln sich in Senken | P | Steighöhe der Fahne gegen Briggs ±30 %; CO₂-Wolke fließt bergab in die Senke (Bild) | |
| 5 | 10⁹ m³ (Lavastrom, Tsunami, km) | Viskosität aus Temperatur, Erstarren an der Front | P+A | Lava-Tempo im gemessenen Band (0,1–10 m/s je Hang und Viskosität) | |
| 6 | planetar, ein Kontinuum | Ozean, Atmosphäre, Magma fein im Blick, gemittelt in der Ferne | P+A | Flug vom Strand in den Orbit: kein sichtbarer Bruch der Fluid-Stufen (Bildreihe), p95 ≤ 33 ms über den ganzen Flug | |
| 7 | fremde Fluide auf N Welten | Methan-Meere, Lava-Ozeane, dichte Atmosphären folgen g und Viskosität | P+A | N = 100 Planeten: Wellen-Dispersion ω² = g·k (tiefes Wasser) im Bild ±15 %; Tropfen- und Wellenbild skaliert sichtbar mit g | |

### Leiter 4 · Wärme, Feuer, Phase — wie viel Welt brennt, schmilzt, gefriert nach der Stoff-Zeile

Misst die Fläche, auf der Wärme wandert und Stoffe ihre Phase wechseln oder verbrennen, mit Tempo nach Physik.

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | 1 Zelle | zündet am Zündpunkt, nass nicht | P | Fackel an trockenes Gras zündet, an nasses nicht | headless |
| 2 | eine Wiese (10³–10⁴ m²) | Front mit dem Wind, Halt an Fluss und nassem Gras, Asche; Eis trägt, Stahl glüht, Lava erstarrt | P (im Brand, nicht im Stand) | 2 000 brennende Zellen: Front-Tempo im Rothermel-Band 0,5–2 m/s, Regen löscht, p95 ≤ 33 ms im Brand-Fenster | headless (CPU 0,2 ms gemessen, Bild-p95 im Brand nicht) |
| 3 | ein Gebäude innen | Raum zu Raum, Flashover, Rauchschicht unter der Decke, Glas springt | P | Flashover nach 3–10 min, Raum-Temperatur gegen ISO 834 ±20 % | |
| 4 | ein Viertel (10⁵ m²) | Funkenflug Dach zu Dach; Stahl verliert Festigkeit ab ≈ 550 °C, die Halle knickt (koppelt Leiter 2) | P+A | Ausbreitung über Häuserreihen je Bauweise im historischen Band; Stahlhalle knickt nach Minuten, nicht Sekunden, nicht nie | |
| 5 | eine Stadt (10⁶–10⁷ m²) | Feuersturm, Aufwind saugt Luft an | P+A | Holzstadt mit Ostwind (London 1666: ≈ 1,8 km² in 4 Tagen): Brandfläche in der Größenordnung ±50 % | |
| 6 | Landschaft (10⁹–10¹¹ m²) | Waldbrand über Wochen, Ökosystem liest die Asche | P+A, Zeitraffer | Brandfläche gegen FARSITE-Rechnung derselben Lage ±30 % | |
| 7 | planetar, Äonen, fremde Welten | Eis-Zeitalter, Magma kühlt zu Kruste, fremde Phasen (Methan-Seen, Eis-Vulkane) | P+A | N = 100 Planeten-Saaten: Phase jedes sichtbaren Oberflächen-Stoffs stimmt mit seinem Phasendiagramm bei Oberflächendruck und -temperatur ≥ 95 % | |

### Leiter 5 · Verformung und Weiches — wie viel sich biegt, knautscht, rutscht, statt starr zu sein

Misst, wie viel Stoff elastisch oder plastisch verformt wird und die Verformung behält: Seil, Tuch, Blech, Schlamm, Schnee, Sand.

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | ein Seil | Länge hält ±2 %, Schwung klingt ab | P | der Flegel schwingt am Leib des Spielers, Seillänge im Bild ±2 % | belegt (Flegel, Bild im Spiel) |
| 2 | Tuch und Hängebrücke | Fahne im EINEN Wind, Brücke trägt den Spieler | P | Fahne und Gras schwingen gemeinsam (Phasen-Korrelation r ≥ 0,6); Brücke hängt unter 90 kg sichtbar durch, Durchhang ±20 % | |
| 3 | ein Wagen knautscht | Blech plastisch, Dellen bleiben, Achse verbiegt, das Fahren ändert sich | P | Frontal 50 km/h gegen Mauer: Knautschtiefe gegen Crashtest ±25 %; danach zieht der Wagen messbar zur Seite | |
| 4 | Boden nimmt Spuren | Schlamm, Schnee, Sand unter Fuß und Rad, die Spur bleibt | P | Reifenspur-Tiefe in nassem Lehm ±30 % gegen Bodenmechanik, sichtbar nach 10 min | |
| 5 | 10³ m³ Schüttgut in Bewegung im Blick | Lawine, Düne rutscht im Schüttwinkel, Erdrutsch nimmt Häuser mit | P | Schüttwinkel trockener Sand 30–35° im Bild; Lawinen-Tempo im gemessenen Band | |
| 6 | jedes Ding verformbar aus seiner Zeile | Metall biegt, Holz splittert, Gummi federt, Eis bricht spröde — ohne Sonderfall | P | Mutation der Streckgrenze ändert die bleibende Verformung im Bild bei 7 von 7 Stoffen | |
| 7 | Kriechen über Zeitalter | Gletscher fließen, Gestein faltet sich (Heim: Geologie — hier die Stoff-Antwort) | P+A, Zeitraffer | Gletscher-Tempo im gemessenen Band 10–1 000 m/Jahr | |

### Leiter 6 · Reaktion und Umwandlung — wie viel Chemie aus der Zeile folgt, bis Epochen aus ihr wachsen (NEU)

Misst, welche Stoff-Umwandlungen (Verbrennen, Explodieren, Rosten, Faulen, Verhütten) aus Zeile, Temperatur und Partner folgen — und ob die Werkstoffe einer Epoche aus dem Prozess entstehen statt aus einer Liste. Die Brücke zu „Zeiten bereisen": Bronze vor Eisen, weil Kupfer bei 1 085 °C schmilzt und Eisen erst bei 1 538 °C.

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | 1 Reaktion | Holz brennt zu Asche und Rauch, Masse bleibt | P | verbranntes Holz: Asche + Rauch-Masse = Holz ±10 % (Zustands-Probe), Rauchmenge sichtbar proportional | |
| 2 | Explosion | Druckwelle nach Ladung, Fenster splittern bis zum gerechneten Abstand | P | Schadensradius ∝ W^(1/3) ±25 % bei drei Ladungen | |
| 3 | Zeit-Reaktionen | Rost, Fäulnis, Gärung, Kochen — Tempo nach Temperatur und Nässe | P | Bildpaar Eisen am See / in der Wüste nach 1 Spieljahr: Rost-Verhältnis ±30 % gegen Korrosions-Raten | |
| 4 | Verhüttung | Erz + Kohle + Hitze → Metall, Glas, Kalk entstehen aus dem Prozess | P | Ofen unter 1 085 °C gibt kein Kupfer, darüber schon; Bewohner oder Spieler verhüttet, das Ergebnis liest die erreichte Temperatur | |
| 5 | Epochen aus Chemie | welche Werkstoffe eine Kultur hat, folgt aus Lagerstätte und erreichter Hitze | P+A | N = 100 Saaten: Werkstoff-Inventar der Siedlungen konsistent mit Lagerstätten und Ofentemperatur ≥ 95 % | |
| 6 | fremde Chemie | andere Atmosphäre, anderes Feuer: ohne Oxidator kein Brand, in Wasserstoff-Welten andere Flammen | P+A | N = 100 Planeten: Feuer nur, wo Brennstoff + Oxidator + Zündtemperatur zusammenkommen — 0 Verstöße in einer Stichprobe von 1 000 Bränden | |

### Leiter 7 · Umströmung und Flug — wie Körper durch Luft und Wasser fliegen, schwimmen, segeln (NEU)

Misst Wurf, Ball, Segel, Flügel und Schwimmen im EINEN Wind und Wasser — die Physik jeder Sportart und jedes Fliegers —, und dass sie mit der Schwere und Luftdichte des Planeten skaliert.

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | 1 Wurf | Ballistik mit Luftwiderstand | P | geworfener Stein und Feder: Wurfweiten gegen Rechnung mit Widerstand ±10 %, die Feder fällt sichtbar langsamer | |
| 2 | ein Ball im Sport | Drall krümmt die Bahn, Abprall nach Fläche | P | Freistoß mit Drall: seitliche Ablenkung im Band realer Messungen ±25 %; Ball auf Rasen und auf Beton: Abprallhöhe nach Stoßzahl ±10 % | |
| 3 | Schwimmen und Segeln | Auftrieb und Widerstand in Wasser und Wind | P | schwimmender Körper: Tauchtiefe = Dichteverhältnis ±5 %; Segelboot fährt am Wind, nicht gegen ihn (Polar-Form) | |
| 4 | Flügel | Gleiter, Vogel, Flugzeug: Auftrieb, Strömungsabriss | P | Mindestfahrt eines Gleiters gegen √(2mg/(ρ·S·C_L)) ±15 %; zu langsam kippt er ab | |
| 5 | Wind der Stadt am Körper | Böen, Thermik, Lee hinter Häusern wirken auf jeden umströmten Körper | P+A | Papier in der Straßenschlucht dreht im Lee sichtbar um; Drachen steigt in der Thermik über heißem Platz | |
| 6 | fremde Konstanten auf N Welten | g und Luftdichte des Planeten skalieren Wurf, Sprung, Flug | P+A | N = 100 Planeten: Wurfweite ∝ 1/g ±10 %, Mindestfluggeschwindigkeit ∝ 1/√ρ ±15 %; Blind-Jury ordnet Sprung-Videos der richtigen Schwere zu ≥ 80 % | |

### Leiter 8 · Stoff-Vielfalt aus dem Samen — wie viele Stoffe die Welt zeigt, die man am Verhalten erkennt

Misst nicht die Länge einer Tafel (Fleiß), sondern die Kraft: wie viele Stoffe aus Zusammensetzung entstehen und ob ein Mensch sie am Verhalten (Fallen, Klingen, Brechen, Brennen) erkennt — ohne Textur. Phasen fremder Stoffe richtet Leiter 4 S7.

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | 10 Stoffe | unterscheidbar am Verhalten, jede Wirkung liest die Zeile | P | Blind-Jury sieht und hört einen grauen Gegenstand fallen, brechen, brennen und benennt den Stoff ≥ 70 % | unter S1: 21 Zeilen in SI, 7 Wirkungen gemessen 4–5, Jury nie gefahren |
| 2 | 10² | Werte gegen Handbuch | P | Stichprobe 50 Zeilen ±10 % gegen Ingenieurs-Tafeln; Jury ≥ 70 % | |
| 3 | 10³ Werkstoffe einer Zivilisation, je Epoche | Legierungen, Gemische, Nahrung aus Leiter 6, nicht eingetragen | P+A | Stichprobe 50 entstandener Werkstoffe: Verhalten gegen Handbuch ±15 % | |
| 4 | 10⁵ über Welten | Eigenschaften aus Zusammensetzung | P+A | 100 zufällige Verbindungen: Dichte- und Schmelzpunkt-Reihenfolge stimmt ≥ 90 % | |
| 5 | 10⁶+ fremde Stoffe | Stoffe, die die Erde nicht kennt, aber die Physik erlaubt | P+A | N = 100 Planeten: Blind-Jury hält fremde Stoffe im Verhalten für „physikalisch denkbar" ≥ 70 % und unterscheidet ≥ 20 je Welt | |

## Stand heute

- **Freie Körper:** EIN Starrkörper-Löser für Kiste und Zylinder, Masse und Trägheit aus Gestalt × ρ der Stoff-Zeile (`stamm/koerper-frei.js:3-15`, `:29-35`); der Kommentar dort sagt selbst: der Wagen-Kern trägt keinen Starrkörper (Fahr-Schritt ohne Drall). Headless 100 wache Körper 0,4 ms (alte Karte). Im echten Spiel an der Stadt kein Bild; die Dinge der Stadt sind keine losen Körper.
- **Tragen und Brechen:** Biegung und Euler-Knick je Glied aus der Stoff-Zeile (`stamm/bau-buch.js:1823-1892`) — **berichtigt:** der Richter ist laut eigenem Kopf ein „GROB-Sanitäts-Richter, kein FEA-Simulator", die Euler-Spannung wird durch `knickSicherheit: 500` geteilt, geeicht auf einen alten Anker (`stamm/bau-buch.js:2580-2591`). Relativ wahr (halbes E knickt früher), absolut nicht. Lastpfad-Bruch macht Teile zu freien Körpern (`stamm/bau-teile.js`, `_werkBricht`); kein Teil bricht in sich, kein Staub, kein gesätes Stadthaus bricht.
- **Fluid:** Zellen-Feld Uint8Array (Luft/Wasser/fest) je Chunk aus Atlas und Grabung (`stamm/wasser-zellen.js:3`, bestätigt) — kein Impuls, keine Strömung. Rauch: Fahne aus Ballen am Feuer. Gas als Feld: nichts.
- **Wärme, Feuer, Phase:** die Front nach Rothermel 1972 auf dem Feld (`stamm/feld-leben.js:2477`, `:2532`, bestätigt), headless 2 000 Zellen 0,2 ms CPU; Phasen-Spalten nur für Eis und Wasser (`stamm/bau-vorlagen.js:1610`). Gebäudebrand, Wärmeleitung durch Bauteile, Festigkeitsverlust: nichts.
- **Verformung:** EIN Seil-Löser im Körper-Kern, gelesen vom Flegel. **Berichtigt:** der einzige „deform"-Treffer in `vehicle-core.js:1317` ist ein Modellier-Werkzeug (BIEGUNG im Deformer-Stapel), kein Knautschen. Plastische Verformung von Wagen, Boden, Metall: nichts.
- **Reaktion:** außer Verbrennen nach Rothermel nichts; die Bearbeitungs-Arten je Stoff (`stamm/bau-buch.js:2624-2626`: Eisen „phaseChange", „plastic") sind Etiketten des Bauplans, keine Chemie.
- **Umströmung:** nichts als Gesetz belegt (kein Widerstand, kein Drall, kein Auftrieb am Körper gesehen).
- **Stoff-Tafel:** **berichtigt:** nicht 7, sondern 21 Zeilen in der SI-Tafel (`stamm/bau-vorlagen.js:1585-1608`: Stein bis Eis, mit μ, Zündpunkt, Rad-μ, Nässe, Körnung); die alte Karte misst 7 Stoffe × 7 Wirkungen mit 4–5 belegt. ρ liest der EINE Leser `_stoffRho`.
- **Ehrliche Einordnung:** im echten Spiel mit Bild belegt sind Leiter 5 S1 und Leiter 3 S0 (Code); alles andere headless oder Werkstatt. Gegen die Vision (Megastadt, Planeten, Zeitalter) liegt dieses Blatt bei ≈ 10⁻⁶ bis 10⁻⁹ des Umfangs.

## Abhängigkeiten

- **Planet und Geologie / Tiefe Zeit:** Magma, Kruste, Erdplatten, Gletscher sind dieses Kontinuum über Äonen; die Geologie liefert Druck und Temperatur, dieses Blatt die Stoff-Antwort (Leiter 4 S7, Leiter 5 S7). Der Verdichter gibt Lavastrom und Gletscher EINEM Heim.
- **Ozean, Wasser und Eis / Atmosphäre, Wetter:** sie besitzen die großen Fluide; Leiter 3 liefert den Löser, Leiter 7 die Wirkung des Winds auf Körper.
- **Architektur / Siedlung und Stadt:** Leiter 2 S4 verlangt, dass gesäte Häuser aus Gliedern mit Stoff bestehen statt aus Fassaden-Kästen.
- **Fahrzeuge und Maschinen:** Knautschen (Leiter 5 S3) und Flug (Leiter 7 S4) liegen im Fahrzeug-Gesetz, der Löser hier.
- **Der Mensch: Leib / Sport:** Ball, Schwimmen, Segeln, Ski (Leiter 7, Leiter 5 S4) sind die Physik jeder Sportart; der aktive Leib wohnt dort.
- **Zivilisation und Epochen:** Leiter 6 S4–S5 ist die Wurzel, aus der Werkzeug-Epochen folgen.
- **Spur, Verfall und Gedächtnis:** Leiter 1 S7, Leiter 2 S8.
- **Kopplung, Kaskade und Katastrophe:** Beben → Bruch → Brand → Flut ist die Kaskade dieses Blatts; ihr Richter sitzt dort.
- **Maßstab-Kontinuum:** die Naht wach/schlafend (Leiter 1 S6, Leiter 3 S6) ist die Voraussetzung jedes Preises ab Sprosse 4.
- **Licht, Bild / Klang:** Feuer-Licht, Rauch-Volumen, Bruch- und Kontakt-Klänge lesen den Zustand dieses Blatts; Leiter 8 S1 braucht den Klang.

## Was die alte Karte hier misst

- **Physik K1** EIN Körper-Gesetz, Masse aus Volumen × Stoff (2/2) → Leiter 1 S1–2, Leiter 8 S1.
- **Physik K2** Kontakt ohne Durchdringen (1/2, Radeon ROT Bild ≠ Kollision) → Richter-Bestandteil von Leiter 1 S2–4.
- **Physik K3** freie Körper und Trümmer, Einsturz nach Lastpfad (2/2) → Leiter 1 S3, Leiter 2 S2.
- **Physik K4** Seile, Tuch, Weiches (1/2) → Leiter 5 S1–2.
- **Physik K5** der aktive Leib → Blatt „Der Mensch: Leib".
- **Stoffe K1** EINE Stoff-Tafel in SI, 7 Wirkungen (1/2) → Leiter 8 S1.
- **Stoffe K2** Feuer nach Rothermel (2/2) → Leiter 4 S2.
- **Stoffe K3** Phasen (2/2) → Leiter 4 S2 (Phasen-Teil).
- **Stoffe K4** Verwitterung, **K5** Sukzession → Blätter „Spur, Verfall" und „Ökosysteme"; Rost und Fäulnis als Reaktion → Leiter 6 S3.
- Die Ω-PHYSIS-Achsen (Schwerpunkt, Lastpfad, Knick) → Leiter 2 S1–2.

Die alte Karte gibt diesem Gebiet 16/20 Punkten; gegen die Vision stehen dieselben Kriterien auf Sprosse 0–3 von 6–8, und im echten Spiel mit Bild auf höchstens Sprosse 1.

## Zweifel

- **Größter Zweifel:** ob 10⁶ im Blick reagierende Körper und 10³ m³ bewegtes Schüttgut im Browser auf Laptop-Grafik bei 33 ms je tragen. Die oberen Sprossen setzen voraus, dass die Physik nur am Schirm rechnet und die Naht unsichtbar bleibt — darum ist die Naht selbst Richter (Leiter 1 S6, Leiter 3 S6).
- Die Bänder der oberen Richter (Kollaps-Zeit, EMS-98, H/46, Stadtbrand-Tempo, Freistoß-Ablenkung) stammen aus allgemeinem Ingenieurwissen, nicht im Einzelnen nachgeschlagen; ±20–50 % sind gesetzt, nicht hergeleitet.
- Blind-Jury-Richter (Leiter 2 S3/S7, Leiter 7 S6, Leiter 8) brauchen eine wiederholbare Jury; ohne sie sind sie Wunsch.
- Offene Frage ohne Richter, darum kein Punkt: ob „Physik fühlt sich wahr an" auf Welten mit erfundenen Stoffen messbar ist jenseits von Phasen, Skalengesetzen und Jury.

## Gegenlese — was sich änderte und was strittig bleibt

- **Zusammengelegt:** „Statik" und „Bruch" sind EINE Leiter (Tragen und Brechen) — ihre ersten Sprossen waren doppelt, Stehen und Versagen sind ein Gesetz.
- **Neu:** Leiter 6 „Reaktion und Umwandlung" (Explosion, Rost, Verhüttung, Epochen aus Chemie — der Weg zu „Zeiten bereisen") und Leiter 7 „Umströmung und Flug" (Ball, Segel, Flügel, fremde g — die Physik „sämtlicher Sportarten" und fremder Planeten) fehlten ganz.
- **Gehoben:** Leiter 1 bis zum Planeten über Jahrhunderte, Leiter 2 bis zu Ruinen über Zeitalter, Leiter 3 bis zu fremden Fluiden auf N Welten.
- **Richter entbaut:** „XPBD", „10⁶ Partikel", „≤ 0,5 ms CPU" und „Stoffe aus Elementen" schrieben eine Bauweise vor; ersetzt durch Seillänge im Bild, bewegtes Volumen, Bild-p95 im Brand und Blind-Jury am Verhalten. Leiter 7 alt („500 Stoffe") maß Fleiß und hatte keinen Preis; jetzt Leiter 8 mit Preis und Erkennbarkeit.
- **Preis vereinheitlicht:** P / P+A, gemessen im Ereignis-Fenster statt im ruhigen Stand — der Brand kostet, nicht die Wiese.
- **Stand berichtigt:** 21 statt 7 Stoff-Zeilen; der Knick-Richter ist durch 500 geeicht und nur relativ wahr; „deform" im Wagen-Kern ist ein Modellier-Werkzeug; headless Belegtes zählt nicht mehr als Sprosse.
- **Strittig:** ob Leiter 8 neben Leiter 4 S7 und Leiter 6 eigenständig bleibt oder als Tiefe in sie fällt; ob Kriechen (Leiter 5 S7) und Lava (Leiter 3 S5) hier oder in der Geologie wohnen; ob die Blind-Jury ein zulässiger Richter im Sinn von R2 ist.
