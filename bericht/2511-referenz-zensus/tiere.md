# Zensus Referenz-Szenen — Gruppe Tiere (Herde, Rudel, Räuber und Beute)

Ich habe nur gelesen: Kapitel leben.md, die Front-Tafel, meisterkarte-2.json (heute je Leiter), die Stationen k2-leben.js, g1.js, g2.js und proben-welt.cjs (alle aus punkte-maschine), dazu tetrapoda-core.js, stamm/kreatur-leben.js, scripts/lib/kreatur-proben.cjs, haushalt.json, planet-core.js und SKILL.md als Auszüge.

**Stand meiner Leitern (meisterkarte-2.json `heute`).** Die Sprosse 1 ist gebucht bei bewegung, verhalten, lebenszyklus, mensch, oeko.netz, oeko.dynamik, kopplung.leben-formt-planet und kopplung.stadt-im-netz. Auf 0 stehen arten, masse, wanderung, oeko.vielfalt und kopplung.evolution-planet; kopplung.kaskade steht nicht in der Ausgabe.

**Die Fronten heute (Front-Tafel 25.11.):**

| Front | Lage |
|---|---|
| arten#1 | 2 von 5 Arten; 0,013 statt 1 Spielstunde |
| masse#1 | beansprucht; ROT, weil die Herde nicht gezeichnet ist („UNGEZEICHNET“) |
| wanderung#1 | ✗ bei deer 0,48× π·8², bear 0,47× π·28² |
| oeko.vielfalt#1 | Ego 0 Sichtungen in 601 Spiel-s |
| bewegung#2 | kein Laufvogel, der Fisch ist ein starrer Leib |
| verhalten#2 | 3 statt ≥ 30 Akte, Rang 0,316 |
| lebenszyklus#2 | beansprucht |
| mensch#2 | keine Fährte |
| oeko.netz#2 | 4 Gattungen in 1 Ebene |
| oeko.dynamik#2 | Jungwuchs ungemessen, „kein nahWiese im Bild 0,0 % < 15 %“ |
| kopplung.evolution-planet#1 | ohne Station |
| kopplung.leben-formt-planet#2 | ohne Station |
| kopplung.stadt-im-netz#2 | ohne Station |

**Die Grundfrage: kann das Spiel heute an Ort und Zeit gehen?** Nein, nicht wörtlich.
- `PLANET_ERDE` (planet-core.js:264) trägt nur die Konstanten des Erdkörpers: Radius, g, Neigung, Jahr, Alter. Eine Erd-Geografie gibt es nicht, also keine Serengeti und kein Lamar-Tal. Erreichbar ist nur ein ANALOG: eine Klimazone mit dem passenden Gelände im Samen.
- Auch eine Epoche der Fauna fehlt. Laut Front-Tafel (erleben.kopplung.klang#5) „trägt der Planet-Faden kein Arten-Inventar je Zeitalter“ (planet-core.js planetPlan).
- Die Fauna besteht aus 4 Land-Gattungen (deer, wolf, bear, fox) und „wesen“. Gezeichnet werden höchstens 20 Leiber (stamm/dirigent-kern.js:281 maxCreatures 20), davon 4 als Nah-Leib (stamm/kreatur-leben.js KREATUR_SATZ.nahLeiber 4).
- In spec/profiband/haushalt.json steht kein Tier-Messort: wiese, genesis, dorf, buehne, stadt, stadt-voll, ort-zeichen, hochhaus-dach, gipfel-blick.

---

## (a) Referenz-Szenen

### Szene 1 — DAS WOLFSTAL: Yellowstone, Northern Range (Lamar-Tal), Winter bis Frühsommer

**Ort und Zeit im Erd-Samen.** Ein Analog: gemäßigtes Bergtal mit Grasland, Nadelwald-Saum und einem Fluss mit Ufer-Jungwuchs.
- Winter (Nov–Apr) für Jagd, Herde und Wanderung.
- Mai–Juli für Kälber und Bären.
- Uhr 6–9 und 17–20 (wann die Jagden fallen: ungeprüft).

**Warum diese Szene zuerst.** Die Gilde des Spiels ist genau die Gilde von Yellowstone: Wapiti ≈ deer, Grauwolf, Grizzly, Rotfuchs. Das ist der datenreichste Ort der Welt für genau unsere vier Gattungen. Ein Ort und eine Gilde urteilen damit Jagd, Herde, Kalb, Wanderung, Kaskade und Flucht zugleich.

**Bänder**

| # | Größe | Wert (Spanne) | Quelle | URL | gelesen |
|---|---|---|---|---|---|
| 1 | Rudelgröße | Mittel 9,8; Spanne 3–18 (2016, 11 Rudel, 108 Wölfe) | Yellowstone Wolf Project 2016 | https://www.nps.gov/articles/yellowstone-wolf-project-report-2016.htm | ja |
| 2 | Beute-Anteil der Wolfsrisse, Winter | Wapiti 68,5 % (161/235), Bison 8,1 %, Maultierhirsch 2,1 % | ebd. | ebd. | ja |
| 3 | Beute-Anteil der Wolfsrisse, Sommer | 54 von 81 = 67 % Wapiti | ebd. | ebd. | ja |
| 4 | Jagderfolg gegen Rudelgröße | flacht ab 4 Wölfen (Trittbrettfahrer) | MacNulty et al. 2012, Behav. Ecol. 23:75 | https://digitalcommons.usu.edu/wild_facpub/1526/ | ja |
| 5 | Jagderfolg auf Bison | flacht erst bei 9–13 Wölfen | MacNulty et al. 2014, PLOS ONE | https://pmc.ncbi.nlm.nih.gov/articles/PMC4229308 | ungeprüft (Suchauszug) |
| 6 | Kalb, erstes Jahr | Überleben 0,22 (n 149); Lamar 0,17 ↔ Mammoth 0,54; Sommer 0,29; Winter 0,90; Bären 58–60 %, Wölfe 14–17 % der Tode; Sommer-Prädation 95 % der Sommertode | Barber-Meyer et al. 2008 (USGS) | https://www.usgs.gov/publications/elk-calf-survival-and-mortality-following-wolf-restoration-yellowstone-national-park | ja |
| 7 | Wanderung der Nordherde | 10–140 km zu ≥ 12 Sommergebieten; Treue Sommer 96 % (n 52), Winter 61 % (n 41); tiefere Überwinterer ziehen 13 Tage früher; 8 Todesfälle in 225 Elch-Sommern | White et al. (USGS) | https://www.usgs.gov/publications/migration-northern-yellowstone-elk-implications-spatial-structuring | ja |
| 8 | Wanderung Clarks Fork | einfach im Mittel 33 mi ≈ 53 km, höchstens 67 mi ≈ 108 km; Herde ~3 000 | USGS-Datensatz | https://data.usgs.gov/datacatalog/data/USGS:5f8db5ff82ce32418791d566 | ungeprüft (Suchauszug) |
| 9 | Kaskade, Bestand | Nordherde 17 000–19 000 vor den Wölfen → 6 279–6 738 vor 2008 | NPS Yellowstone Science 24-1 | https://www.nps.gov/yell/learn/ys-24-1-the-challenge-of-understanding-northern-yellowstone-elk-dynamics-after-wolf-reintroduction.htm | ungeprüft (Suchauszug) |
| 10 | Kaskade, Jungwuchs | 22 von 24 Studien zeigen Zunahme; Weiden > 200 cm um 2010–2012; im Lamar-Tal kein Erholen (Bison) | Beschta & Ripple 2016, Biol. Conserv. 198:93 | https://trophiccascades.forestry.oregonstate.edu/sites/trophic/files/Beschta_Ripple2016.pdf | ungeprüft (Suchauszug) |
| 11 | Fluchtdistanz vor dem Menschen | Rothirsch 120 m (bejagt 100–200 m), Wolf 106 m, Bär 55 m, Fuchs 40 m | Kern-Zitat tetrapoda-core.js:2043–2059 (Stankowich 2008, Karlsson 2007, Moen 2012) | — | ungeprüft (Kern-Zitat) |
| 12 | Gangwechsel | Trab Fr 0,5, Galopp Fr 2,5 | Kern-Zitat tetrapoda-core.js:1363 (Alexander & Jayes 1983) | — | ungeprüft (Kern-Zitat) |
| 13 | Höchsttempo aus der Masse | 454 Arten, 1 g – 10 t, Tempo aus der Masse mit 90 % Genauigkeit, Kurve mit Buckel | Hirt et al. 2017, Nat. Ecol. Evol. 1:1116 | https://phys.org/news/2017-07-size-key-animals.amp | ja |

**Sprossen, die die Szene richtet** (bestehende Kennungen):
- karte2.leben.tiere.arten#1
- karte2.leben.tiere.verhalten#2
- karte2.leben.tiere.lebenszyklus#2, karte2.leben.tiere.lebenszyklus#3
- karte2.leben.tiere.masse#1
- karte2.leben.tiere.wanderung#1, #2, #3, #4
- karte2.leben.tiere.mensch#2
- karte2.leben.oeko.vielfalt#1
- karte2.leben.oeko.netz#2
- karte2.leben.oeko.dynamik#2, karte2.leben.oeko.dynamik#3
- karte2.leben.kopplung.kaskade#2
- karte2.leben.kopplung.leben-formt-planet#4

Das sind 17 Sprossen. FRONT davon sind arten#1, verhalten#2, lebenszyklus#2, masse#1, wanderung#1, mensch#2, vielfalt#1, netz#2 und dynamik#2.

**Was davon heute im Spiel steht:**
- Die 4 Gattungen samt Wurf-Gruppen: Rudel 3–6, Hirsch 3–7 (tetrapoda-core.js:283, Mech & Boitani).
- Die Riss-Quote im Band 0,2–0,4 nach MacNulty (scripts/lib/kreatur-proben.cjs:3057).
- Die Fluchtdistanz je Gattung (tetrapoda-core.js:2059).
- Gang aus der Froude-Zahl (tetrapoda-core.js:1358–1410).
- Wurfgröße nach PanTHERIA (k2-leben.js Leiter LZ, Sprosse 6).
- Höhenwanderung 300–1000 m als Soll (k2-leben.js Leiter WA, Sprosse 4, Georgii & Schröder 1983).
- Leine 18 m × Größe (tetrapoda-core.js:226).
- Bestand je Revier, revierM 113 (tetrapoda-core.js:2298), und BESTAND_REGION (stamm/kreatur-leben.js:3959).
- Die Kaskade Wolf → Hirsch → Jungwuchs, headless gemessen: +0,448 / −0,279.

**Was fehlt:**
- Kein Bison: die fünfte Gattung der Gilde und 8–27 % der Risse.
- Der Bär reißt keine Kälber (ungelesen, nicht geprüft).
- Kein Kalb, das wächst.
- Die Tiere leben nur 35 Spielminuten (stamm/daten.js:176 FAUNA_MAX_AGE_MS laut Station). Damit gibt es keine Wanderung über Tage und kein Gedächtnis über Wochen.
- Keine Fährte im Schnee: siedlung-wege `_trittStufe`.
- Kein Messort am Ufer mit Jungwuchs.
- Die Herde wird nicht gezeichnet; daran arbeitet die Welle tiere-im-blick.

**Wo das Gesetz lebt:**
- tetrapoda-core.js: BESTAND_GESETZ, FURCHT_GESETZ, VERHALTEN.jagd, GANG_GESETZ, LEBENSRAUM_GESETZ.gattung.
- stamm/kreatur-leben.js: `_kreaturFrass`, `tickFaunaLifecycle`, BESTAND_REGION.
- stamm/kreatur-verhalten.js: updateCreatures.

**ERSTE WELLE — „Das Ufer des Wolfstals“**
- **Der Schnitt:** EIN Schnitt an `_kreaturFrass` (stamm/kreatur-leben.js). Die Äsung der Herde liest den Ufer-Jungwuchs des Bestands (phyto-Bestand am Fluss) und schreibt ihn zurück. Damit verschiebt die Herde ohne Wölfe über 10 Spieljahre die SICHTBARE Deckung und Höhe der Weiden am Fluss; mit Wölfen meidet die Herde das Ufer, und die Weiden stehen.
- **Dazu:** ein Messort „ufer“ in spec/profiband/haushalt.json: ein Fluss mit Jungwuchs im Bild und nahWiese ≥ 15 %, damit die Bild-Abnahme nicht mehr am Ort scheitert.
- **Sichtbare Gestalt:** verbissene, kniehohe Weiden ↔ hohe Weiden über 2 m (Band 10).
- **Dateien:** stamm/kreatur-leben.js (`_kreaturFrass`), der Leser des Jungwuchses im phyto-Bestand (ungelesen), spec/profiband/haushalt.json.
- **Erwartet an der Front:** 1 Sprosse (karte2.leben.oeko.dynamik#2). Ehrlich 0–1, weil das Bild auch die Abnahme bestehen muss.
- **Nicht an der Front:** kopplung.kaskade#2 und leben-formt-planet#4 stehen über roten Fronten (kaskade#1 Strömung → Fisch; leben-formt-planet#2 Hang) und bringen 0.
- **Stunden:** 8.
- **Bildpaar:** gleiche Kamera am Ufer-Messort, 10 Spieljahre ohne Wolf ↔ der Gegenlauf mit Wolf. Weiden-Deckung −≥ 20 %, sichtbar als Höhe.

### Szene 2 — DER GNU-STROM: Serengeti–Mara, Mara-Fluss, Juli bis September

**Ort und Zeit.** Ein Analog: tropische Savanne mit Wechselklima, ein Fluss als Querung, Trockenzeit.

**Bänder**

| # | Größe | Wert | Quelle | URL | gelesen |
|---|---|---|---|---|---|
| 1 | Gnus im Zug | ≈ 1,3 Mio | Univ. Glasgow 2014 | https://www.gla.ac.uk/news/archiveofnews/2014/august/headline_350044_en.html | ja |
| 2 | Zebras im Zug | ≈ 250 000 | ebd. | ebd. | ja |
| 3 | Gazellen am Weidegipfel | ≈ 300 000 | ebd. | ebd. | ja |
| 4 | Telemetrie | 6 Halsbänder zugleich, 40 in zehn Jahren (kleine Stichprobe) | ebd. | ebd. | ja |
| 5 | Zugstrecke Zebra | Mittel 81,5 km (37,7–151,9) | CMS-Faktenblatt | https://www.cms.int/siberian-crane/sites/default/files/publication/Fact%20Sheet%20on%20Plains%20Zebra%20Migration%2C%20Serengeti-Mara%20-%20English.pdf | ungeprüft (Suchauszug) |
| 6 | Rundweg | ≈ 500 Meilen | National Geographic | https://www.nationalgeographic.com/animals/article/wildebeest-great-migration-africa-serengeti | ungeprüft (Suchauszug) |
| 7 | Nachbarzahl im Pulk | topologisch 6–7; Φ 0,96 bei Staren | Kern-Zitat k2-leben.js Leiter MA (Ballerini et al. 2008) | — | ungeprüft (Kern-Zitat) |
| 8 | Korrelationslänge | wächst mit der Schwarmgröße | Kern-Zitat (Cavagna 2010) | — | ungeprüft (Kern-Zitat) |
| 9 | Tempo aus der Masse | Gnu ↔ Löwe ↔ Gazelle auf der Hirt-Kurve | Hirt et al. 2017 | https://phys.org/news/2017-07-size-key-animals.amp | ja |

**Sprossen** (8):
- karte2.leben.tiere.masse#3, #4, #5
- karte2.leben.tiere.wanderung#5
- karte2.leben.kopplung.kaskade#3
- karte2.leben.oeko.netz#3
- karte2.leben.tiere.arten#2
- karte2.leben.oeko.vielfalt#2

**Heute im Spiel:** nichts davon.
- Kein Bauplan für Savannen-Huftiere, kein Löwe.
- Gezeichnet werden höchstens 20 Leiber (dirigent-kern.js:281), der Tier-Satz trägt cap 256 je Senke (kreatur-leben.js KREATUR_SATZ).
- Der Regen verlegt keine Route; die Leine hält jedes Tier.

**Wo das Gesetz lebt:** tetrapoda-core.js (Gattungs-Dials, wandern.leashBaseM), stamm/kreatur-leben.js (KREATUR_SATZ, `_tickTierSatz`), planet-core.js planetKlima (Regen-Gürtel über das Jahr).

**ERSTE WELLE — „Der Satz trägt die Herde“**
- **Der Schnitt:** der Tier-Satz (`_tickTierSatz`) zeichnet die Herde des Bestands über die 20 Leiber hinaus als Instanzen mit eigenem Gang.
- **Erwartet an der Front:** 0 Sprossen, solange masse#1 nicht gebucht ist (masse#2 und #3 stehen darüber).
- **Stunden:** 20.
- **Bildpaar:** Third aus 40 m auf eine Herde von 10² ↔ heute 5 Flecken.

Das ist nicht die erste Welle der Gruppe.

### Szene 3 — DIE MAMMUTSTEPPE: Beringia, etwa 20 000 Jahre vor heute, Sommer (Skala-Gegenprobe)

**Bänder**

| # | Größe | Wert | Quelle | URL | gelesen |
|---|---|---|---|---|---|
| 1 | Biomasse der Pflanzenfresser | ≈ 10 t/km² (aus Knochen im Permafrost) | Zimov 2012 (Tagungs-Abstract) | https://www2.jpgu.org/meeting/2012/session/PDF/M-IS03/MIS03-07.pdf | ungeprüft (Suchauszug) |
| 2 | Biomasse, Modellarbeit 2024 | 10,5 t/km², davon Mammut 2,5; zweite Schätzung 8,8 / 4,5 | Modellarbeit 2024 | https://pmc.ncbi.nlm.nih.gov/articles/PMC11058768 | ungeprüft (Seite gab Captcha) |
| 3 | Schätzungen aus Skeletten | „highly debated“ | Sci. Rep. 2021 | https://pmc.ncbi.nlm.nih.gov/articles/PMC8217226 | ungeprüft (Suchauszug) |
| 4 | Vergleich heute | Rothirsch auf geschütztem Grasland in Spanien ≈ 4 t/km² | npj 2022 | https://www.nature.com/articles/s44185-022-00005-z.pdf | ungeprüft (Suchauszug) |
| 5 | Tempo aus der Masse | bis 10 t | Hirt et al. 2017 | https://phys.org/news/2017-07-size-key-animals.amp | ja |
| 6 | Gangwechsel mit der Größe | Fr ∝ √(g·L) | Kern-Zitat tetrapoda-core.js:1363 | — | ungeprüft (Kern-Zitat) |

**Sprossen** (5):
- karte2.leben.tiere.bewegung#6
- karte2.leben.tiere.arten#5
- karte2.leben.oeko.vielfalt#6
- karte2.leben.kopplung.stadt-im-netz#7
- karte2.leben.kopplung.evolution-planet#4

**Heute im Spiel:** PLANET_ERDE und die Zeitalter im Planet-Faden, aber kein Arten-Inventar je Zeitalter. Die Masse reicht von etwa 10 bis 300 kg (bewegung#1).

**ERSTE WELLE:** keine jetzt. Erwartet an der Front: 0 Sprossen, 6 Stunden, nur als späte Gegenprobe der Hirt-Kurve.

**Zur Verfeinerung des Koordinators.** Sie trägt: lebende Analoge liefern das Verhalten, Riesen prüfen die Skala.
- Für die Skala reicht aber der LEBENDE Riese, der Afrikanische Elefant (bis ~6 t, gemessene Gangarten). Die ausgestorbenen Riesen verlängern die Kurve nur von ~6 t auf ~15 t, und das mit Massen aus Knochen-Schätzungen, deren Biomasse-Zahlen selbst „highly debated“ heißen.
- Die Epoche der Riesen ist NICHT die bessere Szene, solange die Fronten bei S1/S2 mit 4 gemäßigten Gattungen stehen.

---

## (b) Richter-Urteil

| # | Richter (Ort) | Soll wörtlich | Herkunft | Urteil | Grund |
|---|---|---|---|---|---|
| 1 | Probe rudel, Frieden/Pirsch (kreatur-proben.cjs:4361–4364) | „das Rudel pirscht im Frieden / den leeren Anker“ = 0 Takte; pirschS ≠ null | gesetz | bleibt | Fand echte Spiel-Fehler (Täter rudel-leib: die Witterung pirscht den leeren Anker). |
| 2 | Probe rudel, Umstellen (kreatur-proben.cjs:3200, 4365–4369) | „kein Takt in 600 s mit ≥ 3 Jägern und Lücke ≤ 540°/n“; „beim ersten Biss … Lücke ≤ 180“ | erfunden | nur-bericht | Die Geometrie hat keine Quelle; sie wackelt an main (1 von 2 ROT, Lücke 268°). Kein Yellowstone-Band beschreibt Wölfe, die einen Menschen umstellen — die Jagd urteilt jagdkreis. |
| 3 | Probe jagdkreis (kreatur-proben.cjs:3057, 4337ff) | Riss-Quote rudel 0,2–0,4 je Jagd, ≥ 10 Jagden | aussen | band | Das Band aus Szene 1 bekommt die Plateau-Prüfung dazu: Quote bei 8 Wölfen ≈ Quote bei 4 (MacNulty 2012). |
| 4 | Probe mahl (kreatur-proben.cjs:4371ff) | „Rudel frisst ≥ 40 % dessen, was seine Mägen fassen“ in 120 s | erfunden | nur-bericht | Die 40 % und die 120 s haben keine Quelle; der Kadaver-Verbrauch gehört an eine Feldzahl (nicht gelesen). |
| 5 | Station arten#1 (k2-leben.js:1863–1876) | „≥ 5 Arten im Bild“ · „Klassen-Maske ≥ 200 px“ · „Spielgang 1 h an 3 Biomen“ | erfunden (Karten-Zahl ohne Quelle) | bleibt | Das Soll ist die Karte. ROT hält die Uhr: spielStunden = Takte/60/(60·DAY_LENGTH)·24 (k2-leben.js:1837) zählt Wand-Takte und liefert 0,013 statt 1 Stunde. Die Messung braucht einen Spielzeit-Raffer, keine neue Schwelle. |
| 6 | Station vielfalt#1, tierKreis (g2.js:80–89) | „JEDE Sicht ≥ 3 Tiere ≥ 200 px … über ≥ 600 Spiel-s … keines im Blick erschien“ | erfunden (Karte) + gesetz (kein Aufploppen) | bleibt | Fand einen echten Spiel-Fehler: Ego 0 Sichtungen, nur der Bär in Third. |
| 7 | Bild-Serie masse#1 „Herde am Hang“ | Kohäsion wandernd ≥ 0,9, Flucht ≥ 0,8, Φ ≥ 0,8; die Herde gezeichnet | aussen (Φ: Ballerini 0,96) | bleibt | Fand einen echten Spiel-Fehler: die fliehende Herde ist UNGEZEICHNET. |
| 8 | Station wanderung#1 (Akten-Zeile; Datei ungelesen) | Aufenthaltsfläche ≥ 0,5 × π·Leine² (deer 0,48× π·8² = ✗) | erfunden | faellt | Die Karte verlangt „Aufenthalt folgt dem Lebensraum“ — dort steht 0,99–1,0. Die halbe Kreisfläche hat keine Quelle und hält die Front an 0,48 gegen 0,5. Ersetzen durch Lebensraum ≥ 0,9 und Fläche > 0. |
| 9 | Station verhalten#2 (k2-leben.js:2523, 2538) | „Feld-Ethogramm … Rangkorrelation ≥ 0,7“, „≥ 30 Akte“, „Alarm-Kette ≤ 1 s“ | unklar | band | Welches Feld-Ethogramm der Rang liest, ist ungelesen. Das Zeitbudget des Wapiti im Winter aus Yellowstone wird das Band (Zahl ungeprüft). |
| 10 | Station mensch#1 (g1.js:2616ff) | Fluchtdistanz im Feldband [0,5 · 1,5] × Feldmaß (deer 120, wolf 106, bear 55, fox 40 m) | aussen | bleibt | Quelle mit Zahl im Kern (Stankowich 2008, Karlsson 2007, Moen 2012); gebucht. |
| 11 | Station bewegung#1 (k2-leben.js Leiter BW, Sprosse 1) | „Gleiten ≤ 5 %“, „Gangwechsel bei der Froude-Zahl der Natur ±10 %“ | aussen | bleibt | Alexander & Jayes 1983 im Kern; gebucht. |
| 12 | Station oeko.dynamik#2, Bild-Abnahme | „Jungwuchs-Deckung −≥ 20 %“; Abnahme „kein nahWiese im Bild: 0,0 % < 15,0 %“ | Soll: unklar · Abnahme: erfunden | band | Die −20 % werden ein Band aus Beschta & Ripple. Die 15 % nahWiese ist eine Schwelle der Bild-Abnahme, die am falschen Ort (ohne Ufer) misst; das heilt der Messort „ufer“, nicht die Schwelle. |

---

## (c) Widerspruch — wo die These in dieser Gruppe nicht trägt

1. **Kein Erd-Ort, keine Erd-Zeit.** Der Same trägt nur die Konstanten der Erde (planet-core.js:264), keine Geografie und keine Fauna je Zeitalter. „In die korrekte Zeit an den korrekten Ort gehen“ heißt heute: ein ANALOG bauen. Das ist selbst eine Welle.
2. **Die Fronten hält meist kein falsches Soll.** Rot sind sie, weil etwas fehlt:
   - Umfang: der Fisch ist starr, es gibt keinen Laufvogel, nur 3 Akte, keine Fährte, 4 Gattungen in 1 Ebene, Tiere leben 35 Spielminuten.
   - Bild und Messpfad: die Herde ist ungezeichnet, Ego hat 0 Sichtungen, die Stunde wird in Wand-Takten gezählt.

   Eine Szene liefert dafür das Ziel, aber keine Sprosse — gebaut werden muss trotzdem.
3. **Die Eichung an Quellen ist hier schon weit.** Der Kern zitiert MacNulty, Alexander & Jayes, Stankowich, Mech & Boitani, PanTHERIA, Georgii & Schröder und Ballerini. Die Linsen sind nicht das Problem, nur zwei bis drei erfundene Geometrie-Schwellen sind es (rudel 540°/n, mahl 40 %, wanderung 0,5·π·r²).
4. **Die datenreichsten Szenen liegen hoch.** Serengeti (10⁶) und Mammutsteppe treffen Sprossen 3–6 über roten Fronten. Nach der Front-Regel bringen sie heute 0 Punkte.
5. **Das Spiel will, was die Natur nicht zeigt.** „Das Rudel umstellt den Spieler“ ist eine Spiel-Entscheidung; Yellowstone liefert dafür kein Band. Solche Richter bleiben Gesetz des Spiels oder fallen.

---

## (d) Nicht gelesen

- k2-zusammenspiel.js: geholt, aber nicht ausgewertet.
- Die Datei der Station wanderung#1 (nur ihre Akten-Zeile) und die Station lebenszyklus#2.
- tetrapoda-core.js zielWahl, wegBaum, wegTeile, zielWunsch und gangSchritt im Wortlaut.
- stamm/kreatur-verhalten.js updateCreatures und `_bestandErscheint` (nicht gefunden in stamm/, die Welle liegt nicht auf main).
- scripts/diag-kreatur-* (die Proben leben in scripts/lib/kreatur-proben.cjs).
- Die Volltexte, nur Abstracts und Seiten gelesen: Yellowstone-Berichte 2019–2025 (die PDF war nicht lesbar), Beschta & Ripple 2016, Zimov 2012, MacNulty 2014, Taylor & Knight 2003.
- Mangels gelesener Zahl offen: Wapiti-Gruppengrößen, Kalbe- und Brunft-Datum, Fluchtdistanz des Wapiti im Feld (Starkey: Abstand 558–879 m zu Erholungssuchenden, nur Suchauszug) und Couzin-Zonen.
