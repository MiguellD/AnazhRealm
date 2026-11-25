# Zensus Referenz-Szenen — Gruppe rom (Mensch: Stadt, Bau, Macht, Sport, Kultur, Kopplung)

Nur gelesen. Stand: main 6c210411 (V18.546.411), punkte-maschine (front-tafel 25.11. 06:17, karte-2-stand 105 von 1 718).

## 0. Die Front meiner Leitern heute (42 Leitern, 283 Sprossen, vision/meisterkarte-2.json)

Die Karte (json) führt in meinen Familien 41 Leitern plus `leben.tiere.mensch`. Das Kapitel `mensch.md` nennt sieben weitere
(`sport.geraet`, `bau.tragwerk`, `bau.gebrauch`, `kopplung.ort/nutzung/geschichte/kette/epoche`). Sie stehen nicht in der json und
nicht auf der Front-Tafel: zusammengelegt.

Gebucht an der Front (laut Front-Tafel, die nächste Sprosse steht dort): sport.regeln 1 · sport.koennen 1 · sport.mannschaft 1 ·
sport.arena 1 · sport.geistspiel 1 · stadt.vertikal 1 · stadt.siedlungsnetz 1 · bau.innen 1 · macht.grenze 1 · macht.wehrbau 3 ·
kultur.schrift 1 · kultur.bildkunst 1 · kopplung.leben 1 · kopplung.antwort 1 · leben.tiere.mensch 1 = **17 Sprossen**.

Was die Fronten hält:
- **„fehlender Leser" (das Spiel trägt den Akt nicht), etwa 20 Fronten.** sport.regeln#2, mannschaft#2, arena#2, geistspiel#2,
  kunst#1, medium#1, macht.recht#1, krieg#1, megastadt#1, grenze#2, kultur.wissen#1, erzaehlkunst#1, glaube#1, sprache#1,
  kopplung.sport#1–#4, kreislauf#1, leben#2, antwort#2. Der gemeinsame Täter von mindestens zehn davon ist der Tag der Bewohner
  (koerper-core.js `tagesPlan` :5729, `TAGES_GESETZ`; stamm/siedlung-bewohner.js `_spielTag` :2514): kein Spiel-Akt, keine Wache,
  kein Kultgang, kein Lokal, kein Jubel.
- **„Umfang nicht erzeugbar":** vertikal#2 (23 statt 30 Geschosse), siedlungsnetz#2, wehrbau#4, schrift#2 (32 statt 500 Grabsteine),
  gestalt#1 (4 statt 10 Kulturen), diffusion#1, bildkunst#2, strassenleben#1 (1 Gasthaus statt 3 Lokale), habitat#1.
- **KEINE STATION (Auge oder Panel):** stadt.groesse#1, stadt.breite#1, stadt.messlatte#1, bau.bedarf#1, bau.huelle#1, macht.stand#1,
  kultur.verstaendigung#1. Sie warten auf das Panel R11.
- **Grün, aber der Preis ist nicht grün:** stadt.form#1 (Straßenwand 5,6:1, R² 0,960), sport.koerper#1 (Tempo und Sprung im Band).
- **bau.bauen#1:** Labor ↔ Welt 98,0 % → 17,3 % (w28-fachwerk-buehne), Soll ≤ 2,1 %.

## 1. Kann das Spiel heute an diesen Ort und in diese Zeit?

- **Einen Erd-Samen (die wirkliche Erde mit Rom auf 41,9° N) gibt es nicht.** Der Planet ist prozedural: planet-core.js:264
  `PLANET_ERDE` trägt nur Parameter, und die Welt hat EINEN Anker (stamm/gelaende-chunks.js:680 `_planetAnker`; die Front-Tafel
  nennt −45,48° N). Weder Copernicus noch SRTM noch eine historische Schicht stehen in den Kernen (Grep 0).
- **Die Epoche Antike gibt es.** fachwerk-core.js:4372
  `antike: {region:'antik', jahr:80, spanne:70, groesse:'markt', technik:['kalkmoertel','eisen']}` — das Jahr 80 ist das Jahr, in dem
  das Kolosseum eröffnet wurde. Dazu kommen die Hausstile `roemisch`/`griechisch` (:4364), die Domus mit 13 × 10 m und 1 Geschoss
  (:2716), das Hofhaus `hofhaus_pastas` (:2770, :2802), der Raster-Plan (:6398), der Steinring als Mauer (:6499) und die Ortsnamen
  Aqua/Castra/Colonia/Via (:4515).
- **Der Satz „dorf 7 300 antike" geht heute** (stamm/feld-leben.js:1027, die Epoche beim Namen). Er gründet eine antike Marktstadt
  beim Spieler. Der Satz „dorf 7 300 jahr 80" landet NICHT in der Antike: `epocheImJahr` (fachwerk-core.js:5060) lässt nur Regionen
  mit mehr als einer Epoche zu, und `antik` hat nur eine.
- **Arena:** Der Genesis-Ort hat eine Fläche `arena: {r:260, k:9, ex:24.5, ez:21, belag:"weg"}` (fachwerk-core.js:14101), also
  49 × 42 m Weg. Der Kommentar dazu (:14099) lautet: „die Arena bleibt Fläche, bis ein Gesetzbuch ihren Hof trägt". Am Genesis-Ort
  wohnt niemand. Die Stadt hat keine Sportstätte: `zusammenspiel` meldet 0 Sportstätten unter 200 Plänen.
- **Spiel und Zuschauer:** koerper-core.js:5795 `SPIEL_GESETZ` trägt Lauf, Ringen (mit Finte) und Brett. Das Programm läuft 18–21 Uhr
  auf dem Platz, mit einem Zuschauer-Ring `ringM 1.5` und dem Abstand der Stände nach Hall 1966 mit 0,45–1,2 m. Daraus wurden
  sport.regeln#1 (ρ 0,843), arena#1 und mannschaft#1 gebucht.
- **Stein:** porta-core.js:306 `STEIN_GESETZ` (Quader, Kopfstein) und die Tor-Ordnungen mit der Lehre Stich → Schub → Dicke tragen den
  Bogen einer Arkade.
- **Messorte** (spec/profiband/haushalt.json): wiese, genesis, dorf, buehne, stadt, stadt-voll (295 Häuser, 1 092 Bewohner),
  ort-zeichen, hochhaus-dach, gipfel-blick. **Keiner ist antik.** stadt-voll trägt die meisten meiner Stationen.

## 2. Referenz-Szenen

### Szene A — Die Arena: das Flavische Amphitheater, Rom, 80–107 n. Chr. (das Beispiel des Schöpfers)

**Ort und Zeit im Spiel:** Weil es keinen Erd-Samen gibt, ist die Szene eine Analog-Klasse und kein Nachbau: der Satz
„dorf 7 300 antike" (Region antik, Jahr 80 ± 25) mit einer Arena als Großbau der Stadt. Nach dem Schnitt wird daraus ein Messort
`antike-arena`. Die Daten eichen das Gesetz (Proportion, Kapazität, Rang, Programm), nie ein Asset.

Bänder (alle auf der Seite gelesen, Kolosseum und Gladiator nach Wikipedia):

| # | Größe | Wert, Spanne | Quelle | URL |
|---|---|---|---|---|
| 1 | Außenmaß | 189 × 156 m, Umfang 545 m, Grundfläche 24 000 m² | Wikipedia Colosseum | https://en.wikipedia.org/wiki/Colosseum |
| 2 | Höhe der Außenwand | 48 m | ebd. | ebd. |
| 3 | Arena | 83 × 48 m (der Schnitt außen nennt 87 × 55 m) | ebd. | ebd. |
| 4 | Plätze | 50 000–80 000, Mittel etwa 65 000 (Kalender von 354: 87 000) | ebd. | ebd. |
| 5 | Eingänge | 80 im Erdgeschoss, 76 für das Volk, jeder nummeriert; das Haus leert sich in „nur wenigen Minuten" | ebd. | ebd. |
| 6 | Ränge nach Stand | Podium (Senatoren) · Logen (Kaiser, Vestalinnen) · maenianum primum (Ritter) · secundum immum (reiche Plebs) · summum (arme Plebs) · in legneis (Arme, Sklaven, Frauen); verbannt sind Totengräber, Schauspieler, Ex-Gladiatoren | ebd. | ebd. |
| 7 | Hypogäum | 80 senkrechte Schächte in die Arena, Klappbühnen für Elefanten (unter Domitian) | ebd. | ebd. |
| 8 | Velarium | 240 Mast-Konsolen, deckt 2/3 der Arena | ebd. | ebd. |
| 9 | Tierhetzen | Eröffnung 80/81: über 9 000 Tiere getötet (Cassius Dio); Trajan 107: 123 Tage, 11 000 Tiere, 10 000 Gladiatoren | ebd. | ebd. |
| 10 | Dauer eines Kampfs | meist 10–15 min, höchstens 20 min | Wikipedia Gladiator | https://en.wikipedia.org/wiki/Gladiator |
| 11 | Ausgang eines Kampfs | Sterblichkeit 19/100 aller, die in die Arena traten; Todesalter im Mittel 27 J (Ville); Tod des Besiegten 1/5 → 1/4 | ebd. | ebd. |
| 12 | Überleben | „von 10 Gladiatoren lebten 9 weiter" | National Geographic | https://www.nationalgeographic.com/history/history-magazine/article/how-roman-gladiators-got-ready-to-rumble |
| 13 | Ausrüstung Murmillo | „über 45 pounds" (≈ 20 kg) Schutz | ebd. | ebd. |
| 14 | Gegner Löwe | Männchen 174,9–225 kg, Weibchen 110–143,5 kg; Sprint 48–59 km/h (gemessen einmal 74,1); Jagd am erfolgreichsten aus 20 m | Wikipedia Lion | https://en.wikipedia.org/wiki/Lion |
| 15 | Entleerung | 66 P je m Breite je min auf Stufen, 82 auf ebener Fläche (Green Guide) | SGSA | https://sgsa.org.uk/physical-factors/circulation/egress/ |
| 16 | Stoff | über 100 000 m³ Travertin ohne Mörtel, 300 t Eisenklammern | Wikipedia Colosseum | https://en.wikipedia.org/wiki/Colosseum |

Daraus gerechnet (keine Quelle, meine Rechnung): 65 000 Plätze über 76 Eingänge und 15 min auf Stufen verlangen
ΣB = 65 000 ÷ (66 × 15) ≈ 66 m Laufbreite. Proportion außen 189/156 = 1,21, Arena 83/48 = 1,73.
Ungeprüft: die Platzzahl des Amphitheaters von Pompeji, die Breite eines Bogens.

**Sprossen, die die Szene richtet** (bestehende Kennungen):
- an der Front: `karte2.mensch.sport.arena#2` (10² Zuschauer, Jubel ≤ 0,5 s) · `karte2.mensch.macht.krieg#1` (Zweikampf zweier
  Bewaffneter; beansprucht von w28-bewohner-satz2) · `karte2.mensch.sport.kunst#1` (Meister gegen Anfänger, die Kunst Kampf;
  beansprucht von w28-bewohner-satz2)
- über der Front: `karte2.mensch.sport.arena#3` (Stadion 10⁴ aus Epoche und Bau-Gesetz, Panel) · `karte2.mensch.macht.krieg#2`
  (Flucht statt Tod im Band; Band 11/12) · `karte2.mensch.macht.stand#2` (3–5 Stände; Band 6) · `karte2.mensch.bau.bedarf#4`
  (Großbau ∝ Bevölkerung) · `karte2.mensch.kopplung.sport#4` (Spieltag-Stau)
- fremde Gruppe: `karte2.mensch.menge.dichte#3` (1 000 Gehende, Dichte-Klassen bis 4 P/m² — der Ausgang der Arena füllt sie)
- `leben.tiere.mensch`: **keine.** #2 ist Fährte und Losung, #3 Reittier. Tier gegen Mensch im Kampf ist keine Sprosse meiner
  Leitern. Die Bänder 9 und 14 dienen hier nur der Gestalt.

**Was heute steht:** die Arena-Fläche 49 × 42 m am Genesis-Ort (fachwerk-core.js:14101); Ringen mit Finte und der Zuschauer-Ring
auf dem Platz (koerper-core.js:5795); die Hieb-Physik Spieler gegen Wesen (stamm/kampf.js); die Antike als Epoche (fachwerk-core.js:4372).
**Was fehlt:** ein Großbau Arena in der Stadt-Grammatik (Grep „arena" in fachwerk-core.js trifft nur den Genesis-Ort); die Ränge nach
Stand (TAGES_GESETZ kennt keinen Stand, macht.stand#1 meldet „Rollen ohne Stand"); Jubel (stamm/siedlung-bewohner.js
`_bewohnerGemuet` liest Akt und Furcht, keinen Spielstand); Waffe gegen Waffe zwischen Bewohnern; ein Messort für die Antike.

**Wo Gesetz und Parameter leben:** fachwerk-core.js `GENESIS_ORT.arena` (:14101), `genesisLayout` (:14311, die Zone :14511) und die
Stadt-Grammatik der Sonderbauten · koerper-core.js `SPIEL_GESETZ` (:5795) · porta-core.js Bogen-Ordnungen und `STEIN_GESETZ` (:306) ·
stamm/siedlung-bewohner.js `_spielTag` (:2514), `_bewohnerGemuet`.

**ERSTE WELLE (sichtbare Gestalt zuerst):**
- **Chokepoint:** Das Spiel-Programm bekommt seinen Ort. Die Arena des Ort-Gesetzes wird ein elliptischer Großbau aus EINER
  Proportion (Außen 1,21, Arena 1,73, Ränge gestaffelt nach Band 6, Stein aus `STEIN_GESETZ`, Bögen aus der porta-Ordnung). Seine
  Platzzahl folgt der Bevölkerung der Stadt. `_spielTag` setzt das Programm in den Großbau, sobald er steht, und füllt die Ränge mit
  den Gästen des Abends. Das Gemüt liest den Treffer als Spielstand und gibt die Stimme (Jubel).
- **Was stirbt:** „die Arena bleibt Fläche" (fachwerk-core.js:14099) und der Platz-Ring als einziger Zuschauer-Ort.
- **Dateien:** fachwerk-core.js · koerper-core.js · stamm/siedlung-bewohner.js · klang-core.js (die Stimme) · die Station
  k2-mensch-sport.js misst arena#2 an der Arena der Stadt statt an der leeren Fläche am Genesis-Ort.
- **Erwartet an der Front:** 1 (`sport.arena#2`). krieg#1 und kunst#1 sind schon von w28-bewohner-satz2 beansprucht und zählen hier
  nicht doppelt. arena#3 bleibt am Panel.
- **Stunden:** etwa 16.
- **Bildpaar:** stadt-voll und „dorf 7 300 antike" bei 19 Uhr, gleiche Kamera 40 m über der Spielstätte und Ego im ersten Rang.
  Vorher: Weg-Fläche und Ring 1,5 m. Nachher: steinerne Ellipse mit gestaffelten Rängen und ≥ 100 Zuschauern, die dem Gang folgen.

### Szene B — Die Stadt um die Arena: Pompeji (79 n. Chr.) und Ostia (2. Jh.)

**Ort und Zeit im Spiel:** dieselbe Analog-Klasse („dorf 7 300 antike"). Das Gesetz, das hier fällt, ist aber epochen-frei und gilt
ebenso an stadt-voll (Mitteleuropa 1320). Pompeji ist die am dichtesten gezählte vorindustrielle Stadt: Häuser, Läden, Backstuben,
Garküchen und Wasser in einer Schicht.

| # | Größe | Wert, Spanne | Quelle | URL |
|---|---|---|---|---|
| 1 | Fläche Pompeji | 64–67 ha | Wikipedia Pompeii | https://en.wikipedia.org/wiki/Pompeii |
| 2 | Einwohner Pompeji | 11 000–11 500 nach Haushaltszählung (die ältere Spanne lautet 10 000–20 000) | ebd. | ebd. |
| 3 | Garküchen (thermopolia) | fast 100 | ebd. | ebd. |
| 4 | Backstuben | mindestens 31 | ebd. | ebd. |
| 5 | Ostia | etwa 50 000 Einwohner im 2. Jh.; 69 ha in den Mauern, 150 ha Fläche | Wikipedia Ostia Antica | https://en.wikipedia.org/wiki/Ostia_Antica |
| 6 | Höhe der Mietshäuser | Augustus 70 Fuß = 20,7 m, Trajan 60 Fuß = 17,75 m; vorher bis 9 Geschosse; erhalten ist eine Insula mit 5 Geschossen | Wikipedia Insula | https://en.wikipedia.org/wiki/Insula_(building) |
| 7 | Mietshaus gegen Stadthaus in Rom | 42 000–46 000 insulae gegen etwa 1 790 domus (Regionenkataloge); im Erdgeschoss Läden (tabernae) | ebd. | ebd. |
| 8 | Ungleichheit der Hausfläche | Gini-Median: Wildbeuter 0,17, Gartenbau 0,27, Ackerbau 0,35; Babylon 0,40 (n 106); Maximum der Alten Welt im Modell etwa 0,48 um 1 n. Chr.; 63 Orte | Kohler et al. 2017, Nature 551 | https://pmc.ncbi.nlm.nih.gov/articles/PMC5714260 |
| 9 | Rom gesamt | etwa 450 000 Einwohner aus den Hausdichten von Pompeji und Ostia | Storey 1997, Antiquity | https://www.cambridge.org/core/journals/antiquity/article/population-of-ancient-rome/BACD7DF32B0B77609CD6713B8AF88882 |
| 10 | Wasser Rom | 11 Aquädukte, 780–800 km; 520 000–635 000 bis 1 000 000 m³ je Tag | Wikipedia Roman aqueduct | https://en.wikipedia.org/wiki/Roman_aqueduct |
| 11 | Brunnen | 591 öffentliche Brunnen, sie nehmen etwa 10 % des Wassers (Frontinus) | ebd. | ebd. |
| 12 | Wasser je Kopf | 67 l je Tag für Römer ohne Leitung im Haus (Brun, bei 600 000 Einwohnern) | ebd. | ebd. |
| 13 | Gefälle der Leitung | mindestens 1:4 800 (Vitruv); Pont du Gard 34 cm je km | ebd. | ebd. |

Daraus gerechnet: Pompeji hat etwa 170 Einwohner je ha (11 000 ÷ 65 ha) und eine Garküche je etwa 115 Einwohner. Ostia hat 333–725
Einwohner je ha, je nachdem ob man die Fläche oder die Mauer nimmt. Ungeprüft: Straßenbreiten (Mau 1899 nennt vermutlich 28 Fuß
für die Via dell'Abbondanza, die Einheit ist abgeschnitten), „über 40 Menschen auf 330 m²" je Insula (Wikipedia trägt dort den
Vermerk „citation needed"), Rom mit 1 Mio. Einwohnern und die Aurelianische Mauer mit 13,86 km² (nur aus der Such-Zusammenfassung).

**Sprossen, die die Szene richtet:**
- an der Front: `karte2.mensch.kultur.strassenleben#1` (3 Lokale, 20 Gäste, Gericht aus der Flur; Bänder 3/4) ·
  `karte2.mensch.kopplung.kreislauf#1` (Mahl bis Feld, Wasser aus dem Brunnen; Bänder 4/11/12) · `karte2.mensch.macht.stand#1`
  (Gini im archäologischen Band; Band 8 — der Teil „arm/reich erkannt" bleibt am Panel)
- über der Front: `karte2.mensch.kultur.strassenleben#2` · `karte2.mensch.kopplung.kreislauf#2`/`#3` (Leitung, Bilanz je Stoff;
  Bänder 10–13) · `karte2.mensch.bau.bedarf#2` (≥ 20 Funktionen, Häufigkeit gegen Zensus; Bänder 3/4/7) ·
  `karte2.mensch.bau.innen#3` (Werkstatt, Laden, Schenke) · `karte2.mensch.stadt.groesse#2` (Marktstadt, Panel) ·
  `karte2.mensch.macht.stand#2`

**Was heute steht:** ein Gasthaus je Ort (Front-Tafel strassenleben#1 „gemessen 1 < 3"); das Mahl ist ein Ort der Bindung, kein
Bissen aus der Flur (koerper-core.js `tagesBindung`, kreislauf#1 „0 von 20"); 0 Brunnen im Plan; die Domus 13 × 10 m mit 1 Geschoss
(fachwerk-core.js:2716) gegen das Hofhaus `hofhaus_pastas` (:2770); keine Insula, keine taberna; die Wohnfläche ungleich nur per Stil,
ohne Stand. Die Kette Acker → Frucht ist von w28-acker-kette beansprucht (nahrung.frucht#1).
**Was fehlt:** die Garküche und das Lokal als Rolle, deren Zahl aus den Bewohnern folgt; das Gericht als Ware aus Flur und Handel; der
Brunnen als Punkt des Plans.

**Wo Gesetz und Parameter leben:** fachwerk-core.js Stadt-Grammatik der Sonderbauten (das Sonderbau-Gesetz gibt heute EIN Gasthaus) ·
koerper-core.js `TAGES_GESETZ.angebot`, `tagesBindung` · stamm/siedlung-bewohner.js `_bewohnerListe`.

**ERSTE WELLE:**
- **Chokepoint:** Das Angebot des Abends wird eine Rolle mit Zahl. Garküche und Lokal stehen je N Bewohner (Band: eine je
  ~115 Bewohner) an den Gassen des Kerns. Ihr Gericht ist eine Ware mit Herkunft aus der Flur des Orts. Der Brunnen ist ein
  Plan-Punkt, aus dem der Tag Wasser holt.
- **Was stirbt:** „ein Gasthaus je Ort" im Sonderbau-Gesetz und das Mahl als bloßer Ort der Bindung.
- **Dateien:** fachwerk-core.js · koerper-core.js · stamm/siedlung-bewohner.js.
- **Erwartet an der Front:** 1 sicher (`kultur.strassenleben#1`), 2 wenn der Brunnen im selben Schnitt steht
  (`kopplung.kreislauf#1`).
- **Stunden:** etwa 10.
- **Bildpaar:** stadt-voll, die Gasse am Platz um 19 Uhr, Auge 1,7 m, Blick längs der Gasse. Vorher: eine Tür, ein Gasthaus. Nachher:
  drei Theken mit Gästen und dazu der Brunnen.

## 3. Richter-Urteil (12)

| Richter | Soll wörtlich | Herkunft | Urteil | Grund |
|---|---|---|---|---|
| sport.arena#2 | „Lautstärke-Spitze nach dem Tor (s) ≤ 0,5", 100 Zuschauer | erfunden (Zahl der Karte) | bleibt | Ein Ereignis-Abstand im Spiel ist ein ehrliches Maß, und er ist ROT, weil der Jubel fehlt, nicht weil das Maß schief wäre. |
| sport.arena#1 | „Blicke, die dem Geschehen folgen ≥ 0,8", 10 Zuschauer | erfunden | bleibt | Gebucht; er hat einen echten Leser (Ring und Blick am Feld) erzwungen. |
| sport.regeln#1 | „ρ Rangfolge ↔ Leib-Leistung 0,6–0,9", 20 Läufe | erfunden (Karte) | bleibt | Grün mit ρ 0,843; die Mutante mit ρ 0,95 (der Sieger ist nur der Leib) wird ROT — er schärft auf das Richtige. |
| sport.regeln#2 | „richtige Pfiffe ≥ 0,9", 20 Partien mit Gegner und Pfiff | erfunden | bleibt | Er fehlt am Leser (kein Ballspiel, kein Schiedsrichter); die Arena gibt einen Kampfrichter, aber kein Ballspiel. |
| macht.krieg#1 | „Treffer sitzt, wo die Klinge den Leib kreuzt ≥ 1; der Getroffene antwortet ≥ 1; Treffer durch die Deckung ≤ 0" | gesetz (Geometrie aus Hieb und Stoß) | bleibt | Er fand den echten Fehler: die Wache tritt mit der Waffe 1,5 m vor die Tat und hält, ohne Hieb. |
| macht.krieg#2 | „Flucht statt Tod im Band; menschlich ≥ 60 %" | aussen (Marshall), ohne Zahl | band | Das Band liegt in der Szene: Sterblichkeit 19/100, Tod des Besiegten 1/5–1/4, Dauer 10–15 (≤ 20) min. |
| macht.stand#1 | Auge, Vorbild „Kohler et al. 2017, Gini der Hausflächen", Lübeck Mengstraße | aussen | band | Der Gini wird eine Zahl: Ackerbau 0,35 bis Alte Welt 0,48 um 1 n. Chr., gemessen am Plan ohne Panel; nur „arm/reich erkannt" bleibt am Panel. |
| macht.recht#1 | „Antwort der Wache ≥ 0,8", 20 Regelbrüche | erfunden | bleibt | UNGEMESSEN, weil keine Wache besteht; er zeigt eine echte Lücke im Spiel und kein schiefes Maß. |
| kultur.glaube#1 | „Gläubige im Kultbau ≥ 0,3; Festtag ÷ Werktag ≥ 3" | erfunden | bleibt | Ich habe keine Quelle mit Zahl gelesen; ROT, weil der Tag keinen Kultgang kennt. |
| kultur.strassenleben#1 | „3 Lokale in einer Gasse am Abend; Gäste ≥ 20; Gerichte trotz fehlender Zutat ≤ 0" | erfunden | band | Pompeji gibt das Band „eine Garküche je ~115 Bewohner"; die Drei wird eine Folge der Bewohnerzahl. |
| bau.bauen#1 | „Labor ↔ Welt an derselben Kamera ≤ 2,1 %" | erfunden (eigene Schwelle K4) | bleibt | Oft geheilt, aber er fand echte Fehler (98,0 % → 17,3 %, Wände, Schornstein und Pfosten fehlten in der Welt). |
| Panel-Sprossen (stadt.groesse#1, stadt.breite#1, stadt.messlatte#1, bau.bedarf#1, bau.huelle#1, verstaendigung#1) | „2AFC ≤ 90 % / Foto ≥ 5 % / Region erkannt ≥ 50 %" | aussen (Fotos realer Orte) | nur-bericht | Ohne Panel R11 hält keiner eine Landung; ein Referenzfoto ersetzt das Panel nicht. Sie bleiben Fronten mit Grund. |

## 4. Widerspruch: wo die These in meiner Gruppe nicht trägt

1. **Einen Erd-Samen gibt es nicht.** Rom am richtigen Ort und zur richtigen Zeit ist im Spiel nicht erreichbar (ein Anker,
   prozeduraler Planet). Die Szene ist eine Analog-Klasse (Region antik, Jahr 80), und die Daten eichen Gesetze, keine Orte. Eine
   wirkliche Erde mit historischen Schichten wäre ein neuer Plan, und der ist nach Gesetz nicht zu liefern.
2. **Die Front-Rechnung.** Die Arena berührt etwa zehn meiner Sprossen, aber nur 1–3 stehen an der Front, und zwei davon sind schon
   beansprucht. Der Rest liegt auf #3–#4 (arena#3, bau.bedarf#4, kopplung.sport#4, stand#2) über ungebuchten unteren Sprossen.
   Punkte gibt nur die Front. „Eine Szene richtet viele Sprossen zugleich" stimmt fürs Messen, aber nicht fürs Buchen.
3. **Meine Fronten sind ROT am fehlenden Akt, nicht am schiefen Maß.** Etwa 20 Fronten melden „fehlender Leser", mit dem gemeinsamen
   Täter Tagesplan und `_spielTag` (kein Spiel-Akt, keine Wache, kein Kultgang, kein Lokal, kein Jubel). Römische Zahlen heilen keinen
   davon; es fehlt Bau, keine Eichung. In meiner Gruppe gibt es kaum oft geheilte Linsen; die Ausnahme ist bau.bauen#1, und die fand
   echte Fehler.
4. **Die meisten Solls sind Zahlen der Karte.** Die Stationen schreiben den Richter-Text ab; die `herkunft`-Zeilen zählen nur
   Aufzählungen. Ein Band kann die Lesart einer Station ersetzen, nicht den Satz der Karte, denn Leitern setzt nur der Schöpfer. Wo die
   Karte selbst ein Band verlangt („im archäologischen Band", „gegen Zensus", „Seshat"), trägt die Szene voll.
5. **Panel.** Mindestens sieben Fronten meiner Gruppe sind 2AFC oder Blindtest. Referenzbilder geben das Vorbild, aber nicht den
   Prüfer.
6. **Tier gegen Mensch** ist in meinen Leitern keine Sprosse. leben.tiere.mensch#2 (Fährte) richtet die Arena nicht. Die Venatio-Zahlen
   gehören zu den leben-Leitern einer anderen Gruppe.
7. **Fürs Verhalten** (Reaktionszeit des Publikums, Gang in den Kultbau, Anteil am Spiel am Abend) ist Rom dünn. Dichte Daten liegen
   dort in der Gegenwart (Green Guide, Weidmann, ATUS). Rom trägt die Gestalt (Bau, Stand, Arena, Wasser); die Gegenwart trägt das
   Verhalten.
8. **Die meisten Fronten stehen im Mitteleuropa um 1320** (stadt-voll), nicht in Rom. Eine Rom-Welle braucht erst einen antiken
   Messort und einen Großbau; der billigere Hebel ist der Tagesplan an stadt-voll.

## 5. Was ich nicht gelesen habe

- Den Mess-Code der Stationen jenseits der `sprossen`-Tafeln und Auszüge (k2-zusammenspiel.js nur die Soll-Zeilen der Kopplungen).
- Die Rümpfe von koerper-core `tagesPlan`, stamm/kampf.js, `_spielTag` und `_bewohnerGemuet`; den Zweig mauer-im-stoff; die Messung
  K4 17,3 %.
- Das leben-Kapitel (tiere.mensch nur aus der json), die menge-Stationen, das FUND-REGISTER und offen-ernte.
- Die zweite Hälfte der Wikipedia-Seiten Colosseum und Gladiator (über 100 000 Zeichen hinaus), die Straßenbreiten von Pompeji, die
  Platzzahl des Amphitheaters von Pompeji, die Parzellen und die Mauerlänge mittelalterlicher Städte (Nördlingen: nur Mauer 1327 und
  Turm 90 m gelesen), Space Syntax und Seshat.
- Die Rang-Größen-Regel nicht neu (das Spiel misst sie, siedlungsnetz#1 ζ 1,022).
