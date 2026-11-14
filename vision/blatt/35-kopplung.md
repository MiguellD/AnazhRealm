# Kopplung, Kaskade und Katastrophe

## Die Vision hier

Kein Ding der Welt steht für sich: die Platte hebt das Gebirge, das Gebirge fängt den Regen, der Regen gräbt das Tal, das Tal trägt den Boden, der Boden das Korn, das Korn die Stadt an der Furt, die Stadt ihre Straßen, Zölle, Götter und Lieder — und die Stadt schreibt zurück: sie rodet, staut, versiegelt, heizt, und das Tal versandet. Wer an EINEM Glied dreht, sieht die Folge bis ins letzte, in beide Richtungen. Die Katastrophe ist dieselbe Kette im Zeitraffer: ein Vulkan, der nach dem Gesetz seiner Kammer ausbricht und dessen Asche Ernten, Preise, Wanderungen und Mythen eines Jahrzehnts schreibt; ein Beben, dessen Welle 1 000 km Küste trifft; Stadtbrand, Seuche, Einschlag, Dürre — jede mit der Häufigkeit, die die Erde schrieb (Gutenberg-Richter, VEI, Einschlags-Statistik), nie vom Drehbuch gesetzt. Der Spieler steht mitten in einer Megastadt von zehn Millionen Menschen, deren jede Person flieht, hilft, plündert oder betet, wenn der Berg aufreißt — in Pompeji am 24. August 79, in Lissabon 1755, in London 1666, in Florenz 1348, aus der Erd-Saat nachgewachsen statt nachgebaut — oder auf einem fremden Planeten mit zehnfacher Vulkanrate, Methan-Regen und einer Biosphäre, die eine andere Evolution schrieb. Die Welt danach trägt die Narbe über Jahrhunderte bis Jahrmillionen: verlegte Städte, versalzte Felder, neue Küsten, andere Sprachen, ausgestorbene und neu entstandene Arten. Jenseits der Gegenwart heißt: kein Spiel und kein Erdmodell koppelt heute Geologie, Ökologie und Gesellschaft in EINER Kette, live, auf einem Laptop, aus einem Samen.

## Das Beste der Gegenwart

- **Dwarf Fortress** (Bay 12, Weltgenese): Höhe, Regen, Drainage, Temperatur → Biome → Flüsse aus Erosion → Jahrhunderte Geschichte mit Zivilisationen und Kriegen. Grenze: die Kette läuft nur einmal vor dem Spiel, offline, ASCII; danach formt keine Katastrophe mehr das Relief, die Geschichte liest die Geologie kaum.
- **Cities: Skylines – Natural Disasters** (Paradox 2016): Beben, Tsunami, Tornado, Einschlag, Erdfall; Beben am Wasser löst Tsunami aus, Meteor und Blitz zünden Brände. Grenze: Häufigkeit als Schieberegler, Tsunami als Kulissen-Welle, die Gesellschaft reagiert nur mit Geld und Toten.
- **Minecraft / Valheim / Teardown**: Brand springt von Block zu Block, Zerstörung bleibt; Grenze: Regel-Automaten ohne physikalisches Tempo, keine Fernfolgen.
- **Wildfire-Modelle** (Rothermel 1972, FARSITE, Finney 2002): Feuerfront aus Brennstoff, Wind, Hang, Feuchte. Grenze: rechnet Fläche, nicht Ökologie und Gesellschaft danach.
- **Katastrophen-Modelle der Rückversicherer** (stochastische Kataloge über 10⁴–10⁵ Jahre, Gefahr × Exposition × Verwundbarkeit) und **globale Gefahren-Karten** (GSHAP/GEM für Beben, GVP für Vulkane): die Erde als Saat mit bekannter Antwort. Grenze: Tabellen, kein Bild, kein Rückweg in die Gesellschaft.
- **Agenten-Evakuierung** (Pathfinder, MassMotion; Tokio-Szenarien für M8-Beben): 10⁴–10⁶ Agenten offline, Stunden je Lauf. Grenze: keine Echtzeit, keine Welt drumherum.
- **Die Erde selbst** als Maßstab: ~1 Beben M ≥ 8 und ~15–18 M7 je Jahr, je Magnitude ×10 seltener (b ≈ 0,8–1,1); VEI 6 alle 50–100 Jahre, VEI 7 alle 500–1 000 Jahre; Einschlag 1 km alle ~5·10⁵ Jahre, Tunguska-Größe ~1 je Jahrtausend; verbrannte Fläche 3–4,5 Mio. km² je Jahr (GWIS). Fünf Massenaussterben, Erholung der Vielfalt in 5–10 Mio. Jahren.
- **Geschichte als Kausal-Archiv**: Tambora 1815 → „Jahr ohne Sommer“ 1816 → Hungersnot, Auswanderung; Pest 1347–1351 → 30–50 % Europas tot → Lohnanstieg, Wüstungen; Abholzung Islands → Bodenverlust; Mesopotamien → Bewässerung → Versalzung → Verfall. Das ist die Tiefe, an der die Kaskade gemessen wird — in beiden Richtungen.

## Der Same

**Geteilter Zustand + Häufigkeits-Größen-Gesetz + Rückschreiben.** Jede Domäne liest dieselben wenigen Felder (Höhe, Wasser, Wärme, Stoff, Leben, Menschen-Dichte, Bauten) und schreibt nur über sie; ein Ereignis ist ein Schreib-Akt auf diese Felder, gezogen aus einer Potenzgesetz-Verteilung (N(≥M) = 10^(a − bM)), deren Parameter selbst Funktionen des Orts sind (Plattengrenze → Beben-Rate, Kammer → VEI, Brennstoff × Trockenheit → Brand, Dichte × Kontakt → Seuche). Menschen-Tat ist kein Sonderfall, sondern derselbe Schreib-Akt (Rodung senkt Leben, Damm hebt Wasser). Die Kaskade entsteht dann von selbst, weil jeder Leser den veränderten Zustand liest — keine Folge, keine Gefahr-Klasse und kein historisches Ereignis wird einzeln gebaut. Der Prüfstein des Samens: eine Gefahr, die nie als Klasse geschrieben wurde (Methan-Brand auf einem Titan-Planeten, Gletscher-Lauf unter einem Vulkan), muss aus den Feldern entstehen. Vorbilder: Katastrophen-Modellierung der Versicherer, Kompartiment-Modelle (SIR) auf Kontakt-Netzen der Epidemiologie, selbstorganisierte Kritikalität (Bak 1987: Sandhaufen und Waldbrand-Automat liefern Potenzgesetze ohne gesetzte Rate). Im Spiel steht der Keim: das lebendige Feld liest/schreibt, der Brand nach Rothermel schreibt Asche, die Asche düngt, der Pegel liest Regen und Dürre der Welt-Uhr.

**Preis-Kürzel.** „Preis voll“ = p95 ≤ 33 ms auf dem Profi-Band (Radeon 890M + GTX 1060) während des gemessenen Geschehens · Ankunft ≤ 5 s kalt, auch direkt am Ereignis · null Download über das Skript hinaus · die Narbe kostet Speicher ∝ Änderung, nie ∝ Weltgröße. Zeitraffer-Budgets stehen zusätzlich in der Sprosse. Ohne „Preis voll“ gilt keine Sprosse.

## Die Leitern

### L1 Die gewachsene Kohärenz — wie viele Glieder Platte → Relief → Klima → Wasser → Boden → Biom → Siedlung → Wirtschaft → Verkehr → Kultur in einer UNGESTÖRTEN Saat erkennbar auseinander folgen

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | 2 Glieder, ein Ort | Wasser folgt dem Relief | Preis voll | 100 Saaten, je 50 Punkte: Anteil Wasserläufe, die sichtbar bergab in eine Senke oder ins Meer laufen ≥ 95 % | HEUTE (Stream-Power-Flüsse; Stichprobe ungemessen) |
| 2 | 4 Glieder, 10 km² | Relief → Wasser → Feuchte → Pflanze | Preis voll | 100 Saaten: Pflanzen-Dichte im Bild gegen Abstand zum Wasser monoton fallend in ≥ 80 % | HEUTE (lokal, Bildpaar fehlt) |
| 3 | 6 Glieder, 10³ km² | Regenschatten hinter Gebirgen, Städte an Furt/Mündung/Pass | Preis voll | 100 Saaten: Anteil Städte an Fluss/Küste/Pass ≥ 70 % (Erde ~80 %); Niederschlag Luv/Lee ≥ 2:1 | |
| 4 | 8 Glieder, 10⁵ km², 10³ Städte | Handelswege über Pässe und Flüsse, Märkte an Knoten, Megastädte an Delta-Knoten | Preis voll | 100 Saaten: Straßennetz-Umweg ≤ 1,2 × günstigster Gelände-Pfad; Stadtgrößen Zipf-Steigung 0,8–1,2 bis zur Größe 10⁷ | |
| 5 | 10 Glieder, Kontinent | Lehm im Trockenen, Holz im Wald, Stein im Gebirge, Speise und Glaube aus Ort | Preis voll | Blind-Test: Spieler ordnen 20 Stadtbilder ihrem Biom zu, Treffer ≥ 70 % | |
| 6 | 10 Glieder ab der Platte, Planet 5·10⁸ km², 10⁹ Bewohner | Gebirge an Plattengrenzen, Wüsten an 30°-Gürteln, Kulturräume an Barrieren | Preis voll, Orbit bis Straße ohne Ladebild | 100 Planeten-Saaten: Anteil, die ein Geograf blind von echten Erdkarten-Ausschnitten nicht trennt ≥ 50 % (Turing-Test der Karte) | |
| 7 | fremde Physik (g, Achse, Stern, Chemie), 10³ Planeten-Typen | die Kette hält, wo die Erde keine Referenz hat | Preis voll | 1 000 Fremd-Saaten: Anteil Siedlungen, deren Ort der Spieler eine sichtbare Ursache (Wasser, Pass, Stoff, Schutz) zuordnen kann ≥ 90 % | |

### L2 Der Katalog der Gewalt — wie viel Gefahr die Welt von SELBST trägt, mit der Häufigkeit und dem Ort, die die Erde schrieb

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 0 | Gefahr nur als Spieler-Tat (Brennglas, `lava`-Satz) | — | Preis voll | Ereignisse ohne Spieler-Zutun über 100 Spieljahre = 0 | HEUTE (unter der Leiter) |
| 1 | 1 Klasse von selbst, 1 km², 100 a | Blitz-Brand aus Trockenheit × Gewitter des EINEN Wetters | Preis voll | 100 Spieljahre Zeitraffer: Brände je km² und Jahr im Faktor 3 der Real-Rate des Bioms | |
| 2 | 3 Klassen (Brand, Hochwasser, Dürre), 10³ km², 10³ a | Rate aus dem Klima des Orts; Hochwasser verlässt das Bett | Preis voll | Häufigkeits-Kurve je Klasse gegen Messreihe (GWIS, Pegel-Jährlichkeit HQ100), Steigung im Faktor 1,5 | |
| 3 | 6 Klassen (+ Beben, Ausbruch, Hangrutsch), Kontinent, 10⁴ a | b 0,8–1,2; VEI-Raten; Hangrutsch nach Neigung × Nässe | Preis voll | 8 Saaten × 10⁴ simulierte Jahre: b-Wert und VEI-Raten im Real-Band | |
| 4 | Auslöser-Ketten (Beben → Tsunami, Dürre → Brand, Ausbruch → Gletscher-Lauf) | jede Folge-Gefahr hat ein Auslöse-Ereignis IN der Welt | Preis voll | Anteil Tsunamis mit Auslöser in der Welt = 100 %; Rate je Küstenkilometer im Faktor 3 | |
| 5 | Erd-Saat, Planet, 10⁶ a | die Gefahr-KARTE stimmt, nicht nur die Rate | Preis voll, Zeitraffer 10⁶ a ≤ 60 s | Erd-Saat: Korrelation simulierte Beben-Rate je 1°-Zelle ↔ GEM-Gefahrenkarte r ≥ 0,7; Vulkan-Orte ↔ GVP-Liste r ≥ 0,7; Einschlag N(>D) ∝ D^−2,7 im Krater-Archiv | |
| 6 | Fremd-Planeten, 10⁹ a | Gefahren, die nie als Klasse geschrieben wurden (Io-Vulkanismus, Venus-Resurfacing, Methan-Sturm), entstehen aus Wärmefluss, Masse, Atmosphäre | Preis voll | 100 Fremd-Planeten: Anteil, deren Gefahr-Bild ein Planetologe blind als physikalisch plausibel einstuft ≥ 80 %; ≥ 1 Gefahr je 10 Planeten, die auf der Erde keinen Namen hat | |

### L3 Die Antwort auf die Störung — wie viele Domänen ein Eingriff (Ereignis, Tat, Wurzel-Mutation) sichtbar ändert und wie lange

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | 1 Domäne, Stunden | Brand schwärzt die Zelle | Preis voll | Bildpaar: Zelle vor/nach dem Brand | HEUTE |
| 2 | 3 Domänen (Boden, Pflanze, Licht), 1 Jahr | Asche düngt, Sukzession Gras → Busch → Wald | Preis voll | Zeitsprung 1 Spieljahr: Nachwuchs auf Asche gezeichnet, r(Tempo, Feuchte × Licht) ≥ 0,5 | HEUTE (r = 0,825, alte Karte Stoffe K5) |
| 3 | 5 Domänen (+ Tier, Wasser), 10 Jahre | Tiere fliehen und kehren zurück, Abfluss steigt auf Brandfläche | Preis voll | Nach Brand: Tierdichte −50 % sofort, Rückkehr in 3–10 Spieljahren; Hochwasser-Spitze am Pegel ≥ 1,3× | |
| 4 | 7 Domänen (+ Siedlung, Wirtschaft), 100 Jahre, 10⁵ Bewohner | Ernteausfall → Preise → Abwanderung | Preis voll, Zeitraffer | Ausbruch VEI 5 nahe Stadt: Bevölkerung −20 % binnen 5 a, Kornpreis ×2; Wiederaufbau im Bildpaar nach 50 a | |
| 5 | 9 Domänen (+ Verkehr, Macht), 10³ Jahre, 10⁷ Bewohner | Hafen versandet → Handelsweg wandert → Stadt verfällt, andere wächst | Preis voll, Zeitraffer | Tsunami-Saat: Anteil zerstörter Häfen, die verlegt neu entstehen ≥ 50 %; Straßennetz-Diff vorher/nachher | |
| 6 | 10 Domänen (+ Kultur), 10⁴ Jahre | bebensichere Bauweise, Flutmythen, Gedenken entstehen, wo die Gefahr wohnt | Preis voll | 100 Saaten: Korrelation Gefahr-Rate des Orts ↔ Anteil gefahrangepasster Bauten im Bild ≥ 0,6 | |
| 7 | Mutation an der WURZEL, 10⁶–10⁸ Jahre, Planet | Platte gekippt → andere Küste, Städte, Sprachen; Einschlag 10 km → Aussterben → Radiation neuer Arten | Zeitraffer 10⁶ a ≤ 60 s, danach Preis voll | Wurzel-Mutation: 10/10 Glieder am selben Ort sichtbar geändert (Bildpaar Weltkarte); Einschlag: Arten-Verlust 50–80 %, Vielfalt erholt in 5–10 Mio. a (Fossil-Kurve der Erde) | |

### L4 Mitten im Ereignis — die größte Katastrophe und die meisten Menschen, die der Spieler LIVE erlebt

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | eine 16-m-Zelle, 0 Menschen | Glut, Lava erstarrt zu Stein | Preis voll | Bild der Zelle in Glut und erstarrt | HEUTE |
| 2 | 1 ha, 10 Menschen | Feuerfront mit Wind und Hang; Bewohner weichen | Preis voll während der Front | Frame p95 während 1 ha brennt; Anteil Bewohner, die die Front meiden, = 100 % | ungemessen (Front steht, p95 und Flucht nie gemessen) |
| 3 | 1 km², 10³ Menschen | Wald- oder Lavafeld mit Rauch, Glut, Fluss; Dorf flieht | Preis voll | Bildvergleich gegen Foto (Brandfront, Pahoehoe); Fluchtwege folgen dem Gelände | |
| 4 | 100 km², 10⁵ Menschen | Stadtbrand über 10⁴ Gebäude, pyroklastischer Strom; Panik, Helfer, Stau | Preis voll | Blind-Urteil gegen historische Bilder (London 1666, Pompeji-Rekonstruktion) ≥ „glaubhaft“ bei 70 %; Räumungszeit im Faktor 2 gegen Evakuierungs-Modell | |
| 5 | 10⁴ km², 10⁷ Menschen (Megastadt jenseits Tokios) | Tsunami über 1 000 km Küste, Beben M8 unter der Stadt | Preis voll, Ankunft ≤ 5 s am Ereignis | Wellen-Ankunftszeit an 10 Küstenorten ±10 % gegen √(g·h); jede sichtbare Person handelt (keine Statisten-Schleife im Blickfeld, Stichprobe 100 Personen) | |
| 6 | 10⁶ km², 10⁸ Menschen | Supervulkan (VEI 8), Kontinent unter Asche, Wanderung | Preis voll | Aschedicke gegen Distanz im Faktor 2 der Toba/Yellowstone-Rekonstruktion; Himmel-Bild über 3 Jahre | |
| 7 | Planet, 10⁹–10¹⁰ Menschen | Einschlag 10 km: Feuerball, globaler Brand, Impakt-Winter, aus jeder Perspektive (Orbit bis Straße) | Preis voll in jeder Perspektive | Flug vom Krater bis zur Antipode ohne Ladebild; Bildvergleich gegen Chicxulub-Modellierung | |

### L5 Brand — Wald, Steppe und Stadt nach Physik

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | Brand springt Zelle zu Zelle | Automat ohne Tempo | Preis voll | Front läuft | überholt |
| 2 | Vegetation, ha | Tempo aus Stoff, Wind, Hang, Feuchte; hält an Fluss, Fels, nassem Gras | Preis voll | Front-Tempo mit Wind 0,5–2 m/s; Halt an Fluss/Fels in 100 % der Proben | HEUTE |
| 3 | km², Kronenfeuer + Funkenflug | Übergang Boden → Krone, Spotting bis 1 km | Preis voll | Anteil Fronten, die einen 20-m-Fluss überspringen, im Real-Band (Sturm ja, Windstille nein) | |
| 4 | Stadtviertel, 10³ Gebäude | Holz/Stroh brennt, Stein hält; Brandgassen stoppen | Preis voll | Holzstadt vs. Steinstadt gleicher Saat: verbrannter Anteil ≥ 5:1; Bildpaar | |
| 5 | Megastadt, 10⁶ Gebäude, Feuersturm | Feuersturm zieht eigenen Wind (Hamburg 1943, Tokio 1923) | Preis voll | Wind am Brandrand ≥ 2× Umgebung; Fläche/Zeit gegen London 1666 (≈ 1,8 km² in 4 Tagen) Faktor 2 | |
| 6 | Kontinent, Brandsaison | 3–4,5 Mio. km²/a global aus Klima | Preis voll, Zeitraffer | Erd-Saat: verbrannte Fläche je Jahr und Biom im Faktor 1,5 gegen GWIS-Karte | |
| 7 | jede Epoche, jeder Planet | Feuer bei O₂ 15–35 % (Karbon), fremde Atmosphären und Brennstoffe | Preis voll | Saat mit O₂ 30 %: Brandfläche ≥ 3× der heutigen; Kohleschichten im Archiv | |

### L6 Geologische Gewalt schreibt Relief — Ausbruch, Beben, Rutsch hinterlassen bleibende Form (Schnittstelle zum Blatt Planet und Geologie: hier nur das Ereignis)

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | eine Zelle Lava, bleibt Stein | Erstarren nach Newton, am Wasser zehnmal schneller | Preis voll | Bild der Zelle nach 1 Spieltag: Stein, betretbar | HEUTE |
| 2 | Lavastrom 1 km, fließt bergab | Zähigkeit aus Temperatur, Fluss folgt dem Gefälle, staut Täler | Preis voll | Strom endet in der Senke in 100 % der Proben; Länge gegen Kilauea-Ströme Faktor 2 | |
| 3 | Vulkan 10 km, baut sich über Ausbrüche auf | Schild vs. Schicht aus Magma-Chemie | Preis voll | Kegel-Profil gegen Mauna Loa / Fuji (Neigung ±20 %); Bildvergleich | |
| 4 | Beben verwirft und rutscht, 100 km | Bruch an Störung, Versatz, Hangrutsch, Schaden nach Bauweise | Preis voll | Nach M7: Versatz 1–5 m entlang der Störung sichtbar; Rutsch-Anteil monoton mit Hangneigung | |
| 5 | Region 10⁴ km² über 10⁴ Jahre | Caldera, Lavaplateau, neue Inseln, Küstenhebung | Zeitraffer ≤ 60 s, danach Preis voll | Bildpaar Region vor/nach 10⁴ a; neues Land nur, wo Vulkane oder Hebung stehen | |
| 6 | Planet über 10⁸ Jahre | Wilson-Zyklus, Hotspot-Ketten | Zeitraffer 10⁷ a ≤ 60 s | Hotspot-Kette: Inselalter linear mit Abstand (r ≥ 0,9); Weltkarten-Folge gegen Paläogeografie | |

### L7 Seuche und Menschen-Kaskade — Ansteckung durch Millionen, Folgen durch Gesellschaft

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 0 | keine Krankheit | — | — | im Spiel erkrankt kein Bewohner | HEUTE (unter der Leiter) |
| 1 | ein Dorf, 10² Bewohner | Ansteckung auf Kontakten des Tagesplans | Preis voll | Epidemie-Kurve: Gipfel und Endgröße im Faktor 1,5 der SIR-Lösung mit gleichem R₀ | |
| 2 | eine Stadt, 10⁴ | Ansteckung folgt Markt, Brunnen, Dichte | Preis voll | Snow-Test (London 1854): Fälle häufen sich um die verseuchte Quelle, ≥ 3× | |
| 3 | Region 10⁶, Handelswege tragen | Ausbreitung entlang Straßen und Häfen | Preis voll, Zeitraffer | Front-Tempo gegen Pest 1347–1351 (≈ 1–5 km/Tag entlang Wegen) Faktor 2 | |
| 4 | Kontinent 10⁸ | Sterblichkeit 30–50 %, Arbeitsmangel, Löhne, Wüstungen | Preis voll, Zeitraffer | Nach Pest-Saat: Wüstungen ≥ 10 %, Lohn-Index ×1,5 binnen 50 a; Bildpaar Dorf vorher/nachher | |
| 5 | Planet 10⁹–10¹⁰, Epochen, auch Tier- und Pflanzen-Seuchen | Erreger evolvieren, Immunität, Städtebau antwortet (Kanalisation) | Preis voll, Zeitraffer | 100 Saaten: Korrelation Stadtdichte ↔ Seuchenrate ≥ 0,5; nach Kanalisation Rate −50 % | |

### L8 Der Mensch schreibt zurück — wie weit Siedlung, Landbau und Technik die Natur verändern, die sie trägt (NEU)

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 0 | Natur nur als Verbot und Kosten (Haus nicht im Wasser, Weg meidet Nässe) | — | Preis voll | Bildpaar 100 Spieljahre neben einer Stadt: Natur unverändert | HEUTE |
| 1 | ein Dorf, Rodung, 10 km² | Wald weicht Feld; Wild zieht ab | Preis voll | Waldanteil im Umkreis 5 km fällt mit Bevölkerung (r ≥ 0,6), Bildpaar 100 a | |
| 2 | eine Stadt, Fluss und Boden | Rodung → Erosion → Versandung; Damm → Stausee; Bewässerung → Versalzung | Preis voll, Zeitraffer | Sediment im Hafen nach Rodung ≥ 2× der Wald-Saat; versalzte Felder im Bild nach 500 a Bewässerung im Trockenen | |
| 3 | Megastadt 10⁷, Region | Wärmeinsel, versiegelte Flächen → Sturzflut, abgepumptes Tiefenwasser → Senkung (Tokio, Jakarta) | Preis voll | Stadt-Mitte nachts ≥ 3 K wärmer als Umland; Hochwasser-Spitze ≥ 1,5× nach Versiegelung; Senkung cm/a im Faktor 3 von Jakarta | |
| 4 | Kontinent, Epochen | Landbau formt Biome (Steppe aus Wald, Wüstung zu Wald), Ausrottung der Großtiere | Preis voll, Zeitraffer | Erd-Saat 10⁴ a: Waldanteil Europas folgt der Rekonstruktion (Holozän) im Faktor 1,5 | |
| 5 | Planet, Industrie-Epoche | Treibhausgase → Klima → Meeresspiegel → Küstenstädte | Zeitraffer 10³ a ≤ 60 s, danach Preis voll | Saat mit Industrie: Erwärmung je Verdopplung CO₂ 2–5 K; Küstenlinien-Diff im Bildpaar | |
| 6 | Fremd-Zivilisation | Terraforming, Atmosphären-Umbau, Selbstvernichtung oder Gleichgewicht | Preis voll | 100 Fremd-Saaten mit Zivilisation: Anteil, deren Planet sich messbar vom Zustand ohne sie unterscheidet ≥ 80 % (Bildpaar Orbit) | |

### L9 Die Erde als Saat — wie viele Ereignisse der echten Geschichte aus Gesetzen nachwachsen, nicht nachgebaut werden (NEU; die Zeitreise in die Katastrophe)

| Sprosse | Umfang | Tiefe | Preis | Richter (Zahl oder Bildvergleich im echten Spiel — misst das Ergebnis) | Stand |
|---|---|---|---|---|---|
| 1 | 1 Ort, 1 Ereignis-Typ | der Ort der Erd-Saat trägt die echte Gefahr (Vesuv steht am Golf) | Preis voll, Ankunft ≤ 5 s am Ort | Bildvergleich Ort gegen Foto/Relief-Modell; der Vulkan bricht von selbst aus | |
| 2 | 10 Orte, Epoche wählbar | Ausbruch, Beben, Brand am Ort mit Rate im Real-Band | Preis voll | Für 10 Erd-Orte: simulierte Wiederkehr im Faktor 3 der historischen | |
| 3 | Pompeji 79, Lissabon 1755, London 1666 | Ablauf aus Gesetzen: Säulen-Phase → pyroklastischer Strom; Beben → Brand → Tsunami | Preis voll, 10⁴ Menschen live | Zeitachse des Ablaufs gegen Quellen (Plinius; Augenzeugen 1755) im Faktor 2 je Phase; Blind-Bildvergleich gegen Rekonstruktion | |
| 4 | 100 Ereignisse über 5 000 Jahre | Fernfolgen (Tambora → 1816, Pest → Löhne) entstehen in der Erd-Saat ohne Skript | Preis voll, Zeitraffer | Anteil der 100, deren dokumentierte Fernfolge in der Saat messbar eintritt ≥ 50 % | |
| 5 | Erdgeschichte 4,5·10⁹ a | Schneeball-Erde, Massenaussterben, Deccan-Trapps reisbar | Zeitraffer, danach Preis voll | Für die fünf großen Aussterben: Zeitpunkt aus der Saat-Mechanik im Faktor 2, Arten-Verlust im Faktor 1,5 | |

## Stand heute

- **Brand (der stärkste Teil):** Rothermel 1972 + Albini + Anderson-Ellipse, Wind, Hang, Bettfeuchte aus Boden und der EINEN Nässe der Welt, Front als kürzeste Laufzeit — `stamm/feld-leben.js:2477–2620` (Kopf 2477, `_brandStoff` 2497, `_brandZuenden` 2619). Asche als Tat: `AnazhRealm.TAT_NARBE` ab `stamm/feld-leben.js:3738`; Sukzession gemessen (r = 0,825). Nur Vegetation brennt, kein Haus, keine Stadt. Gezündet wird durch Spieler und durch die Sonne hinter einer Linse, die in der Welt liegt (`stamm/koerper-fahrt.js:2247`, „Die Sonne entzündete …“ auch fern vom Spieler) — die Linse legt aber der Spieler; kein Blitz (Grep `blitz` in `stamm/` leer).
- **Lava:** Spieler-Tat auf der 16-m-Zelle, Erstarren nach Newton-Gang aus der Stoff-Tafel, am Wasser zehnmal schneller und unter Dampf (`gelaende-core.js:1787–1801`), bleibt Stein. Kein Vulkan, kein Fließen, kein Relief-Aufbau.
- **Relief:** Großform aus Kontinentalität und Erosionsfeld, Flüsse nach Stream-Power (`gelaende-core.js`). Keine Platten, keine Ursache der Hebung.
- **Wasser liest Wetter (berichtigt):** der Pegel von See und Fluss ist eine Funktion der Welt-Uhr aus Schmelze, Regen (Nash-Kaskade) und DÜRRE — der Bach fällt, wenn es nicht regnet, das Frühjahr hebt ihn bordvoll (`gelaende-core.js:1540–1562`, `stamm/wasser-hydro.js:74–78`, Takt `stamm/dirigent-takt.js:1697`). Dürre ist also als Zustand da, nicht als Ereignis mit Folge; Hochwasser endet an der Krone des Betts („darüber trägt die Aue den Überschuss, nicht gerechnet“).
- **Siedlung liest Natur als Verbot und als Kosten (berichtigt):** `ortImWasser` (`fachwerk-core.js:8623`) verwirft Orte im Wasser; das Wegenetz macht nasse Schritte 20-mal teurer (`WEG_ZWISCHEN.furt`, `fachwerk-core.js:3861/3969`) — der Weg geht um den Bach. Kein Standort AUS Furt, Mündung, Pass, Fruchtbarkeit; keine Rückwirkung der Siedlung auf die Natur (L8 = 0).
- **Kopplung im Feld:** EIN Wasser-Spiegel für Körper, Tier, Pflanze, Klang (`gate:kopplung F1`); Ökologie-Kaskade 10/10.
- **Nichts** für Beben, Tsunami, Einschlag, Seuche, Stadtbrand: die Treffer des Greps über `stamm/` und `*-core.js` sind Wortspiele („Hochwasser“ eines Puffers in `siedlung-bauten.js`, „vulkan“ als Wort für `glut` in `feld-sprache.js:635`).
- **Fazit:** L1 bei 2 von 7, L2 unter der Leiter, L3 bei 2 von 7, L4 bei 1 (Sprosse 2 ungemessen), L5 bei 2 von 7, L6 bei 1 von 6, L7 unter der Leiter, L8 unter der Leiter, L9 bei 0. In Größenordnungen: die Kette ist lokal (10 km²) und kurz (4 Glieder), die Vision planetar (5·10⁸ km²) und über 10 Glieder in beide Richtungen.

## Abhängigkeiten

- **Planet und Geologie** (Platten, Kammer, Störungen) trägt L6 und L2 ab 3; **Tiefe Zeit** liefert den Zeitraffer (L3-7, L6-5+, L9-5).
- **Atmosphäre, Wetter und Klima** liefert Blitz, Dürre, Regenschatten (L1-3, L2-1/2, L8-5); **Ozean, Wasser und Eis** die Flachwasser-Welle (L4-5), Sturmflut, Hochwasser über die Aue.
- **Siedlung und Stadt**, **Architektur** (Brennstoff der Häuser, Bauweise) für L5-4+, L3-4+, L8; **Millionen: Bevölkerung** und **Der Mensch: Geist, Alltag** (Kontakt-Netz, Flucht) für L4 und L7.
- **Arbeit, Technik und Handel**, **Netze, Verkehr**, **Macht, Recht und Konflikt** sind Leser der Folge (L1-4, L3-4/5) und Schreiber in L8; **Kultur, Sprache, Glaube** in L1-5, L3-6.
- **Spur, Verfall und Gedächtnis der Welt** hält die Narbe (Speicher ∝ Änderung); **Evolution und fremdes Leben** für L3-7, L9-5; **Menschenzeit: Epochen** für L9.
- **Der Same: Architektur der Entfaltung** muss den geteilten Zustand bis in Planeten-Maßstab tragen — sonst bleibt jede Kopplung lokal.

## Was die alte Karte hier misst

- **Stoffe K2 Brand-Front** → L5 Sprosse 2. **Stoffe K5 Sukzession 2/2** → L3 Sprosse 2. **Stoffe K1 EINE Stoff-Tafel** → Voraussetzung für L5-4.
- **Gelände K4 EIN Wasser-Spiegel 2/2** → L1 Sprosse 1–2. **Ökologie Kaskade 10/10** → L3 Sprosse 3 (Tier-Domäne).
- **Wetter K1/K3** (Wetter als Funktion, Pegel aus Regen und Dürre) → Bedingung für L2-1/2.
- **Siedlung (24) „die Siedlung, die Boden, Wasser und Epoche verlangen“** → L1 Sprosse 3. **H2 Hitze und Brand als Overlay-Achsen** → der Same im Feld.

## Zweifel

- Ein b-Wert über 10⁴ Jahre (L2-3) ist halb Mechanik, halb Erlebnis; ob ein Spieler ihn je sieht, ist offen. Die Gefahr-Karte gegen die Erde (L2-5) ist der ehrlichere Richter, verlangt aber eine Erd-Saat, die heute nicht existiert.
- L4-2 stand als HEUTE; p95 bei brennendem Hektar wurde nie gemessen — jetzt „ungemessen“, bis das Profi-Band es fährt.
- Kultur-Glieder (L1-5, L3-6) tragen nur Blind-Tests und Korrelationen; ob „Kultur folgt der Gefahr“ fair messbar ist, bleibt Kandidat für eine offene Frage nach R6.
- L9 (Erd-Saat) setzt voraus, dass der Same die echte Erde als einen Punkt seines Raums treffen kann — das ist eine Forschungsfrage, keine Bau-Aufgabe; scheitert sie, bleibt L9 an Sprosse 1–2 eine Stil-Treue, keine Kausal-Treue.
- Seuche (L7) und Massensterben in einer Welt mit Millionen Bewohnern verlangen eine Rahmung, die der Schöpfer setzt, nicht dieses Blatt.
- Raten aus Sekundärquellen; Faktor-2/3-Bänder bewusst grob.

## Gegenlese — was sich änderte und was strittig bleibt

- **Gehoben:** L4 misst jetzt Menschen live mit (bis 10⁹–10¹⁰, die Megastadt 10⁷ „jenseits Tokios“ in Sprosse 5); L5-5 von 10⁵ auf 10⁶ Gebäude; L1-4/6 mit Zipf bis 10⁷ und einem Turing-Test der Karte statt „Geograf findet plausibel ≥ 80 %“.
- **Fleiß → Fähigkeit:** L2 zählte Klassen (3 → 6 → 10 → 15) wie eine Liste; die oberen Sprossen messen jetzt die Gefahr-KARTE der Erd-Saat gegen GEM/GVP und das Entstehen namenloser Gefahren auf Fremd-Planeten — der Same muss erzeugen, was nie als Klasse geschrieben wurde.
- **Dieselbe Leiter:** L1-7 (Wurzel-Mutation) und L3 maßen dasselbe — Antwort auf Störung. L1 misst jetzt nur die ungestörte Kohärenz, L3 jede Störung bis zur Wurzel.
- **Lücken gefüllt:** L8 „Der Mensch schreibt zurück“ (die Kette lief nur Natur → Mensch) und L9 „Die Erde als Saat“ (der Schöpfer will in Pompeji 79 stehen — das braucht einen Richter gegen die echte Geschichte).
- **Preis:** „Preis voll“ (33 ms + Ankunft ≤ 5 s + null Download + Narbe ∝ Änderung) steht jetzt in jeder Sprosse; vorher trug fast jede nur „33 ms“.
- **Stand berichtigt:** Dürre und bordvoller Pegel existieren als Zustand der Welt-Uhr (`gelaende-core.js:1540`); das Wegenetz liest Wasser als Kosten (`fachwerk-core.js:3861`); die Sonne zündet hinter einer liegenden Linse auch fern vom Spieler; Zeilennummern des Brands verschoben (2477/2497/3738 statt 2482/2505/3742); L4-2 von HEUTE auf ungemessen.
- **Strittig:** ob L6 hierher oder ganz ins Geologie-Blatt gehört; ob L9 mehr als Stil-Treue leisten kann; ob „jede sichtbare Person handelt“ (L4-5) ohne Stichproben-Protokoll ein fairer Richter ist.
