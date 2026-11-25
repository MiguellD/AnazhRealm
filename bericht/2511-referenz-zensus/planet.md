# Zensus Referenz-Szenen — Gruppe planet (Geologie, Relief, Wasser, tiefe Zeit, Kopplung)

Nur gelesen. Stand: punkte-maschine (front-tafel 25.11. 06:17, karte-2-stand 105 von 1 718), main = Haupt-Klon.

## 0. Lage der Gruppe (gelesen, nicht geraten)

**Gebucht in meinen Leitern (meisterkarte-2.json, `heute`):** wasser.stroemung 1 · wasser.eis 2 · wasser.kreislauf 1 · wasser.tiefsee 1 · zeit.archiv 1 · kopplung.bahn-klima 1 · kopplung.wetter-welt 2 (Glieder 1, 3) · kopplung.gegenwart 1 (Glied 6). Das sind 10 Sprossen. Alle anderen Leitern stehen auf 0.
`planet.zeit.reise`, `planet.zeit.fossil`, `planet.relief.massstab` und `planet.kopplung.eingriff` stehen im Kapitel-Text, aber nicht in meisterkarte-2.json. Ihre Front urteile ich darum nicht. Neu in der JSON ist dagegen `planet.erde.gestalt` („Die echte Erde — erkannt und vermessen“, 6 Sprossen, heute 0). Ihre Front #1 hat KEINE STATION.

**Die Fronten und was sie hält (front-tafel.md):**

| Front | Was sie hält |
|---|---|
| relief.grossform#1 | Das Gesetz hält (293 von 293 Läufen enden in See oder Meer, 10/10 Senken nass), aber nur 17 von 20 Bildern. Die Abnahme ist ROT: „Vordergrund 33,5 % näher als 3,61 m: Laub baum_erle“ |
| wasser.gezeiten#1 | Kein Gesetz. Hub 0 m über 25 h. Der Meeresspiegel ist eine Konstante (gelaende-core.js:6092 `waterLevel: GRUND.basis − GRUND.meerUnterBasis`, :7773 `wasserSpiegel` liest `L.waterLevel`) |
| wasser.kreislauf#2 | Kein Grundwasser. `atlasSpiegel` füllt nur den 3×3-Rand (gelaende-core.js:7804) |
| relief.wandel#1 | Das Wasser gräbt nicht. `_voxelSurfaceY` kennt keinen Abtrag |
| wasser.seegang#1 | Die Probe misst nichts (spiegelTreue ungemessen) |
| wasser.stroemung#2 | Die Probe misst nichts. werkbank `/bild` kennt keinen optischen Fluss |
| geologie.einschlag#1 · geologie.inneres#1 · zeit.klimageschichte#1 · kopplung.ereignis-spur#1 · kopplung.kaskade#1 · kopplung.gegenwart#4 · kopplung.siedlungslage#2–5 | „Umfang nicht erzeugbar“: das Gesetz fehlt |
| kopplung.land-meer-luft#1 / #2 / #5 | luvLee 1,195 (Soll ≥ 2) · Rang 0,137 (Soll ≥ 0,7) · Lee −1,3 % (Soll ≤ −50 %). Täter: planet-core `planetKlimaR` / `planetScheibe` |
| kopplung.siedlungslage#1 | Leser 48,4 % (Soll 100 %): Steg und Boot lesen den Spiegel nicht |
| geologie.platten#1 · vulkan#1 · gebirge#1 · unterwelt#1 · lagerstaette#1 · relief.formschatz#1 · relief.boden#1 · wasser.eis#3 · wasser.tiefsee#2 · zeit.archiv#2 · siedlungslage#6/#7 · gegenwart#3 | KEINE STATION |

**Die ABNAHME-Linse** (scripts/lib/abnahme-urteil.cjs:38, `sicht.vordergrund.deckung ≤ 0,25`) steht in **8 Planet-Sprossen** der Tafel. Fünf davon tragen bei c1236fa8 denselben Befund „Vordergrund 28,1 % näher als 8 m“: Eine geteilte Beleg-Pose hält sie alle.

**Kann das Spiel HEUTE an Ort und Zeit der Erde? Nein.**
- `reise <Breite> <Länge> [Ma]` (stamm/feld-leben.js:1278–1298) führt an Breite und Länge des Saat-Planeten, nicht der Erde. Die Zeit geht nur in ganzen Ma (−4 000 … +1 000, :1289–1290). −21 ka oder +100 a sind unerreichbar.
- Das Relief am Ort ist der Gelände-Kern (Rauschen + Flussnetz T1/T2, gelaende-core.js:361–370), nicht der Planet: Die Akte zu gegenwart#5 sagt „das Relief der Welt ist nicht der Planet am Ort“.
- Die Welt **staucht die Höhe**: „ihre 160 m tragen, was in den Alpen 3 km tragen; 0,11 K/m“ (gelaende-core.js:1304–1305; die Erde hat 6,5 K/km).
- Der Mond steht immer voll gegenüber der Sonne (welt-licht.js:826–828).
- Die Messorte (spec/profiband/haushalt.json) sind wiese, genesis, dorf, buehne, stadt, stadt-voll, ort-zeichen, hochhaus-dach und gipfel-blick (172 m). Darunter ist **kein Küsten-, Tal-, Gletscher- oder Tafelland-Messort**. Die Gezeiten-Station nimmt „die Bucht 11 km vom Spawn“.

## (a) Referenz-Szenen

### Szene 1 — Nordseeküste: Wattenmeer und das Rhein-Maas-Schelde-Delta, heute (T = 0), mit dem Ereignis 1953

| Größe | Wert (Spanne) | Quelle | URL |
|---|---|---|---|
| Periode der Mondgezeit M2 | 12 h 25,2 min = 12,42 h | Wikipedia „Tide“ | https://en.wikipedia.org/wiki/Tide |
| Spring-Nipp-Takt | zwei Wochen, ~7 d Spring→Nipp (29,53 d / 2 = 14,77 d) | Wikipedia „Tide“ | https://en.wikipedia.org/wiki/Tide |
| Tidenhub-Klassen | mikro < 2 m · meso 2–4 m · makro > 4 m · hyper > 6 m | Wikipedia „Tidal range“ | https://en.wikipedia.org/wiki/Tidal_range |
| größter mittlerer Hub | 11,7 m Fundy (Extrem 17,0 m); Europa: Bristol Channel 9,60 m (max 15 m) | Wikipedia „Tidal range“ | https://en.wikipedia.org/wiki/Tidal_range |
| Sturmflut 1953 | Land bis 5,6 m über NN geflutet; NL 1 365 km²; 67 Deichbrüche in Zeeland | Wikipedia „North Sea flood of 1953“ | https://en.wikipedia.org/wiki/North_Sea_flood_of_1953 |
| Meeresspiegel Wattenmeer | +3,7 mm/a, die Sedimentation übersteigt ihn auf den meisten Watten; Fläche ~10 000 km², Küste ~500 km | Wikipedia „Wadden Sea“ | https://en.wikipedia.org/wiki/Wadden_Sea |
| voll entwickelte See | 37 km/h → 1,5 m · 56 km/h → 4,1 m · 74 km/h → 8,5 m; Fetch 139 / 518 / 1 313 km; Perioden 5,7 / 8,6 / 11,4 s | Wikipedia „Wind wave“ | https://en.wikipedia.org/wiki/Wind_wave |
| JONSWAP | Spitzen-Überhöhung 3,3; σ 0,07 / 0,09 | Wikipedia „Wind wave“ | https://en.wikipedia.org/wiki/Wind_wave |
| Größte Einzelwelle | „etwas unter 2·Hs“ | Wikipedia „Wind wave“ | https://en.wikipedia.org/wiki/Wind_wave |
| Tidenhub Wattenmeer | 1,5–4 m, Mitte oft > 3 m — **ungeprüft** (nur Such-Auszug, Seite nicht geöffnet) | ecomare | https://ecomare.nl/en/in-depth/reading-material/wadden-sea-area/wadden-sea |
| Trockenfallen | 30 % (SH-Nationalpark) gegen „die Hälfte“ — **ungeprüft, widersprüchlich** | Such-Auszug | https://Www.wikipedia.org/wiki/Schleswig-Holstein_Wadden_Sea_National_Park |
| Spiegel des Wassers senkrecht | ≈ 2 % aus Fresnel mit n ≈ 1,33 — **ungeprüft** (gerechnet; die Seite nennt nur Glas n 1,5 → 4 %) | Wikipedia „Fresnel equations“ | https://en.wikipedia.org/wiki/Fresnel_equations |

Bänder mit Quelle: 9 · ungeprüft: 3.

**Sprossen, die die Szene richtet:**
- karte2.planet.wasser.gezeiten#1, #2, #3, #4
- karte2.planet.wasser.seegang#1, #2, #3, #6
- karte2.planet.wasser.stroemung#3
- karte2.planet.wasser.tiefsee#2
- karte2.planet.relief.grossform#4
- karte2.planet.zeit.klimageschichte#1
- karte2.planet.kopplung.kaskade#4
- karte2.planet.kopplung.gegenwart#4

**Heute im Spiel:**
- Meer als Konstante: gelaende-core.js:5889, 6092, 7773.
- Weißkappe nach Monahan: foundry-core.js:160–161 (laut Kapitel).
- Spiegel-Pass `_wasserBlick` in stamm/wasser-hydro.js.
- Mond = −Sonne: welt-licht.js:826–828.
- Eine Bucht 11 km vom Spawn (Gezeiten-Akte 5b36f69a).

**Es fehlt:** die Gezeit, Strand und Watt (formschatz kennt kein Delta, keinen Strand), ein Küsten-Messort, die Mondbahn.

**Das Gesetz lebt in:** gelaende-core `wasserSpiegel` / `waterLevel` (der EINE Spiegel, Kern-Gesetz laut SKILL „Die Quelle je Domäne“). Leser sind die Automat-Ruhe `_ensureWaterCALevel`, `_nassAt` und `_wasserBlick`.

**ERSTE WELLE:**
- **Chokepoint:** `wasserSpiegel`/`waterLevel` des Meer-Körpers liest die Welt-Uhr: η(t) = A_M2·cos(2πt/12,42 h) + A_S2·cos(2πt/12,00 h). Die Schwebung M2–S2 gibt den Spring-Nipp-Takt von 14,77 d ohne eigene Mondbahn. Der Hub ist meso, 2–4 m.
- **Was stirbt:** die Konstante „Basis − 3 m“ als Meeresspiegel. Seen bleiben ohne Gezeit.
- **Dateien:** gelaende-core.js (Spiegel), stamm/wasser-hydro.js (Leser des Spiegels), voxel-worker.js (falls der Faden den Spiegel cached).
- **Erwartet an der Front:** gezeiten#1 sicher, gezeiten#2 wahrscheinlich (gleiche Funktion, Pegel über 30 Tage) = **2**. Ein seegang#1 an derselben Bucht wäre Zufall, nicht gezählt.
- **Aufwand:** ~8 h.
- **Bildpaar:** die Bucht, gleiche Kamera, Uhr bei Ebbe gegen Uhr + 6,2 h bei Flut. Das Watt fällt sichtbar trocken (benetzte Fläche).
- **Preis-Risiko:** Ein wandernder Spiegel darf den Automaten nicht neu rechnen lassen. Die Kosten gehören an den Schirm, nie an die Küstenlänge.

### Szene 2 — Ein Alpental: das Oberwallis (Grosser Aletschgletscher → Rhonetal), heute (T = 0) und LGM (−21 ka)

| Größe | Wert (Spanne) | Quelle | URL |
|---|---|---|---|
| Höhenmodell | swissALTI3D, Raster 0,5 / 2 m; σ 0,3 m (LiDAR neu), 0,5 m (alt, < 2 000 m), 1–3 m (Stereo, > 2 000 m); ~43 500 Kacheln à 1 km². Lizenz des Vollbestands nicht gelesen; Proben nur zum Testen | swisstopo | https://www.swisstopo.admin.ch/en/height-model-swissalti3d |
| Gletscher-Geometrie | Aletsch 22,6–23 km lang, 81,7 km² (2011), 905 m dick am Konkordiaplatz, ~180 m/a, 4 160 → 1 650 m | Wikipedia „Aletsch Glacier“ | https://en.wikipedia.org/wiki/Aletsch_Glacier |
| Gletscher im Wandel | −3,2 km seit 1870 (−1,3 km seit 1980), −114,6 m im Jahr 2006, > 300 m Dicke verloren bis 2016 | Wikipedia „Aletsch Glacier“ | https://en.wikipedia.org/wiki/Aletsch_Glacier |
| Höhen-Gradient | ISA 6,5 K/km; trocken 9,8 K/km; feucht 3,6–9,2 K/km (typisch ~5) | Wikipedia „Lapse rate“ | https://en.wikipedia.org/wiki/Lapse_rate |
| Hack-Gesetz | L = C·A^h, h „etwas unter 0,6“, fällt über 20 720 km² | Wikipedia „Hack's law“ | https://en.wikipedia.org/wiki/Hack%27s_law |
| Bifurkation | 3–5 (britische Flüsse) | Wikipedia „Strahler number“ | https://en.wikipedia.org/wiki/Strahler_number |
| Mäander | Länge 10–14 × Breite (Mittel 11); Radius 2–3 × Breite; Länge 3–5 × Radius (4,7); Gürtel 15–18 × Breite; Sinuosität ≥ 1,5 | Wikipedia „Meander“ (Abschnitt markiert „braucht Belege“) | https://en.wikipedia.org/wiki/Meander |
| Regenschatten (Erde, nicht Wallis) | Südalpen NZ 6 300–8 900 mm im Luv gegen < 760 mm 50 km östlich; Olympic 2 200 gegen 250–380 mm; Skandinavien 2 250–3 575 gegen 280–760 mm → Luv/Lee 3–12:1 | Wikipedia „Rain shadow“ | https://en.wikipedia.org/wiki/Rain_shadow |
| Trog-Querprofil | y = a·x^b; die Parabel b ≈ 2 ist die U-Form (Svensson 1959) — **ungeprüft** (Such-Auszug) | J. Glaciol. / arXiv | https://arxiv.org/pdf/0901.1177 |
| Siedlung am Wasser | > 50 % der Menschen ≤ 3 km von Süßwasser, nur 10 % > 10 km (Kummu 2011) — **ungeprüft** (Abstract per Suche) | PLoS ONE | https://pmc.ncbi.nlm.nih.gov/articles/PMC3110782 |
| Seen | 117 Mio. Seen > 0,002 km², 3,7 % der Landfläche (Verpoorter 2014); Potenzgesetz erst ab 0,46 km², τ = 2,14 (Cael & Seekell 2016) — **ungeprüft** (Suche) | PMC | https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4937396/ |

Bänder mit Quelle: 8 · ungeprüft: 3.

Die Kern-Konstante L = 1,27 km·(A/km²)^0,6 (gelaende-core.js:1606–1608, 1642–1644) ist Hacks Meilen-Formel 1,4·A^0,6, umgerechnet in km. Die Umrechnung ist von mir gerechnet: 1,4·1,609/2,59^0,6 = 1,27. Das Gesetz zitiert die Quelle damit schon.

**Sprossen, die die Szene richtet:**
- karte2.planet.relief.grossform#1, #2, #3
- karte2.planet.relief.formschatz#1, #2
- karte2.planet.relief.wandel#3, #5
- karte2.planet.wasser.eis#4
- karte2.planet.zeit.klimageschichte#1, #2
- karte2.planet.kopplung.land-meer-luft#1, #2, #5
- karte2.planet.kopplung.siedlungslage#3
- karte2.planet.kopplung.gegenwart#1, #3
- karte2.planet.kopplung.kaskade#1

**Heute im Spiel:**
- Flussnetz in drei Ebenen (1 600 · 400 · 100 m), Stream-Power S = ks·A^−θ (θ = 0,45, ks = 6), Trog-Exponent b 1,3 … 2, Trog 0,7 im Hochgebirge: gelaende-core.js:364–370, 386–391.
- Hack: gelaende-core.js:1642.
- Mäander kinematisch: gelaende-core.js:765–784 (laut Kapitel).
- Höhe gestaucht, 0,11 K/m: gelaende-core.js:1300–1320.
- Der höchste Gipfel um die Metropole hat 172,2 m (haushalt.json, gipfel-blick).
- Der Findling liest `ort.eis` des Planeten: stamm/vegetation-baum.js:1433.

**Es fehlt:** ein Gletscher, die Erd-Höhe, der Regenschatten am Kamm (luvLee 1,195) und eine Zeit in Jahren (Reise nur in ganzen Ma).

**ERSTE WELLE:**
- **Chokepoint:** der Regenschatten am Kamm in planet-core `planetKlimaR`. Der Niederschlag im Lee fällt mit der Hebung über den Kamm, Soll gegen das Erd-Band Luv/Lee 3–12:1. Der Bewuchs liest es, grün/braun an der Kammlinie: sichtbare Gestalt.
- **Was stirbt:** ein Klima ohne Kamm.
- **Dateien:** planet-core.js, voxel-worker.js (planetOrtAuftrag). Dazu die geteilte Beleg-Pose der Probe, „28,1 % näher als 8 m“, sonst bleibt das Bild ROT.
- **Kollision:** w28-klima-kontinent beansprucht land-meer-luft#3/#4 in derselben Funktion. Erst nach deren Landung schneiden.
- **Erwartet an der Front:** land-meer-luft#1 sicher (Glied, zählt allein); #2 (Rang ≥ 0,7 über 10 Saaten) offen = **1**.
- **Aufwand:** ~6 h.
- **Bildpaar:** Kammlinie Luv gegen Lee, gleiche Kamera, vorher einheitlich grün, nachher geteilt.

### Szene 3 — Das Colorado-Plateau: Grand Canyon (Grand Canyon Village / Bright Angel Point) und Meteor Crater, heute

| Größe | Wert (Spanne) | Quelle | URL |
|---|---|---|---|
| Wand-Höhe | Rand → Fluss 4 460 ft (1 359 m) Süd, 5 940 ft (1 811 m) Nord | Wikipedia „Geology of the Grand Canyon area“ | https://en.wikipedia.org/wiki/Geology_of_the_Grand_Canyon_area |
| Lagen | ~40 große Sedimentlagen; Supergroup bis 3 700 m | ebd. | ebd. |
| Alter | Vishnu 1,75–1,73 Ga (metamorph); Kaibab ~270 Ma | ebd. | ebd. |
| Kliff-Bank | Redwall-Kalk 120–240 m, Kliffbildner | ebd. | ebd. |
| Rhythmus hart/weich | Kliff: Tapeats, Muav, Redwall, Coconino; Hang: Bright Angel Shale, Hermit, Watahomigi; Kaibab gestufte Klippen | ebd. | ebd. |
| Diskordanz | Great Unconformity = 460 Ma Lücke | ebd. | ebd. |
| Einfacher Krater | Meteor Crater D 1,186 km, Tiefe 170 m, Rand +45 m, ~50 ka, Körper ~50 m → d/D = 0,143 (gerechnet) | Wikipedia „Meteor Crater“ | https://en.wikipedia.org/wiki/Meteor_Crater |
| d/D frischer Krater | ≈ 1:5 (Pike 1977) — **ungeprüft** (nur die refQuelle der Station, k2-planet.js:2220) | — | — |
| Kliff / Ruhewinkel | 60–85° / 33–37° — **ungeprüft** (Kapitel und Kern-Regler, keine äußere Seite gelesen) | — | — |

Bänder mit Quelle: 7 · ungeprüft: 2.

**Sprossen, die die Szene richtet:**
- karte2.planet.zeit.archiv#2, #4, #6
- karte2.planet.relief.formschatz#1
- karte2.planet.relief.boden#1
- karte2.planet.geologie.einschlag#1
- karte2.planet.geologie.gebirge#1 (das Plateau als Kraton: ≤ 20 % verformte Wände)
- karte2.planet.geologie.lagerstaette#1 (drei Genesen in einer Wand)

**Heute im Spiel:**
- Schicht-Gesetz T5, Pediment → Schutthang → Kliff: gelaende-core.js:374–375, `schichtMass` :1041.
- Regler Kliff 74°, Schutt 35°, Schicht 26 m (8–60 m), hart 0,55: gelaende-core.js:393–398.
- Fels und Schutt des Schicht-Gesetzes im Boden-Leser: stamm/gelaende-boden.js:2558.
- `rockPhenotype`: foundry-core.js:5253 (wählt nur die Sorte eines Brockens).
- archiv#1 ist gebucht.

**Es fehlt:** Gestein, Farbe und Alter je Lage; Krater (0 Leser); Verformung. Und eine Wand über 1 km: Die Welt staucht auf 160 m, eine Schicht misst höchstens 60 m gegen 120–240 m Redwall.

**ERSTE WELLE:**
- **Chokepoint:** `schichtMass` gibt jeder Bank ein Milieu: hart = Kalk oder Sandstein (Kliff), weich = Ton oder Schiefer (Hang). Dazu eine Farbe, die der Fels-Leser (gelaende-boden.js:2558) als Band zeichnet, und dieselbe Genese an `rockPhenotype`.
- **Was stirbt:** der einfarbige Fels ohne Lage.
- **Dateien:** gelaende-core.js, stamm/gelaende-boden.js, foundry-core.js (additiv). Dazu die Station für archiv#2, die es nicht gibt: Rhythmus der Bänder hart/weich gegen die Grand-Canyon-Folge.
- **Erwartet an der Front:** archiv#2 = **1**. lagerstaette#1 und formschatz#1 brauchen eine Jury, die nicht steht.
- **Aufwand:** ~10 h.
- **Bildpaar:** Tafelberg-Wand einer Tafelland-Saat (Ort der gebuchten archiv#1), gleiche Kamera: grau gegen gebändert.

## (b) Richter-Urteil

| # | Richter (Ort) | Soll wörtlich | Herkunft | Urteil | Grund |
|---|---|---|---|---|---|
| 1 | relief.grossform#1, g1.js `laeufeUrteil` (:2866) | „im Spiel an 20 Orten nachgefahren: 100 % der Läufe enden in See oder Meer“ | gesetz | bleibt | Das Gesetz hält 293/293. ROT sind drei Bilder mit Ufer-Erlen; die Pose wurde schon einmal geheilt (15 → 17/20, g1.js:2853) |
| 2 | ABNAHME, abnahme-urteil.cjs:38 | `sicht.vordergrund.deckung ≤ 0,25` (dazu `sicht.deckung ≤ 0,02` :37) | erfunden | bleibt | Sie fand echte Kameras im Laub. Aber die Erle am Ufer ist wahre Welt: Der Täter ist die Pose der Probe, nie das Gelände. Ein Erd-Band gibt es für eine Foto-Regel nicht. Sie hält 8 Planet-Sprossen |
| 3 | wasser.gezeiten#1, k2-planet.js:3920 | „Periode ±2 %“, ref 12,42 h | aussen | bleibt | Das Band steht schon (M2). ROT nur, weil das Gesetz fehlt |
| 4 | wasser.kreislauf#2 | „Grube unter dem Spiegel füllt sich bis zu ihm ±0,1 m; Quellen ≥ 90 % an Spiegel-Austritten“ | gesetz | bleibt | Fand einen echten Fehler: `atlasSpiegel` füllt nur den Rand 3×3 |
| 5 | relief.wandel#1, k2-planet.js:3276–3277 | „Abtrag = Ablagerung ±10 %“, „≤ 10 min Spielzeit“ | gesetz | bleibt | Massenerhaltung nach Exner. Die 10 min sind eigene Zahl, aber harmlos. Fand: das Wasser gräbt nicht |
| 6 | wasser.seegang#1, k2-planet.js:3575 | „spiegelTreue ≥ 0,6“, „12 Posen“ | erfunden | band | Die Spiegelung des Wassers ist Fresnel (≈ 2 % senkrecht → 100 % streifend). Das Soll wird Reflexion je Blickwinkel gegen Fresnel. Heute misst die Probe nichts |
| 7 | wasser.stroemung#2, k2-planet.js:4134–4136 | „längs/quer ≥ 1,5“, „Richtung ±20°“, „12 Posen“ | erfunden | bleibt | Die Richtung 0° folgt aus dem Gesetz. Längs/quer ist eigene Zahl, ohne Instrument (kein optischer Fluss): erst das Gerät, dann das Band |
| 8 | kopplung.land-meer-luft#1, k2-zusammenspiel.js:637 | „Niederschlag Luv/Lee ≥ 2:1“ | aussen | band | Die Erde zeigt 3–12:1 (Südalpen, Olympic, Skandinavien). Das Soll ist zahm, das Band aus der Szene ist schärfer |
| 9 | kopplung.siedlungslage#3, k2-zusammenspiel.js:379–381 | „Siedlungen an Furt, Terrasse, Küste ≥ 80 %“; „Städte > 10⁵ ≤ 10 km von Küste oder Strom ≥ 70 %“ | erfunden | band | Kummu 2011: 90 % der Menschen ≤ 10 km vom Süßwasser (ungeprüft). Das 70 % ist so ohne Quelle |
| 10 | zeit.klimageschichte#1 | „+100 a bei +2 °C: Schneegrenze +300 m ±30 %“ | aussen | band | 6,5 K/km × 2 K → 308 m stimmt für die Erde. Die Welt rechnet 0,11 K/m: dort sind es 18 m. Das Band muss ΔT/Γ_Welt lesen, oder die Stauchung fällt |
| 11 | geologie.einschlag#1, k2-planet.js:2220 | „einfache Krater Tiefe/Durchmesser 1:5 ±20 %“ (Pike 1977) | aussen | band | Gilt nur für frische Krater: Der Meteor Crater hat 0,143 und läge außerhalb von 0,16–0,24. Das Band muss das Alter tragen |
| 12 | kopplung.siedlungslage#1, k2-zusammenspiel.js:351 | „100 % der Leser“ (folgen EINEM Spiegel) | gesetz | bleibt | Sage a, tue a. Fand einen echten Fehler: Steg und Boot lesen den Spiegel nicht (48,4 %) |

Kein Richter dieser Gruppe fällt. Die Soll der Planet-Stationen tragen fast überall schon eine Quelle: Pike, Neukum, Monahan, McCowan, Snodgrass, Kelvin, Exner, M2, Garrett, Richardson, Downing/Verpoorter, Jasiewicz.

## (c) Widerspruch — wo die These hier nicht trägt

1. **Es gibt keinen Erd-Samen, den man bereisen kann.** `reise` führt an Breite und Länge des Saat-Planeten, nicht der Erde. Die Zeit geht nur in ganzen Ma. Das Relief am Ort ist nicht der Planet (gegenwart#5). `planet.erde.gestalt` steht auf 0, ohne Station; die offene Frage 1 des Kapitels (Erd-Saat gegen „aus EINEM Samen“) ist nicht entschieden. „An den Ort und in die Zeit gehen“ geht hier heute nicht: Die Szene ist eine **Quelle von Bändern**, kein Ort im Spiel.
2. **Die gestauchte Höhe bricht jedes Erd-Band in Metern der Höhe:** Schneegrenze +300 m, Hypsometrie, Orogen-Profil, Kilometer-Wände, Redwall 120–240 m gegen eine Schicht von höchstens 60 m. Tragfähig bleiben nur dimensionslose Bänder: Hack-Exponent, Bifurkation, d/D, Winkel, Perioden, Verhältnisse. Solange die Welt ihre 160 m für 3 km hält, eicht die Erde nur Exponenten und Takte.
3. **Die Fronten sind nicht wegen falscher Soll ROT, sondern weil das Gesetz fehlt.** 14 Fronten tragen „Umfang nicht erzeugbar“ (Gezeit, Krater, Magnetfeld, Grundwasser, Abtrag, Treibhaus-Drift, Schichtfolge, Rutschung, Bodenart, Stadt > 10⁵, Verkehr, Meeresspiegel-Geschichte, Körper der Saat), 16 haben KEINE STATION. Eine Referenz-Szene baut kein Gesetz. Der Engpass ist der Macher, nicht das Eichen.
4. **Die Linse, die Planet-Sprossen wirklich hält, ist eine Foto-Regel** (die Abnahme mit Vordergrund ≤ 25 %). Für sie gibt die Erde kein Band; sie heilt nur über die Pose der Probe.
5. **Eine einzelne Szene lädt zum Überfitten ein.** Die Leitern verlangen 20, 50 oder 100 Saaten (R4 Breite). Wer den Samen auf das Wallis zieht, verletzt „aus EINEM Samen“ für die übrigen Saaten. Die Erde ist hier überall Referenz (Statistik), nicht ein Ort.
6. **Blindtests und Jury** (formschatz#1, lagerstaette#1, archiv#6/#7, seegang#3/#7) brauchen ein Panel, das nicht steht. Erd-Fotos helfen erst mit einem Urteiler und dürfen nie Asset werden.

## (d) Nicht gelesen

- vision/kapitel/planet.json, vision/blatt/01–06, BRUECKE.md, meisterkarte-2-richter.md.
- k2-planet.js und k2-zusammenspiel.js nur per grep, nicht ganz (7 473 / 9 895 Zeilen); g1.js nur den Abschnitt zu grossform#1.
- planet-core.js `planetKlimaR` und `planetScheibe` nicht im Code gelesen (nur die Akten); voxel-worker.js nicht; stamm/wasser-*.js nur über SKILL und Akten.
- Die Lizenz des swissALTI3D-Vollbestands, AHN (Niederlande) und LINZ (Neuseeland) nicht geprüft.
- Keine Bilder angesehen, keine Messung gefahren.
- Die Seiten zu Wattenmeer-Hub, Kummu, Verpoorter, Svensson und Pike nicht selbst geöffnet: Diese Zahlen sind als ungeprüft markiert.
