# Zensus Referenz-Szenen — Gruppe netz (mensch.netz · fahrzeug · wirtschaft · nahrung)

Nur gelesen. Stand: punkte-maschine (front-tafel 25.11. 06:17, 103/105 gebucht), Haupt-Klon main 6c210411.

## 0. Die Front meiner Gruppe heute (vision/front-tafel.md, meisterkarte-2.json `heute`)

| Leiter | Front | Was sie rot hält |
|---|---|---|
| mensch.netz.gestalt | #1 | Gefälle 30 % an d:7@836,438 (Soll ≤ 9,5), Wände im Korridor |
| mensch.netz.verkehr | #2 (#1 gebucht, aber an main UND Kopf ROT: 2 311 von 2 396 m, ein Steckenbleiber) | keine Station in der Sitzung (KEINE STATION), Fahr-Linse VK ROT |
| mensch.netz.massenverkehr | #1 | fehlender Leser: keine Linie, kein Halt |
| mensch.netz.stoffwechsel | #1 | fehlender Leser: 451 Laternen, 0 Leitungen |
| mensch.fahrzeug.medium | #2 (beansprucht pm-beobachter) | Saat ändert die Physik nicht; Bremsweg 0–45,39 m; keine Spurrinne |
| mensch.fahrzeug.form | #2 | 5 Rezepte statt 50 Baupläne |
| mensch.fahrzeug.gestalt | #1 | 3 Fahrzeug-Typen (Akte 22.11.; w28-fahrzeug-gattung landete heute, nicht nachgemessen) |
| mensch.fahrzeug.lenker | #1 | KEINE STATION gemessen |
| mensch.fahrzeug.maschine | #2 | keine Mühle, kein Wasserrad |
| mensch.nahrung.flur | #2 | 5 Äcker = 0,00091 km² statt ≈ 1 km² |
| mensch.nahrung.frucht | #1 (beansprucht w28-acker-kette) | wartet auf das Augen-Urteil (429 Pflanzen in Reihen) |
| mensch.nahrung.tier | #2 (beansprucht) | 0 Jäger, TAGES_GESETZ ohne Jagd |
| mensch.nahrung.erdbau | #1 | KEINE STATION (Kern 1) |
| mensch.nahrung.strom | #2 | 35 von 101 essen, kein Korb Feld → Teller |
| mensch.nahrung.hand | #3 | 2 am Acker um 10 Uhr (Soll 50) |
| mensch.nahrung.jenseits | #1 | 0 Gärten unter 31 Häusern |
| mensch.wirtschaft.stoffstrom | #1 | Esse schmilzt kein Erz, kein Barren (stamm/feld-leben.js:2499) |
| mensch.wirtschaft.beruf | #2 | 1 Handlung (pwalk) über 17 Rollen |
| mensch.wirtschaft.markt | #2 | Stand ohne Preis (stamm/bau-vorlagen.js:1128) |
| mensch.wirtschaft.handel | #2 | 0 Routen zwischen Orten |
| mensch.wirtschaft.technik | #2 | keine Technik, nur das Jahr des Plans (1238) |
| mensch.wirtschaft.energie | #1 | feuerK 1573 K konstant, frisst kein Holz (stamm/feld-leben.js:3121) |

Fast jede Front ist „Umfang nicht erzeugbar" oder „fehlender Leser" — es fehlt das Ding, nicht das Soll. Ausnahmen mit echtem Soll-Streit: verkehr#2/lenker#1 (VK-Linse), netz.gestalt#1, medium#2.

## (a) Referenz-Szenen

### Szene 1 — Der Knoten der Großstadt am Werktag (Mitteleuropa, heute, 7–9 Uhr)

Ort/Zeit im Erd-Samen: eine Hauptstraße mit vorfahrtgeregelten Knoten in einer mitteleuropäischen Großstadt, Epoche `moderne` (fachwerk-core.js:4371 `EPOCHEN.moderne`, Jahr 1935 ± 70), Werktag morgens. Die dichteste Datenlage aller Verkehrs-Zeiten.

| Größe | Wert (Spanne) | Quelle | URL |
|---|---|---|---|
| Sättigungsverkehrsstärke, Basis | 1 900 Pkw/h/Spur (Zeitlücke 1,9 s) | FHWA HPMS Manual, App. N (HCM-Gleichung) — gelesen | https://www.fhwa.dot.gov/ohim/hpmsmanl/appn5.cfm |
| IDM Wunsch-Zeitlücke T | 1,5 s | Wikipedia IDM (Kalibrierung nach Treiber) — gelesen | https://en.wikipedia.org/wiki/Intelligent_driver_model |
| IDM Mindestabstand s0 | 2 m | dto. — gelesen | dto. |
| IDM a / b / δ / v0 | 0,73 m/s² / 1,67 m/s² / 4 / 30 m/s | dto. — gelesen | dto. |
| Grenzzeitlücke t_c (HCM TWSC) | Hauptstrom links 4,1 s · Neben rechts 6,2 (6,9) · Neben gerade 6,5 · Neben links 7,1 (7,5) s | PTV Visum Hilfe, Tab. 105 — gelesen | https://cgi.ptvgroup.com/vision-help/VISUM_2024_ENG/Content/1_Benutzermodell%20IV/1_5_Vorfahrtsgeregelte%20Knoten.htm |
| Folgezeitlücke t_f | 2,2 / 3,3 / 4,0 / 3,5 s | dto., Tab. 106 — gelesen | dto. |
| Bremsweg 100 → 0, Faustformel | (v/10)² = 100 m normal, Gefahrenbremsung halbiert ≈ 50 m | ADAC — gelesen | https://www.adac.de/rund-ums-fahrzeug/tests/autotest/bremstest-kurzer-bremsweg/ |
| Bremsweg 100 → 0 gemessen | Ø 36,4 m aus > 500 Tests (31,3–47,8 m) | ADAC-Auswertung, Such-Auszug — ungeprüft | https://www.autohaus.de/index.php/nachrichten/autohersteller/adac-bremstest-die-entscheidenden-15-meter-3069027 |
| Stauwelle rückwärts | ≈ −15 km/h empirisch | arXiv nlin/0404018, Such-Auszug — ungeprüft | https://arxiv.org/pdf/nlin/0404018 |
| örtliche Sättigung | Ø 1 559 Fz/h/Spur (Washington DC) | DDOT-Bericht, Such-Auszug — ungeprüft | https://rosap.ntl.bts.gov/view/dot/54680/dot_54680_DS1.pdf |

Sprossen, die sie richtet: karte2.mensch.netz.verkehr#1 (halten), karte2.mensch.netz.verkehr#2, karte2.mensch.netz.verkehr#3, karte2.mensch.netz.verkehr#4, karte2.mensch.fahrzeug.lenker#1, karte2.mensch.fahrzeug.lenker#2, karte2.mensch.fahrzeug.medium#2.

Heute im Spiel:
- stamm/siedlung-verkehr.js:2536 `AnazhRealm.VERKEHR`: `abstandM 2.5` (fester Abstand, KEINE Zeitlücke), `tempoMs 8.3`, `bremsMs2 3.5`, `folgeM 40`, `stil.brems 0.4`. Bei 8,3 m/s und 2,5 m Abstand ist die Zeitlücke 0,3 s — außerhalb des Bands 1–3 s, das lenker#1 (Station) und verkehr#3 verlangen.
- fachwerk-core.js:5998 `VERKEHR_GESETZ` (hausJeWagen 15, Spur, Wende, Kreuzung `kreuzM 6`) — Geometrie, keine Vorfahrt-Rangfolge.
- fachwerk-core.js:5947 `WEGE_KLASSE` je Weg und stamm/siedlung-ort.js:3930 `WEGENETZ.entwurfKmh` (ortsdurchfahrt 50, wohnstrasse 30, gasse 25, feldweg 40; RASt 06 laut Kommentar, ungeprüft) — die Rangfolge der Wege steht schon, kein Knoten liest sie als Vorfahrt.
- vehicle-core.js:5357 `FLOTTE` (Pkw-Bestand nach Segment) — modern, passt zu dieser Szene.
- Messort `stadt-voll` (spec/profiband/haushalt.json:320, „dorf 7 300", Anker 836/438) trägt die Szene als Geometrie; sein Plan steht aber im Jahr 1238 (front-tafel technik#2) — Pkw im Jahr 1238.

Was fehlt: die Folge mit Zeitlücke (IDM s* = s0 + v·T + v·Δv/(2√(ab))); die Vorfahrt am Knoten nach Rang (Nebenstrom fährt nur in eine Lücke ≥ t_c, Folger nach t_f) — damit wird der Warte-Graph an jedem Knoten eine Rangfolge ohne Kreis; keine Ampel in der Szene (Station verkehr#3: „0 Ampeln"); kein Erd-Samen, keine Epoche am Messort wählbar.

Wo das Gesetz lebt: stamm/siedlung-verkehr.js (Folge, `_verkehrVorrang`, Warte-Graph `W.wartet`), Konstanten in fachwerk-core.js `VERKEHR_GESETZ` (Kern, additiv).

ERSTE WELLE (sichtbar: der Knoten fließt): EIN Schnitt „Folge und Vorfahrt aus EINEM Gesetz" — `VERKEHR_GESETZ` bekommt additiv `T 1,5 s, s0 2 m, a, b, tc[], tf[]` (IDM + HCM), der feste `abstandM` stirbt als Folge-Abstand, und jeder Knoten ordnet seine Zuläufe nach `WEGE_KLASSE` (gleicher Rang: rechts vor links); ein Wagen des niederen Rangs fährt nur in eine Lücke ≥ t_c. Dateien: fachwerk-core.js, stamm/siedlung-verkehr.js. Erwartet an der Front: karte2.mensch.netz.verkehr#2 und karte2.mensch.fahrzeug.lenker#1 (2), verkehr#1 hält. Ehrlich: lenker#1 trägt an der Station zusätzlich „Reisetempo ÷ erlaubtes ≥ 0,8" (nicht in der Karte, siehe Richter 10) — reißt es, bleibt 1. Stunden ≈ 7. Bildpaar: stadt-voll, Third 25 m über dem Knoten des Warte-Kreises 8>9 um 10 Uhr — vorher zwei Wagen Bug an Bug mit Reihe dahinter, nachher der Nebenstrom wartet am Rand, der Hauptstrom fährt.

### Szene 2 — London um 1900: die Pferde-Großstadt (Werktag)

Ort/Zeit: London (oder jede Großstadt Mitteleuropas) um 1900, Epoche `gruenderzeit` (fachwerk-core.js:4371, Jahr 1860 ± 60, Pool viktorianisch/georgian). Die datenreichste Zeit für das Tier im Dienst der Stadt und für die Gestalt-Breite der Fahrzeuge (fünf Gattungen zugleich auf einer Straße).

| Größe | Wert | Quelle | URL |
|---|---|---|---|
| Pferde in der Personenbeförderung, London 1900 | > 50 000 täglich | Historic UK — gelesen | https://www.historic-uk.com/HistoryUK/HistoryofBritain/Great-Horse-Manure-Crisis-of-1894 |
| Hansom cabs, London 1900 | > 11 000 | dto. — gelesen | dto. |
| Omnibusse | „several thousand", je Bus 12 Pferde am Tag | dto. — gelesen | dto. |
| Mist je Pferd und Tag | 15–35 lb (6,8–15,9 kg) | dto. — gelesen | dto. |
| Harn je Pferd und Tag | ≈ 2 pints (≈ 1,1 l) | dto. — gelesen | dto. |
| New York um 1900 | 100 000 Pferde, ≈ 2,5 Mio lb Mist je Tag | dto. — gelesen | dto. |
| Zugkraft eines Zugpferds im Dauerzug | 5–20 % des Körpergewichts (Versuchsstufen) | Potard, Leith, Fedde 1998, J Appl Physiol, Such-Auszug — ungeprüft | https://madbarn.com/research/force-speed-and-oxygen-consumption-in-thoroughbred-and-draft-horses |
| Daumenregel totes Gewicht | ≈ 1/10 des Körpergewichts | populär, Such-Auszug — ungeprüft | https://a-z-animals.com/blog/how-much-weight-can-a-horse-carry-and-pull/ |

Sprossen: karte2.mensch.fahrzeug.gestalt#1 (5 Gattungen: Hansom, Omnibus, Fuhrwerk/Leiterwagen, Kutsche, Motorwagen), karte2.mensch.fahrzeug.gestalt#2 (Epoche ± 1 Jh., Silhouette gegen Museumsfoto), karte2.mensch.wirtschaft.handel#2 (Fuhrwerke zwischen Orten), karte2.mensch.netz.verkehr#2 (derselbe Richter, epochenfrei), karte2.mensch.netz.stoffwechsel#1 (Gaslaterne an einer Leitung — die Szene passt, Zahl nicht gelesen).

Heute im Spiel:
- vehicle-core.js:5416 `EPOCHE_GESETZ`: schlitten −5000, ochsenkarren −3000, kutsche 1700 (4 Tiere, kraftN 800, 1 100 W, vGang 7 m/s), motorwagen 1900, heute 2025, zukunft 2150 — die Zeit-Achse steht als Gestalt.
- vehicle-core.js (PRESETS) „Leiterwagen" mit `antrieb: zugtier` — `FLOTTE` gibt ihm 0.
- stamm/siedlung-verkehr.js:391 `flotte(von.slots.length, seed)` — liest kein Jahr: die Stadt im Jahr 1238 fährt kompakt_fwd/suv/limousine.
- Kein Erd-Samen: Grep nach erdSaat/Erd-Samen in stamm/ und den Kernen 0 Treffer; kein Messort mit gewählter Epoche.

Was fehlt: `flotte(n, same, jahr)` aus der Stufe des `EPOCHE_GESETZ`; Omnibus und Hansom als Rezepte; das Zugtier als Leib an der Deichsel (heute Antrieb als Zahl); ein Messort in der Epoche gruenderzeit.

Wo es lebt: vehicle-core.js (`FLOTTE`, `flotte`, `EPOCHE_GESETZ`), Leser stamm/siedlung-verkehr.js:391.

ERSTE WELLE (die sichtbarste der Gruppe): „Die Flotte liest das Jahr des Plans" — `FLOTTE` wird je Stufe des `EPOCHE_GESETZ` eine Zeile (die Zugtier-Stufen tragen Leiterwagen, Ochsenkarren, Kutsche), `flotte` nimmt das Jahr des Plans; die Stadt am Messort stadt-voll (1238) fährt Ochsenkarren und Leiterwagen. Dateien: vehicle-core.js (additiv), stamm/siedlung-verkehr.js:391. Erwartet an der Front: 0 durch Zahl — gestalt#1 bucht erst mit dem Augen-Urteil (Blindpaar), wie frucht#1; der Gewinn ist das Bild, und das Anachronismus-Bild fällt. Stunden ≈ 8. Bildpaar: stadt-voll, 12 m vor dem nächsten Wagen, 2 m Höhe (die Pose der Station gestalt#1) — vorher SUV vor Fachwerk 1238, nachher Ochsenkarren.

### Szene 3 — Ein englisches Gutsdorf um 1300 (Winchester-Güter), Erntezeit August

Ort/Zeit: Südengland 1270–1350, die Zeit mit ≈ 30 000 überlieferten Ertrags-Beobachtungen aus Gutsrechnungen — und der Nachbar des Jahrs, in dem der Plan des Messorts heute schon steht (1238; fachwerk-core.js:4371 `EPOCHEN.mittelalter` Jahr 1320 ± 90). Die dichteste Szene meiner Gruppe: Flur, Frucht, Hand, Mühle, Rennofen, Markt in einem Dorf.

| Größe | Wert | Quelle | URL |
|---|---|---|---|
| Ertrags-Datenbank | 1211–1491, dicht 1270–1430, ≈ 30 000 Beobachtungen, frei nutzbar mit Zitat (© B. M. S. Campbell) | BAHS Medieval Crop Yields Database — gelesen | https://www.bahs.org.uk/crop-yields-database/ |
| Mühlen 1086 | ≈ 6 027 (davon 4 845 bewertet) | Domesday-Auszählung, windmillworld — gelesen | https://windmillworld.com/watermills/domesday.htm |
| Orte mit Mühle | 4 185 von 19 970 (≈ 21 %; 1,44 Mühlen je Mühlenort, eigene Rechnung) | dto. — gelesen | dto. |
| Rennofen-Ausbeute | 15 kg Erz → 1,5 kg Luppe (10 % der Erzmasse) | Wealden Iron Research Group — gelesen | https://www.wealdeniron.org.uk/experimental-bloomery-ironmaking/exp-bloom/ |
| Ausbeute vom verfügbaren Eisen | ≈ 26 % (5,77 kg verfügbar) | dto. — gelesen | dto. |
| Saat-Ertrag-Verhältnis Weizen | ≈ 4 (Winchester 1283–1349, ≈ 385 kg/ha netto) | Titow 1972 über Such-Auszug — ungeprüft | https://www.nuff.ox.ac.uk/economics/history/Paper90/schneider90.pdf |
| Aussaat Weizen | 2–2,5 bushel/acre | Oseney-Güter 1274–1348, Such-Auszug — ungeprüft | https://www.oxoniensia.org/volumes/1979/postles.pdf |
| Holzkohle : Erz | ≈ 1 : 1 nach Masse | Wikipedia Bloomery, Such-Auszug — ungeprüft | https://en.wikipedia.org/wiki/Bloomery |
| Winterweizen heute (Kontrast) | 72,8 dt/ha (DE 2023) | Destatis-Tabelle, Such-Auszug — ungeprüft | https://destatis.de/EN/Press/2023/05/PE23_197_412.html |

Sprossen: karte2.mensch.wirtschaft.stoffstrom#1, karte2.mensch.wirtschaft.energie#1, karte2.mensch.wirtschaft.energie#2, karte2.mensch.fahrzeug.maschine#2, karte2.mensch.nahrung.flur#2, karte2.mensch.nahrung.frucht#1, karte2.mensch.nahrung.frucht#2, karte2.mensch.nahrung.hand#3, karte2.mensch.nahrung.strom#1, karte2.mensch.nahrung.strom#2, karte2.mensch.wirtschaft.markt#2, karte2.mensch.wirtschaft.beruf#2, karte2.mensch.nahrung.jenseits#1, karte2.mensch.nahrung.tier#2.

Heute im Spiel:
- schmiede-core.js:2862 `STOFF_GESETZ` (T_schmelz je Stoff) und das TECHNIK-Gesetz in fachwerk-core.js (nach :4385; Vorkommen aus Rudnick & Gao 2003 · McKelvey 1960) — die Quelle für Erz am Ort steht.
- stamm/feld-leben.js:2499 die Esse wärmt den gehaltenen Stahl, schmilzt kein Erz; :3121 `feuerK 1573 K` konstant, frisst kein Holz.
- stamm/koerper-leib.js:3106 das Rad eines Werks dreht im Leerlauf ohne Quelle.
- fachwerk-core.js:4699–4714 1–2 Äcker je Feldweg-Ende (0,00091 km²); stamm/siedlung-wege.js:1621 als Fleck gemalt.
- koerper-core.js:5300 `TAGES_GESETZ` ohne Jagd; stamm/bau-vorlagen.js:1128 Marktstand ohne Preis.

Was fehlt: Halde, Holzstapel und Barren als Bestände mit EINEM Schreiber; Mühle/Wasserrad an einer Quelle (der Wasser-Automat steht); eine Flur in Gewannen; Preis und Bestand am Stand.

ERSTE WELLE: „Der Rennofen frisst Holz und gibt Luppe" — die Esse der Schmiede wird ein Ofen mit zwei Beständen (Erz-Halde aus dem TECHNIK-Vorkommen, Holzkohle-Stapel), je Schmelze sinken beide, die Luppe ist 10 % der Erzmasse (Wealden), ohne Brennstoff fällt `feuerK` und kein Barren entsteht; T_schmelz liest STOFF_GESETZ (nur lesen). Dateien: stamm/feld-leben.js (Esse, feuerK), fachwerk-core.js (Halde und Stapel am Los der Schmiede, additiv). Erwartet an der Front: karte2.mensch.wirtschaft.stoffstrom#1 und karte2.mensch.wirtschaft.energie#1 (2) — beide Stationen urteilen „fehlender Leser", derselbe Leser schließt beide; stoffstrom#1 braucht zusätzlich „Werkzeug in der Hand" im Zeitraffer. Stunden ≈ 7. Bildpaar: 6 m diagonal vor der ersten Schmiede, Ego 1,7 m (Pose der Station stoffstrom#4), Zeitraffer Tag 0 ↔ Tag 7: Halde und Holzstapel kleiner, Barren am Ofen.

## (b) Richter-Urteil

| # | Richter (Ort) | Soll wörtlich | Herkunft | Urteil | Grund |
|---|---|---|---|---|---|
| 1 | VK Warte-Kreis (scripts/diag-fahr-leben.cjs:1028) | „ein Kreis, der länger als `leibS` steht, ist der Stau beim Namen" (leibS 20 s) | gesetz (ein Kreis im Warte-Graphen ist ein Deadlock; die 20 s erfunden) | bleibt | fand einen echten Spiel-Fehler (8>9): Wagen stehen ewig — die Vorfahrt-Rangfolge der Szene 1 löst ihn an der Wurzel. |
| 2 | VK Frist (:1062, VERKEHR.fristS) | „Fahrt ${laengsteS} s > 300 s" | erfunden | band | die Frist wird Route ÷ Entwurfs-Tempo plus Knoten × t_f (HCM) — 668 s ist dann Folge des Kreises, keine eigene Schwelle. |
| 3 | VK ohne Ziel (:1057) | „ohne Ziel erreicht: Wagen …" (Soll: keiner) | gesetz (Karte verkehr#2: 100 % am Ziel) | bleibt | die Karte verlangt es wörtlich; 13 Wagen ohne Ziel sind die Folge des Kreises. |
| 4 | VK Arbeit (:1106, ARBEIT.paare 0,25) | „geprüfte Wagen je Blick (Soll ≤ 0,25 × Soll der Wagen)" = ≤ 5,25 | erfunden | nur-bericht | ein Zähl-Ersatz für Kosten ohne Bildzeit; die Kosten urteilt das Profi-Band in ms — 7,24 hält heute eine Landung, ohne dass ein Bild langsamer wurde. |
| 5 | VK Warte-Graph-Tiefe (:1107, ARBEIT.kreis 12) | „Schritte je Suche (Soll ≤ 12)" | erfunden | nur-bericht | Kosten-Ersatz wie 4. |
| 6 | VK Bild-Ruck (:1037, ruckM 0,15) | „das Bild springt … (Soll ≤ 0,15 m)" | erfunden | bleibt | fand einen echten Bildfehler (0,478 m Sim-Lage im Bild, gleitend 0,107 m). |
| 7 | VK Ohr (:1038–1039, ohrK 4, ohrMs 0,35) | „Stimmen ≤ 4", „Fahrt-Stimme ≤ 0,35 ms" | erfunden | nur-bericht | nicht Teil der Karte verkehr#2; gehört an die Klang-Leiter. |
| 8 | VK fahrend je Minute (:1021, weg60M 30) | „in jeder vollen Minute fährt jeder ≥ 30 m" | erfunden | band | das ist der Messname für „0 Stillstand" der Karte; die Schwelle wird aus IDM/HCM: steht nur, wer auf eine Lücke ≥ t_c oder einen Vordermann wartet. |
| 9 | Station karte2.mensch.netz.verkehr#1 (g5.js, nach :6359) | „Route ≥ 2000 m … auf dem Netz ≥ 95 % … angekommen … Steckenbleiber 0" | erfunden (Karten-Zahl), Steckenbleiber = Spiel-Fehler | bleibt | heute ROT an main und Kopf (2 311 von 2 396 m) — ein echter Steckenbleiber, die gebuchte Sprosse wackelt. |
| 10 | Station lenker#1 (k2-mensch-fahrzeug.js:883) | „Reisetempo ÷ erlaubtes ≥ 0,8" | erfunden (die Karte lenker#1 sagt nur „0 Kollisionen, 0 Stillstände ohne Anlass") | faellt | Scope-Zusatz über der Karte; städtische Reisetempi liegen wegen Knoten weit unter dem Entwurfs-Tempo. |
| 11 | Station lenker#1 (k2-mensch-fahrzeug.js:882) | „Zeitlücke zum Vorderen im Median in s, von 1 bis 3" | aussen (IDM T 1,5 s, HCM 1,9 s) — aber das Band gehört der Karte lenker#2 | band | das Band trägt, nur an der falschen Sprosse: heute 0,3 s aus `abstandM 2,5` — die Szene-1-Welle bringt es in das Band. |
| 12 | Station medium#2 (k2-mensch-fahrzeug.js:567–573) | „Bremsweg 100 → 0 in 30–50 m", „50 → 0 in 7,5–12,5 m" | aussen (ADAC Faustformel 50 m Gefahrenbremsung gelesen; Ø 36,4 m ungeprüft) | band | das Band hält gegen die Profis; es fand Bremswege von 0 m in einem Rezept — einen echten Fehler. |
| — | Station netz.gestalt#1 (k2-mensch-netz.js:240) | „Gefälle p95 % ≤ 9,5" | unklar (wohl Straßenbau-Norm, nicht gelesen) | bleibt | fand 30 % Gefälle an der Stadt des Messorts — ein echter Trassen-Fehler. |
| — | Station flur#2 (k2-mensch-nahrung.js:690) | „Feldgrößen-Verteilung KS ≤ 0,25, Blindurteil ≤ 65 %" | aussen gemeint, ohne genannten Datensatz | band | der Vergleichs-Datensatz (Kataster/Luftbild einer Gewannflur) fehlt in der Station; BAHS gibt Erträge, keine Feldgrößen. |

## (c) Widerspruch — wo die These in meiner Gruppe nicht trägt

1. Das heutige Verkehrs-ROT ist kein Eich-Problem. Warte-Kreis, Steckenbleiber und 30 %-Trasse sind Logik- und Geometrie-Fehler; keine Referenz-Szene löst einen Deadlock. Die Profis liefern hier das GESETZ (Vorfahrt-Rangfolge, Zeitlücke), nicht ein Band für eine Linse — die These trägt nur in dieser Lesart.
2. Fast alle Fronten der Gruppe stehen auf „fehlender Leser" oder „Umfang nicht erzeugbar" (Mühle 0, Preis 0, Jäger 0, Garten 0, Technik 0, Linie 0, Leitung 0). Ein Band aus Domesday oder BAHS baut keine Mühle; dort fehlt das Ding, nicht das Soll.
3. Den Erd-Samen gibt es im Code nicht (Grep 0 in stamm/ und Kernen); die Messorte sitzen in „dorf 7 300" mit Plan-Jahr 1238. „Nach London 1900 gehen" ist erst ein Fundament (Gelände, Plan, Epoche am Messort), dann eine Szene. Billiger und sofort: die Epoche des bestehenden Messorts ehrlich lesen (EPOCHEN und EPOCHE_GESETZ stehen).
4. Die datenreiche Verkehrs-Zeit (heute: HCM, IDM, ADAC) widerspricht dem Jahr des Messorts (1238); die Zeit des Messorts ist für Verkehr datenarm. Eine Szene kann nicht beides eichen.
5. Maßstab: die Daten von London 1900 (50 000 Pferde) liegen auf Sprosse 5–6; die Front verlangt 10 Wagen. An der Front zählt die Logik, nicht die Kalibrierung.
6. Viele Sprossen der Gruppe urteilt das Blindpanel (≤ 65 %, ≥ 80 % erkannt: flur#2, frucht#1, hand#3, strom#2, beruf#2, jenseits#1, gestalt#1). Ein Referenzfoto ersetzt das Panel (R11) nicht; ohne Panel bucht keine dieser Szenen diese Sprossen.
7. Die Kosten-Schwellen (Arbeit, Warte-Graph-Tiefe, Sim-Takt) messen Gebot 7, nicht die Wirklichkeit — dafür gibt es keine Referenz; sie gehören ans Profi-Band (ms), nicht an eine Szene.

## (d) Nicht gelesen

stamm/koerper-fahrt.js (nur die Zeilen-Zitate der Karte); worlds/garage (nur die Dateiliste); vehicle-core.js `exportDrive`/`fahrSchritt` (Physik, Bremsweg 0 m nicht ursächlich geprüft); proben-welt.cjs `fahrWegenetz` und fahr-proben (wie der Warte-Graph gezählt wird); die Mess-Akten (messung/*.json) — die VK-Zahlen stammen aus dem Brief; die Stationen k2-* nur per Grep und Auszug; FUND-REGISTER und offen-ernte; der heute gelandete Zweig w28-fahrzeug-gattung (kann gestalt#1 schon ändern); HCM selbst, BASt-Ganglinien (keine Zahl gefunden), Straßen-Tempo London 1900 (nicht gefunden), Potard 1998 (nicht geöffnet), TU-Delft-Kapitel Fundamentaldiagramm (PDF unlesbar), Feldgrößen einer realen Gewannflur (kein Datensatz gefunden).
