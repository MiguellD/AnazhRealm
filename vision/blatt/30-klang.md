# Klang, Stimme und Musik

## Die Vision hier

Jenseits der Gegenwart heißt: man schließt die Augen und weiß, wo man ist — auf welchem Planeten, in welcher Epoche, in welcher Gasse, bei welchem Wetter, vor welchem Stoff, in welchem Leib. Nichts davon ist aufgenommen: der Raum hallt, weil Fels und Fassade dort stehen; der Schritt knirscht, weil der Kies diese Körnung hat; der Vulkan grollt im Infraschall, weil Magma durch diesen Schlot steigt; die dünne Luft eines fremden Planeten trägt Töne leiser, tiefer und langsamer, weil Dichte und Schallgeschwindigkeit es so wollen — und im Vakuum schweigt alles außer dem eigenen Leib. Eine Stadt mit hundert Millionen Bewohnern, gegen die Tokio ein Dorf ist, klingt als EIN atmender Körper aus Verkehr, Maschinen, Märkten, Stadien und Millionen Stimmen, und doch hört man in ihr jedes einzelne Gespräch, wenn man näher tritt — in einer Sprache, die aus den Gesetzen ihrer Kultur gewachsen ist, mit einer Stimme, die aus Kehlkopf, Alter und Stimmung ihres Leibs folgt. Die Musik jeder Kultur und jeder Epoche — von der Knochenflöte bis zu Klängen, die es nie gab — entsteht aus den Instrumenten, die diese Kultur aus ihren Stoffen baut, und den Tonsystemen, die ihre Ohren gewählt haben. Und alles ist gekoppelt: der Ausbruch, den man hört, ist derselbe, der die Küste formt und die Stadt in Panik versetzt. Ein Download von null Bytes; jede Note und jede Silbe ist Rechnung.

## Das Beste der Gegenwart

- **Red Dead Redemption 2** (Rockstar 2018): etwa eine halbe Million aufgenommene Dialogzeilen von ~700 Sprechern, dazu handgemischte Klangwelt — die Grenze: jede Zeile ist ein Asset, Gesamtgröße > 100 GB, keine Zeile entsteht neu ([GamesRadar](https://www.gamesradar.com/red-dead-redemption-2-has-a-60-hour-story-500000-lines-of-dialogue), [TechSpot](https://www.techspot.com/news/76927-red-dead-redemption-2-details-revealed-60-hours.html)).
- **Microsoft Project Acoustics / Triton** (Gears of War 4, Sea of Thieves): Wellen-Akustik, aber gebacken je Level; zerstörbare oder nie gesehene Welten bleiben außen vor. **Planeverb** (2020) rechnet Wellenakustik dynamisch, aber nur in 2D ([Planeverb-Papier](https://microsoft.com/en-us/research/uploads/prod/2020/08/Planeverb_CameraReady_wFonts.pdf)); **WAVE** (UNC) braucht Vorberechnung ([WAVE](https://gamma.cs.unc.edu/WAVE/docs/paperVR.pdf)).
- **Steam Audio** (Valve): HRTF, strahlverfolgte Verdeckung und Hall in Echtzeit — die Geometrie stammt aus Assets, die späte Hallfahne bleibt geometrisch unwahr.
- **Modale Synthese** (van den Doel/Kry/Pai, FoleyAutomatic 2001; Zheng & James, Bruch-Klang SIGGRAPH 2010): Kontakt, Rollen, Gleiten und Bruch aus Physik, Hunderte Trümmer — aber mit vorberechneten Klangbänken je Objekt ([Cornell FractureSound](https://www.cs.cornell.edu/projects/FractureSound/)).
- **No Man's Sky** (Paul Weir, GDC 2017): Tierstimmen aus Parametern (VocAlien) und Musik zur Laufzeit aus Stems (Pulse) — die Stems sind Aufnahmen einer einzigen Band, Sprache bleibt Glyphe.
- **Neuronale Sprachsynthese im Browser** (Kokoro 82 M, Kitten TTS 15–80 M, 2025): Sprache per WebGPU, Kitten-Nano 24 MB bei ~7× Echtzeit — aber nur Englisch, eine Handvoll Stimmen, Dutzende MB Gewichte, eine Stimme zugleich ([Kitten TTS](https://cdn.jsdelivr.net/npm/kitten-tts-webgpu@0.1.1/README.md), [HeadTTS](https://unpkg.com/@met4citizen/headtts@0.2.0/README.md)).
- **Fréchet Audio Distance** (Kilgour et al. 2019): der Abstand zweier Klang-Verteilungen im Raum eines Audio-Erkenners — das, was FID fürs Bild ist; heute Maßstab für erzeugten Klang gegen Feldaufnahmen. Sie ist der maschinelle Stellvertreter des Jury-Ohrs auf dieser Karte.
- **Die Wirklichkeit:** ~7 164 lebende Sprachen ([Ethnologue](https://ethnologue.com/insights/how-many-languages)), Tausende Musiktraditionen mit eigenen Stimmungen (Gamelan, Maqam, Raga, Pentatonik); Stadtlärm einer Großstadt 55–75 dB(A) am Tag mit typischem Oktavspektrum; Stadion-Chöre von 10⁵ Stimmen; Vulkane und Gewitter strahlen bis in den Infraschall.

## Der Same

**Klang ist die Antwort eines Stoffs, angeregt durch ein Ereignis, getragen durch ein Medium in einem Raum, gehört von einem Ohr.** Anregung (Kraft aus Physik und Stoff) × Resonator (Moden aus Form, Dichte, Härte, Dämpfung) × Medium (Dichte, Schallgeschwindigkeit, Absorption der Atmosphäre) × Raum (Geometrie der Welt um Quelle und Hörer) × Ohr (Art, Richtung, Schwelle, Aufmerksamkeit). Stimme ist derselbe Same mit einem lebenden Resonator (Quelle-Filter-Modell: Stimmlippe × Vokaltrakt aus dem Leib — der Tier-Ruf im Kern trägt ihn heute schon, `klang-core.js:495`), Sprache ist ein Gesetz über diesen Resonator (Phoneminventar, Phonotaktik, Prosodie aus der Kultur-Saat), Musik ist ein Gesetz über gebaute Resonatoren (Instrument aus Stoff und Handwerk der Kultur) und über die Zeit (Tonsystem, Metrum, Form) — und das Tonsystem selbst folgt aus dem Stoff: welche Intervalle konsonant klingen, hängt vom Obertonspektrum des Instruments ab (Sethares, *Tuning, Timbre, Spectrum, Scale*: Gamelan-Stimmungen passen zu den unharmonischen Spektren der Metallophone). Eine Menge von Millionen Quellen ist derselbe Same als Statistik: fern ein Feld, nah ein Einzelner. Gelöst hat das die **Musikinstrumenten-Akustik und die Sprachsynthese**: Physical Modeling (Karplus-Strong, Digital Waveguides, Yamaha VL1 1994) erzeugt Instrumente aus Röhre, Saite und Fell statt aus Samples; die Formant-Synthese (Klatt 1980, DECtalk) erzeugte verständliche Sprache aus ~40 Parametern ohne Aufnahme; die Raumakustik (Sabine, Eyring) leitet den Nachhall aus Volumen und Absorption ab. Die Linguistik (Typologie, WALS) liefert die Verteilungen, an denen gewürfelte Sprachen gemessen werden.

## Die Leitern

**Der Preis-Satz P(x)** steht in jeder Zeile und heißt zusammen: Klang-Anteil am Haupt-Faden p95 ≤ x ms, Audio-Faden 0 Aussetzer in 10 min, Bild p95 ≤ 33 ms gehalten, 0 Byte Download über die Basis, Ankunft ≤ 5 s — gemessen auf dem Standardgerät (Radeon 890M UND GTX 1060). Eine Sprosse, deren Umfang und Tiefe stehen, deren P(x) aber an einem der beiden Geräte reißt, ist NICHT gehalten. Der Abgriff ist der Master-Ausgang im echten Spiel; „FAD" ist der Abstand der Abgriff-Verteilung zu einem Referenz-Korpus von Feldaufnahmen, „Jury" ist die Eichung der FAD-Schwelle mit menschlichen Hörern (einmal je Klasse, nicht je Lauf).

### L1 Raum, Medium und Hörort — der Ort klingt nach seiner Geometrie, seinem Medium und dem Leib, in dem man steckt

Misst, ob Richtung, Entfernung, Verdeckung, Beugung und Nachhall jeder Quelle aus der Welt folgen — vom Feld über die Häuserschlucht bis zur fremden Atmosphäre und zum Vakuum — und aus jeder Perspektive (Ohr, Helm, Wagen-Innenraum, Wasser).

| Sprosse | Umfang | Tiefe | Preis | Richter (im echten Spiel) | Stand |
|---|---|---|---|---|---|
| 1 | 1 Ort, Stereo | Links/rechts, Pegel fällt mit Abstand | P(0,2) | Pegel- und Laufzeit-Unterschied am Abgriff hat an 24 Quellen-Lagen das richtige Vorzeichen (100 %) | gehalten |
| 2 | 4 Raumklassen (Feld, Wald, Gasse, Höhle) | Nachhall paarweise ≥ 1,3× verschieden, Quelle hinter Haus/Hang ≥ 6 dB leiser und dumpfer | P(0,2) | RT60 am Abgriff je Ort; Mutation Bau-Dichte → RT60 monoton | HEUTE: Umfang+Tiefe stehen, P reißt an Radeon (0,25 > 0,2) |
| 3 | jeder begehbare Ort einer Siedlung (10³ Orte, Zufalls-Stichprobe) | Richtung vorn/hinten/oben hörbar, Ecke und Tür hörbar | P(0,3) | Blind-Lokalisierung (Jury, geeicht) vorn/hinten/oben ≥ 85 %; RT60 an 50 Zufalls-Orten ±25 % der Sabine-Zahl aus dem echten Raumvolumen | |
| 4 | Innenräume aller Gebäude einer Stadt (10⁵ Räume) | Raum-in-Raum: Tür offen/zu, Treppenhaus, Halle; Nachbar hörbar durch die Wand nach Stoff | P(0,3) | Impulsantwort im Spiel vs. gemessene IR realer Raumtypen (Kirche, Bad, Saal, Gasse): Oktav-RT60 ±20 %; Wand-Dämmung je Stoff ±5 dB gegen Bauakustik-Tafel | |
| 5 | Stadt-Maßstab, Fernschall bis 10 km, jede Perspektive (Ohr, Helm, Wagen innen) | Tiefen beugen um Hochhäuser, Höhen schattieren, Echo von Felswand; Wind- und Temperaturgradient biegt den Schall; im Wagen klingt die Welt durch Glas | P(0,5) | Donner/Glocke aus 2/5/10 km: Laufzeit = Abstand/c ±2 %, Höhendämpfung nach ISO 9613 ±3 dB; Wagen-Innenraum-Spektrum vs. Referenz-Messung FAD ≤ Schwelle | |
| 6 | Medienwechsel: Unterwasser, Eis, Fels-Körperschall | unter Wasser 4,3× schnellerer Schall, Grenze dämpft ~30 dB, Beben im Boden gefühlt vor gehört | P(0,5) | Eintauchen: Spektral-Schwerpunkt kippt wie in Hydrophon-Referenz ±20 %; Boden-Welle kommt vor der Luft-Welle in der Zeitfolge des Abstands | |
| 7 | jeder Planet aus 10⁶ Saaten, vom Gasriesen bis zum Vakuum | Atmosphäre aus Gesetz: Dichte, c, Absorption (Mars: c ≈ 240 m/s, Höhen −20 dB); im Vakuum nur Körperschall durch Helm und Leib | P(0,5) | Stichprobe 100 Saaten: Laufzeit, Pegel und Höhendämpfung am Abgriff folgen der Atmosphären-Zeile des Planeten in ≥ 95 %; Vakuum-Saaten: Luftschall 0, Körperschall vorhanden | |

### L2 Stoff und Ereignis — jeder Kontakt, Bruch, Fluss und Ausbruch klingt nach seiner Physik

Misst, wie viele Ereignisse aus dem Gesetz unterscheidbar klingen und wie wahr sie gegen Aufnahmen sind — gemessen an Zufalls-Stichproben, nie an einer Liste.

| Sprosse | Umfang | Tiefe | Preis | Richter (im echten Spiel) | Stand |
|---|---|---|---|---|---|
| 1 | Schritt auf 3 Stoffen | Stoffe am Klang unterscheidbar | P(0,2) | Spektral-Schwerpunkt je Stoff ≥ 300 Hz getrennt, ≥ 5 Schritte je Stoff am Abgriff | gehalten |
| 2 | ~10 Ereignis-Klassen (Schritt, Landung, Treffer-Paar, Motor+Doppler, Glut, Substanz) | Landung laut ∝ Aufprall, Motor folgt Gas, Doppler stimmt | P(0,2) | Motor r = 1,0, Landung r ≥ 0,99, Doppler r ≥ 0,99 am Abgriff | HEUTE: Umfang+Tiefe stehen, P reißt an Radeon |
| 3 | jeder Stoff der Tafel × jede Kontaktart (Stoß, Kratzen, Rollen, Gleiten, Bruch) | Stoff am Klang erkennbar | P(0,3) bei 32 gleichzeitigen Ereignissen | Blind: Stoff aus 10 nur am Klang erkannt ≥ 70 % (Jury, danach Klassifikator); FAD je Stoff gegen Foley-Korpus ≤ Schwelle | |
| 4 | jedes Ding aus der Werkstatt, 100 Zufalls-Bauten | Größe → Tonhöhe, Hohlraum → Resonanz, Bruch zerfällt in Trümmer-Klänge | P(0,4) bei 64 Ereignissen | gebaute Glocke/Topf/Brett: tiefste Eigenfrequenz am Abgriff ±10 % gegen Platten-/Balken-Formel; zerbrochenes Ding: Trümmerzahl im Bild ↔ Einschläge am Abgriff r ≥ 0,8 | |
| 5 | Elementar-Ereignisse: Brandung, Lawine, Hagel, Donner, Sturm, Waldbrand | Kaskaden-Klang aus der Simulation (Front, Masse, Energie) | P(0,4), Kosten an Hörbarem, nie an Weltgröße | Donner-Spektrum und -Dauer vs. Messreferenz ±25 %; Brandungspegel ∝ Wellenhöhe im Bild r ≥ 0,9 | |
| 6 | Geologie: Vulkan, Erdbeben, Lavastrom, Geysir, Gletscherkalben | Infraschall bis 1 Hz als Tief- und Vibrations-Spur, Lautheit ∝ Energie | P(0,4) | Eruptionsstärke der Simulation → Pegel am Ohr in 1/5/20 km gegen Vulkan-Akustik-Messungen ±6 dB | |
| 7 | jedes Ereignis jeder Welt, 10⁶ Saaten, auch fremde Stoffe (Methanregen, Eis-Vulkan, Meteoriten-Einschlag) | plausibel für einen nie gehörten Stoff | P(0,5) | Stichprobe 1 000 Ereignisse aus Zufalls-Saaten: Anteil, den das geeichte Ohr „plausibel für diesen Stoff und dieses Medium" nennt ≥ 90 % | |

### L3 Klanglandschaft — Natur und Stadt als EINE Population von Quellen

Misst, ob die Landschaft klingt nach dem, was dort WIRKLICH lebt, fährt und arbeitet — Tiere, Wetter, Bewohner, Verkehr, Märkte, Stadien — fern als Feld, nah als Einzelne, von der Wiese bis zur Megastadt, die Tokio klein macht. (Früher zwei Leitern Natur und Stadt: derselbe Same, dieselbe Teilung fern/nah, dieselben Richter.)

| Sprosse | Umfang | Tiefe | Preis | Richter (im echten Spiel) | Stand |
|---|---|---|---|---|---|
| 1 | 1 Biom (Wiese) + Dorf, 9 Texturen, Feuer, Motor | jede Quelle hat einen Körper im Bild; Wind gesehen = gehört | P(0,2) | Klang-Zensus Pegel je Ort im Soll; Wind Bild↔Ohr r ≥ 0,6 | HEUTE (r 0,81/0,79), P reißt an Radeon |
| 2 | 5 Biome × Tag/Nacht × Regen; 20 Wagen der Stadt | Wind, Ufer, Regen, Wagen gesehen = gehört; Insekten-Takt aus Temperatur | P(0,2) | Kreuzkorrelation Bild↔Ohr ≥ 0,6 je Biom; Wagen-Pegel ∝ Abstand, Kosten an K Stimmen, nie an 20 | teils: Verkehr K-nah steht, Wald/Ufer/Nacht gehalten, Fels und Siedlung offen |
| 3 | 10² lebende Quellen eines Dorfs (Bewohner, Werkstätten, Tiere) | Schritte, Werkzeug, Tür, Murmeln folgen dem Tagesplan der Bewohner | P(0,3) | Dorfplatz Mittag vs. Nacht ≥ 15 dB; Quellen am Abgriff ↔ Bewohner im Bild r ≥ 0,8 | |
| 4 | jedes Biom der Erde (Stichprobe 20 Zufalls-Orte über Regenwald bis Wüste, Riff bis Tundra) | Dämmerungschor, Jahreszeit; Arten teilen das Spektrum (Nischen) | P(0,3) | Bioakustik-Indizes (ACI, NDSI) je Ort gegen Feldaufnahme-Datenbank ±25 %; Spektral-Überlappung der Rufer < Zufall | |
| 5 | 10⁴ Quellen einer Großstadt (Verkehr, Glocken, Märkte, Baustellen, Stadion) | fern als Feld, nah als Einzelner; Straßenschlucht hallt; 10⁴-Stimmen-Chor im Stadion synchron | P(0,4), Kosten an Schirm+Änderung | Tag-Pegel und Oktavspektrum an 10 Zufalls-Orten vs. Lärmkarten-Referenz (55–75 dB(A)) ±5 dB; FAD Straße/Markt/Stadion gegen Feldaufnahmen ≤ Schwelle | |
| 6 | 10⁶ Bewohner einer Metropole | Rushhour, Feiertag, Stromausfall, Spiel-Tor im Stadion verändern den Klangkörper | P(0,5) | 24-h-Fahrt: Pegelkurve folgt der Aktivität der Simulation r ≥ 0,9; Blindtest Abgriff vs. Feldaufnahme (Shibuya, Times Square): ≥ 50 % „echt" | |
| 7 | 10⁸ Bewohner in einer Stadt, 10⁹⁺ auf dem Planeten — Tokio ×3 | jeder Bezirk, jede Höhe (Straße, Hochbahn, Dach im 300. Stock) hat seinen Klang; man erkennt das Viertel mit geschlossenen Augen | P(0,5), Ankunft ≤ 5 s an jedem Ort | 50 Zufalls-Orte × 6 Uhrzeiten: Bezirk-Typ und Uhrzeit nur am Abgriff erkannt ≥ 70 % (geeichter Klassifikator); Anteil der hörbaren Quellen, die im Bild einen Verursacher haben, ≥ 99 % | |
| 8 | fremde Evolution: 10⁶ Saaten mit eigenen Arten, Medien, Sinnen | Rufe in fremden Medien (Ultraschall, Infraschall, dichte Atmosphären); Ruf folgt Leib | P(0,5) | 100 Zufalls-Saaten: „lebendig und eigen" ≥ 80 %, Paar-Unterscheidbarkeit am Abgriff ≥ 90 %; Ruf-Tonhöhe vs. Körpergröße folgt Allometrie (Steigung ±20 %) über alle Arten | Tiefe teils: Tier-Ruf f0 ∝ L^−0,9 mit Formanten (`klang-core.js:495-497`) |

### L4 Stimme und Sprache — jede Person spricht hörbar, in einer Sprache ihrer Kultur

Misst, wie viele Personen mit eigener Stimme sprechen und wie viele Sprachen aus Gesetzen entstehen, verständlich, gefühlvoll und ohne Aufnahme oder Gewichte.

| Sprosse | Umfang | Tiefe | Preis | Richter (im echten Spiel) | Stand |
|---|---|---|---|---|---|
| 1 | 1 Stimme aus Gesetz, Laute ohne Bedeutung (Murmeln, Rufe) | Stimme folgt dem Leib: Kind/Frau/Mann, groß/klein hörbar | P(0,3) | F0 und Formanten am Abgriff folgen Leib-Maßen gegen Peterson-Barney-Vokaltafel ±15 % | unter der Leiter: der Begleiter spricht über die Geräte-Stimme des Browsers (zählt nicht, R4) |
| 2 | 10 Stimmen, 1 Sprache (Spielersprache), verständlich | Prosodie aus Affekt (Freude, Angst, Zorn) | P(0,5) | Wortfehlerrate eines Spracherkenners auf dem Abgriff ≤ 10 %; Affekt blind erkannt ≥ 60 % | |
| 3 | jeder Bewohner einer Siedlung (10³), eigen nach Alter, Herkunft, Krankheit | zwei Zufalls-Bewohner verwechselbar nur wie im Leben | P(0,5) | Sprecher-Verwechslung zweier Zufalls-Bewohner ≤ 5 % (Sprecher-Erkenner am Abgriff) | |
| 4 | 10² Sprachen aus Gesetz (Inventar, Silbenbau, Prosodie, Wortschatz) | typologisch plausibel | P(0,5) | 100 Zufalls-Sprachen: Inventar-Größen und Silbenbau innerhalb der WALS-Verteilung; Sprachpaare am Abgriff unterscheidbar ≥ 90 % | |
| 5 | Sprachwandel über Epochen und Abstammung | Lautwandel, Lehnwörter aus Kontakt, Dialekte je Ort | P(0,5) | Stammbaum der Simulation aus dem Abgriff per Lautvergleich rekonstruierbar (Baum-Abstand ≤ 20 %) | |
| 6 | jede Person einer Metropole (10⁶) spricht und antwortet | Antwort im Sinn, in eigener Stimme | P(0,5), Antwort ≤ 1 s | Stichprobe 1 000 Bewohner: jeder spricht hörbar in seiner Sprache, Latenz ≤ 1 s, Spielersprache ≤ 10 % WER | |
| 7 | 10⁴ Sprachen über Planeten und Zeitalter, 10⁸⁺ Sprecher, auch fremde Sprechorgane (Pfeif-, Klick-, Infraschall-Sprachen) | fremde Sprache als Sprache erkennbar, nicht als Lärm | P(0,5), Ankunft ≤ 5 s | 100 Zufalls-Saaten: Anteil, den das geeichte Ohr als „Sprache" einstuft ≥ 90 %; Wortgrenzen und Wiederholungsstruktur messbar | |

### L5 Musik je Kultur und Epoche — Instrumente und Tonsysteme aus Stoff und Gesetz

Misst, ob Musik aus einem Gesetz entsteht (Instrument aus Stoff → Spektrum → Tonsystem → Tradition), ob sie an Quellen der Welt hängt und ob Hörer Kultur und Epoche erkennen — nicht, wie viele Stile von Hand eingetragen sind.

| Sprosse | Umfang | Tiefe | Preis | Richter (im echten Spiel) | Stand |
|---|---|---|---|---|---|
| 1 | 1 Musik-System, 22 handgestimmte Genre-Tafeln, 12-TET, 7 Skalen | Musik liest das Feld (Valenz, Erregung), keine Wiederholung in 10 min | P(0,2) | Chroma-Abstand bei Valenz-Mutation; 185 Phrasen, 0 wiederholt | HEUTE, P reißt an Radeon; die Tafeln sind Fleiß, nicht Same |
| 2 | Musik am Ort: eine hörbare Quelle in der Welt (Spieler, Straßenmusiker) | gebautes Instrument klingt nach seiner Gestalt | P(0,3) | Tonhöhe am Abgriff folgt Saiten-/Röhrenlänge des gebauten Instruments ±3 % | |
| 3 | 100 Zufalls-Kulturen, je eigenes Tonsystem aus dem Spektrum ihrer Instrumente | Mikrotonalität, Metrum (gerade, ungerade, additiv), Form | P(0,3) | Intervall-Histogramme der 100 decken den Raum realer Traditionen: jede reale Korpus-Tradition hat einen Nachbarn ≤ 15 cent mittlerer Abstand; Paare unterscheidbar ≥ 90 % | |
| 4 | jedes Instrument, das eine Kultur aus ihren Stoffen bauen kann (100 Zufalls-Bauten) | Klangfarbe aus Stoff und Bauform, Spieltechnik aus Leib | P(0,4) bei 16 Stimmen | Instrumenten-Klassifikator ordnet den Abgriff der richtigen Hornbostel-Sachs-Familie zu ≥ 80 % | |
| 5 | Musik im Leben: Fest, Arbeit, Trauer, Krieg, Stadion-Gesang, Ensembles | Gesang mit Text in der Sprache der Kultur | P(0,5) | 100 Zufalls-Kulturen: „plausible Musik" ≥ 80 %; Anlass (Fest/Trauer) blind erkannt ≥ 70 % | |
| 6 | Musik wandelt sich durch Kontakt und Technik (Knochenflöte → Polyphonie → Elektronik) | Stil-Evolution, nicht Stil-Katalog | P(0,5) | Stammbaum der Stile aus dem Abgriff rekonstruierbar (Baum-Abstand ≤ 25 %) | |
| 7 | 10⁵ Traditionen über Planeten, fremde Ohren und Medien | Musik fremder Arten, die es nie gab, und doch Musik | P(0,5), Ankunft ≤ 5 s | Stichprobe 1 000 Saaten: Struktur messbar (Wiederholung, Hierarchie, Tonzentrum oder Puls) ≥ 95 %, geeichtes Ohr „Musik, nicht Lärm" ≥ 80 % | |

### L6 Hören im Getümmel — Fokus, Verständlichkeit und Mischung

Misst, ob der Spieler in der lautesten Welt das Wichtige hört: das Gespräch, dem er sich zuwendet, die Warnung, den eigenen Schritt — ohne dass die Menge verschwindet. Die Fähigkeit, die eine Megastadt von Lärm trennt.

| Sprosse | Umfang | Tiefe | Preis | Richter (im echten Spiel) | Stand |
|---|---|---|---|---|---|
| 1 | 7 Stimmen zugleich, die lautesten gewinnen; Musik tritt unter Stimme | keine Spitze über 0 dBFS | P(0,2) | Spitzen am Abgriff ≤ 0 dBFS über 10 min; Duck 8–12 dB bei Stimme | HEUTE (Stimmen-Deckel 7, Spitzen-Wand, Duck), P reißt an Radeon |
| 2 | Dorfplatz mit 10² Quellen | der zugewandte Sprecher bleibt verständlich | P(0,3) | Wortfehlerrate des zugewandten Sprechers bei 65 dB(A) Umgebung ≤ 15 % | |
| 3 | Großstadt-Straße 75 dB(A), 10⁴ Quellen | Zuwendung (Blick, Nähe) hebt eine Stimme aus der Menge, wie das Ohr es tut | P(0,4) | WER des zugewandten Sprechers ≤ 15 %, Pegel der Menge dabei ≤ 3 dB gesenkt (die Stadt bleibt da) | |
| 4 | Ausnahme-Lage: Explosion, Stadion-Tor, Sirene | Gehör-Schutz, Vertäubung, Klingeln — der Leib hört mit | P(0,4) | nach 130 dB-Ereignis: Hörschwelle am Abgriff steigt und erholt sich in der Zeitfolge der Audiologie ±30 % | |
| 5 | jede Perspektive: Kind, Tier, fremdes Ohr, Hörgeschädigter | das Ohr selbst ist Gesetz (Hörbereich, Richtung, Schwelle) | P(0,4) | Wechsel des Leibs: Abgriff-Spektrum folgt dem Hörbereich der Art (Fledermaus Ultraschall hörbar heruntergemischt, Elefant Infraschall) ±20 % | |

### L7 Kopplung und Zeit — die Kette ist hörbar, die Epoche klingt nur nach sich selbst

Misst das Zusammenspiel (R7): ein Ereignis zieht seine Folgen hörbar durch alle Leitern, und eine Zeitreise klingt nur nach dem, was in dieser Epoche lebt und gebaut ist. (Die drei Epochen-Richter der ersten Fassung — Natur, Stadt, Musik — sind hier EINER.)

| Sprosse | Umfang | Tiefe | Preis | Richter (im echten Spiel) | Stand |
|---|---|---|---|---|---|
| 1 | Wetter → Stoff: Regen auf jedem Dach klingt nach dessen Stoff | gesehen = gehört über zwei Leitern | P(0,3) | Regen-Klang am Abgriff je Dach-Stoff unterscheidbar; Regenstärke im Bild ↔ Pegel r ≥ 0,9 | |
| 2 | Ereignis → Menge: ein Ausbruch, Beben, Unfall ändert Bewohner, Verkehr, Tiere | die Menge reagiert (Schrei, Flucht, Hupe, Vogel verstummt) | P(0,4) | nach Ereignis: Spektrum und Pegel der Klanglandschaft ändern sich in ≤ 2 s, die Änderung folgt der Reaktion der Simulation r ≥ 0,8 | |
| 3 | Kette über Zeit: Vulkan grollt → Asche auf Dächern → Küste wächst → neue Bucht hat Brandung und Hafen | die Klanglandschaft eines Ortes folgt seiner Geschichte | P(0,4) | Zeitraffer 100 Jahre an 10 Orten: Quellen am Abgriff ⊂ was die Simulation dort entstehen ließ, 0 Waisen | |
| 4 | Zeitreise über Menschenzeit (Rom, Edo, Industrie, Zukunft) | Klang der Technik der Epoche: Hufe, Dampf, Verbrenner, Elektro; Musik und Sprache der Epoche | P(0,5), Ankunft ≤ 5 s je Epoche | Epochen-Fahrt: 0 anachronistische Quellen (Abgriff-Klassen ⊂ Technik-Inventar der Epoche); Epoche nur am Abgriff erkannt ≥ 80 % | |
| 5 | Tiefe Zeit (Kambrium still, Karbon-Insekten, Kreide, Eiszeit) und fremde Planeten-Geschichten | was lebt, klingt; Vogelgesang erst, wenn Vögel entstehen | P(0,5), Ankunft ≤ 5 s | Fahrt über 6 Zeitalter × 10 Saaten: Quellen am Abgriff ⊂ Arten der Epoche, 0 Anachronismen | |

## Stand heute

- **Raum (L1, Sprosse 2 ohne Preis):** RT60 aus der Lage am Ohr (Kronen-, Bau-, Fels-Anteil), `klang-core.js:432-437`, `:1179` `umweltRaumNachhall`, `:1188` `umweltRaum`; Verdeckung Haus −11,2 dB / Hang −10,9 dB, RT60 Feld 0,283 · Wald 0,649 · Gasse 1,522 · Höhle 3,195 s (MEISTERKARTE.md Klang K3, 2/2). Kein HRTF — Stereo-Panning (`createStereoPanner`, `klang-core.js:1012/1191/1277`). Kein Medienwechsel, keine Atmosphäre.
- **Stoff und Ereignis (L2, Sprosse 2 ohne Preis):** `schrittKlang` aus Stoff-Tafel `klang-core.js:1532`, `trefferPaar` `:1420`, `substanzKlang` `:1318`, Motor `fahrtStimme` mit Doppler `:1675`; Motor r 1,0, Landung r 0,9975 (Klang K4). Keine Eigenfrequenz aus Gestalt, kein Bruch, kein Donner, kein Vulkan.
- **Klanglandschaft (L3, Sprosse 1, Sprosse 2 teils):** neun Textur-Gesetze `klang-core.js:668-766`, Grillen-Takt aus der Wärme mit festem Harfen-Ton (`:488-493`), Tier-Ruf aus dem Körper f0 ∝ L^−0,9 mit zwei Formanten ∝ 1/L (`:495-497`), Klang-Zensus Wiese/Ufer/Wald/Dorf, Nacht, Regen gehalten; Wind Bild↔Ohr r 0,81/0,79 (Klang K1, K2). Verkehr: die K nächsten fahrenden Wagen klingen, `stamm/klang.js:1092-1110` (`_fahrtVerkehr`). Keine Bewohner-Klänge, kein Stadtteppich, Vögel als zwei Schleifen statt Arten.
- **Stimme und Sprache (L4, unter der Leiter):** BERICHTIGT — es gibt eine gesprochene Stimme: der Begleiter (KI) spricht über die `speechSynthesis` des Browsers (`stamm/werkstatt-hud.js:71-89`, Mitspieler `stamm/netz-p2p.js:2556-2575`), die Musik tritt darunter (`klang.js:2333`, Duck „gespraech"). Diese Stimme ist eine Geräte-Stimme des Betriebssystems — nicht aus Gesetz, je Gerät anders, nicht dem Leib eines Bewohners zugeordnet — und zählt nach R4 nicht. Bewohner sprechen nicht; `taste.gespraech` (`stamm/daten.js:1780`) öffnet Text. Der Quelle-Filter-Same des Tier-Rufs ist der nächste Hebel für L4/1.
- **Musik (L5, Sprosse 1):** BERICHTIGT — 22 Genre-Tafeln (nicht 23), `klang-core.js:96-117` (Blues bis Rock, eine „Barock"), 7 Skalen 12-TET `:39-47`, Lofi-Schicht `stamm/klang.js:1130`, Musik liest das Feld (MEISTERKARTE Affekt K5: 185 Phrasen, 0 wiederholt; Duck 8,5–12 dB). Die Tafeln sind von Hand gestimmt — Fleiß, kein Same; keine Kultur, keine Epoche, keine Mikrotonalität, Instrumente als Oszillator-Synthese.
- **Getümmel (L6, Sprosse 1):** Stimmen-Deckel 7 (`klang-core.js:417`), Hörschwelle mit Hysterese, Spitzen-Wand hinter dem Master (`:420ff`), Musik-Duck.
- **Kopplung (L7):** nichts gekoppelt über die Leitern hinaus; Wetter→Klang nur als Regen-Textur am Ort, nicht je Dach-Stoff.
- **Preis:** Klang-Takt p95 GTX 0,14/0,20/0,18 ms; Radeon 0,17/0,25/0,22 ms ROT > 0,2 (Klang K5 1/2, `cec92db1`); 0 Samples, alles Synthese. Nach dem Preis-Satz heißt das: an der Radeon hält HEUTE keine Sprosse 2 ganz — der Same steht, der Preis ist die enge Kante.

## Abhängigkeiten

- **Physik und Stoff:** die Stoff-Tafel (Dichte, Härte, Dämpfung) ist L2s Resonator — ohne Gestalt-Daten kein Sprung auf L2/4 und L5/2–4.
- **Architektur, Gebäude und Innenräume; Siedlung und Stadt:** Raumgeometrie und Volumen tragen L1/3–5 und L3/5–7.
- **Atmosphäre, Wetter und Klima; Himmel und fremde Welten:** Dichte, Temperaturgradient, Schallgeschwindigkeit je Planet für L1/5–7; Donner, Sturm, Regen für L2/5, L7/1.
- **Planet und Geologie, Ozean:** Vulkan, Beben, Brandung als Anreger L2/5–6, L1/6, L7/3.
- **Tiere, Leben im Wasser, Evolution und fremdes Leben:** Arten mit Leib (Größe, Organ, Hörbereich) für L3/4, L3/8, L6/5.
- **Der Mensch: Leib, Gesicht; Geist, Alltag; Sport:** Kehlkopf, Alter, Affekt, Tagesplan, Stadion für L4, L3/3–6, L5/5.
- **Kultur, Sprache, Glaube und Wissen:** die Sprach- und Kultur-Saat (L4/4–5, L5/3–6) — das Blatt Kultur besitzt Grammatik und Bedeutung, dieses Blatt den hörbaren Laut.
- **Millionen: Bevölkerung, Masse und Strom:** fern Statistik, nah Einzelne — dieselbe Teilung trägt L3/5–7, L4/6, L6/3.
- **Menschenzeit, Tiefe Zeit:** Epochen-Inventare für L7/4–5.
- **Ankunft, Geräte:** jede Sprachstimme muss ohne Gewichts-Download kommen, sonst kollidiert L4 mit der Ankunft ≤ 5 s.

## Was die alte Karte hier misst

Bereich 32 „Klang aus dem Gesetz", 9/10:
- **K1 Ort klingt nach dem, was dort ist, jeder Ruf mit Körper (2/2)** → L3 Sprosse 1.
- **K2 Gesehen = gehört (2/2)** → Richter von L3 Sprosse 1–2.
- **K3 Raum: Richtung, Verdeckung, Hall (2/2)** → L1 Sprosse 2 (Umfang+Tiefe).
- **K4 Körper aus Stoff und Bewegung (2/2)** → L2 Sprosse 2 (Umfang+Tiefe).
- **K5 Kosten am Hörbaren, 0 Aussetzer (1/2)** → keine eigene Leiter, sondern der Preis-Satz P(x) jeder Sprosse (R3); Radeon ROT 0,25 ms nimmt den Sprossen 2 ihr Halten.
- Bereich 10 Affekt **K5 Die Musik liest das Feld (2/2)** → L5 Sprosse 1.
- Die alte Karte misst Stimme, Sprache, Stadt-Menge, Getümmel, Kultur/Epoche der Musik, Medium/Planet, Geologie-Klang und Kopplung gar nicht — 9/10 dort ist hier Sprosse 1–2 von 5–8 auf vier Leitern, 1 von 5 auf L6, 0 auf L7 und „unter der Leiter" bei der Stimme.

## Zweifel

- **Jury und FAD:** Hörtests mit Menschen sind nicht in ≤ 3 min fahrbar; die Karte setzt FAD und Klassifikatoren als Stellvertreter, mit der Jury nur als Eichung je Klasse. Ob FAD für fremde Planeten (kein Referenz-Korpus) überhaupt etwas misst, ist offen — dort trägt nur die Struktur-Messung (L5/7, L4/7).
- **Sprache ohne Gewichte:** ob Synthese aus Gesetz je unter 10 % Wortfehlerrate kommt, ist offen; heutige verständliche Browser-Stimmen brauchen 24–80 MB Gewichte. Ein Gewichts-Netz als Same kollidiert mit „null Download" — offene Frage, nicht Punkt.
- **Wellenakustik im Browser:** Beugung und Fernschall (L1/5) ohne Bake ist in keinem Spiel belegt; die Sprosse ist eine Wette.
- **Die Größenordnungen** (10⁸ Sprecher, 10⁴ Sprachen, 10⁵ Traditionen) sind aus der Vision abgeleitet, nicht aus einer Messung, ab welcher Zahl ein Hörer den Unterschied merkt.
- **Die P(x)-Budgets** sind gesetzt (0,2 → 0,5 ms), nicht abgeleitet; der Audio-Faden läuft getrennt, sein Budget je Gerät ist ungemessen.
- Die Stand-Belege stammen aus MEISTERKARTE.md und Code-Lesen, nicht aus eigenem Hören — kein Abgriff, kein Spiel gestartet.

## Gegenlese — was sich änderte und was strittig bleibt

- **Preis gebündelt:** der Preis-Satz P(x) (Haupt-Faden-Anteil + 0 Aussetzer + Bild ≤ 33 ms + 0 Byte + Ankunft ≤ 5 s, Radeon UND GTX) steht jetzt in jeder Zeile statt „dito"; Folge: die drei HEUTE-Sprossen 2 halten an der Radeon NICHT ganz (0,25 > 0,2) — ehrlich abgesenkt.
- **Oberste Sprossen gehoben:** Stadt auf 10⁸ Bewohner je Stadt / 10⁹⁺ je Planet (Tokio ×3), Raum bis Vakuum und Gasriese, Stimme auf 10⁸ Sprecher über Zeitalter und fremde Sprechorgane.
- **Bauweise aus Richtern und Tiefen entfernt:** „HRTF", „modale Antwort", „Formant-Stimme", „Physical Modeling", „nah 8 Sprecher voll", „gate:klang-zensus" ersetzt durch das am Abgriff Hörbare; FAD als Bildpaar fürs Ohr eingeführt.
- **Zusammengelegt:** Naturklang + Stadt → L3 Klanglandschaft (derselbe Same fern/nah); die drei Epochen-Richter → EIN Richter in L7. **Neu:** L6 Getümmel (Fokus, Verständlichkeit, Leib-Ohr, jede Perspektive) und L7 Kopplung und Zeit (R7).
- **Fleiß zu Fähigkeit:** „10 Traditionen (Maqam, Raga …)" → 100 Zufalls-Kulturen, deren Tonsystem aus dem Spektrum ihrer Instrumente folgt und den Raum realer Traditionen abdecken muss; Paar-Listen → Zufalls-Stichproben.
- **Stand berichtigt:** gesprochene Stimme existiert (Begleiter über Browser-`speechSynthesis`), zählt aber nach R4 nicht; 22 statt 23 Genre-Tafeln; Tier-Ruf-Allometrie und Grillen-Temperatur-Gesetz stehen schon (Tiefe-Teil von L3/8, L3/2).
- **Strittig:** ob FAD fremde Welten richten kann; ob Zeitreise in reale Epochen ohne reale Sprachen/Musik-Daten „aus einem Samen" überhaupt R4 genügt (Latein als Gesetz?); die gesetzten P(x)-Budgets; ob L6/5 (fremdes Ohr) hierher oder zu „Fremde Sinne" gehört.
