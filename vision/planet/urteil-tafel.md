# Das Urteil je Größe (erzeugt von `urteil.cjs`, nicht abgetippt)

Je Zeile: id · Größe · Ort · vorher (Zensus) · Urteil · Stufe · Grund. Geordnet nach Urteil, dann Stufe.

## FOLGT (158)

| id | Größe | Ort | vorher | Stufe | Grund |
|---|---|---|---|---|---|
| a10 | Rausch-Periode (vendor) | `vendor/simplex-noise.js:54` | folgt | unter dem Band | perm[i & 255] (vendor/simplex-noise.js:54, :118) |
| a1 | Welt-Form: Höhe als Funktion f(x,z) | `gelaende-core.js:2819` | folgt | §5 Naht | die Heimat-Höhe f(x, z) bleibt die Form unter dem Band, gestellt auf die Planet-Höhe am Anker (§5) |
| a2 | Ursprung / erster Spawn | `stamm/gelaende-chunks.js:1392` | gesetzt | §5 Naht | der Ursprung der Heimat ist der Anker |
| a6 | Basis-Höhe | `gelaende-core.js:5679` | gesetzt | §5 Naht | die Heimat-Höhe ist die gestauchte Planet-Höhe am Anker |
| a77 | Kühlung je Meter | `gelaende-core.js:5850` | folgt | §5 Naht | Sommer-Mittel 18 °C (:1313) auf die Mitte der Schneegrenze (:1282) |
| a78 | Höhen-Stauchung Planet | `planet-core.js:2307` | folgt | §5 Naht | Erde-Gradient 0,0065 K/m gegen kuehlungKJeM |
| a87 | Landung der Reise | `gelaende-core.js:5790` | gesetzt | §5 Naht | die Landung einer Reise ist eine Adresse |
| d63 | Breite der Heimat | `welt-licht.js:697-717 · gelaende-core.js` | gesetzt | §5 Naht | die Breite der Heimat ist die Breite des Ankers |
| d66 | Länge · Ortszeit | `welt-licht.js:699-701` | gesetzt | §5 Naht | die Länge der Heimat ist die Länge des Ankers |
| e210 | Anker-Lage breite / laenge / kuesteKm | `planet-core.js:2237` | folgt | §5 Naht | aus der Suche |
| a84 | Plan-Normalform | `gelaende-core.js:5962` | folgt | S0 Körper | LANDFORM_REGLER (:5968–5973) |
| c8 | TEMPERATUR.jahrTage (Tage je Saison-Zyklus der Physik) | `gelaende-core.js:1319` | gesetzt_anker | S0 Körper | jahrTage des Körpers; in Uhr-Sekunden = Tag der Uhr × jahrTage |
| c13 | seasonYearSeconds (Länge des Jahrs auf der Welt-Uhr) | `stamm/dirigent-kern.js:311` | gesetzt | S0 Körper | jahrTage des Körpers; in Uhr-Sekunden = Tag der Uhr × jahrTage |
| c15 | PEGEL_TAG_S (Spieltag des Pegels und der Nässe-Dosis) | `stamm/daten.js:166` | folgt | S0 Körper | Spieltag = Tag der Uhr (Zeitraffer) |
| c26 | Phasen der Front und Feuchte (Saat) | `phyto-core.js:4337` | folgt | S0 Körper | Saat der Welt (worldMeta.seed, stamm/bild-himmel.js:2847); kein Math.random |
| d65 | Achsneigung in der Sonne | `welt-licht.js:711-717` | gesetzt | S0 Körper | neigungRad des Körpers |
| e18 | gS = 9,81/g | `planet-core.js:330` | folgt | S0 Körper | aus g: gS = 9,81/g |
| e157 | KLIMA.tropoKm | `planet-core.js:1863` | gesetzt | S0 Körper | Tropopause ∝ T/g aus dem Körper (10 km × 9,81/g × T/288) |
| e183 | fJ Jahres-Normierung | `planet-core.js:2063` | folgt | S0 Körper | aus jahrTage und PLANET_ERDE.jahrTage |
| e59 | Q Krusten-Schwelle | `planet-core.js:787` | folgt | S1 Platten | aus krustenAnteil: Quantil über 4096 Fibonacci-Proben (:795–:799) |
| e232 | o.rand (Art, Abstand, Rate) | `planet-core.js:2353` | folgt | S1 Platten | aus dem Punkt |
| a23 | land | `gelaende-core.js:381` | gesetzt | S2 Relief | Land-Anteil aus S2 (wildnis.land) |
| a25 | hoehe (Relief-Skala) | `gelaende-core.js:383` | gesetzt | S2 Relief | Relief-Maß aus S2 (orogenStaerke, gS ∝ 1/g) |
| a27 | OFFSET-Spline C → m | `gelaende-core.js:405` | gesetzt | S2 Relief | Großform-Höhe aus S2 |
| a28 | RELIEF-Spline E → m | `gelaende-core.js:415` | gesetzt | S2 Relief | Gebirgshöhe aus S2 (Kollision, Bogen, Gedächtnis) |
| a29 | Küsten-Rampe | `gelaende-core.js:578` | gesetzt | S2 Relief | Küsten-Profil aus S2 (Kruste, Schelf, Hang) |
| a32 | Grundhöhe K | `gelaende-core.js:598` | folgt | S2 Relief | Splines OFFSET und RELIEF |
| a33 | Hebung U | `gelaende-core.js:599` | folgt | S2 Relief | rel, off (Großform) |
| a34 | Tafelland-Stil | `gelaende-core.js:591` | gesetzt | S2 Relief | Tafel aus S2 (wildnis.tafel) |
| a35 | Trog-Gewicht | `gelaende-core.js:601` | gesetzt | S2 Relief | Trog aus S2 (wildnis.trog) |
| a40 | ks (Steilheits-Index) | `gelaende-core.js:390` | gesetzt | S2 Relief | Steilheit ks aus S2 (wildnis.ks = 3 + 12·konv) |
| a43 | Meer-Sohle | `gelaende-core.js:707` | gesetzt | S2 Relief | Schelf aus S2 (Krusten-Profil, shelfKm) |
| a63 | Schicht-Periode | `gelaende-core.js:1049` | folgt | S2 Relief | schichtDicke, hartAnteil, Winkel (gerechnet §2) |
| a64 | Schicht-Bezug | `gelaende-core.js:1200` | folgt | S2 Relief | Treppe ab der Sohle JEDES Segments |
| a67 | Bathymetrie | `gelaende-core.js:1887` | gesetzt | S2 Relief | Schelf aus S2 (Krusten-Profil, shelfKm) |
| a68 | Tiefsee-Klemme | `gelaende-core.js:1898` | gesetzt_anker | S2 Relief | Schelf aus S2 (Krusten-Profil, shelfKm) |
| a80 | Regler-Δ → Erbgut des Orts | `gelaende-core.js:5951` | folgt | S2 Relief | LANDFORM_REGLER + reglerDelta (:5923) |
| a81 | Planet → Regler | `planet-core.js:2320` | folgt | S2 Relief | Kontinentalität, Steile, Konvergenz, Randabstand des Planeten |
| a82 | Leit-Stützen 9×9 | `planet-core.js:2348` | folgt | S2 Relief | Planet-Höhe × Stauchung gegen den Anker |
| a83 | Vulkan und Rand des Ortes | `planet-core.js:2351` | folgt | S2 Relief | Platten des Planeten |
| a85 | Erbgut der Welt | `stamm/gelaende-boden.js:1338` | folgt | S2 Relief | Gesetz der Welt (_weltGesetz) |
| a96 | Schutt aus dem Relief | `gelaende-core.js:1085` | folgt | S2 Relief | Schicht-Gesetz (Abschnitt Schutthang der Treppe) |
| b8 | Meeresboden (Schelf → Hang → Tiefsee) | `gelaende-core.js:1885` | gesetzt | S2 Relief | Schelf aus S2 (Krusten-Profil, shelfKm) |
| b10 | Ozean-Maske je Kachel (hydroMarkOcean) | `gelaende-core.js:6240` | folgt | S2 Relief | Relief surf der Kachel + b2 |
| b20 | Schelf-Mindesttiefe der Zellen (SHELF_MIN_DEPTH) | `stamm/wasser-zellen.js:309` | gesetzt | S2 Relief | Schelf aus S2 (Krusten-Profil, shelfKm) |
| e101 | nahtTafel | `planet-core.js:1190` | folgt | S2 Relief | aus TAU_W, TAU_A, WURZEL (K4) |
| e106 | Höhe h = hA + hB·refKm − sigmaKm | `planet-core.js:1649` | folgt | S2 Relief | K7: Kontinent relativ zum Bezugs-Spiegel |
| e235 | hoeheM im Auftrag | `planet-core.js:1650` | folgt | S2 Relief | aus dem Punkt |
| e236 | land / kuesteKm im Auftrag | `planet-core.js:1650` | folgt | S2 Relief | aus dem Punkt, fuss 16 |
| a7 | Meer unter Basis | `gelaende-core.js:5679` | gesetzt | S3 Meer | der Spiegel aus S3; am Anker −3 m unter der Basis, byte-gleich |
| a79 | Meer der Reise | `gelaende-core.js:5910` | folgt | S3 Meer | Planet-Δ (planet-core.js:2331) |
| b2 | Meeresspiegel der Welt (state.waterLevel, EIN Schreiber) | `stamm/bild-himmel.js:485` | folgt | S3 Meer | terrainBaseHeight − ort.meerUnterBasisM (b1 Heimat, b3 Reise); gerufen stamm/bild-himmel.js:280 und stamm/dirigent-ankun |
| b3 | Meer am Reise-Ort (ORT_FELDER.meer waterLevelM, Δ zur Heimat | `planet-core.js:2331` | folgt | S3 Meer | meerKm = Σ − Ref aus der Volumenbilanz der Becken (planetMeer, planet-core.js:1618), Stauchung sv = 0,0065 / kuehlungKJe |
| b6 | Meer-Vorgabe Basis − GRUND.meerUnterBasis (Kern) | `gelaende-core.js:6180` | folgt | S3 Meer | b1 |
| b15 | Eis-Dicke auf Seen und Meer (eisDicke) | `gelaende-core.js:1404` | folgt | S3 Meer | Temperatur-Feld × Wasserkörper (gelaende-core.js:1388) |
| e139 | Land-Eis polwärts der Eis-Linie | `planet-core.js:1608` | folgt | S3 Meer | aus der Energiebilanz (planetKlimaGlobal) |
| e142 | meerKm | `planet-core.js:1628` | folgt | S3 Meer | σ − σRef (K7) |
| e192 | schneeKm | `planet-core.js:2084` | folgt | S3 Meer | Null-Grad-Höhe des Sommers |
| b70 | Abflussspende (PEGEL.spende) | `gelaende-core.js:1600` | gesetzt | S4 Klima | Turc-Pike-Abfluss am Ort; am Anker die Heimat-Spende, sonst × spendeVerh |
| b76 | Spende am Reise-Ort (spendeVerh) | `gelaende-core.js:5918` | folgt | S4 Klima | Planet-Klima (planet-core.js:2298) |
| b79 | Verdunstung im Hydro-Gesetz | `stamm/wasser-zellen.js:2092` | gesetzt | S4 Klima | Verdunstung im Hydro-Gesetz fehlt (0): sie folgt PET aus S4 |
| c1 | TEMPERATUR.sommer (Tagesmittel am Meer, Sommer-Mitte) | `gelaende-core.js:1314` | gesetzt | S4 Klima | am Anker 18 °C byte-gleich, sonst + Δ klima.sommerC |
| c2 | TEMPERATUR.winter (Tagesmittel am Meer, Winter-Mitte) | `gelaende-core.js:1315` | gesetzt | S4 Klima | am Anker −4 °C byte-gleich, sonst + Δ klima.winterC |
| c3 | Jahresmittel der Luft am Meer | `gelaende-core.js:1333` | folgt | S4 Klima | mittel = (sommer + winter)/2 = (18 + −4)/2, gelaende-core.js:1333; ortWuchs tJ dieselbe Formel :5736 |
| c4 | Jahres-Amplitude der Luft | `gelaende-core.js:1335` | folgt | S4 Klima | amp = (sommer − winter)/2, gedämpft 1/√(1+(ωτ)²) bei Trägheit τ (gelaende-core.js:1328–1330) |
| c5 | TEMPERATUR.tagAmp (Tagesgang ±) | `gelaende-core.js:1317` | gesetzt | S4 Klima | Tagesgang aus S4 (tagAmpC) |
| c7 | TEMPERATUR.sommerPhase (Saison-Phase des Sommer-Gipfels) | `gelaende-core.js:1316` | gesetzt | S4 Klima | Sommer-Phase aus S4 (Phasen-Verzug lag) |
| c10 | Luft-Temperatur T(y, Saison, Uhr, Wetter) | `gelaende-core.js:1344` | folgt | S4 Klima | temperaturFeld gelaende-core.js:1321–1338 + temperaturAus :1344–1352; Signatur ohne x, z |
| c17 | klimaHeute.spendeMm (Jahres-Abfluss der Tafel) | `gelaende-core.js:5847` | folgt | S4 Klima | PEGEL.spende·1000·jahrTage = 0,0009·1000·365; Reise: × spendeVerh (gelaende-core.js:5904) |
| c18 | spendeVerh (Verhältnis der Spende zur Heimat) | `gelaende-core.js:5854` | folgt | S4 Klima | Reise: abflussMm(Ort)/abflussMm(Anker), planet-core.js:2298 → gelaende-core.js:5918 |
| c27 | ort.wetter.regenQuote (Δ nasse Zeit der Reise-Welt) | `gelaende-core.js:5920` | gesetzt | S4 Klima | der Δ-Weg der Regen-Quote aus S4 |
| c28 | ort.wetter.sturmQuote (Δ Sturm-Zeit der Reise-Welt) | `gelaende-core.js:5920` | gesetzt | S4 Klima | der Δ-Weg der Sturm-Quote aus S4 |
| c29 | Regen-Mittel des Klimas (Grund des Pegels) | `stamm/wasser-hydro.js:247` | folgt | S4 Klima | Mittel von WEATHER_FIELD[_wetterAmOrt(0, 0, k·120)].rain, k < REGEN_KLIMA_ZUEGE 2000 (stamm/wasser-hydro.js:935) — an (0 |
| c35 | state.weather (das EINE Wetter-Wort der Welt) | `stamm/dirigent-takt.js:1740` | folgt | S4 Klima | wetterAt an der Spieler-Position (stamm/dirigent-takt.js:1733–1734) je 120 s; sonst der Wunsch der Welt (DSL/Nexus) |
| c36 | nassTage (Nässe-Dosis der Welt) | `stamm/bild-himmel.js:3076` | folgt | S4 Klima | Integral des rain-Kanals des globalen Worts über die Welt-Uhr |
| c37 | Grundrichtung θ0 des Winds | `phyto-core.js:4343` | folgt | S4 Klima | t0 = FNV-1a(saat + "-wind-dir")/2^32 · 2π (phyto-core.js:4336, :4343) |
| c39 | Δ windX / windZ (Wind-Richtung des Planeten am Ort) | `planet-core.js:2336` | folgt | S4 Klima | windOst/windNord des Planeten-Klimas (planet-core.js:2335) |
| c49 | cloudCover (Bedeckung des Himmels) | `stamm/bild-himmel.js:1763` | folgt | S4 Klima | _weatherBlendedValue(0,12, 0,9) über die Achse des globalen Worts |
| c50 | wolkenFeld (Ort der Wolken) | `welt-licht.js:901` | folgt | S4 Klima | Rauschen + Wolken-Uhr aus der Saat (stamm/dirigent-takt.js:1745 _wolkenSaat) |
| c58 | Feuchte der Front (einzige Luftfeuchte-Größe) | `phyto-core.js:4439` | folgt | S4 Klima | Saat-Phase w.feuchte (phyto-core.js:4348) längs der Zugachse s |
| c62 | state.naesse (Nässe der Welt) | `stamm/bild-himmel.js:3080` | folgt | S4 Klima | exakt je Schritt integriert aus dem Feld des globalen Worts (stamm/stoff-material.js:2229–2234) |
| c64 | SCHNEE.start / voll (Band der Schneegrenze) | `gelaende-core.js:1283` | gesetzt | S4 Klima | Schneegrenze aus T und −6,5 K/km (S4 schneeKm) |
| c66 | schneeLinie (Linie des Schnee-Pegels) | `gelaende-core.js:1491` | folgt | S4 Klima | tiefste Höhe mit schneePegel ≥ deckt, Halbierung (gelaende-core.js:1494–1503) |
| c67 | schneeVersatz (Weg der Grenze seit der Sommer-Mitte) | `gelaende-core.js:1505` | folgt | S4 Klima | linie(saison) − linie(sommerPhase), gerundet auf SCHMELZE.stufe |
| c69 | schneeBandM (Band der Reise-Welt) | `gelaende-core.js:5855` | folgt | S4 Klima | Reise: linie(Ort) − linie(Heimat), gelaende-core.js:5919 |
| c73 | schneePegel (Schnee-Wasser-Äquivalent) | `gelaende-core.js:1467` | folgt | S4 Klima | Grad-Tag geschlossen auf der Jahres-Welle (gelaende-core.js:1471–1489) |
| c78 | EIS.kopplung / meerSchicht / saeule (Wärme-Trägheit des Wass | `gelaende-core.js:1380` | folgt | S4 Klima | τ = ρc·h/α (gelaende-core.js:1360); Teich 1 m 1,9 d, Meer 97 d |
| c83 | FOREST_PACK.bestand.waldgrenze (Waldgrenze am Schnee) | `phyto-core.js:3202` | gesetzt | S4 Klima | Waldgrenze aus T (Sommer) |
| d10 | Abflussspende der Heimat (Niederschlag-Ersatz) | `gelaende-core.js:1600 · :5847` | gesetzt | S4 Klima | Niederschlag aus S4 (Gürtel, Feuchte-Integral, Lee) |
| d26 | „Klima“ clim (Arten-Gradient) | `phyto-core.js:3059` | gesetzt | S4 Klima | „Klima“ clim liest heute Rauschen; es folgt T und P aus S4 |
| d28 | Trockenheit dry aus der Höhe | `phyto-core.js:3056 · stamm/vegetation-wi` | gesetzt | S4 Klima | Trockenheit aus P/PET (S4), nicht aus der Höhe |
| d81 | Anker des Jahrs (Phase + Welt-Uhr) | `stamm/bild-himmel.js:931-960` | folgt | S4 Klima | Funktion der Welt-Uhr spielZeit |
| d82 | Lage zwischen den Stützen (Mitten-Versatz) | `stamm/bild-himmel.js:3307-3312` | folgt | S4 Klima | die Welt zählt Saison-Mitten, das Studio Stützen |
| d83 | Saison-Mitten des Worts (setSeason) | `stamm/bild-himmel.js:966` | folgt | S4 Klima | k/4 + 1/8 |
| d84 | Laub-Präsenz pr (Frühling · Sommer · Herbst · Winter) | `foundry-core.js:255-258` | gesetzt | S4 Klima | Phänologie: liest T(Saison) statt der Phase des 2 400-s-Jahrs |
| d85 | Blüte bl | `foundry-core.js:255-258` | gesetzt | S4 Klima | Phänologie: liest T(Saison) statt der Phase des 2 400-s-Jahrs |
| d86 | Halm-Länge ha | `foundry-core.js:255-258` | gesetzt | S4 Klima | Phänologie: liest T(Saison) statt der Phase des 2 400-s-Jahrs |
| e155 | T0 / T2 | `planet-core.js:1904` | folgt | S4 Klima | Energiebilanz (North 1975) |
| e156 | Held-Hou ΔH | `planet-core.js:1909` | folgt | S4 Klima | Held & Hou 1980 |
| e158 | Hadley-Rand φH (zellBreite) | `planet-core.js:1911` | folgt | S4 Klima | Held & Hou 1980: √(5/3·gHΔ/(Ω²a²)) |
| e159 | Zellen je Halbkugel | `planet-core.js:1913` | folgt | S4 Klima | ⌊π/2/φH + 0,5⌋ |
| e191 | abflussMm | `planet-core.js:2085` | folgt | S4 Klima | Turc-Pike |
| e194 | windOst / windNord → windX / windZ | `planet-core.js:2082` | folgt | S4 Klima | aus Wind-Modell |
| e211 | Anker sommerC / winterC / randKm / randArt / wertung | `planet-core.js:2238` | folgt | S4 Klima | aus dem Klima am Anker |
| e224 | klima.sommer / winter (Meeres-Niveau) | `planet-core.js:2332` | folgt | S4 Klima | aus planetKlimaR, auf Meeres-Niveau reduziert |
| e225 | klima.sommerPhase (Süd + 0,5) | `planet-core.js:2333` | folgt | S4 Klima | Halbkugel |
| e227 | klima.spendeMm → spendeVerh | `planet-core.js:2298` | folgt | S4 Klima | Turc-Pike-Abfluss als Verhältnis |
| a47 | Senke: Meer oder See | `gelaende-core.js:670` | folgt | S5 Wasser | Höhe K des Knotens gegen den Spiegel |
| a76 | Gewässer-Schnitt in der Dichte | `gelaende-core.js:7201` | folgt | S5 Wasser | Hydrosphäre über der Relief-Fläche |
| b23 | Benannte Seen (benannteSeen) | `gelaende-core.js:1922` | folgt | S5 Wasser | b21 |
| b24 | Flut-See je Kachel (hydroExtractLakes) | `gelaende-core.js:6417` | folgt | S5 Wasser | Priority-Flood (Barnes 2014) auf surf der Kachel |
| b25 | See-Spiegel (level) | `gelaende-core.js:6453` | folgt | S5 Wasser | Überlauf-Höhe des Beckens aus dem Relief |
| b26 | See-Bilanz (seeBilanz) | `gelaende-core.js:6389` | folgt | S5 Wasser | bilanz aus Planet N/PET (gelaende-core.js:5750) |
| b30 | Lag-Klasse des Sees | `gelaende-core.js:6045` | folgt | S5 Wasser | Snyder-Lag aus Einzugsfläche und Weg (gelaende-core.js:1640) |
| b32 | Stau-Spiegel (stauSpiegel, stauFeld, stauFelder) | `gelaende-core.js:7514` | folgt | S5 Wasser | Werke + atlasSpiegel-Basis (gelaende-core.js:7640), Überlauf gelaende-core.js:7530 |
| b38 | Flussnetz (Knoten, Abfluss, Einzugsfläche A) | `gelaende-core.js:512` | folgt | S5 Wasser | Grundhöhe K, steilster Abstieg je Ebene |
| b41 | Fluss-Sohle (Stream-Power) | `gelaende-core.js:724` | folgt | S5 Wasser | A aus b38, ks, θ |
| b47 | Fluss-Breite je Punkt | `gelaende-core.js:6574` | folgt | S5 Wasser | flussBreite(A) × Rinnsal-Faktor |
| b55 | Quelle (Ort) | `gelaende-core.js:2050` | folgt | S5 Wasser | Topologie des Netzes (b38) |
| b58 | Fluss-Spiegel S (hydroRiverSpiegel) | `gelaende-core.js:6621` | folgt | S5 Wasser | globale Netz-Sohle y (gelaende-core.js:6573) + Ufer der Kachel |
| b59 | Strömungs-Richtung (flowX, flowZ) | `gelaende-core.js:6577` | folgt | S5 Wasser | Netz-Bahn |
| b65 | Hydrosphäre je Kachel (hydrosphaere) | `gelaende-core.js:6036` | folgt | S5 Wasser | Relief der Kachel + Netz |
| b66 | Grundwasser-Tisch (aquiferY) | `stamm/wasser-zellen.js:206` | gesetzt | S5 Wasser | der Grundwasser-Tisch folgt dem Wasser (S5), nicht dem Meer unter jedem Berg — S5 misst heute kein Grundwasser |
| b75 | Pegel-Hub (pegelHub) | `gelaende-core.js:1796` | folgt | S5 Wasser | Schmelze + Regen über Nash/Snyder, Manning |
| b90 | Zellen-Flood je Chunk (_buildVoxelChunkWaterCells) | `stamm/wasser-zellen.js:143` | folgt | S5 Wasser | schnittSpiegel (stamm/wasser-zellen.js:272), atlasSpiegel (:260), Aquifer (:329) |
| b91 | Wasser-Fläche (Sheet) | `stamm/wasser-zellen.js:952` | folgt | S5 Wasser | b90 |
| b92 | Körper-Spiegel (_koerperWasserSpiegel) | `stamm/wasser-hydro.js:746` | folgt | S5 Wasser | atlasSpiegel (stamm/wasser-hydro.js:750) + Automat |
| b94 | Wellen-Hub (_wasserHubM) | `stamm/gelaende-fern.js:2679` | folgt | S5 Wasser | Σ Dünung × Treiber (b93, b95) |
| d6 | Feuchte des Bodens (Feld) | `stamm/gelaende-boden.js:1538-1563` | folgt | S5 Wasser | max(Fluss-Nähe ss über Segment-Abstand, Höhe über Wasser-Band) aus der Hydrosphäre (_hydroDistAt, _waterLevelAt) — nie a |
| a59 | schichtDicke | `gelaende-core.js:397` | gesetzt | S6 Gestein, Boden | Schicht-Dicke aus der Gesteins-Art |
| a60 | hartAnteil | `gelaende-core.js:398` | gesetzt_anker | S6 Gestein, Boden | Hart-Anteil aus der Gesteins-Art |
| a90 | Glut-Achse → Basalt | `stamm/feld-leben.js:2974` | gesetzt | S6 Gestein, Boden | Gesteins-Art aus S6 (Basalt an Rücken und Hotspots, Granit im Orogen-Kern …) |
| a91 | Material-Wahl | `stamm/vegetation-wiese.js:2362` | folgt | S6 Gestein, Boden | Welt-Feld (stamm/feld-leben.js:1793) + Feuchte (FEUCHTE.erdeGewicht) |
| a92 | Strata: Stein unter | `stamm/vegetation-wiese.js:3198` | gesetzt | S6 Gestein, Boden | Strata aus der Gesteins-Art |
| a93 | Eisen-Adern | `stamm/vegetation-wiese.js:3203` | gesetzt | S6 Gestein, Boden | Gesteins-Art aus S6 (Basalt an Rücken und Hotspots, Granit im Orogen-Kern …) |
| a97 | Bankung des Fels-Stoffs | `gelaende-core.js:3349` | gesetzt | S6 Gestein, Boden | Gesteins-Art aus S6 (Basalt an Rücken und Hotspots, Granit im Orogen-Kern …) |
| a98 | Grundton und Korn | `gelaende-core.js:3385` | gesetzt | S6 Gestein, Boden | Gesteins-Art aus S6 (Basalt an Rücken und Hotspots, Granit im Orogen-Kern …) |
| a108 | Flechte | `stamm/gelaende-boden.js:3205` | gesetzt | S6 Gestein, Boden | Boden aus Gestein × Klima × Hang |
| a109 | Feuchte → Erde | `stamm/gelaende-boden.js:3226` | gesetzt | S6 Gestein, Boden | Boden aus Gestein × Klima × Hang |
| a110 | Wiesen-Wache | `stamm/daten.js:635` | gesetzt | S6 Gestein, Boden | Boden aus Gestein × Klima × Hang |
| c82 | ORT_WUCHS.sand (Trocken-Bogen aus dem Jahresmittel) | `gelaende-core.js:5729` | gesetzt | S7 Biom | Trocken-Bogen aus dem Jahresmittel (S7) |
| d16 | ORT_WUCHS nadel (Nadelholz meidet die Tropen) | `gelaende-core.js:5728` | gesetzt | S7 Biom | Nadelholz-Grenze aus dem Klima (S7) |
| d19 | Wuchs der Heimat (decke, oase, wald, gras, laub, nadel, bila | `gelaende-core.js:5857 · Wand :5865-5867` | folgt | S7 Biom | ortWuchs(TEMPERATUR, zeitMa 0, verh {1, 1}) — gesättigt: Sommer 18 ≫ frost 3, tJ 7 < nadel 16, Zeit 0 ≫ alle Schwellen;  |
| d20 | Wuchs eines Reise-Orts | `gelaende-core.js:5921` | folgt | S7 Biom | Δ.wuchs.decke/wald = Niederschlag gegen Verdunstung des Planeten (planet-core pflanzenDeckung, Leser e), klimaHeute + Δ  |
| d41 | Wiesen-Deckung grass | `foundry-core.js:3146-3148` | folgt | S7 Biom | Licht der stehenden Kronen L (_bodenLichtFeld) × Feuchte m (Hydrosphäre) × Hang rk; Beiwerte gesetzt (Labor FIX v27) |
| d44 | Wiesen-Grund: die Grün-Wache des Bodens | `stamm/gelaende-boden.js:2641-2652 · stam` | folgt | S7 Biom | aus der Bodenfarbe (Erde aus Rauschen lebendig, Feuchte, Schnee, Pfad) |
| e233 | o.biom (Köppen, Hauptklasse, Whittaker) | `planet-core.js:2338` | folgt | S7 Biom | planetBiom |
| d53 | Tag der Welt (Mitternachts-Zähler) | `stamm/bild-himmel.js:2738-2742` | folgt | Tag und Jahr | zählt jede Mitternacht der Uhr |
| d54 | Etikett der Uhr Nacht · Morgen · Tag · Abend | `stamm/bild-himmel.js:2762-2768` | gesetzt | Tag und Jahr | Etikett der Tageszeit aus der Sonnenhöhe statt der Uhr |
| d55 | Tagesplan der Bewohner wach · werk · ruhe | `koerper-core.js:5126-5130` | gesetzt | Tag und Jahr | Tagesplan aus Auf- und Untergang statt fester Stunden |
| d56 | Sternfeld-Drehung | `stamm/dirigent-takt.js:2422` | gesetzt | Tag und Jahr | Sternfeld-Drehung aus Tag und Breite (Polhöhe) |
| d59 | Winkel der Sonne zur Uhr | `welt-licht.js:699-701` | gesetzt | Tag und Jahr | Sonnenstand aus Breite, δ und Stundenwinkel |
| d60 | Neigung der Bahn | `welt-licht.js:714` | gesetzt | Tag und Jahr | Sonnenstand aus Breite, δ und Stundenwinkel |
| d61 | Mittagshöhe der Sonne | `welt-licht.js:711-717 (gerechnet, d-mess` | folgt | Tag und Jahr | asin(1/√1,08) aus der gesetzten Bahn; Gipfel 74,35° um 11:52 |
| d62 | Aufgang · Untergang · Lichtdauer | `welt-licht.js:713 (y = sin w)` | folgt | Tag und Jahr | Auf- und Untergang aus Breite und δ (cos H₀ = −tan φ·tan δ) |
| d64 | Deklination · Tag des Jahres in der Sonne | `welt-licht.js:702-710 (OFFEN)` | gesetzt | Tag und Jahr | δ = ε·sin(2π·d/Jahr) |
| d68 | DIE EINE Tag-Achse: Anker der Grenzgröße | `welt-licht.js:92-101 · :728-761` | gesetzt_anker | Tag und Jahr | DIE EINE Tag-Achse liest die Sonne aus Tag und Jahr |
| e153 | Einstrahlung s2 | `planet-core.js:1891` | folgt | Tag und Jahr | Jahresmittel der Einstrahlung, 2. Legendre-Mode aus β (North 1975) |

## FÄLLT (16)

| id | Größe | Ort | vorher | Stufe | Grund |
|---|---|---|---|---|---|
| e217 | wildnis.kontinentLambda | `planet-core.js:2323` | gesetzt | §5 Naht | wildnis.kontinentLambda: Δ ≡ 0 per Bau; die Wellenlänge der Heimat ist Band |
| e222 | wildnis.schichtDicke | `planet-core.js:2328` | gesetzt | §5 Naht | wildnis.schichtDicke: Δ ≡ 0 per Bau; sie folgt S6 |
| e223 | wildnis.hartAnteil | `planet-core.js:2329` | gesetzt | §5 Naht | wildnis.hartAnteil: Δ ≡ 0 per Bau; er folgt S6 |
| d4 | Samen der Welt (Vorgabe) | `stamm/feld-leben.js:1794` | gesetzt | S0 Körper | Samen der Welt (Vorgabe): Zwilling der Saat a4 |
| a36 | Höhen-Deckel | `gelaende-core.js:1883` | gesetzt_anker | S2 Relief | Höhen-Deckel ≤ 267 m: Klemme; die Höhe folgt S2 × s_v |
| a88 | terrainSteepness | `stamm/dirigent-kern.js:282` | gesetzt | S2 Relief | terrainSteepness: Zwilling der Relief-Skala a25; das Maß des Gebirges folgt S2 (gS ∝ 1/g) |
| b4 | Meer-Vorgabe +4 über der Basis (ohne L.waterLevel) | `gelaende-core.js:520` | gesetzt | S3 Meer | Meer-Vorgabe +4: Zwilling; der Spiegel folgt S3 |
| b5 | Meer-Vorgabe 0 (Stamm, Worker, Kern-Spiegel) | `stamm/wasser-zellen.js:206` | gesetzt | S3 Meer | Meer-Vorgabe 0: Zwilling; der Spiegel folgt S3 |
| b11 | atlasSpiegel-Vorgabe jenseits geladener Kacheln | `gelaende-core.js:7756` | gesetzt | S3 Meer | atlasSpiegel-Vorgabe jenseits der Kachel: das Meer −3 ohne Ort; der Spiegel an der Adresse folgt S3 und S5 |
| b12 | wasserSpiegel-Vorgabe (≥ Meer überall) | `gelaende-core.js:7697` | gesetzt | S3 Meer | wasserSpiegel-Vorgabe: Zwilling von b11 (−3 gegen −∞); der Spiegel an der Adresse folgt S3 und S5 |
| e135 | BEZUG_MA | `planet-core.js:273` | gesetzt | S3 Meer | BEZUG_MA: toter Name, nie gelesen (sigmaRef rechnet mit dem Literal, :1596) |
| d72 | Tiere: Lichtphase nacht · dämmerung | `tetrapoda-core.js:131 · :2118 · :2133-21` | gesetzt | Tag und Jahr | Zwilling der EINEN Tag-Achse (welt-licht.js:728, d68): eigene Schwelle auf derselben Sonnenhöhe |
| d73 | Vögel: Morgenchor-Stützen | `tetrapoda-core.js:2381` | gesetzt | Tag und Jahr | Zwilling der EINEN Tag-Achse (welt-licht.js:728, d68): eigene Schwelle auf derselben Sonnenhöhe |
| d74 | Vogel-Schwarm sonneMin | `tetrapoda-core.js:2458` | gesetzt | Tag und Jahr | Zwilling der EINEN Tag-Achse (welt-licht.js:728, d68): eigene Schwelle auf derselben Sonnenhöhe |
| d75 | Bestäuber: Sonnen-Stützen | `tetrapoda-core.js:2916` | gesetzt | Tag und Jahr | Zwilling der EINEN Tag-Achse (welt-licht.js:728, d68): eigene Schwelle auf derselben Sonnenhöhe |
| d76 | Grille: nachtAb · nachtVoll | `klang-core.js:492 · :932` | gesetzt | Tag und Jahr | Zwilling der EINEN Tag-Achse (welt-licht.js:728, d68): eigene Schwelle auf derselben Sonnenhöhe |

## SAME (38)

| id | Größe | Ort | vorher | Stufe | Grund |
|---|---|---|---|---|---|
| e7 | PLANET_ERDE.tagStunden | `planet-core.js:263` | gesetzt_anker | keine Stufe | Physik-Datum §2 (Erd-Schlüssel; sonst zieht es der Same) |
| a4 | Saat der Heimat | `stamm/speicher-welten.js:64` | gesetzt | S0 Körper | der Same selbst |
| a5 | Rausch-Strom der Höhe | `gelaende-core.js:5679` | gesetzt | S0 Körper | der Same selbst |
| e1 | PLANET_ERDE.radiusKm | `planet-core.js:263` | gesetzt_anker | S0 Körper | Physik-Datum §2 (Erd-Schlüssel; sonst zieht es der Same) |
| e2 | PLANET_ERDE.g | `planet-core.js:263` | gesetzt_anker | S0 Körper | Physik-Datum §2 (Erd-Schlüssel; sonst zieht es der Same) |
| e3 | PLANET_ERDE.wasserKm | `planet-core.js:263` | gesetzt_anker | S0 Körper | Physik-Datum §2 (Erd-Schlüssel; sonst zieht es der Same) |
| e6 | PLANET_ERDE.neigungRad | `planet-core.js:263` | gesetzt_anker | S0 Körper | Physik-Datum §2 (Erd-Schlüssel; sonst zieht es der Same) |
| e8 | PLANET_ERDE.jahrTage | `planet-core.js:263` | gesetzt_anker | S0 Körper | Physik-Datum §2 (Erd-Schlüssel; sonst zieht es der Same) |
| e10 | PLANET_ERDE.sternFluss | `planet-core.js:263` | gesetzt_anker | S0 Körper | Physik-Datum §2 (Erd-Schlüssel; sonst zieht es der Same) |
| e4 | PLANET_ERDE.krustenAnteil | `planet-core.js:263` | gesetzt_anker | S1 Platten | Physik-Datum §2 (Erd-Schlüssel; sonst zieht es der Same) |
| e11 | PLANET_ERDE.alterMa | `planet-core.js:263` | gesetzt_anker | S1 Platten | Physik-Datum §2 (Erd-Schlüssel; sonst zieht es der Same) |
| e14 | regime | `planet-core.js:326` | gesetzt | S1 Platten | regime „platten“: Vorgabe ohne Zug, ein Datum |
| e15 | nS Schollen-Zahl | `planet-core.js:331` | gesetzt | S1 Platten | vom Samen gezogen; der Bereich ist geeicht (Richter: spike.md §c, Linse bau3) |
| e16 | nO Ozean-Platten | `planet-core.js:332` | gesetzt | S1 Platten | vom Samen gezogen; der Bereich ist geeicht (Richter: spike.md §c, Linse bau3) |
| e34 | Start-Baum Abstand | `planet-core.js:377` | gesetzt | S1 Platten | vom Samen gezogen; der Bereich ist geeicht (Richter: spike.md §c, Linse bau3) |
| e39 | Ozean-Platten-Rate | `planet-core.js:514` | gesetzt | S1 Platten | vom Samen gezogen; der Bereich ist geeicht (Richter: spike.md §c, Linse bau3) |
| e45 | Kontinent-Rate | `planet-core.js:580` | gesetzt | S1 Platten | vom Samen gezogen; der Bereich ist geeicht (Richter: spike.md §c, Linse bau3) |
| e47 | Verweildauer versammelt | `planet-core.js:584` | gesetzt | S1 Platten | vom Samen gezogen; der Bereich ist geeicht (Richter: spike.md §c, Linse bau3) |
| e48 | Drift des Superkontinents | `planet-core.js:586` | gesetzt | S1 Platten | vom Samen gezogen; der Bereich ist geeicht (Richter: spike.md §c, Linse bau3) |
| e5 | freibordKm | `planet-core.js:317` | gesetzt | S2 Relief | vom Samen gezogen; der Bereich ist geeicht (Richter: spike.md §c, Linse bau3) |
| e12 | bodenAlterMaxMa | `planet-core.js:324` | gesetzt | S2 Relief | vom Samen gezogen; der Bereich ist geeicht (Richter: spike.md §c, Linse bau3) |
| e13 | shelfKm | `planet-core.js:325` | gesetzt | S2 Relief | vom Samen gezogen; der Bereich ist geeicht (Richter: spike.md §c, Linse bau3) |
| e30 | Lappen-Gewicht | `planet-core.js:346` | gesetzt | S2 Relief | vom Samen gezogen; der Bereich ist geeicht (Richter: spike.md §c, Linse bau3) |
| e42 | Naht-Höhe H0 | `planet-core.js:544` | gesetzt | S2 Relief | vom Samen gezogen; der Bereich ist geeicht (Richter: spike.md §c, Linse bau3) |
| e54 | Schürze | `planet-core.js:711` | gesetzt | S2 Relief | vom Samen gezogen; der Bereich ist geeicht (Richter: spike.md §c, Linse bau3) |
| e62 | Schollen-Ellipse Achsen | `planet-core.js:1016` | gesetzt | S2 Relief | vom Samen gezogen; der Bereich ist geeicht (Richter: spike.md §c, Linse bau3) |
| e97 | Versatz-Treppe | `planet-core.js:1384` | gesetzt | S2 Relief | vom Samen gezogen; der Bereich ist geeicht (Richter: spike.md §c, Linse bau3) |
| e109 | Hotspot-Beginn | `planet-core.js:611` | gesetzt | S2 Relief | gleichverteilt gezogen |
| e111 | Hotspot-Stärke | `planet-core.js:612` | gesetzt | S2 Relief | vom Samen gezogen; der Bereich ist geeicht (Richter: spike.md §c, Linse bau3) |
| e115 | Ausbruchs-Versatz | `planet-core.js:895` | gesetzt | S2 Relief | gezogen |
| e116 | Ausbruchs-Stärke, Ausfall | `planet-core.js:896` | gesetzt | S2 Relief | gezogen; jeder 8. fällt aus |
| e117 | Ketten-Breite | `planet-core.js:906` | gesetzt | S2 Relief | vom Samen gezogen; der Bereich ist geeicht (Richter: spike.md §c, Linse bau3) |
| e121 | Bogen-Kegel | `planet-core.js:1299` | gesetzt | S2 Relief | Kegel-Höhe gezogen |
| e122 | Rift-Kegel | `planet-core.js:1318` | gesetzt | S2 Relief | Kegel-Höhe gezogen |
| e124 | Trapp-Radius | `planet-core.js:624` | gesetzt | S2 Relief | vom Samen gezogen; der Bereich ist geeicht (Richter: spike.md §c, Linse bau3) |
| e126 | Trapp-Zeit | `planet-core.js:623` | gesetzt | S2 Relief | gleichverteilt gezogen |
| e9 | PLANET_ERDE.drehsinn | `planet-core.js:263` | gesetzt_anker | S4 Klima | Physik-Datum §2 (Erd-Schlüssel; sonst zieht es der Same) |
| e28 | Schollen-Alter | `planet-core.js:344` | gesetzt | S6 Gestein, Boden | vom Samen gezogen; der Bereich ist geeicht (Richter: spike.md §c, Linse bau3) |

## GESETZ (39)

| id | Größe | Ort | vorher | Stufe | Grund |
|---|---|---|---|---|---|
| a3 | Achsen | `planet-core.js:2241` | gesetzt_anker | §5 Naht | Konvention, im Code benannt (planet-core.js:2241) |
| e70 | lamCut = max(32, 2·fuss) | `planet-core.js:1057` | gesetzt | §5 Naht | das Band 32 km (K8) |
| e71 | fuss der Brücke | `planet-core.js:2309` | gesetzt | §5 Naht | fuss 16 der Brücke (K8, 2·fuss ≤ 32) |
| e160 | KLIMA.lapse | `planet-core.js:1864` | gesetzt_anker | §5 Naht | Standard-Atmosphäre |
| e145 | KLIMA.q0 | `planet-core.js:1858` | gesetzt_anker | S0 Körper | North & Coakley 1979 (S0 = 1337,6/4) |
| e152 | Gough-Faktor | `planet-core.js:1889` | gesetzt_anker | S0 Körper | Gough 1981 |
| a41 | theta (Konkavität) | `gelaende-core.js:391` | gesetzt_anker | S2 Relief | Physik am Ort mit Quelle: Flint-Konkavität θ (gelaende-core.js:391) |
| a57 | schuttWinkel | `gelaende-core.js:395` | gesetzt_anker | S2 Relief | Physik am Ort mit Quelle: Ruhewinkel des Schutthangs (gelaende-core.js:395) |
| e85 | GDH1 Ozean-Tiefe | `planet-core.js:1152` | gesetzt_anker | S2 Relief | Stein & Stein 1992 (GDH1), ENTSCHEID §1 :83 |
| b13 | Salz und Gefrierpunkt des Meers (EIS.salzMeer, gefrierJeSalz | `gelaende-core.js:1377` | gesetzt_anker | S3 Meer | Physik am Ort mit Quelle: Meerwasser-Salinität 35 ‰, Gefrierpunkt-Erniedrigung ≈ −0,054 K/‰ (Seewasser-Zustand) |
| e149 | KLIMA.coEis | `planet-core.js:1860` | gesetzt_anker | S3 Meer | North 1975 |
| e150 | KLIMA.tEisC | `planet-core.js:1861` | gesetzt_anker | S3 Meer | North 1975 |
| b74 | Schmelze (SCHMELZE.fall, gradTag, deckt) | `gelaende-core.js:1458` | gesetzt_anker | S4 Klima | Physik am Ort mit Quelle: Hock 2003 (gelaende-core.js:1454) |
| c11 | WOLKE.daempft (Wolke dämpft den Tagesgang) | `gelaende-core.js:1343` | gesetzt_anker | S4 Klima | Physik am Ort mit Quelle: Dai 1999: bedeckt schrumpft die Tagesspanne um 25–50 % (gelaende-core.js:1340) |
| c24 | front.zugMS (Zug der Fronten im Höhenwind) | `phyto-core.js:4320` | gesetzt_anker | S4 Klima | Physik am Ort mit Quelle: 850 hPa, 30–50 km/h (phyto-core.js:4314) |
| c30 | SCHMELZE.fall (Schneefall je Frosttag) | `gelaende-core.js:1459` | gesetzt_anker | S4 Klima | Physik am Ort mit Quelle: Hock 2003 (gelaende-core.js:1454–1455: Schneefall 1,5 mm Wasser je Frosttag) |
| c41 | WIND_FELD.sturmMS (Wind am Ort bei U = 1) | `phyto-core.js:4318` | gesetzt_anker | S4 Klima | Physik am Ort mit Quelle: Beaufort 9–10 (20,8–28,4 m/s), phyto-core.js:4315 |
| c55 | LUFT.sichtKlarM / sichtSturmM (Sichtweite) | `foundry-core.js:305` | gesetzt_anker | S4 Klima | Physik am Ort mit Quelle: Koschmieder (Kontrast 0,02), foundry-core.js:286 |
| c70 | SCHMELZE.gradTag (Grad-Tag-Faktor) | `gelaende-core.js:1460` | gesetzt_anker | S4 Klima | Physik am Ort mit Quelle: Braithwaite 1995 / Hock 2003: 3–6 mm/(K·d) (gelaende-core.js:1446, :1454) — gesetzt am oberen Rand |
| c71 | SCHMELZE.deckt (Schnee deckt ab) | `gelaende-core.js:1461` | gesetzt_anker | S4 Klima | Physik am Ort mit Quelle: Hock 2003 (gelaende-core.js:1455) |
| c74 | DECKE.dichte / tritt / knie (Schnee-Decke) | `gelaende-core.js:1524` | gesetzt_anker | S4 Klima | Physik am Ort mit Quelle: Sturm 2010: saisonale Decke 220–350 kg/m³ (gelaende-core.js:1514) |
| c80 | EIS.traegt (Dicke, die den Menschen trägt) | `gelaende-core.js:1384` | gesetzt_anker | S4 Klima | Physik am Ort mit Quelle: GOLD P = A·h², A = 3,5 kg/cm² — 80 kg auf 4,8 cm (gelaende-core.js:1375) |
| e146 | KLIMA.olrA / olrB | `planet-core.js:1859` | gesetzt_anker | S4 Klima | North & Coakley 1979 |
| e148 | KLIMA.coA0 / coA2 | `planet-core.js:1860` | gesetzt_anker | S4 Klima | North 1975 |
| e166 | Clausius-Clapeyron kalt-seitig | `planet-core.js:1970` | gesetzt | S4 Klima | Clausius-Clapeyron (≈ 7 %/K, Held & Soden 2006); der Kern fährt 5 %/K |
| e189 | Turc-Pike | `planet-core.js:2078` | gesetzt_anker | S4 Klima | Turc 1954 / Pike 1964 (im Code benannt :2077) |
| a53 | Mäander | `gelaende-core.js:776` | gesetzt_anker | S5 Wasser | Physik am Ort mit Quelle: Langbein & Leopold 1966; Leopold & Wolman 1960 (gelaende-core.js:768–770) |
| b46 | Breiten-Gesetz (FLUSS_BREITE) | `gelaende-core.js:748` | gesetzt_anker | S5 Wasser | Physik am Ort mit Quelle: Dunne & Leopold 1978 (hydraulische Geometrie) |
| b48 | Bach/Fluss-Grenze (GEWAESSER_ART) | `gelaende-core.js:761` | gesetzt_anker | S5 Wasser | Physik am Ort mit Quelle: LAWA-Typologie, Pottgiesser & Sommerhäuser 2008 |
| b69 | Lauf-Gesetz (LAUF.snyder, hack) | `gelaende-core.js:1602` | gesetzt_anker | S5 Wasser | Physik am Ort mit Quelle: Snyder 1938; Hack 1957 |
| b73 | Manning-Exponent des Pegels | `gelaende-core.js:1634` | gesetzt_anker | S5 Wasser | Physik am Ort mit Quelle: Manning, breites Rechteck: h ∝ Q^0,6 |
| b98 | Wasser-Optik je Körper (WASSER_GESETZ.koerper kd, c) | `foundry-core.js:179` | gesetzt_anker | S5 Wasser | Physik am Ort mit Quelle: Davies-Colley & Smith 2001; Pope & Fry 1997 (foundry-core.js:176-177) |
| b99 | Nash-Kaskade (LAUF.nash) | `gelaende-core.js:1607` | gesetzt_anker | S5 Wasser | Physik am Ort mit Quelle: Nash 1957 (Gamma-Ganglinie, n Speicher) |
| d18 | ORT_WUCHS Zeiten decke · wald · laub · gras | `gelaende-core.js:5723-5726` | gesetzt_anker | S7 Biom | Physik am Ort mit Quelle: Landpflanzen Ordovizium/Silur, Wälder Devon, Bedecktsamer späte Kreide, Gräser K-Pg/Miozän (Strömber |
| d34 | Saum am Siedlungsrand | `phyto-core.js:3202` | gesetzt_anker | S7 Biom | Physik am Ort mit Quelle: Krautsaum 5–10 m, Strauchgürtel ≥ 5 m, Waldmantel 15–20 m: WWF Schweiz 2012, Naturschutzbund AT 2017 |
| d45 | Wiesenarten nach Zeigerwerten L · F | `foundry-core.js:3069-3078` | gesetzt_anker | S7 Biom | Physik am Ort mit Quelle: Ellenberg et al. 2001; der Ort liest L = 1 + 8·Licht, F = 5 + 4·Feuchte (gesetzt, foundry-core.js:30 |
| e196 | KOEPPEN Tafel | `planet-core.js:1878` | gesetzt_anker | S7 Biom | Peel et al. 2007 (:2097) |
| e197 | Köppen-Schwellen | `planet-core.js:2108` | gesetzt_anker | S7 Biom | Peel et al. 2007 |
| d69 | Kanal nacht der Tag-Achse | `welt-licht.js:749 · :758` | gesetzt_anker | Tag und Jahr | bürgerliche Dämmerung bei −6° (Literatur-Norm) |

## BLEIBT (110)

| id | Größe | Ort | vorher | Stufe | Grund |
|---|---|---|---|---|---|
| b82 | Gezeiten | `— (grep gezeit/tide/ebbe: 0 Treffer)` | gesetzt | keine Stufe | kein Mond im Gesetz (§2) — die Gezeiten bleiben null |
| d94 | Richtung des Monds (immer Vollmond) | `welt-licht.js:720-722` | gesetzt | keine Stufe | kein Mond im Gesetz (§2) — „Mond = −Sonne“ bleibt gesetzt |
| e206 | Anker-Zone | `planet-core.js:2213` | gesetzt | §5 Naht | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e207 | Anker-Bedingungen | `planet-core.js:2215` | gesetzt | §5 Naht | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e208 | Anker-Wertung | `planet-core.js:2217` | gesetzt | §5 Naht | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e24 | T_START / T_ENDE | `planet-core.js:271` | gesetzt | S1 Platten | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e25 | Schollen-Gewicht Pareto α 4/3 | `planet-core.js:339` | gesetzt | S1 Platten | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e26 | SCHOLLE_DECKEL | `planet-core.js:277` | gesetzt | S1 Platten | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e27 | Flächen-Faktor 1,22 | `planet-core.js:342` | gesetzt | S1 Platten | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e33 | Gruppen höchstens 19 − nO | `planet-core.js:357` | gesetzt | S1 Platten | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e35 | verstreuen: 28 Kandidaten, Wertung min(l, 0,35) − 0,12·w | `planet-core.js:438` | gesetzt | S1 Platten | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e36 | versammeln: Lichte 0,86 | `planet-core.js:466` | gesetzt | S1 Platten | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e37 | Ozean-Zug | `planet-core.js:509` | gesetzt | S1 Platten | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e38 | Ozean-Richtung Streuung | `planet-core.js:513` | gesetzt | S1 Platten | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e46 | Mindest-Dauer eines Abschnitts | `planet-core.js:581` | gesetzt | S1 Platten | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e50 | tempo(u) | `planet-core.js:683` | gesetzt | S1 Platten | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e63 | Platten-Verzug λ / A / Schranke | `planet-core.js:299` | gesetzt | S1 Platten | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e66 | Rand-Art Schwellen | `planet-core.js:1266` | gesetzt | S1 Platten | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e69 | NACHKLANG_MA | `planet-core.js:1209` | gesetzt | S1 Platten | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e83 | Mantel-Drehung | `planet-core.js:1436` | gesetzt | S1 Platten | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e29 | schildFaktor | `planet-core.js:289` | gesetzt | S2 Relief | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e41 | Naht-Kontakt-Lücke | `planet-core.js:528` | gesetzt | S2 Relief | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e44 | Naht-Zeit t − 30 | `planet-core.js:596` | gesetzt | S2 Relief | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e51 | TAU_W (Reife) | `planet-core.js:271` | gesetzt | S2 Relief | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e52 | TAU_A (Abbau) | `planet-core.js:271` | gesetzt | S2 Relief | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e53 | WURZEL_ANTEIL / WURZEL_TAU | `planet-core.js:1158` | gesetzt | S2 Relief | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e58 | Rand-Gedächtnis H0 | `planet-core.js:762` | gesetzt | S2 Relief | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e67 | Rand-Reichweite der Schablonen | `planet-core.js:1268` | gesetzt | S2 Relief | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e68 | Kontinent-Gewicht wkI/wkJ | `planet-core.js:1271` | gesetzt | S2 Relief | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e74 | Schollen-Wellen lam0 / lamG / lamF | `planet-core.js:1032` | gesetzt | S2 Relief | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e75 | Schollen-Warp | `planet-core.js:1040` | gesetzt | S2 Relief | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e76 | LAPPEN_GROB / LAPPEN_FEIN | `planet-core.js:279` | gesetzt | S2 Relief | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e77 | KUESTE_GEWINN | `planet-core.js:295` | gesetzt | S2 Relief | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e78 | RAMPE0 / RAMPE1 | `planet-core.js:272` | gesetzt | S2 Relief | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e79 | Hang glatt(Q − 0,05; Q) | `planet-core.js:1413` | gesetzt | S2 Relief | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e80 | BECKEN_C / BECKEN_GEWINN / BECKEN_TIEF | `planet-core.js:284` | gesetzt | S2 Relief | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e81 | Becken-Spektrum | `planet-core.js:1421` | gesetzt | S2 Relief | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e82 | DYN_KM dynamische Topographie | `planet-core.js:293` | gesetzt | S2 Relief | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e84 | SEDIMENT_FUELLT | `planet-core.js:294` | gesetzt | S2 Relief | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e86 | Tiefsee-Hügel | `planet-core.js:1411` | gesetzt | S2 Relief | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e87 | alterAusSumme p = 4, weicher Deckel | `planet-core.js:1145` | gesetzt | S2 Relief | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e88 | graben | `planet-core.js:1151` | gesetzt | S2 Relief | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e89 | Orogen-Stärke s | `planet-core.js:1273` | gesetzt | S2 Relief | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e90 | Grat-Faktor | `planet-core.js:1278` | gesetzt | S2 Relief | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e91 | Kontinent-Kollision | `planet-core.js:1282` | gesetzt | S2 Relief | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e92 | Anden-Profil | `planet-core.js:1285` | gesetzt | S2 Relief | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e93 | Insel-Bogen | `planet-core.js:1288` | gesetzt | S2 Relief | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e94 | Rift | `planet-core.js:1314` | gesetzt | S2 Relief | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e95 | Rücken | `planet-core.js:1315` | gesetzt | S2 Relief | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e96 | Transform | `planet-core.js:1334` | gesetzt | S2 Relief | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e99 | randTafel Breite | `planet-core.js:1168` | gesetzt | S2 Relief | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e100 | randForm Lage und Erhalt | `planet-core.js:1184` | gesetzt | S2 Relief | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e102 | Trapp-Höhe | `planet-core.js:1497` | gesetzt | S2 Relief | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e103 | orogenStaerke | `planet-core.js:1553` | gesetzt | S2 Relief | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e104 | orogenAktiv | `planet-core.js:1554` | gesetzt | S2 Relief | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e105 | kont an Becken-Küsten | `planet-core.js:1533` | gesetzt | S2 Relief | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e108 | Hotspots nH | `planet-core.js:608` | gesetzt | S2 Relief | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e112 | Ketten-Takt | `planet-core.js:883` | gesetzt | S2 Relief | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e114 | Ketten-Ausblenden | `planet-core.js:904` | gesetzt | S2 Relief | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e118 | Ketten-Abklingen Ozean / Kontinent | `planet-core.js:905` | gesetzt | S2 Relief | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e120 | Hotspot-Kegel | `planet-core.js:1506` | gesetzt | S2 Relief | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e123 | Trapps nE | `planet-core.js:615` | gesetzt | S2 Relief | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e127 | vulkanAktiv Schwellen | `planet-core.js:1307` | gesetzt | S2 Relief | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e128 | Förderung | `planet-core.js:2352` | gesetzt | S2 Relief | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e213 | landAus(kont) | `planet-core.js:2200` | gesetzt | S2 Relief | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e215 | wildnis.land | `planet-core.js:2321` | gesetzt | S2 Relief | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e216 | wildnis.hoehe | `planet-core.js:2322` | gesetzt | S2 Relief | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e218 | wildnis.rauhLambda | `planet-core.js:2324` | gesetzt | S2 Relief | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e219 | wildnis.trog | `planet-core.js:2325` | gesetzt | S2 Relief | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e220 | wildnis.ks | `planet-core.js:2326` | gesetzt | S2 Relief | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e221 | wildnis.tafel | `planet-core.js:2327` | gesetzt | S2 Relief | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e136 | sigmaRef Erosionsbasis | `planet-core.js:1595` | gesetzt | S3 Meer | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e137 | EIS_DICKE_KM | `planet-core.js:274` | gesetzt | S3 Meer | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e144 | MEEREIS_WINTER_C | `planet-core.js:292` | gesetzt | S3 Meer | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e151 | KLIMA.walker | `planet-core.js:1862` | gesetzt | S4 Klima | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e161 | Gürtel: grund / itcz, Breite 0,4w | `planet-core.js:1872` | gesetzt | S4 Klima | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e163 | Absinken Hadley-Rand | `planet-core.js:1873` | gesetzt | S4 Klima | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e164 | Meridional-Wind | `planet-core.js:1960` | gesetzt | S4 Klima | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e165 | stehende Wellen der Zirkulation | `planet-core.js:1965` | gesetzt | S4 Klima | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e167 | feuchteLand0 / feuchteLand1 | `planet-core.js:1870` | gesetzt | S4 Klima | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e168 | mNeutral Küstenferne | `planet-core.js:1977` | gesetzt | S4 Klima | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e170 | KLIMA.schritte | `planet-core.js:1865` | gesetzt | S4 Klima | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e171 | FEUCHTE_KM / FEUCHTE_N | `planet-core.js:1941` | gesetzt | S4 Klima | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e173 | KLIMA.meerKm | `planet-core.js:1868` | gesetzt | S4 Klima | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e174 | KLIMA.recycleKm | `planet-core.js:1869` | gesetzt | S4 Klima | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e175 | maritim | `planet-core.js:2000` | gesetzt | S4 Klima | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e176 | KLIMA.leeKm | `planet-core.js:1867` | gesetzt | S4 Klima | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e177 | KLIMA.schattenKm | `planet-core.js:1866` | gesetzt | S4 Klima | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e178 | Luv-Hub | `planet-core.js:2014` | gesetzt | S4 Klima | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e179 | Kontinentalität c | `planet-core.js:2021` | gesetzt | S4 Klima | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e180 | Randströme | `planet-core.js:2040` | gesetzt | S4 Klima | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e181 | Monsun-Schub | `planet-core.js:2052` | gesetzt | S4 Klima | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e182 | Gürtel-Versatz φG | `planet-core.js:2055` | gesetzt | S4 Klima | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e184 | Land-/Meer-Schwingung cL, kontiMeerKm | `planet-core.js:2066` | gesetzt | S4 Klima | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e185 | Jahres-Amplitude amp | `planet-core.js:2067` | gesetzt | S4 Klima | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e186 | PET | `planet-core.js:2069` | gesetzt | S4 Klima | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e187 | KLIMA.trockenK | `planet-core.js:1874` | gesetzt | S4 Klima | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e188 | advW Winter-Advektion | `planet-core.js:2075` | gesetzt | S4 Klima | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e190 | tagAmpC | `planet-core.js:2080` | gesetzt | S4 Klima | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e193 | Phasen-Verzug lag | `planet-core.js:2088` | gesetzt | S4 Klima | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e228 | wetter.regenQuote | `planet-core.js:2337` | gesetzt | S4 Klima | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e229 | wetter.sturmQuote | `planet-core.js:2337` | gesetzt | S4 Klima | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e198 | WHITTAKER Tafel und Schwellen | `planet-core.js:1880` | gesetzt | S7 Biom | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e199 | pflanzenDeckung veg | `planet-core.js:2145` | gesetzt | S7 Biom | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e200 | decke | `planet-core.js:2146` | gesetzt | S7 Biom | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e201 | wald | `planet-core.js:2146` | gesetzt | S7 Biom | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| e230 | Wuchs-Verhältnis (Anker 0 → 1) | `planet-core.js:2300` | gesetzt | S7 Biom | von Hand gestimmt; geeicht an der Erde (Richter: spike.md §c, Linse bau3) |
| c6 | TEMPERATUR.tagGipfel (wärmste Uhr) | `gelaende-core.js:1318` | gesetzt | Tag und Jahr | die wärmste Stunde (0,625); der Kern kopiert sie nur (:2333), das Gesetz hat keine Formel |
| d70 | Kanal tag (Nacht-Auge) nachtGrad | `welt-licht.js:87` | gesetzt | Tag und Jahr | Nacht-Auge der Tag-Achse (−32°) |
| d71 | Kanal hell (Leuchtdichte des Tageshimmels) | `welt-licht.js:743 · :759` | gesetzt | Tag und Jahr | Leuchtdichte des Tageshimmels über der Sonnenhöhe |

## BAND (119)

| id | Größe | Ort | vorher | Stufe | Grund |
|---|---|---|---|---|---|
| a15 | Klemme der Bühnen-Terme | `gelaende-core.js:114` | gesetzt | unter dem Band | Klemme der Bühnen-Terme |
| a17 | Zahl der Terme | `gelaende-core.js:93` | gesetzt | unter dem Band | Zahl der Bühnen-Terme |
| a18 | Insel-Term | `gelaende-core.js:116` | gesetzt | unter dem Band | Bühnen-Term des Prüfplatzes |
| a19 | Rampen-Term | `gelaende-core.js:123` | gesetzt | unter dem Band | Bühnen-Term des Prüfplatzes |
| a22 | Bahn-Term | `gelaende-core.js:212` | gesetzt | unter dem Band | Bühnen-Term des Prüfplatzes |
| a20 | Bucht-Term | `gelaende-core.js:155` | gesetzt | S2 Relief | Bucht-Term der Bühne |
| a24 | kontinentLambda | `gelaende-core.js:382` | gesetzt | S2 Relief | Wellenlängen des Heimat-Reliefs (λ 38 m … 9 km) unter dem Band |
| a26 | rauhLambda | `gelaende-core.js:384` | gesetzt | S2 Relief | Wellenlängen des Heimat-Reliefs (λ 38 m … 9 km) unter dem Band |
| a30 | Oktaven von C und E | `gelaende-core.js:573` | gesetzt | S2 Relief | Wellenlängen des Heimat-Reliefs (λ 38 m … 9 km) unter dem Band |
| a31 | Warp der Großform | `gelaende-core.js:1265` | gesetzt | S2 Relief | Wellenlängen des Heimat-Reliefs (λ 38 m … 9 km) unter dem Band |
| a42 | Mindest-Gefälle der Sohle | `gelaende-core.js:717` | gesetzt | S2 Relief | Strom-Kraft-Gesetz des Tal-Netzes unter dem Band |
| a44 | Einschnitt Ebene 1 | `gelaende-core.js:732` | gesetzt | S2 Relief | Strom-Kraft-Gesetz des Tal-Netzes unter dem Band |
| a45 | Einschnitt Ebene 2 | `gelaende-core.js:729` | gesetzt | S2 Relief | Strom-Kraft-Gesetz des Tal-Netzes unter dem Band |
| a52 | Talgrund-Mittel | `gelaende-core.js:1122` | gesetzt | S2 Relief | Talgrund-Mittel |
| a56 | kliffWinkel | `gelaende-core.js:394` | gesetzt | S2 Relief | Schicht-Treppe unter dem Band |
| a58 | pedimentWinkel | `gelaende-core.js:396` | gesetzt | S2 Relief | Schicht-Treppe unter dem Band |
| a61 | Pediment-Länge | `gelaende-core.js:1055` | gesetzt | S2 Relief | Schicht-Treppe unter dem Band |
| a62 | Bank-Neigung | `gelaende-core.js:1059` | gesetzt | S2 Relief | Schicht-Treppe unter dem Band |
| a65 | detail | `gelaende-core.js:401` | gesetzt | S2 Relief | Detail-Anteil unter dem Band |
| a66 | Hang-Detail | `gelaende-core.js:1880` | gesetzt | S2 Relief | Wellenlängen des Heimat-Reliefs (λ 38 m … 9 km) unter dem Band |
| a69 | Höhlen-Decke | `gelaende-core.js:7191` | gesetzt | S2 Relief | Höhlen unter dem Band |
| a70 | Höhlen-Mündung | `gelaende-core.js:2855` | gesetzt | S2 Relief | Höhlen unter dem Band |
| a71 | Höhlen-Boden | `gelaende-core.js:7212` | gesetzt | S2 Relief | Höhlen unter dem Band |
| a72 | Höhlen-Wurm | `gelaende-core.js:7216` | gesetzt | S2 Relief | Höhlen unter dem Band |
| a73 | Kaverne | `gelaende-core.js:7219` | gesetzt | S2 Relief | Höhlen unter dem Band |
| a74 | Halle | `gelaende-core.js:7222` | gesetzt | S2 Relief | Höhlen unter dem Band |
| a94 | Fels-Freilegung rockLo/rockHi | `stamm/daten.js:624` | gesetzt | S2 Relief | Fels-Freilegung nach Hang |
| a95 | Schutt-Schwellen | `stamm/daten.js:631` | gesetzt | S2 Relief | Form unter dem Band (< 32 km bzw. unter der Saison), Heimat-Gesetz |
| a99 | Geröll | `gelaende-core.js:3409` | gesetzt | S2 Relief | Form unter dem Band (< 32 km bzw. unter der Saison), Heimat-Gesetz |
| a102 | Himmels-Sicht | `gelaende-core.js:4309` | gesetzt | S2 Relief | Höhlen unter dem Band |
| a103 | Rock-Exposure | `stamm/gelaende-boden.js:719` | gesetzt | S2 Relief | Rock-Exposure nach Hang |
| a104 | Fels-Geologie der Streu | `stamm/vegetation-baum.js:3267` | gesetzt | S2 Relief | Findling und Aufschluss der Streu |
| a105 | Mulde | `gelaende-core.js:5473` | gesetzt | S2 Relief | Form unter dem Band (< 32 km bzw. unter der Saison), Heimat-Gesetz |
| a106 | Mikro-Relief | `stamm/daten.js:654` | gesetzt | S2 Relief | Form unter dem Band (< 32 km bzw. unter der Saison), Heimat-Gesetz |
| b34 | Höhlen-Decke am Wasser | `gelaende-core.js:7188` | gesetzt | S2 Relief | Höhlen unter dem Band |
| d32 | Hang-Grenze des Walds slopeLo · slopeHi | `stamm/vegetation-wiese.js:3265-3266` | gesetzt | S2 Relief | Form unter dem Band (< 32 km bzw. unter der Saison), Heimat-Gesetz |
| d43 | Gras-Hang lo · hi | `stamm/vegetation-wiese.js:3284` | gesetzt | S2 Relief | Form unter dem Band (< 32 km bzw. unter der Saison), Heimat-Gesetz |
| b14 | Eis-Eichung (brack, kopplung, saeule, meerSchicht, uebergang | `gelaende-core.js:1379` | gesetzt | S3 Meer | Eis-Eichung am Ort |
| b71 | Regen-Anteil am Pegel (PEGEL.regen) | `gelaende-core.js:1600` | gesetzt | S4 Klima | Regen-Stufen des Wetters unter der Saison |
| b80 | Gefäß-Wasser (GEFAESS) | `stamm/bau-teile.js:3135` | gesetzt | S4 Klima | Verdunstung am Ding unter der Saison |
| b81 | Nässe-Film (verdunstS) | `stamm/stoff-material.js:3791` | gesetzt | S4 Klima | Verdunstung am Ding unter der Saison |
| c12 | WOLKE.regen (Regen kühlt) | `gelaende-core.js:1343` | gesetzt | S4 Klima | Wetter unter der Saison |
| c20 | WX_GESETZ.rain (Regen-Stärke je Wetter-Zeile) | `phyto-core.js:4288` | gesetzt | S4 Klima | Wetter unter der Saison |
| c21 | front.stufen.regen (Schwelle nass) | `phyto-core.js:4325` | gesetzt | S4 Klima | Regen-Stufen des Wetters unter der Saison |
| c22 | front.stufen.sturm (Schwelle Sturm) | `phyto-core.js:4325` | gesetzt | S4 Klima | Sturm-Stufen des Wetters unter der Saison |
| c23 | front.wellen (drei Bänder: Wellenlänge, Gewicht) | `phyto-core.js:4321` | gesetzt | S4 Klima | Wetter unter der Saison |
| c25 | front.biegeM / querM (Biegung der Front-Linie) | `phyto-core.js:4322` | gesetzt | S4 Klima | Wetter unter der Saison |
| c34 | WEATHER_INTENSITY (Achse des Worts) | `stamm/daten.js:42` | gesetzt | S4 Klima | Wetter unter der Saison |
| c38 | Mäander der Richtung | `phyto-core.js:4357` | gesetzt | S4 Klima | Mäander des Winds unter der Saison; die mittlere Richtung folgt S4 (windX/windZ) |
| c40 | WX_GESETZ.wind (Wind-Kanal je Wetter-Zeile) | `phyto-core.js:4288` | gesetzt | S4 Klima | Böe und Wetter unter der Saison |
| c42 | WIND_GESETZ.boe (die wandernde Böe) | `phyto-core.js:6598` | gesetzt | S4 Klima | Böe und Wetter unter der Saison |
| c43 | _windWob (Böen-Drift der Wind-Uhr) | `stamm/stoff-material.js:266` | gesetzt | S4 Klima | Böe und Wetter unter der Saison |
| c44 | WIND_FORM (Lee und Tal-Düse) | `gelaende-core.js:2777` | gesetzt | S4 Klima | Böe und Wetter unter der Saison |
| c45 | WEATHER_WIND_AMP (Weite der Halm-Biegung) | `stamm/daten.js:135` | gesetzt | S4 Klima | Böe und Wetter unter der Saison |
| c47 | REGEN_GESETZ.drift (Regen-Drift je Wind-Einheit) | `foundry-core.js:202` | gesetzt | S4 Klima | Böe und Wetter unter der Saison |
| c48 | WOLKEN_SCHICHT.deckung (Bedeckung klar…Regen) | `welt-licht.js:872` | gesetzt | S4 Klima | Wetter unter der Saison |
| c51 | WOLKEN_SCHICHT.hoeheM (Höhe der Wolken) | `welt-licht.js:865` | gesetzt | S4 Klima | Wetter unter der Saison |
| c52 | WX_GESETZ.sun (Sonne durch die Wolke) | `phyto-core.js:4288` | gesetzt | S4 Klima | Wetter unter der Saison |
| c54 | WX_GESETZ.fog (Dunst je Zeile) | `phyto-core.js:4288` | gesetzt | S4 Klima | Wetter unter der Saison |
| c57 | front.stufen.nebel / feuchteM (Nebel aus der Feuchte-Welle) | `phyto-core.js:4324` | gesetzt | S4 Klima | Wetter unter der Saison |
| c60 | NAESSE.benetzenS / regenAb (Benetzen) | `stamm/stoff-material.js:3790` | gesetzt | S4 Klima | Form unter dem Band (< 32 km bzw. unter der Saison), Heimat-Gesetz |
| c61 | NAESSE.versickern (Poren des Bodens) | `stamm/stoff-material.js:3795` | gesetzt | S4 Klima | Verdunstung am Ding unter der Saison |
| c65 | SCHNEE.zungen (Rauschen der Grenze) | `gelaende-core.js:1285` | gesetzt | S4 Klima | Rauschen der Schneegrenze (λ 45–330 m) |
| c72 | SCHMELZE.firn (Firn über dem Jahr) | `gelaende-core.js:1462` | gesetzt | S4 Klima | Form unter dem Band (< 32 km bzw. unter der Saison), Heimat-Gesetz |
| c79 | EIS.uebergang (Übergang H des Eises an die Luft) | `gelaende-core.js:1383` | gesetzt | S4 Klima | Eis- und Frost-Physik am Ort |
| c81 | ORT_WUCHS.frost (Dauer-Frost: Sommer am Meer) | `gelaende-core.js:5727` | gesetzt | S4 Klima | Eis- und Frost-Physik am Ort |
| a21 | Rinnen-Term | `gelaende-core.js:188` | gesetzt | S5 Wasser | Netz-Form unter dem Band; den Weg ≥ 113 km und Q trägt S5 |
| a37 | Netz-Kanten | `gelaende-core.js:424` | gesetzt | S5 Wasser | Netz-Form unter dem Band; den Weg ≥ 113 km und Q trägt S5 |
| a38 | netzDichte | `gelaende-core.js:386` | gesetzt | S5 Wasser | Netz-Form unter dem Band; den Weg ≥ 113 km und Q trägt S5 |
| a39 | rinnen | `gelaende-core.js:400` | gesetzt | S5 Wasser | Netz-Form unter dem Band; den Weg ≥ 113 km und Q trägt S5 |
| a46 | Knoten-Streuung | `gelaende-core.js:615` | gesetzt | S5 Wasser | Netz-Form unter dem Band; den Weg ≥ 113 km und Q trägt S5 |
| a48 | talForm | `gelaende-core.js:387` | gesetzt | S5 Wasser | Form unter dem Band (< 32 km bzw. unter der Saison), Heimat-Gesetz |
| a49 | Auen-Breite F | `gelaende-core.js:920` | gesetzt | S5 Wasser | Form unter dem Band (< 32 km bzw. unter der Saison), Heimat-Gesetz |
| a50 | Talbreite W | `gelaende-core.js:921` | gesetzt | S5 Wasser | Form unter dem Band (< 32 km bzw. unter der Saison), Heimat-Gesetz |
| a51 | Quergefälle der Aue | `gelaende-core.js:425` | gesetzt | S5 Wasser | Form unter dem Band (< 32 km bzw. unter der Saison), Heimat-Gesetz |
| a54 | Mündungs-Höhe | `gelaende-core.js:1248` | gesetzt | S5 Wasser | Netz-Form unter dem Band; den Weg ≥ 113 km und Q trägt S5 |
| b28 | Kleinster See (minLakeCells) | `stamm/daten.js:206` | gesetzt | S5 Wasser | Form unter dem Band (< 32 km bzw. unter der Saison), Heimat-Gesetz |
| b31 | See-Bett-Tiefe (carveLakeBedDepth) | `stamm/daten.js:251` | gesetzt | S5 Wasser | Form unter dem Band (< 32 km bzw. unter der Saison), Heimat-Gesetz |
| b43 | Mündungs-Sohle | `gelaende-core.js:725` | gesetzt | S5 Wasser | Form unter dem Band (< 32 km bzw. unter der Saison), Heimat-Gesetz |
| b45 | Aue (aue, AUE_QUER) | `gelaende-core.js:389` | gesetzt | S5 Wasser | Form unter dem Band (< 32 km bzw. unter der Saison), Heimat-Gesetz |
| b50 | Kanal-Tiefe (kanalTiefe) | `stamm/daten.js:222` | gesetzt | S5 Wasser | Form unter dem Band, gespeist aus Q (S5) |
| b51 | Bett-Formel (carveBedMin, carveBedK) | `stamm/daten.js:218` | gesetzt | S5 Wasser | Form unter dem Band, gespeist aus Q (S5) |
| b52 | Spiegel-Freibord (spiegelFreibord) | `stamm/daten.js:225` | gesetzt | S5 Wasser | Form unter dem Band (< 32 km bzw. unter der Saison), Heimat-Gesetz |
| b53 | Ufer (bankNeigung, bankKruemmung, bankWeite, bankRundung) | `stamm/daten.js:233` | gesetzt | S5 Wasser | Form unter dem Band (< 32 km bzw. unter der Saison), Heimat-Gesetz |
| b54 | Damm (dammBreite, dammFreibord) | `stamm/daten.js:244` | gesetzt | S5 Wasser | Form unter dem Band (< 32 km bzw. unter der Saison), Heimat-Gesetz |
| b56 | Rinnsal (quellBett, quellWeitung) | `stamm/daten.js:249` | gesetzt | S5 Wasser | Form unter dem Band (< 32 km bzw. unter der Saison), Heimat-Gesetz |
| b60 | Strömungs-Betrag | `stamm/wasser-hydro.js:365` | gesetzt | S5 Wasser | Form unter dem Band (< 32 km bzw. unter der Saison), Heimat-Gesetz |
| b61 | Wasserfall (waterfallSlope, waterfallMinDrop) | `stamm/daten.js:212` | gesetzt | S5 Wasser | Form unter dem Band (< 32 km bzw. unter der Saison), Heimat-Gesetz |
| b67 | Aquifer-Tiefe (AQUIFER_TIEFE_M) | `stamm/daten.js:425` | gesetzt | S5 Wasser | Aquifer-Tiefe am Ort |
| b68 | Grundwasser-Speicher im Pegel (LAUF.k0, rho, n, trocken) | `gelaende-core.js:1601` | gesetzt | S5 Wasser | Grundwasser-Speicher des Pegels |
| b83 | Automat-Fluss (rate, EPS, SUPPORT) | `stamm/wasser-zellen.js:1641` | gesetzt | S5 Wasser | Zell-Automat des Wassers unter dem Band |
| b84 | Automat-Halt (CA_FLOW_KEEP) | `stamm/wasser-zellen.js:2489` | gesetzt | S5 Wasser | Zell-Automat des Wassers unter dem Band |
| b93 | Dünung (welle.duenung, frequenz) | `foundry-core.js:185` | gesetzt | S5 Wasser | Seegang unter dem Band |
| b96 | Shader-Literale der Welle (Drift, Kräusel-Frequenz) | `stamm/bild-sicht.js:1340` | gesetzt | S5 Wasser | Seegang unter dem Band |
| b97 | Normal-Wellen (WASSER_GESETZ.wellen) | `foundry-core.js:155` | gesetzt | S5 Wasser | Seegang unter dem Band |
| c63 | FEUCHTE (Boden-Feuchte, nicht Luft) | `stamm/gelaende-boden.js:3220` | gesetzt | S5 Wasser | Form unter dem Band (< 32 km bzw. unter der Saison), Heimat-Gesetz |
| d7 | FEUCHTE flussReichweite · hoeheNah · hoeheFern · hoeheGewich | `stamm/gelaende-boden.js:3221-3224` | gesetzt | S5 Wasser | Form unter dem Band (< 32 km bzw. unter der Saison), Heimat-Gesetz |
| d8 | FEUCHTE sichtbarLo · sichtbarHi | `stamm/gelaende-boden.js:3231-3232` | gesetzt | S5 Wasser | Form unter dem Band (< 32 km bzw. unter der Saison), Heimat-Gesetz |
| d9 | FEUCHTE affinitaetGewicht · erdeGewicht | `stamm/gelaende-boden.js:3225-3226` | gesetzt | S5 Wasser | Form unter dem Band (< 32 km bzw. unter der Saison), Heimat-Gesetz |
| d1 | Welt-Stimme lebendig (Wellenlänge) | `stamm/feld-leben.js:2972` | gesetzt | S7 Biom | Rausch-Stimmen unter dem Band (λ 160–520 m); das Biom darüber folgt S7 |
| d2 | Welt-Stimmen dichte · glut · magieleitung (Wellenlängen) | `stamm/feld-leben.js:2973-2975` | gesetzt | S7 Biom | Rausch-Stimmen unter dem Band (λ 160–520 m); das Biom darüber folgt S7 |
| d3 | Domain-Warp der Welt-Stimmen | `stamm/feld-leben.js:2979-2980` | gesetzt | S7 Biom | Rausch-Stimmen unter dem Band (λ 160–520 m); das Biom darüber folgt S7 |
| d21 | Boden Erde ↔ Stein | `stamm/gelaende-boden.js:2567` | gesetzt | S7 Biom | Rausch-Stimmen unter dem Band (λ 160–520 m); das Biom darüber folgt S7 |
| d22 | Wald-Stand st (Wald ↔ Lichtung), Frequenz | `stamm/vegetation-wiese.js:3220` | gesetzt | S7 Biom | Wald ↔ Lichtung (λ ≈ 167 m) |
| d24 | Bestandsdichte sd (zwei fbm-Oktaven, host contrast · mid) | `phyto-core.js:2728-2731 · :2788-2810` | gesetzt | S7 Biom | Bestands-Muster unter dem Band; die Deckung folgt S7 |
| d25 | Geburt aus der Dichte | `phyto-core.js:2814-2818` | gesetzt | S7 Biom | Bestands-Muster unter dem Band; die Deckung folgt S7 |
| d27 | Bestands-Mosaik patch · Zentren · Breite | `phyto-core.js:3060 · :2833-2836` | gesetzt | S7 Biom | Arten-Nische unter dem Band; der Arten-Vorrat folgt S7 |
| d29 | Nischen-Gewichte wF · wT · wE · wB · wW | `phyto-core.js:2853-2858` | gesetzt | S7 Biom | Arten-Nische unter dem Band; der Arten-Vorrat folgt S7 |
| d30 | Nass-Nische: Erle feu²·6, andere Arten ≥ 1,2 m über Wasser | `phyto-core.js:3085 · :3708` | gesetzt | S7 Biom | Arten-Nische unter dem Band; der Arten-Vorrat folgt S7 |
| d31 | Kein Baum im Wasser | `phyto-core.js:3663` | gesetzt | S7 Biom | Bestands-Muster unter dem Band; die Deckung folgt S7 |
| d35 | Reichweite eines Orts (Rand des Saums) | `fachwerk-core.js:3678 · :3713-3715` | gesetzt | S7 Biom | Form unter dem Band (< 32 km bzw. unter der Saison), Heimat-Gesetz |
| d36 | Kronen-Radien je Art (Größe 1) | `phyto-core.js:3159-3168` | gesetzt | S7 Biom | Arten-Nische unter dem Band; der Arten-Vorrat folgt S7 |
| d39 | Auto-Arten: Nische aus dem Namens-Hash | `phyto-core.js:3678-3684` | gesetzt | S7 Biom | Arten-Nische unter dem Band; der Arten-Vorrat folgt S7 |
| d40 | Platzierungs-Dichte clump · wet · high | `stamm/vegetation-wiese.js:3219-3232` | gesetzt | S7 Biom | Bestands-Muster unter dem Band; die Deckung folgt S7 |
| d42 | Strauch-Glocke des Kerns | `foundry-core.js:3150` | gesetzt | S7 Biom | Unterwuchs unter dem Band; die Deckung folgt S7 |
| d46 | Wiesen-Fleck | `stamm/daten.js:587 · stamm/gelaende-bode` | gesetzt | S7 Biom | Form unter dem Band (< 32 km bzw. unter der Saison), Heimat-Gesetz |
| d47 | Unterwuchs-Frequenz meadowFreq | `stamm/vegetation-wiese.js:3221` | gesetzt | S7 Biom | Unterwuchs unter dem Band; die Deckung folgt S7 |
| d48 | Dach-Dämpfung des Bodenlichts canopyK | `stamm/vegetation-wiese.js:3240` | gesetzt | S7 Biom | Unterwuchs unter dem Band; die Deckung folgt S7 |
| d93 | Holz der kahlen Krone (KRONE_JAHR) | `phyto-core.js:6728` | gesetzt | S7 Biom | Holz der kahlen Krone |

## TECHNIK (104)

| id | Größe | Ort | vorher | Stufe | Grund |
|---|---|---|---|---|---|
| a8 | Hydro-Kachel | `gelaende-core.js:5679` | gesetzt+T | keine Stufe | vom Leser als Technik gezählt |
| a16 | Vertikal-Band der Chunks | `stamm/gelaende-boden.js:2740` | folgt+T | keine Stufe | vom Leser als Technik gezählt |
| a75 | Band des Dichte-Gitters | `gelaende-core.js:2656` | folgt+T | keine Stufe | vom Leser als Technik gezählt |
| a115 | Chunk-Kante | `stamm/gelaende-boden.js:2740` | gesetzt+T | keine Stufe | vom Leser als Technik gezählt |
| a116 | LOD-Schritte | `stamm/gelaende-boden.js:2727` | gesetzt+T | keine Stufe | vom Leser als Technik gezählt |
| a117 | Sicht-Ring | `stamm/gelaende-boden.js:2716` | gesetzt+T | keine Stufe | vom Leser als Technik gezählt |
| a118 | Netze im Speicher | `gelaende-core.js:537` | gesetzt+T | keine Stufe | vom Leser als Technik gezählt |
| a119 | Knoten-Maps | `gelaende-core.js:546` | gesetzt+T | keine Stufe | vom Leser als Technik gezählt |
| a120 | Zellen- und Tal-Maps | `gelaende-core.js:1011` | gesetzt+T | keine Stufe | vom Leser als Technik gezählt |
| a121 | Spalten-Plätze | `stamm/gelaende-boden.js:3173` | gesetzt+T | keine Stufe | vom Leser als Technik gezählt |
| a122 | Chunk-Speicher IDB | `stamm/gelaende-chunks.js:3415` | gesetzt+T | keine Stufe | vom Leser als Technik gezählt |
| a123 | Erdbau | `gelaende-core.js:2094` | gesetzt | keine Stufe | Spiel-Mechanik |
| a124 | Edit-Form | `gelaende-core.js:2546` | gesetzt | keine Stufe | Spiel-Mechanik |
| b16 | Fern-Wasser: Senkung und Tauchung (FAR_WATER.drop/dip) | `stamm/gelaende-fern.js:2346` | gesetzt | keine Stufe | Fern-Darstellung |
| b18 | Fern-Ring Wasser-Tiefe | `stamm/gelaende-fern.js:1745` | folgt | keine Stufe | Fern-Ring: Darstellung des Wassers in der Ferne |
| b35 | Wasser-Band (hydroBand) | `gelaende-core.js:6159` | gesetzt+T | keine Stufe | vom Leser als Technik gezählt |
| b62 | Hydro-Kachel (regionSize, cell) | `stamm/daten.js:203` | gesetzt+T | keine Stufe | vom Leser als Technik gezählt |
| b63 | Carve-Eimer (carveBucketSize) | `stamm/daten.js:252` | gesetzt+T | keine Stufe | vom Leser als Technik gezählt |
| b64 | Hydro-Reichweite (_hydroReichweite) | `stamm/gelaende-boden.js:647` | folgt+T | keine Stufe | vom Leser als Technik gezählt |
| b77 | Pegel-Tag (PEGEL_TAG_S) | `stamm/daten.js:165` | gesetzt | keine Stufe | Zeitschritt |
| b89 | Sim-Zelle (step, dim, dimY, floorDrop) | `stamm/gelaende-boden.js:2740` | gesetzt+T | keine Stufe | vom Leser als Technik gezählt |
| c14 | DAY_LENGTH_DEFAULT_MINUTES (Tag der Uhr) | `stamm/daten.js:160` | gesetzt | keine Stufe | Zeitraffer: Uhr-Minuten je Tag; der Tag des Körpers ist tagStunden (S0) |
| c31 | WETTER_ZUG_SEK (Takt des Wetter-Zugs) | `stamm/daten.js:170` | gesetzt+T | keine Stufe | vom Leser als Technik gezählt |
| c32 | WEATHER_TRANSITION_DURATION_MS (Übergang des Worts) | `stamm/daten.js:144` | gesetzt+T | keine Stufe | vom Leser als Technik gezählt |
| c46 | WIND_WIEGEN (Takt des Wiegens) | `stamm/stoff-material.js:3865` | gesetzt | keine Stufe | Darstellung |
| d49 | Uhr beim Start (timeOfDay) | `stamm/dirigent-kern.js:300` | gesetzt | keine Stufe | Spiel-Start |
| d51 | Tag-Länge Regler · Boden | `stamm/daten.js:146-151 · stamm/bild-himm` | gesetzt | keine Stufe | Zeitraffer |
| d79 | Phase beim Start (Sommer-Mitte) | `stamm/dirigent-kern.js:305` | gesetzt | keine Stufe | Spiel-Start in der Sommer-Mitte |
| d80 | Jahr läuft (autoSeason) | `stamm/dirigent-kern.js:306` | gesetzt | keine Stufe | Zeitraffer |
| d87 | Tönung ti · bau · mulMin · mulMax | `foundry-core.js:255-261` | gesetzt | keine Stufe | Darstellung |
| d88 | kartenGewicht · karteSchwelle | `foundry-core.js:262 · :279` | gesetzt | keine Stufe | Darstellung |
| d95 | Stärke des Mondlichts | `welt-licht.js:74` | gesetzt | keine Stufe | Darstellung |
| d96 | Mondblässe gegen den Himmel | `stamm/bild-himmel.js:3338` | gesetzt | keine Stufe | Darstellung |
| a11 | Grenze Erdbau-Zelle | `gelaende-core.js:2129` | folgt+T | unter dem Band | vom Leser als Technik gezählt |
| a12 | Grenze Edit-Karte | `gelaende-core.js:7276` | folgt+T | unter dem Band | vom Leser als Technik gezählt |
| a13 | Grenze Bahn-Gitter | `gelaende-core.js:319` | folgt+T | unter dem Band | vom Leser als Technik gezählt |
| a14 | Grenze Grundriss-Zelle | `stamm/vegetation-baum.js:3288` | folgt+T | unter dem Band | vom Leser als Technik gezählt |
| a9 | Float32-Lage der Boden-Vertices | `voxel-worker.js:3939` | folgt+T | §5 Naht | vom Leser als Technik gezählt |
| e20 | nachbarKm(R) | `planet-core.js:302` | folgt+T | §5 Naht | vom Leser als Technik gezählt |
| e60 | Nachbar-Liste 4096 Proben | `planet-core.js:853` | gesetzt+T | §5 Naht | vom Leser als Technik gezählt |
| e209 | Anker-Suche | `planet-core.js:2210` | gesetzt+T | §5 Naht | vom Leser als Technik gezählt |
| e212 | Würfel-Karte um den Anker | `planet-core.js:2244` | folgt+T | §5 Naht | vom Leser als Technik gezählt |
| e231 | leit 9×9 Stützen | `planet-core.js:2342` | gesetzt | §5 Naht | leit 9×9: das Gitter der Brücke |
| e234 | Δ-Listen ORT_DELTA_KLIMA / ORT_DELTA_WETTER / ORT_WUCHS | `planet-core.js:2278` | gesetzt+T | §5 Naht | vom Leser als Technik gezählt |
| d92 | Raster der Schnee-Tafel und des Schnee-Versatzes | `stamm/bild-himmel.js:2897-2899 · :2926-2` | folgt+T | S0 Körper | vom Leser als Technik gezählt |
| e21 | VERSION | `planet-core.js:57` | gesetzt+T | S0 Körper | vom Leser als Technik gezählt |
| e22 | planetHash FNV-1a + mix32 | `planet-core.js:149` | folgt+T | S0 Körper | vom Leser als Technik gezählt |
| e205 | pruefJahr R5 | `planet-core.js:2182` | gesetzt+T | S0 Körper | vom Leser als Technik gezählt |
| e17 | Gesetzes-Band nS 4–48, nO 2–16 | `planet-core.js:333` | gesetzt+T | S1 Platten | vom Leser als Technik gezählt |
| e19 | MAX_P | `planet-core.js:275` | gesetzt+T | S1 Platten | vom Leser als Technik gezählt |
| e40 | Drehung je Schlüsselbild ≤ 0,9π | `planet-core.js:518` | gesetzt+T | S1 Platten | vom Leser als Technik gezählt |
| e49 | Schlüsselbilder höchstens 80 | `planet-core.js:576` | gesetzt+T | S1 Platten | vom Leser als Technik gezählt |
| e56 | tOffen 1,05 | `planet-core.js:722` | gesetzt+T | S1 Platten | vom Leser als Technik gezählt |
| e61 | Paar-Konvergenz aus Proben < 250 km | `planet-core.js:861` | gesetzt+T | S1 Platten | vom Leser als Technik gezählt |
| e64 | K1 Krusten-Vorrang ×12 | `planet-core.js:999` | gesetzt+T | S1 Platten | vom Leser als Technik gezählt |
| e65 | paarRelativC Fenster | `planet-core.js:1110` | gesetzt+T | S1 Platten | vom Leser als Technik gezählt |
| e107 | Krusten-Klasse | `planet-core.js:1550` | gesetzt+T | S1 Platten | vom Leser als Technik gezählt |
| a86 | Plan-Version | `gelaende-core.js:5675` | gesetzt+T | S2 Relief | vom Leser als Technik gezählt |
| a107 | Mikro-Relief Distanz | `stamm/daten.js:685` | gesetzt+T | S2 Relief | vom Leser als Technik gezählt |
| b19 | Ozean-Tor des Chunks (OCEAN_GATE_MARGIN) | `stamm/wasser-zellen.js:80` | gesetzt+T | S2 Relief | vom Leser als Technik gezählt |
| e57 | Rand-Gedächtnis 32 Fächer | `planet-core.js:740` | gesetzt+T | S2 Relief | vom Leser als Technik gezählt |
| e72 | rausch ×0,7 · fbm 2,03/Oktave, ≤ 12 Oktaven, ×1,6 | `planet-core.js:175` | gesetzt+T | S2 Relief | vom Leser als Technik gezählt |
| e73 | gratKm (1 − /n/)², zwei Oktaven | `planet-core.js:202` | gesetzt+T | S2 Relief | vom Leser als Technik gezählt |
| e98 | NAHT_KM | `planet-core.js:1341` | gesetzt+T | S2 Relief | vom Leser als Technik gezählt |
| e113 | Ketten-Stützen | `planet-core.js:881` | gesetzt+T | S2 Relief | vom Leser als Technik gezählt |
| e119 | Ketten-Kappe Rand | `planet-core.js:918` | gesetzt+T | S2 Relief | vom Leser als Technik gezählt |
| e129 | planetVulkane Gitter | `planet-core.js:1680` | gesetzt+T | S2 Relief | vom Leser als Technik gezählt |
| e141 | kuesteF Halbierung | `planet-core.js:1641` | gesetzt+T | S2 Relief | vom Leser als Technik gezählt |
| e172 | kontGrob fuss, Rückfall-Radius | `planet-core.js:1945` | gesetzt+T | S2 Relief | vom Leser als Technik gezählt |
| e131 | meerLoesen | `planet-core.js:1561` | folgt+T | S3 Meer | vom Leser als Technik gezählt |
| e132 | PROBEN_SPIEGEL | `planet-core.js:1574` | gesetzt+T | S3 Meer | vom Leser als Technik gezählt |
| e134 | Hüll-Proben fuss | `planet-core.js:1580` | gesetzt+T | S3 Meer | vom Leser als Technik gezählt |
| e140 | planetMeer Fach | `planet-core.js:1622` | gesetzt+T | S3 Meer | vom Leser als Technik gezählt |
| e203 | Eis-Codes (Meereis 2, EF 1) | `planet-core.js:2104` | gesetzt+T | S3 Meer | vom Leser als Technik gezählt |
| c33 | WETTER_ZEILE / WETTER_WORT (Wort ↔ Zeile) und die Wetter-Taf | `stamm/daten.js:53` | gesetzt+T | S4 Klima | vom Leser als Technik gezählt |
| c68 | SCHMELZE.stufe (Rasten des Versatzes) | `gelaende-core.js:1463` | gesetzt+T | S4 Klima | vom Leser als Technik gezählt |
| c75 | Tafel-Raster DECKE/PEGEL (unter 40, ueber 300, dy 1, stufe 0 | `gelaende-core.js:1600` | gesetzt+T | S4 Klima | vom Leser als Technik gezählt |
| d89 | Stufen der Karte im Jahr | `stamm/stoff-karte.js:2066` | gesetzt+T | S4 Klima | vom Leser als Technik gezählt |
| d90 | Saison-Drift der Ferne | `stamm/gelaende-chunks.js:3442` | gesetzt+T | S4 Klima | vom Leser als Technik gezählt |
| e154 | Energiebilanz-Gitter | `planet-core.js:1894` | gesetzt+T | S4 Klima | vom Leser als Technik gezählt |
| e169 | Wind-Gewicht om | `planet-core.js:1979` | gesetzt+T | S4 Klima | vom Leser als Technik gezählt |
| e195 | luv / lee / stromK / meerWest / meerLuv / feuchte / kontinen | `planet-core.js:2083` | folgt+T | S4 Klima | vom Leser als Technik gezählt |
| e204 | ORT_KLIMA Pflichtfelder | `planet-core.js:2172` | gesetzt+T | S4 Klima | vom Leser als Technik gezählt |
| a55 | Netz trägt bis | `gelaende-core.js:1859` | folgt+T | S5 Wasser | vom Leser als Technik gezählt |
| b27 | See-Toleranz TOL | `gelaende-core.js:6420` | gesetzt+T | S5 Wasser | vom Leser als Technik gezählt |
| b29 | Füll-Epsilon (fillEpsilon) | `stamm/daten.js:205` | gesetzt_anker+T | S5 Wasser | vom Leser als Technik gezählt |
| b33 | Stau-Raster (CA_STAU) | `stamm/wasser-zellen.js:2496` | gesetzt+T | S5 Wasser | vom Leser als Technik gezählt |
| b57 | Punkt-Deckel (maxRiverPoints) | `stamm/daten.js:214` | gesetzt+T | S5 Wasser | vom Leser als Technik gezählt |
| b72 | Pegel-Raster (PEGEL.unter, ueber, dy, stufe) | `gelaende-core.js:1600` | gesetzt+T | S5 Wasser | vom Leser als Technik gezählt |
| b78 | Pegel-Rand und Regen-Klima (PEGEL_RAND_M, REGEN_KLIMA_ZUEGE) | `stamm/wasser-hydro.js:932` | gesetzt+T | S5 Wasser | vom Leser als Technik gezählt |
| b85 | Automat-Ruhe (SETTLE) | `stamm/wasser-zellen.js:2133` | gesetzt+T | S5 Wasser | vom Leser als Technik gezählt |
| b86 | Automat-Bild (CA_REMESH_TICK_INTERVAL, WASSER_BILD_RAND) | `stamm/wasser-zellen.js:2494` | gesetzt+T | S5 Wasser | vom Leser als Technik gezählt |
| b87 | Saat-Pegel je Wasser-Zelle (_seedWaterLevel) | `stamm/wasser-zellen.js:1791` | gesetzt+T | S5 Wasser | vom Leser als Technik gezählt |
| b88 | Wasser-Frist (OHNE_FRIST_MS.wasser) | `stamm/dirigent-takt.js:2667` | gesetzt+T | S5 Wasser | vom Leser als Technik gezählt |
| a100 | Fels fein / fern | `gelaende-core.js:3402` | gesetzt+T | S6 Gestein, Boden | vom Leser als Technik gezählt |
| a101 | Rausch-Gitter des Fels | `gelaende-core.js:3439` | gesetzt+T | S6 Gestein, Boden | vom Leser als Technik gezählt |
| a111 | Boden-Karte Teilung | `stamm/daten.js:464` | gesetzt+T | S6 Gestein, Boden | vom Leser als Technik gezählt |
| a112 | Boden-Stufen | `stamm/gelaende-boden.js:3191` | gesetzt+T | S6 Gestein, Boden | vom Leser als Technik gezählt |
| a113 | Boden-Generation | `gelaende-core.js:2860` | gesetzt+T | S6 Gestein, Boden | vom Leser als Technik gezählt |
| a114 | Gen-Version | `stamm/speicher-laden.js:2706` | gesetzt+T | S6 Gestein, Boden | vom Leser als Technik gezählt |
| d37 | Darts je Zelle · Zelle · Packung | `stamm/vegetation-wiese.js:3264 · phyto-c` | gesetzt+T | S7 Biom | vom Leser als Technik gezählt |
| d38 | dartsPerM2 des Labors | `phyto-core.js:3157` | gesetzt+T | S7 Biom | vom Leser als Technik gezählt |
| e202 | Biom-Farben, KOEPPEN_FARBE, Karten-Rampen | `planet-core.js:2136` | gesetzt+T | S7 Biom | vom Leser als Technik gezählt |
| d67 | Stufe der Sonne (Schattierung) | `stamm/bild-himmel.js:3404` | gesetzt+T | Tag und Jahr | vom Leser als Technik gezählt |
