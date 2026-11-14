# Maßstab-Kontinuum: von der Zelle zur Galaxie

## Die Vision hier

Der Spieler sieht unter der Lupe die Pollenkörner auf dem Staubblatt, hebt den Blick: das Sandkorn auf der Fingerkuppe, die Ameise auf der Blattader — und zieht zurück, ohne ein einziges Ladebild: Hand, Wiese, Dorf, eine Stadt, gegen die Tokio ein Dorf ist, Küste, Kontinent, die Krümmung des Planeten, sein Mond, die Sonne, das System, der Spiralarm, die ganze Galaxie. Das sind gut 26 Größenordnungen (10 µm bis 10²¹ m) in einem Flug, und auf jeder Stufe wirken dieselben Gesetze: der Fluss, der am Ufer das Korn sortiert, baut das Delta, das man aus dem Orbit sieht; die Lichter der Megastadt aus 400 km sind die Wohnungen von Millionen Einzelnen, und jeder Lichtpunkt, den man anfliegt, ist ein Mensch mit seinem Tag; der Stern am Nachthimmel des Dorfs ist der Stern, auf dessen Planet man landet. Und der Maßstab ist eine Perspektive mit eigener Physik: als Ameise überlebt man den Sturz vom Halm, ein Wassertropfen ist eine Kugel, die einen festhält; als Raumschiff gilt Kepler. Jenseits der Gegenwart heißt: beide Enden zugleich, aus EINEM Samen, ohne Download, im Browser, bei 33 ms — und was man aus der Höhe sieht, findet man beim Abstieg wieder.

## Das Beste der Gegenwart

- **Powers of Ten** (Eames, 1977): 40 Größenordnungen (10⁻¹⁶ bis 10²⁴ m) in einem Zoom, aber gemalt und fest, kein Ort ist begehbar.
- **SpaceEngine** (seit 2010): Galaxie bis Planetenoberfläche prozedural auf der GPU, nahtlos. Grenze: der Boden endet bei Gelände und Textur, kein Leben, keine Stadt, unter ~1 m nichts.
- **Star Citizen** (CIG): 64-Bit-Positionen, geschachteltes Objekt-Streaming, Planet → Orbit → Station → Zimmer ohne Ladebild. Grenze: handgebaute Assets, Installation im Bereich von 100 GB, Start in Minuten.
- **No Man's Sky** (2016): ~1,8·10¹⁹ Planeten aus einem Samen, Landung ohne Ladebild. Grenze: geschrumpfte Systeme, Schablonen-Gesetze, Oberfläche ohne Geschichte, Bevölkerung im Dutzend.
- **Microsoft Flight Simulator** (2020/2024): die ganze Erde aus jeder Flughöhe, aus gestreamten Kartendaten im Petabyte-Bereich statt aus Gesetzen; in Bodennähe grob, Städte ohne Bewohner.
- **Kerbal Space Program / Outer Wilds**: Floating Origin trägt ein System in 32-Bit-Physik; KSP zeigt Jitter bei großen Distanzen, Outer Wilds hält sein System klein.
- **Outerra**: ein Planet von Orbit bis Zentimeter, fraktal verfeinert. Grenze: spärliches Leben, keine Städte aus Gesetzen.
- **Grounded** (Obsidian, 2020) und **Spore** (Maxis, 2008): Ameisen-Maßstab als Spiel bzw. Zelle → Galaxie als Abfolge — aber Grounded kennt nur einen Maßstab, und Spore schaltet zwischen getrennten Spielen statt einer Welt.
- **Cities: Skylines / Assassin's Creed Unity**: zehntausende simulierte Bürger bzw. bis zu ~5 000 sichtbare Figuren in einer Szene — die Menge ist dort Kulisse oder auf eine Stadt begrenzt, nie aus dem Orbit bis zum Gesicht verfolgbar.
- **Wirklichkeit**: Zelle 10 µm, Sandkorn 0,0625–2 mm, Kapillarlänge Wasser 2,7 mm, Erdradius 6,37·10⁶ m, Neptunbahn 4,5·10¹² m, Milchstraßen-Scheibe ~10²¹ m. Größter Ballungsraum der Erde (Tokio) ~3,7·10⁷ Menschen.

## Der Same

**Die Welt als Funktion von (Ort, Maßstab, Zeit).** Jede Stufe ist die bedingte Verfeinerung der gröberen: sie erbt deren Mittelwert und Statistik (Galaxie → Stern → System → Platte → Kontinent → Flussnetz → Korngröße am Ufer; Region → Stadt → Viertel → Haus → Bewohner), und gezeichnet wird nur die Stufe, die der Schirm auflöst. Positionen sind hierarchisch und relativ, sodass keine Zahl mehr als ihre Stufe tragen muss. Das Gegenstück: was eine feine Stufe ändert (ein Damm, ein gebautes Haus, ein Mensch, der das Licht anknipst), wird in die gröberen zurückgemittelt — der Blick aus der Höhe ist die Summe der Einzelnen, nie ein Bild von ihnen. Und die Physik ist dimensionslos geschrieben (Reynolds, Bond, Froude, Kepler), damit dasselbe Gesetz die Ameise schweben und den Menschen fallen lässt.

Fremde Branchen haben das gelöst: die **Kartografie** mit der Kachel-Pyramide (Zoom 0–22, nur der Schirm wird geladen); die **Astrophysik** mit Zoom-in-Simulationen und Adaptive Mesh Refinement (die grobe Lösung als Randbedingung der feinen); die **Bildkompression** mit Wavelets (jede Auflösung ist die gröbere plus Detail); die **Strömungslehre** mit Ähnlichkeitsgesetzen (ein Modell im Kanal sagt das Schiff voraus). Die Lehre ist dieselbe: die Kosten folgen dem Schirm, nie der Größe der Welt (Gebot 7).

**Der Preis P** gilt in jeder Sprosse, sofern sie nichts Strengeres nennt: Frame p95 ≤ 33 ms auf BEIDEN Standardgeräten (Radeon 890M, GTX 1060), kein Ladebild, null Download über das Skript, VRAM im Band des Profi-Bands. Eine Sprosse, deren Richter P nicht mitmisst, ist nicht gehalten. Jeder Richter fährt über N zufällige Saaten (R4), nie über einen gepflegten Messort.

## Die Leitern

### L1 Die Spanne ohne Bruch — wie viele Größenordnungen ein Flug trägt, ohne dass sich eine Stufe verrät

Misst die größte zusammenhängende Spanne der Bildbreite (am Boden bzw. Bildfeld im Raum), über die ein ununterbrochener Flug in beide Richtungen alle Bruch-Bedingungen hält: keine Lücke und kein Ladebild, Pop-Bilder ≤ 0,5 % (lokale Änderung > 8 % Luma auf > 0,5 % Fläche ohne Bewegungsursache), Jitter am Auge < 0,5 px, mittlere Farbe je Zelle ohne Sprung > ΔE₀₀ 3, und P. Die Spanne zählt nur bis zur ersten Stelle, an der eine Bedingung reißt — wer Spanne durch grobes Umschalten erkauft, verliert sie.

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| S1 | 3 Größenordnungen: Bildbreite ~1 m (Auge 0,5 m) bis ~1 km, Lauf, Fahrt, Steigflug | Wiese, Baum, Haus und Gelände wechseln ihre Stufen unsichtbar | P | N = 20 Saaten × Steigflug 0,5 m → 700 m Auge in 30 s, hin und zurück: Bruch-Bedingungen gehalten über die volle Spanne | unter S1 — die Wiese trägt bis ~20 m, der Fern-Saum ist ROT (Kohärenz 0,60), die Spanne ohne Bruch ist nie gemessen |
| S2 | 5: 1 cm bis 1 km Bildbreite; 0,5 m bis ~20 km Sicht ohne Kante | Halm und Blatt im Nahzoom mit Parallaxe und Eigenschatten; Wald, Wiese, Siedlung gehen ohne Farbsprung in die Landschaft | P | wie S1, Spanne 1 cm → 1 km Bildbreite | |
| S3 | 8: 1 mm bis 100 km; der Planet krümmt sich | Korn als Körper; Horizont sinkt mit der Höhe wie auf einer Kugel | P | wie S1, Spanne 1 mm → 100 km; Horizont-Absenkung aus 10 km Auge gegen √(2h/R) ±10 % | |
| S4 | 10: Korn bis ganzer Planet (10⁷ m) | Gelände wird Kugel, Atmosphäre von innen wird Atmosphäre von außen, Tag-Nacht-Grenze, Wolken, Ozeane | P, Ankunft ≤ 5 s | Flug Boden → Orbit (40 000 km) → Boden auf der anderen Planetenseite, N = 20 Saaten, Bruch-Bedingungen gehalten | |
| S5 | 13: bis Sonnensystem (10¹³ m), wahre Abstände | Planeten in Bahnen aus der Bahnmechanik des Samens, nicht geschrumpft | P | Flug Boden → Nachbarplanet → Landung; Bahnabstand gegen die Mechanik ±1 %; Jitter eines Objekts in 10¹² m vom Ursprung < 0,5 px bis zum Ranflug auf 1 m | |
| S6 | 17: bis Nachbarsterne (10¹⁷ m) | jeder Lichtpunkt ein System mit Planeten | P | Flug zu 10 zufälligen Nachbarsternen, Landung je auf einem Planeten, Bruch-Bedingungen gehalten | |
| S7 | 21: bis Galaxie (10²¹ m) | Stern wird Punkt wird Feld wird Arm; der Gesamtfluss der Felder bleibt beim Wegzoomen erhalten | P | Spanne 1 mm → 10²¹ m; Gesamtfluss der Sternfelder ±5 %, kein Aufblitzen | |
| S8 (Vision) | **26: 10 µm (Pollen, Zelle) bis 10²¹ m, in beide Richtungen** | dieselben Gesetze auf jeder Stufe, jede Stufe begehbar | P | EIN Flug Pollenkorn → Galaxie → Pollenkorn auf einem anderen Planeten in ≤ 120 s, N = 20 Saaten: Spanne ≥ 10²⁶ ohne Bruch, Pop ≤ 0,1 % | |

### L2 Die Treue über die Stufen — was man von oben sieht, findet man unten

Misst, ob ein Merkmal, das aus der Höhe sichtbar ist, beim Abstieg an derselben Stelle und in derselben Farbe wieder auftaucht (eine Welt statt zweier).

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| S1 | Gelände-Lage 0–20 km | ferner Grat steht dort, wo man ihn erreicht; Luft nach Koschmieder | P | Grat-Lage im Fernbild gegen Lage beim Hinlaufen ±2 px; Restkontrast am Rand ≤ 2 %; Kontrast e^(−βd) ±15 % | HEUTE (Restkontrast 1,1–1,9 % bei 18–23 km, Koschmieder 0,87–1,07, beide Geräte) |
| S2 | Bedeckung 0–8 km | Wald, Wiese, Fels, Siedlung aus der Ferne in Farbe und Gefüge des Bodens | P | N = 100 Saaten-Orte: mittlere Farbe der Zelle aus 8 km gegen aus 10 m, ΔE₀₀ ≤ 5 in ≥ 90 %; Kamm-Gefüge gegen REF Mischwald | |
| S3 | Siedlung, Straße, Fluss 0–50 km | aus 50 km steht die Stadt dort, wo man in ihr steht | P | N = 100: Lage von Straße und Fluss im Höhenbild gegen Lage am Boden ≤ 1 Pixel der Höhenstufe in ≥ 95 % | |
| S4 | ganzer Planet | Wolken aus dem Orbit = Wetter am Boden; Nachtlichter = erleuchtete Häuser | P | Bedeckung über 50 Orten im Orbitbild gegen Himmel am Boden ±10 %; Nachtlicht-Pixel gegen gezählte erleuchtete Fenster am Boden r ≥ 0,9 | |
| S5 | Sonnensystem | Planet am Himmel = Planet beim Anflug (Phase, Helligkeit, Ringe, Farbe) | P | Phase ±2°, Farbe ΔE ≤ 5, vom Boden gegen Anflug | |
| S6 | Galaxie | Sternenhimmel des Dorfs = Sterne der Galaxie-Ansicht | P | Lage der 500 hellsten Sterne ±0,1°; Milchstraßen-Band an der Stelle der Scheibe | |
| S7 (Vision) | **alle 26 Größenordnungen** | jedes sichtbare Merkmal jeder Stufe hat seinen Ort auf der feineren Stufe | P | 1000 zufällige Abstiege über N = 50 Saaten (Galaxie → Korn): Anteil, in dem ein zufällig gewähltes sichtbares Merkmal der oberen Stufe an seiner Stelle wiedergefunden wird, ≥ 95 % | |

### L3 Die Tiefe am kleinen Ende — wie wahr ist die Nähe

Misst, wie viel echte Struktur das Bild bei kleiner Bildbreite trägt, gegen Makro- bzw. Mikroskop-Fotos derselben Bildbreite und Bodenklasse, an zufälligen Orten — nie an einem gepflegten Fleck.

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| S1 | Bildbreite 2 m (Blick vor die Füße), N = 100 Orte | Boden mit Halmen und Steinen | P | Spektrum des Bilds gegen REF-Foto der Bodenklasse: Energie über 1/20 der Bildbreite ≥ 50 % der Referenz in ≥ 80 % der Orte | ungemessen (die Armlänge-Pose der alten Karte prüft Pixel, nicht Spektrum) |
| S2 | 50 cm | einzelne Halme, Kiesel, Laubstreu | P | wie S1 gegen Foto 50 cm; Textur-Statistik (Gram) im Band der Referenz | |
| S3 | 10 cm | Blattadern, Rindenrisse, Bodenkrümel mit Eigenschatten | P | wie S1 gegen Makrofoto 10 cm | |
| S4 | 1 cm | Ameise, Korn, Moospflänzchen | P | bei 1 cm seitlicher Kamera-Bewegung: Bewegungsfeld (optischer Fluss) gegen die Tiefe des Makro-Stereopaars, Fehler ≤ 20 % — die Nähe hat Raum, kein gestrecktes Bild | |
| S5 | 1 mm | Sandkörner mit Form und Farbe aus dem Gestein | P | Korngrößen-Verteilung im Bild am Ufer gegen die Sortierung des Flusses: Wentworth-Klasse richtig an ≥ 90 % von 100 Uferorten | |
| S6 | 0,1 mm, überall auf jedem Planeten | Korn, Kristall, Pollen aus dem Gesetz des Ortes | P | N = 100 zufällige Orte auf 10 Saaten-Planeten: Bildvergleich gegen Makrofoto der passenden Bodenklasse, plausibel in ≥ 90 % | |
| S7 (Vision) | **10 µm: der Mikroskop-Blick** | Zelle, Pollenwand, Milbe — das Leben des Ortes unter der Lupe | P | N = 100 zufällige Orte: Bildvergleich gegen Lichtmikroskopie derselben Klasse, plausibel in ≥ 80 %; das gefundene Leben passt zum Biom des Ortes | |

### L4 Der Sprung — Sekunden bis zum Bild an jedem Ort und Maßstab

Misst den Preis der Reichweite: wie schnell ein Sprung an einen beliebigen Ort und Maßstab ein vollständiges Bild trägt (die kalte Ankunft gehört „Ankunft, Geräte und Zugang"; hier der Sprung im laufenden Spiel).

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| S1 | 10² erreichbare Orte: zufälliger Ort im Umkreis 10 km | volles Bild am Boden | ≤ 2 s bis Bild ohne Lücke, danach P | N = 20 Sprünge: p95 Sekunden bis Bild ohne Lücke | ungemessen (kalte Ankunft heute 11–17 s; Sprung im Spiel nie gemessen) |
| S2 | ganzer Planet (10⁸ Orte zu je 100 m) | volles Bild am Boden | ≤ 2 s, P | wie S1, Ziel überall auf dem Planeten | |
| S3 | anderer Planet desselben Systems | volles Bild am Boden | ≤ 2 s, P | wie S1, Ziel auf anderem Planeten | |
| S4 | beliebiger Stern der Galaxie (10¹¹) | volles Bild am Boden eines seiner Planeten | ≤ 2 s, P | N = 20 zufällige Sterne | |
| S5 | beliebiger Ort UND beliebiger Maßstab | volles Bild auch im Nahzoom und aus dem Orbit | ≤ 1,5 s, P | N = 50 Zufalls-Sprünge über alle Stufen | |
| S6 (Vision) | **jeder Ort, jeder Maßstab, 10 µm bis 10²¹ m** | volles Bild | ≤ 1 s, P | N = 100 Zufalls-Sprünge über alle Stufen und Saaten: p95 ≤ 1 s bis Bild ohne Lücke, Frame p95 danach ≤ 33 ms | |

### L5 Der Fluss durch die Stufen — eine Tat auf einer Stufe, sichtbar auf der anderen

Misst die Kopplung über Maßstäbe (R7): was auf einer feinen Stufe geschieht, ändert die gröberen sichtbar, und umgekehrt.

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| S1 | ein gebautes Haus aus 400 m | das Haus steht im Steigflug, wo es gebaut wurde | P | Haus in der Werkstatt bauen, aufsteigen: Pixel des Hauses im Bild aus 400 m an seiner Stelle | ungemessen |
| S2 | eine Tat aus 10 km | Rodung, Damm, Siedlung ändern Farbe und Form im Fernbild | P | Bildpaar aus 10 km: Änderung an der Stelle der Tat ΔE ≥ 5, sonst ≤ 1 | |
| S3 | eine Tat aus dem Orbit | Stausee, Stadt, Waldbrand aus 400 km | P | Bildpaar aus dem Orbit: Fläche der Änderung gegen Fläche am Boden ±10 % | |
| S4 | ein Prozess aus dem Orbit | Aschewolke, Sturm, Lavastrom wirken auf Licht und Wetter am Boden | P | Aschewolke im Orbitbild an der Stelle; Bodenlicht darunter gegen die Wolkendichte ±15 % | |
| S5 | Planet im System | Nachtlicht, Eiszeit, Vulkanwinter im Planetenscheibchen aus 10⁹ m | P | Nachtlicht und Eisbedeckung im Scheibchen gegen den Bodenstand ±10 % | |
| S6 (Vision) | **jede Tat, jede Stufe, beide Richtungen** | das Korn verlagert sich im Fluss, der Fluss baut das Delta, das Delta sieht man aus dem Orbit; der Stern setzt das Licht, das Licht das Wachstum, das Wachstum den Boden | P | N = 100 Zufalls-Ereignisse auf 6 Stufen: Anteil, deren Folge zwei Größenordnungen darüber und darunter richtig sichtbar ist, ≥ 90 % | |

### L6 Die Menge im Blick — wie viele lebende Einzelne ein Maßstab trägt

Misst die Bevölkerung als Maßstabs-Gesicht: wie viele Einzelne (Menschen, Tiere, Fahrzeuge) ein Blick trägt — und dass die Menge in der Ferne die Summe der Einzelnen ist, nicht ein Bild von ihnen. Richter je Sprosse: Zahl der unterscheidbaren, sich bewegenden Einzelnen im Blick, und N = 100 zufällig gewählte Punkte der Menge (Lichtpunkt, Gestalt, Wagen), angeflogen bis Augenhöhe: Anteil, an dem dort ein Einzelner steht, der dasselbe tut wie in der Ferne (Ort ±2 m, Richtung, Tätigkeit, beleuchtetes Fenster) — dazu P.

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| S1 | 10² Einzelne in einem Blick (ein Platz) | jeder mit eigenem Weg und Tag | P | Zählung + Anflug-Treue ≥ 95 % | HEUTE als Umfang (Test-Stadt 35 Häuser, 118 Bewohner), Treue und P dort ungemessen |
| S2 | 10³ (Marktplatz einer Stadt aus 300 m) | Gedränge ohne Klon-Muster: Gang, Kleidung, Ziel verschieden | P | Zählung + Treue ≥ 95 %; Anteil identischer Paare (Gestalt + Gang) unter 1000 ≤ 1 % | |
| S3 | 10⁴ (Viertel aus 1 km) | Ströme zur Arbeit, zum Markt, nach Hause folgen der Uhr | P | Zählung + Treue ≥ 90 %; Dichte je Straße gegen Uhrzeit im Band einer realen Pendler-Kurve | |
| S4 | 10⁵ (Stadt aus 5 km, Verkehr sichtbar) | Wagen und Menschen als Ströme auf Trassen, Stau entsteht, wo er entstehen muss | P | Zählung + Treue ≥ 90 %; Fluss-Dichte-Kurve der Straßen im Band der Verkehrswissenschaft | |
| S5 | 10⁶ (Metropole aus 30 km, nachts) | die Lichter sind die Wohnungen, die gerade wach sind | P | Treue ≥ 90 %; Nachtlicht-Anteil gegen die Zahl der Wachen am Boden ±10 % | |
| S6 (Vision) | **10⁷–10⁸ in einem Blick: eine Megastadt jenseits Tokios, aus dem Orbit bis zum Gesicht** | jeder Punkt der Menge ist ein Einzelner mit Leben, aus EINEM Samen | P | N = 20 Saaten-Städte: Zählung ≥ 10⁷ im Blick, Treue des Anflugs ≥ 90 %, Klon-Paare ≤ 1 % | |

### L7 Die Physik des Maßstabs — ein Gesetz, das bei jeder Größe anders wirkt

Misst, ob dieselbe Physik je Größe das Richtige tut (Fähigkeit, nicht Liste): Körper aus zufälligen Größenordnungen, geworfen, fallen gelassen, benetzt, umlaufend — gegen die dimensionslosen Gesetze der Wirklichkeit.

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| S1 | 1 Größenordnung (Mensch, Wagen, Kiste: 0,5–5 m) | Fall, Stoß, Fahrt plausibel | P | Fallzeit aus 10 m gegen √(2h/g) ±5 %; Bremsweg gegen μ ±10 % | HEUTE als Bereich (Körper- und Fahrt-Physik im Mensch-Maßstab), gegen die Formel ungemessen |
| S2 | 3 Größenordnungen (Ameise bis Haus) | die Ameise überlebt den Sturz, weil die Luft sie bremst; der Mensch nicht | P | Endgeschwindigkeit eines 5-mm-Körpers ±20 % gegen Messung (~6 m/s); Sturz-Folge passend zur Größe | |
| S3 | Flüssigkeit über den Maßstab | Tropfen unter der Kapillarlänge kugelig, darüber flach; ein Tropfen hält die Ameise fest | P | Form liegender Tropfen gegen Bond-Zahl ±15 % bei 0,5/2,7/10 mm | |
| S4 | Bahn (Mond, Raumschiff) | Umlauf aus der Schwere des Samens, nicht aus Schienen | P | Umlaufzeit gegen Kepler ±1 %; ein Wurf aus dem Orbit fällt dort, wo die Mechanik sagt | |
| S5 | Planet als Körper | Gezeiten aus Mond und Sonne, Abplattung aus der Drehung | P | Tidenhub-Periode gegen Mond-Sonne-Rechnung ±5 %; Abplattung gegen Drehung ±10 % | |
| S6 (Vision) | **10 µm bis 10⁷ m, jede Größe** | EIN Gesetzessatz trägt Staub, Ameise, Mensch, Schiff, Mond | P | N = 100 Körper mit zufälliger Größe (log-gleichverteilt über 12 Größenordnungen) in zufälligen Handlungen: Verhalten im Band der dimensionslosen Gesetze (Re, Bond, Froude, Kepler) in ≥ 90 % | |

## Stand heute

- **Die Welt ist eine flache, endlose Ebene**, keine Scheibe mit Rand: die letzte Fern-Schale endet sichtbar bei 18–23 km (Restkontrast 1,1–1,9 %, MEISTERKARTE.md:589); das Panorama-Feld reicht bis 40 km (`stamm/bild-sicht.js:3877` FELD_PASS `rMaxM: 40000`) und deckt den Blick bis Auge ~2,8 km (`stamm/bild-sicht.js:3888` „camY 2800"). Das Gelände kennt keine Krümmung.
- **Berichtigt — die Kugel gibt es schon, aber nur im Himmel**: das Atmosphären-Gesetz rechnet mit einem Kugelplaneten (`foundry-core.js:284` `erdeM: 6360e3, randM: 6460e3`), samt Höhe des Orts in km (`stamm/bild-himmel.js:1784` `_atmoOrtKm`). Der Himmel ist kugelig, der Boden flach — ein Zwilling nach Gebot 4, der beim Steigflug über ~10 km als Widerspruch zwischen Luft-Horizont und Gelände-Horizont sichtbar wird; L1 S3 ist sein Richter.
- **Das kleinste Auge**: `stamm/bild-sicht.js:3861` `HOEHLEN_AUGE_M = 0.25`; die Wiese trägt bis ~20 m (Messung 14.11.); der größte Chunk-Ring 540 m (`stamm/siedlung-wege.js:1839`).
- **Darüber**: Planeten als Punkte des Sternfelds (`stamm/bild-himmel.js:3230`); der Mond mit dem Durchlass derselben Atmosphäre (`stamm/bild-himmel.js:1778`).
- **Gemessen**: Koschmieder 0,87–1,07, Kante 1,1–1,9 % (beide Geräte), Fern-Saum ROT (Kohärenz 0,6029, Radeon), Abendschatten 1/2, Sturm-Sicht 1508–1553 m (MEISTERKARTE.md:588–592); kalte Ankunft 11–17 s (B).
- **Menge**: Stadt des Worts 300 Häuser, Test-Stadt 35 Häuser mit 118 Bewohnern (14.11.) — Größenordnung 10², das Ziel 10⁷–10⁸.
- **Befund**: gemessen ohne Bruch ist heute keine Spanne; die Spanne mit Fehlern liegt bei ~4,5 der 26 Größenordnungen (logarithmisch ~17 %, linear ~0). Gehalten sind nur L2 S1 und die Umfangs-Spalten von L6 S1 und L7 S1. Es gibt keinen begehbaren Planeten, keinen Orbit, kein System, keine Galaxie, keinen Nahzoom unter Augenhöhe und keine Physik über den Maßstab.

## Abhängigkeiten

- **Der Same: Architektur der Entfaltung** (ZUERST): die Funktion (Ort, Maßstab, Zeit) und die hierarchischen Koordinaten; ohne sie ist jede Stufe über L1 S2 ein Zwilling.
- **Planet und Geologie / Tiefe Zeit**: die Kugel (deren Radius das Atmosphären-Gesetz schon trägt), Platten, Kontinente — L1 S3–S4, L2 S3, L7 S5.
- **Himmel, Sonnensysteme und fremde Welten**: Bahnen, Sterne, Galaxie (L1 S5–S8, L2 S5–S6, L7 S4). Jenes Blatt misst, WAS im Himmel steht; dieses, dass man nahtlos hinkommt und es dasselbe bleibt.
- **Städte und Bevölkerung / Verkehr (C)**: L6 ist deren Maßstabs-Gesicht; die Tiefe des Einzelnen misst jenes Blatt, hier zählt die Summe und die Treue beim Anflug.
- **Licht, Bild und Horizont**: Ferne und Luft (L2 S1–S2) teilt sie; dieses Blatt erweitert sie über die Atmosphäre hinaus.
- **Erosion und Boden / Pflanzen / Tiere / Evolution**: das kleine Ende (L3) bis zur Zelle.
- **Kopplung, Kaskade und Katastrophe**: L5 ist deren Maßstabs-Gesicht.
- **Ankunft, Geräte und Zugang**: die kalte Ankunft (B ≤ 5 s); L4 misst den Sprung im laufenden Spiel.
- **Der Spieler: Perspektive, Rolle und Reise**: Ameise, Mensch, Schiff als Rollen; L7 ist deren Physik.

## Was die alte Karte hier misst

Bereich III, **14 Ferne bis zum Horizont — 6/10** (MEISTERKARTE.md:575–592):
- K1 Luft nach Koschmieder, 2/2 → L2 S1.
- K2 Die Welt hat keine Kante, 2/2 → L2 S1 (und Bedingung „keine Lücke" in L1).
- K3 Bewaldete Grate tragen einen Saum bis 8 km, 0/2 → L2 S2 und Bruch-Bedingung in L1 S1–S2.
- K4 Grate werfen Abendschatten in ferne Täler, 1/2 → Teil von L2 S1 (Lage-Treue).
- K5 Die Ferne im Wetter, 1/2 → Teil von L2 S4 (Wetter oben = Wetter unten).
- Die Posen-Matrix (Ego, Third, Armlänge, vom Hügel, MEISTERKARTE.md:19) → L1 S1 und L3 S1.
- Ankunft (B) → Ankunfts-Blatt; L4 setzt darauf.
Die alte Karte misst nichts unter Augenhöhe, nichts über ~3 km Auge, keine Menge über einen Ort hinaus und keine Physik über den Maßstab.

## Zweifel

- **Ob 10 µm überall eine faire Sprosse ist**: kein Spiel und kein Datensatz liefert das; ob Mikroskop-Referenzen je Biom beschaffbar sind, ist offen (offene Frage, Richter L3 S7 dann nur mit Fotos einzelner Klassen).
- **Über die Galaxie hinaus** (Lokale Gruppe 10²³ m, kosmisches Netz): der Schöpfer nannte Sonnensysteme und Planeten, nicht Galaxien-Haufen — offene Frage, kein Punkt.
- **Die Galaxie im Browser**: ob 10²¹ m mit 32-Bit-GPU-Arithmetik ohne Jitter tragen, ist in WebGPU nicht vorgeführt.
- **L6 Treue beim Anflug** setzt voraus, dass die Ferne die Einzelnen kennt, ohne sie alle zu rechnen; ob das mit P vereinbar ist, ist der eigentliche Prüfstein des Samens (Gebot 7).
- **Die Schwellen** (ΔE ≤ 5, Pop ≤ 0,5 %, Jitter < 0,5 px, ≥ 90/95 %) sind gesetzt, nicht aus Wahrnehmungsstudien abgeleitet.
- **Zahlen der Gegenwart** (No Man's Sky, MSFS, Star Citizen, AC Unity) aus Allgemeinwissen und Presse, nicht aus Primärquellen.

## Gegenlese — was sich änderte und was strittig bleibt

- **Zusammengelegt**: die alte L1 (Spanne) und L3 (Übergang ohne Bruch) waren dieselbe Leiter — eine Spanne zählt nur so weit, wie keine Stufe sich verrät; die neue L1 misst genau das, die alte Lücke „Spanne durch grobes Umschalten" ist zu.
- **Gehoben**: unteres Ende 0,1 mm → 10 µm (Mikroskop-Blick, die „Evolutionen" des Schöpfers beginnen bei der Zelle); Megastadt 10⁷–10⁸ statt keiner Menge.
- **Neu**: L6 Menge im Blick (die Millionen Personen als Maßstabs-Gesicht, gerichtet durch Anflug-Treue statt Zählung allein) und L7 Physik des Maßstabs (ein Gesetz, viele Größen — Fähigkeit statt Liste).
- **Richter berichtigt**: „Anteil Geometrie statt Textur" schrieb eine Bauweise vor → optischer Fluss gegen Makro-Stereo; jeder Richter fährt über N Saaten; der Preis P (beide Geräte, kein Ladebild, null Download, VRAM) steht in jeder Sprosse statt nur „33 ms".
- **Stand berichtigt**: die Kugel gibt es schon im Atmosphären-Gesetz (`foundry-core.js:284`, 6360 km) — der Grep „findet nichts" war falsch, und das ist ein Himmel-Boden-Zwilling; die Welt ist eine endlose Ebene, keine Scheibe, ihre sichtbare Kante liegt bei 18–23 km, nicht 40 km; HEUTE-Marken ohne Messung heißen jetzt „ungemessen" bzw. „unter S1".
- **Strittig**: ob L5 (Fluss durch die Stufen) nicht in das Kopplungs-Blatt gehört; ob L7 nicht eher ein Physik-Blatt ist; ob 10 µm eine Sprosse oder eine offene Frage sein muss; die Schwellen sind gesetzt, nicht abgeleitet.
