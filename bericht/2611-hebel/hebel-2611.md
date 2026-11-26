# HEBEL-TAFEL der Meisterkarte 2 — 26.11., Stand Akten ft/ (front-tafel.cjs alle 400), main 54b89949

**Zahlen:** 292 Fronten (72 KEINE STATION · 72 SONST · 66 BÜHNE Umfang · 27 SPIEL Leser fehlt · 12 FERN · 10 BÜHNE Spieler · 9 Menge · 8 Kosmos · 8 Saaten · 5 PROBE · 2 NAH · 1 TEIL). 220 tragen eine Akte; **106 davon stehen am Kopf 31ea3847
(20./21.11., 1 596 Commits hinter main)**; bei 138 von 220 ist eine in der Akte genannte Täter-Datei seit dem Akten-Kopf auf main geändert.
**tiefe+:** die Tafel nennt 15 — 9 davon sind GEBUCHTE Glieder (glieder-Leitern gegenwart #2/#6, land-meer-luft #3/#4 zählt das Werkzeug als „grün hinter der Front“). Echt wartend: 6 (geologie.platten#2, geologie.gebirge#2, pflanzen.biome#3,
stadt.form#3, nahrung.erdbau#2, sinne.gesehen#2).
**Ansprüche:** zug/anspruch.txt liegt nicht im ft-Ordner — beanspruchte Fronten sind hier NICHT markiert (vor jedem Brief lesen).
**Maß:** S = ein Kopf 2–4 h (1) · M = ein Tag (2) · L = mehrere Tage (4). HEBEL = (Fronten + echte tiefe+) ÷ Größe. Zeilen in (a) sind die der Akte (am Akten-Kopf); „main:“ = heute geprüft per git grep.

## 0. Vor jedem Macher: die Neumessung (kein Macher, Hebel unendlich) — Liste (iii) unten
Sechs Fronten tragen am main schon eine gelandete Zahl im Soll, die Akte ist älter: sinne.gesehen#1 (+ #2 grün dahinter), klang.stimme#1, kosmos.systeme#1, kopplung.leib#1, kopplung.kultur#2, wirtschaft.stoffstrom#1 → bis 7 Sprossen aus EINER Runde.

## 1. Die Fähigkeiten, sortiert nach Hebel

| # | Fähigkeit | Fronten | tiefe+ | Größe | Hebel |
|---|---|---|---|---|---|
| 1 | Frei-Löser kennt Luft und Ruhe | 3 | 0 | S | 3,0 |
| 2 | Tagesplan trägt Fest, Spiel, Kultbau, Jagd | 6 | 0 | M | 3,0 |
| 3 | Region jenseits der geladenen Siedlung | 9 | 1 | L | 2,5 |
| 4 | Sonderbauten der Stadt-Grammatik | 5 | 0 | M | 2,5 |
| 5 | Himmel als Katalog | 5 | 0 | M | 2,5 |
| 6 | Humanoid-Genom liest Jahr und Breite | 2 | 0 | S | 2,0 |
| 7 | Gegenwart aus der Geschichte des Orts | 2 | 0 | S | 2,0 |
| 8–13 | Wind-Feld · Klang-Quellen · Herde als Individuen · Feld und Handlung · Bewohner als Zeuge · Sport und Abendspiel | 4·4·4·4·8·8 | 0 | M·M·M·M·L·L | 2,0 |
| 14–25 | Planet-Faden je Saat · Kultur-Vielfalt · Spieler-Sinne · Brand · Verkehr · Öko-Stoffe · Kamera/Zeit · Zwei Geräte · Licht-Stetigkeit · Wasserspiegel · Klima-Rest · Höhenstufe | 6·6·6·3·3·3·3·3·3·3·3·2 | 1 (Höhenstufe) | L·L·L·M… | 1,5 |
| 26–29 | Ware · Schicht · Arten-Breite · Technik-Baum | 5 je | 0 | L | 1,25 |
| 30–34 | Preis · Raffer · Magnetfeld · Relief-Ereignis · Wetter-Druckfeld | 4·4·2·3·1 | 0 | L·L·M·L·M | 1,0–0,5 |

**1 · FREI-LÖSER KENNT LUFT UND RUHE (S, Hebel 3,0).** (a) stamm/koerper-frei.js:421 `_freiSchritt` „der Löser kennt keine Luft“ (main :479); Fass „Aufprall 0.9 s, Schlaf 3.183 s“ — Verdacht: dieselbe Ruhe-Schwelle im Löser; 5-mm-Körper Verdacht
Luft. (b)(d) `karte2.same.physik.flug#1` Feder ±10 % (ist 2 260 %, Stein 7,96 % ✓) · `karte2.same.physik.koerper#1` Ruhe ≤ 2 s (ist 2,283) · `karte2.same.massstab.physik#2` Endgeschwindigkeit 5-mm-Körper ±20 % gegen ~6 m/s (Bühne: Werke spannen 1,08
statt 3 Größenordnungen). (c) 0. (e) S: ein Widerstands-Term c_w·A·v² im einen Löser, zwei Zahlen am Fass — ein Kopf.

**2 · TAGESPLAN TRÄGT FEST, SPIEL, KULTBAU, JAGD (M, 3,0).** (a) koerper-core.js:5326 tagesPlan „schlaf · morgen · besuch · arbeit · mittag · abend“, koerper-core.js:5300 „TAGES_GESETZ trägt keine Rolle, die jagt oder fischt“, glaube#1 „kennt keinen
Gang in den Kultbau und keinen Festtag“ (main: TAGES_GESETZ koerper-core.js:5375, tagesPlan liest heute nass/krank). (b)(d) `karte2.mensch.kopplung.sport#1` Anteil im Spiel 5–15 % (0 %) · `karte2.mensch.kopplung.sport#2` Partien bei Regen ↓ ≥ 50 %,
Eis nur < 0 °C (ungemessen) · `karte2.mensch.kultur.glaube#1` ≥ 30 % im Kultbau, Festtag ≥ 3× Werktag (0; 1) · `karte2.mensch.kopplung.kultur#3` ≥ 80 % der Feste auf einem Ereignis der Saat (Leiter warf nach 20 s, s. i) · `karte2.mensch.geist.tag#2`
ATUS ≤ 0,2 je Hauptkategorie (1; 12 von 17 leer) · `karte2.mensch.nahrung.tier#2` ≥ 1 Jagd je Tag, Wildbestand sinkt (0 Jäger). (c) 0. (e) M: neue Akte + Kalender im EINEN Gesetz, ihre Orte stehen (Kultbau, Platz); Jagd braucht den Bestand-Leser.

**3 · REGION JENSEITS DER GELADENEN SIEDLUNG (L, 2,5).** (a) stamm/siedlung-ort.js _autoSettlementFindSite „Anker am Zell-Hash“, „die Wand des Rang-Gesetzes 500“, _wegenetzLegen „Netz nur zwischen geladenen Orten“ (main :1882, :3572); stadt.form#2
„dorf 7 9310 steht erst nach ~154 s, über dem Deckel von 60 s“. (b)(d) `karte2.mensch.geist.absicht#3` 10⁴ Bewohner, Ziele ≥ 0,3 (1 213) · `karte2.mensch.stadt.form#2` Blindtest Lage/Wohlstand ≥ 70 % an 10⁴ Häusern (307) ·
`karte2.mensch.wirtschaft.handel#2` 10 Routen ≤ 10 % teurer als billigste (0) · `karte2.mensch.stadt.siedlungsnetz#2` Nachtbild aus 100 km, Verwechslung ≥ 30 % (Orte bis 0,01 km) · `karte2.planet.kopplung.siedlungslage#3` Furt/Terrasse/Küste ≥ 80 %
(32,3 %), Gegenlauf ≤ 30 % (32,6 %) · `karte2.planet.kopplung.siedlungslage#4` Steigung ≤ Grenze ≥ 95 % (79,7 %), Pass verlegt ≥ 80 % · `karte2.mensch.macht.wehrbau#4` 100 Burgen je 10⁴ km² (1) · `karte2.mensch.kultur.diffusion#1` Grenzstreifen ≥ 30
% gemischt (1 Kultur binnen 2 km) · `karte2.mensch.menge.dichte#3` v(ρ) ± 15 % Weidmann, 1 000 Gehende (109, größte Dichte 0,71 P/m²). (c) 1 (stadt.form#3). (e) L: Orte als Funktion über die Region (Rang, Lage, Netz) plus Ankunft unter 60 s — mehrere
Tage.

**4 · SONDERBAUTEN DER STADT-GRAMMATIK (M, 2,5).** (a) fachwerk-core STADT_GRAMMATIK / Sonderbau-Gesetz: „keine Architektur mit Rad oder Segel (338 Häuser, Rollen 20)“, „das Rad eines Werks dreht im Leerlauf ohne Quelle, stamm/koerper-leib.js:3106“,
„kirchhof … keine Tafel mit Schrift“, „der höchste Turm trägt 23 Geschosse“, „0 mehr als 2 m unter dem Grund“. (b)(d) `karte2.mensch.wirtschaft.energie#2` Flaute ↔ Wind: Mühle steht ↔ dreht (0 Mühlen) · `karte2.mensch.fahrzeug.maschine#2` ≥ 90 %
arbeiten nur bei Quelle, 50 Saaten (0) · `karte2.mensch.kultur.schrift#2` OCR ≥ 80 % an 500 Grabsteinen (32 Lose, 0 Tafeln) · `karte2.mensch.stadt.vertikal#2` ≥ 100 m, 30 Geschosse (23 / 73,66 m) · `karte2.mensch.stadt.habitat#1` 10² Bewohner unter
der Erde, 3 Lebenslinien (0). (c) 0. (e) M: Mühle + Grabtafel + Turmhöhe sind Zeilen der Grammatik mit Leser; habitat#1 allein wäre L.

**5 · HIMMEL ALS KATALOG (M, 2,5).** (a) stamm/bild-himmel.js:465 „0 Sterne bis mag 6 im Feld (aMag)“, :312 Wandelsterne fest; welt-licht.js:989 himmelSicht „kein Meteor je Stunde“; stamm/dirigent-ankunft.js:340 „Mondscheibe Kugel [16,16] ohne
Karte“; welt-licht.js:691 „die Sonne trägt kein Alter: e0(staerke)“, Reise bis +1 Ga (stamm/feld-leben.js:1278). (b)(d) `karte2.planet.kosmos.sternhimmel#2` Zählkurve ±10 % gegen Bright-Star, ~9 000 bis mag 6 (0) · `karte2.planet.kosmos.galaxien#1`
Heimatgalaxie Richtung/Größe ±5 % (0 Galaxien, kein Band) · `karte2.planet.kosmos.ereignisse#1` 5–10 Meteore je Stunde (0) · `karte2.erleben.spieler.forscher#1` Krater Fernrohr ↔ Anflug ≤ 1 % (keine Karte) · `karte2.planet.kosmos.sterne#1` +5 Ga:
Leuchtkraft +~50 % ±10 %. (c) 0. (e) M: ein Katalog-Gesetz (Helligkeit, Band, Meteor-Rate, Mondkarte) im Himmel-Kern; der Anflug an die Galaxie bleibt der L-Rest.

**6 · HUMANOID-GENOM LIEST JAHR UND BREITE (S, 2,0).** (a) stamm/koerper-leib.js _rollHumanoidGenome „kh aus dem Samen, kein Jahr“; „Hautton aus dem Samen, keine Breite“ (koerper-leib.js:44 skinTone, EIN Anker gelaende-chunks.js:680 _planetAnker);
main: koerper-leib.js:12. (b)(d) `karte2.mensch.kopplung.leib#5` Körpergröße ± 5 cm gegen reale Kurve (6,305 cm; Epoche 100 % ✓) · `karte2.mensch.kopplung.leib#2` 200 Saaten: Hautton ↔ Breite r ≥ 0,7 (Saaten 200 ✓, r ungemessen). (c) 0. (e) S: zwei
Eingänge des Genoms; die Station fährt schon 200 Saaten.

**7 · GEGENWART AUS DER GESCHICHTE DES ORTS (S, 2,0).** (a) stamm/vegetation-baum.js:1433 `_rockGeologyClass` „der Findling liest die Eis-Zeit des Planeten, ort.eis — nicht die Geschichte des Orts“; gelaende-core.js hoehe „das Relief der Welt ist
nicht der Planet am Ort“. (b)(d) `karte2.planet.kopplung.gegenwart#1` Ursache = 100 % (99,9 %) · `karte2.planet.kopplung.gegenwart#5` 1 000 Orte gleich (992; Beleg-Bild fiel: Vordergrund 28,1 %). (c) 0 echt (Tafel 3 = gebuchte Glieder). (e) S: zwei
Rest-Prozent an benannter Zeile.

**8 · DAS EINE WIND-FELD WIRD GELESEN (M, 2,0).** (a) stamm/stoff-material.js `_windAt` (main :370): „die Böe wandert mit ω/k, nicht mit dem Wind“, „liest keine Häuser“, „der Kreatur-Takt rief _windAt … 0×“ (stamm/kreatur-furcht.js:119), „Tuch-Löser
trägt nur das Tuch am Leib (stamm/koerper-fahrt.js:160)“. (b)(d) `karte2.leben.pflanzen.kraft#2` Laufzeit ±20 % (23,741 %) · `karte2.planet.kopplung.stadtklima#1` Pfütze trocknet im Schatten später (0; Wind ±20° ✓ 1,976°) ·
`karte2.erleben.kopplung.wahrnehmung#2` Beute mit Wind-Wahl überlebt ≥ 1,5× · `karte2.same.physik.verformung#2` Fahne ↔ Gras r ≥ 0,6, Durchhang unter 90 kg ±20 %. (c) 0. (e) M: vier Leser am einen Feld.

**9 · UMWELT-KLANG LIEST DIE QUELLEN DER WELT (M, 2,0).** (a) klang-core.js umweltMischung „die Regenstimme ohne Dachstoff“ (main :878); stamm/klang.js _umweltLageZwei „kein Ausbruch, kein Beben, keine Menge“; „keine Hufe, kein Dampf, kein
Verbrenner“; stamm/siedlung-verkehr.js:634 „0 Wagen“. (b)(d) `karte2.erleben.kopplung.klang#1` Regen je Dachstoff, r ≥ 0,9 (1 Klang) · `karte2.erleben.kopplung.klang#2` r ≥ 0,8 (0,6; Verzug ✓) · `karte2.erleben.kopplung.klang#4` 0 Anachronismen,
Epoche am Abgriff ≥ 80 % · `karte2.erleben.klang.landschaft#2` Bild ↔ Ohr ≥ 0,6, 20 Wagen (0). (c) 0. (e) M: die Mischung bekommt Dach, Menge, Epoche als Eingang.

**10 · HERDE ALS INDIVIDUEN ÜBER SPIELTAGE (M, 2,0).** (a) tetrapoda-core.js:289 VERHALTEN.herde.wurf „Herde 3–7“ (main :283 deer [3, 7]), stamm/kreatur-leben.js „ein Tier trägt nur bs“, wandern.leashBaseM „die Leine um den Anker“,
stamm/siedlung-wege.js _trittStufe „ein Gang tritt keine Fährte“. (b)(d) `karte2.leben.evolution.erbe#2` Herde ≥ 100, wiedererkannt ≥ 90 % (4; 0 %) · `karte2.leben.evolution.zivilisation#2` Gruppengröße ↑ mit Räubern über 100 Saaten (1) ·
`karte2.leben.tiere.wanderung#2` Streifgebiet ≥ 100 m über 1 Spieltag (10,985 m) · `karte2.leben.tiere.mensch#2` Spur → Tier ≤ 10 min ≥ 0,8 (0). (c) 0. (e) M; Verdacht: eine Wurzel (Wurf + Leine + Zeichen je Individuum).

**11 · FELD UND HANDLUNG JE BERUF (M, 2,0).** (a) koerper tagesHaltung „die Haltung folgt dem Akt des Tags, nicht dem Beruf“; „kein Leib liest ihr Können“ (stamm/siedlung-bewohner.js _bewohnerGemuet); fachwerk-core dorfLayout „1–2 Äcker je
Feldweg-Ende“. (b)(d) `karte2.mensch.wirtschaft.beruf#2` Beruf aus 1 Bild ≥ 80 % (1 Handlung bei 17 Rollen) · `karte2.mensch.nahrung.hand#3` 50 sichtbar bei Feldarbeit (2) · `karte2.mensch.sport.kunst#1` Blindtest Anfänger ↔ Meister ≥ 80 % ·
`karte2.mensch.nahrung.flur#2` Flur ≈ 1 km², KS ≤ 0,25 (0,00091 km²). (c) 0. (e) M.

**12 · DER BEWOHNER ALS ZEUGE: WAHRNEHMUNG → GEDÄCHTNIS → ANTWORT (L, 2,0).** (a) stamm/siedlung-bewohner.js `_bewohnerZeuge` (main :2604) „jeder Zeuge ≤ 25 m erinnert die Tat im selben Takt, kein Schreck wandert“, „die Wache weicht wie jeder Zeuge“,
`_bewohnerNahen` „kein Hieb, keine Deckung“; :2169 „Akte eines Orts {t, type}, kein Glied“; :1554 `_tickBewohner` (keine Äußerung); koerper-seele.js:379 „der Tod steht nur im Tagebuch“. (b)(d) `karte2.mensch.menge.kollektiv#2` Schreck-Front 3–8 m/s
(51,72), Flucht ≥ 0,9 (0,777) · `karte2.mensch.macht.recht#1` Antwort ≥ 0,8 von 20 (0; 3 Taten) · `karte2.mensch.macht.megastadt#1` Antwortzeit ∝ Weg ρ ≥ 0,7 (0 Streifen) · `karte2.mensch.macht.krieg#1` 20 Zweikämpfe, Treffer am Kreuz (0) ·
`karte2.erleben.sinn.tod#3` ≥ 80 % nennen Ort und Täter · `karte2.erleben.sinn.ziele#2` Blind-Spieler nennt ≥ 1 Ziel nach 60 min · `karte2.mensch.kopplung.leben#2` Missernte → ≥ 10 % ziehen um · `karte2.mensch.zeit.kausal#3` Kette ≥ 5 Glieder ≥ 95 %
(0 Akten). (c) 0. (e) L: Wache/Schreck = M, Gedächtnis + Frage = zweites M.

**13 · SPORT UND ABENDSPIEL (L, 2,0).** (a) koerper-core.js:5135 „kein Ballspiel, kein Gegner, keine Rolle Schiedsrichter“, :5126 „0 im Sport-Akt“, :5182 „treff, keinen Tisch mit Brett“ / „keine Bühne“; stamm/siedlung-bewohner.js:2283 „das Gemüt
liest keinen Spielstand“; fachwerk-core DORF „keine Sportstätte“, „kein Stadion“. (b)(d) `karte2.mensch.sport.regeln#2` Pfiffe ≥ 90 % in 20 Partien · `karte2.mensch.sport.mannschaft#2` Passquote ± 20 % · `karte2.mensch.sport.arena#2`
Lautstärke-Spitze ≤ 0,5 s nach dem Tor · `karte2.mensch.sport.koennen#3` Bestwert wächst mit N und Übung · `karte2.mensch.sport.geistspiel#2` Elo 800–2 000, ρ ≥ 0,6 · `karte2.mensch.kultur.erzaehlkunst#1` Lachen/Stille r ≥ 0,5 ·
`karte2.mensch.kopplung.sport#3` Cramérs V ≥ 0,3 · `karte2.mensch.kopplung.sport#4` Verkehr ≥ + 30 % auf Stadion-Trassen. (c) 0. (e) L: Ball-Simulation + Stätte + Publikum; setzt Fähigkeit 2 voraus.

**14 · DER PLANET-FADEN ANTWORTET JE SAAT GANZ (L, 1,5).** (a) voxel-worker.js:1429 „baut jeden Planeten mit PLANET_ERDE; planet-core.js:319 g der Saat ungelesen“; planet-core planetPlan „kein Stern-Typ“; planetOrt „weder Arten noch Medium“;
stamm/vegetation-baum.js:1482 „liest die geladene Welt“; gelaende-core.js:6107 Hydrosphäre nur für die Saat der Welt (voxel-worker.js:1997). (b)(d) `karte2.leben.evolution.fremde-physik#1` 50 Saaten je g (1) · `karte2.erleben.kopplung.wahrnehmung#6`
20 Paare ≥ 0,8 (0 Saaten mit Stern-Typ) · `karte2.erleben.kopplung.klang#5` 0 Anachronismen je Zeitalter · `karte2.erleben.kopplung.klang#6` 0 Waisen je Planet · `karte2.erleben.spieler.wegfindung#1` ≥ 0,9 an 50 Saaten (1 von 51 Adressen) ·
`karte2.same.kopplung.kohaerenz#1` 100 Saaten × 50 Punkte ≥ 95 % (nur Welt-Saat). (c) 0. (e) L: Faden-Antwort um g, Stern, Arten, Hydro je Saat; zwei Kerne.

**15 · KULTUR-VIELFALT (L, 1,5).** (a) „Kulturen an den Häusern (4 < 10)“; Namen „stamm/siedlung-bewohner.js, fachwerk-core ORTSNAME: Saaten der Namen 1“; „kein Schlüssel der Erde: Augusta Raurica 100 → Steinstadt“; fachwerk-core.js DORF „keine
Sprachgrenze“, „keine Kaskade Geologie → Kultur“. (b)(d) `karte2.mensch.kultur.gestalt#1` 10 Kulturen ≥ 80 % (4) · `karte2.mensch.kultur.bildkunst#2` ≥ 70 % (4) · `karte2.mensch.kultur.sprache#1` Namen ≥ 0,9 aus 2 Saaten (1) ·
`karte2.mensch.zeit.erde#1` Straßenachsen ≥ 70 % · `karte2.mensch.kopplung.kultur#4` Grenze folgt, ≥ 80 % · `karte2.mensch.kopplung.kultur#5` Kaskade alle ≠ (beide Leitern warfen nach 20 s, s. i). (c) 0. (e) L.

**16 · SPIELER-SINNE UND SEELE (L, 1,5).** (a) stamm/koerper-seele.js:1614 `_scentAt` „kein Leser des Spielers“; stamm/bild-sicht.js:2 nur RGB; stamm/klang.js:2 kein Echo; tetrapoda-core.js:62 / kreatur-verhalten.js:190 keine Marke;
koerper-fahrt.js:2744 `applyPlayerSoul`; koerper-seele.js:437 `_getSoulDef` „0 ohne Leib“. (b) `karte2.erleben.sinne.geruch#2` (Aas 100 m ≤ 90 s) · `karte2.erleben.sinne.sicht#1` (Kontrast ≥ 0,2) · `karte2.erleben.sinne.hoeren#1` (≤ 2× sehende Zeit)
· `karte2.erleben.sinne.signale#2` (≤ 15°) · `karte2.erleben.spieler.rolle#2` (≥ 0,9 an 30 Bewohnern) · `karte2.erleben.spieler.nichtleib#1` (≤ 5 %). (e) L.

**17–25 (je M, 1,5).** BRAND (stamm/feld-leben.js:3078 Zelle 16 m, stamm/feld-brand.js `_tickBrand`, `_brandEntfachen` 0 Zündungen): `karte2.same.physik.feuer#2` 2 000 Zellen, p95 ≤ 33 (45) · `karte2.same.kopplung.ereignis#2` p95 während 1 ha (42,69
ms) · `karte2.same.kopplung.gewalt#1` Brände im Faktor 3 der Real-Rate. — VERKEHR (vehicle-core.js:3474 exportDrive liest keine Saat, 5 Rezepte, stamm/siedlung-verkehr.js:27 nur Wagen an Wenden): `karte2.mensch.fahrzeug.form#2` (Kippgrenze ±15 %, 50
Pläne) · `karte2.mensch.fahrzeug.medium#2` (Bremsweg 30–50 m, 20 Saaten) · `karte2.mensch.netz.massenverkehr#1` (≥ 10 Bewohner je Stunde). — ÖKO-STOFFE (stamm/vegetation-wiese.js:2097 EIN Nährstoff, foundry-core.js:152 Trübe fest 0,47):
`karte2.leben.oeko.stoffe#2` · `karte2.leben.wasser.netz#2` (Blüte ±1 Monat) · `karte2.leben.oeko.partner#1` (r ≥ 0,5; 0,088). — KAMERA/ZEIT (stamm/dirigent-kern.js:1237 setCameraMode nur Ego/Third, stamm/feld-dsl.js:926 keine Zeitlupe,
stamm/koerper-bewegung.js:1759 `_loopCamera`): `karte2.erleben.bild.kamera#1` · `karte2.erleben.spieler.zeit#2` (Fallzeit ±5 %) · `karte2.same.massstab.spanne#1` (20 Saaten Steigflug). — ZWEI GERÄTE (stamm/netz-p2p.js, peers 0):
`karte2.erleben.schoepfen.teilen#2` · `karte2.erleben.schoepfen.gesetz#1` · `karte2.erleben.kopplung.geteilter-sinn#1`. — LICHT-STETIGKEIT (Verdacht drei Wurzeln): `karte2.planet.kosmos.himmelsmechanik#1` (Sprung ≤ 0,1 EV; 0,369) ·
`karte2.erleben.kopplung.bild#1` (≤ 5 %; 43,6 % bei 100 m) · `karte2.erleben.bild.nacht#1` (Schatten ≥ 3:1; 0,947). — WASSERSPIEGEL (gelaende-core.js:7728 atlasSpiegel „füllt nur den Rand 3×3“, gelaende-core.js:1569 Hub an der Krone gedeckelt,
state.waterLevel eine Zahl): `karte2.planet.wasser.kreislauf#2` (Grube ±0,1 m; 1 m) · `karte2.planet.wetter.extreme#1` (≥ 100 mm; 14,72) · `karte2.planet.kopplung.gegenwart#4` (Rias ≥ 95 %); dazu ohne Station same.physik.fluid#1 und nahrung.erdbau#1
(+1 tiefe). — KLIMA-REST (planet-core; Landung 95f7fea1 nennt „Rest-Täter die Hadley-Breite“): `karte2.planet.kopplung.bahn-klima#2` (≥ 2×; 1,944) · `karte2.same.kopplung.terraform#1` (Bilanz 1 ± 10 %; 0,853) ·
`karte2.planet.kopplung.land-meer-luft#2` (Rang ≥ 0,7; 0,137 — Verdacht neu, s. iii). — HÖHENSTUFE (phyto-core.js forestNische „keine Höhenstufe“, gelaende-core TEMPERATUR „0,11 K/m statt 0,0065“): `karte2.leben.pflanzen.biome#2` (≥ 90 %; 56,9 %; +1
tiefe) · `karte2.planet.wetter.klimazonen#2` (Schneegrenze 2 900 m ±20 %; 165,6 m — L-Rest).

**26–29 (je L, 1,25).** WARE (stamm/bau-vorlagen.js:1128 Stand ohne Preis, koerper-core.js:5269 tagesBindung „das Mahl ist ein Ort, keine Ware“, koerper-core.js:257 webe): `karte2.mensch.wirtschaft.markt#2` (Brot ≥ + 30 %) ·
`karte2.mensch.kopplung.kreislauf#1` (≥ 90 %; 0 %) · `karte2.mensch.kopplung.leib#3` (100 %; 0 %) · `karte2.mensch.nahrung.strom#2` (Korb verfolgt; 35 beim Mahl) · `karte2.mensch.kultur.strassenleben#1` (3 Lokale; 1). — SCHICHT („kein Leser
_bodenArtAt/_gesteinAt/_schichtAt“, stamm/vegetation-wiese.js:2362 `_terrainMaterialAt` „wechselt erst 12 m unter dem Grund“, fachwerk STILMODE, voxel-worker planetOrtAuftrag): `karte2.planet.kopplung.siedlungslage#2` (≥ 5 Leser; 0) ·
`karte2.planet.kopplung.siedlungslage#5` (≥ 90 %) · `karte2.planet.kopplung.ereignis-spur#1` (≥ 95 %) · `karte2.same.gedaechtnis.schicht#1` (≥ 3; 1) · `karte2.leben.evolution.fossil#1` (100 Funde; 0); ohne Station zeit.archiv#2,
geologie.lagerstaette#1, kopplung.kultur#1. — ARTEN-BREITE (tetrapoda-core.js:2072 4 Gattungen in 1 Ebene, FISCH_GESETZ starr/ohne Uhr, VERHALTEN.aktionen 3 Akte, stamm/koerper-leib.js `_buildCreatureGroup`): `karte2.leben.oeko.netz#2` ·
`karte2.leben.tiere.bewegung#2` · `karte2.leben.tiere.verhalten#2` (≥ 30 Akte; 3) · `karte2.leben.wasser.rhythmen#2` (Hub ≥ 200 m; 0,001) · `karte2.leben.evolution.bauplan#1` (1 000 Genome; 20 im Deckel). — TECHNIK-BAUM (fachwerk-core.js:4168
epocheBei „kein Stand wächst aus Bevölkerung und Vernetzung“): `karte2.mensch.wirtschaft.technik#2` · `karte2.mensch.kultur.wissen#1` (r ≥ 0,5) · `karte2.mensch.zukunft.technik#1` (10 neue Dinge; 0) · `karte2.mensch.zukunft.maschinenwesen#1` ·
`karte2.mensch.zukunft.leib#1`.

**30–34 (1,0–0,5).** PREIS (L): `karte2.same.preis.speicher#1` (Heap ≤ 400; 537,6 MB, VRAM 140,2 ≤ 118) · `karte2.same.preis.ausdauer#1` (≤ 50 MB/min; 65,6) · `karte2.same.entfaltung.schirm#1` (gedrosselt, Skala 0,5) ·
`karte2.erleben.spieler.praesenz#1` (Taste→Bild ≤ 50 ms; ego 50,2, third 68,2). — RAFFER (L; stamm/netz-portal.js `_reiseBetreten` „kein Raffer am Ort“, planet-core.js:1883 kein CO₂ in Jahren, stamm/siedlung-wege.js `_trittErholen`):
`karte2.erleben.kopplung.klang#3` · `karte2.planet.zeit.klimageschichte#1` (+2 °C, +300 m) · `karte2.same.kopplung.zeitreise#3` (100 %; 25 %) · `karte2.same.gedaechtnis.pfad#2` (≥ 70 %; Welt-Uhr null Spieltage). — MAGNETFELD (M; „kein Magnetfeld in
Welt und Planet“, planet-core.js:9): `karte2.planet.geologie.inneres#1` (≤ 5°) · `karte2.erleben.sinne.feld#1`. — RELIEF-EREIGNIS (L; stamm/gelaende-chunks.js:2144 `_voxelSurfaceY` „kein Abtrag“, „_rutschung, _bergsturz fehlen“):
`karte2.planet.relief.wandel#1` · `karte2.planet.kopplung.kaskade#1` (20 Saaten; 0) · `karte2.planet.geologie.einschlag#1`. — WETTER-DRUCKFELD (M; phyto-core.js:4423 wetterAt „drei Sinus-Wellen“, Verdacht überholt durch w28-wetter-am-ort 24.11.):
`karte2.planet.wetter.lagen#2` (≥ 80 %; 0 %).

**Einzelne ohne Klasse (je eigene Wurzel laut Akte):** `karte2.mensch.menge.bevoelkerung#2` (≥ 20; 18 — S) · `karte2.erleben.schoepfen.schutz#2` (Korpus ≥ 100; 7 — S, nur spec/abnahme/ki-feind-korpus.json) · `karte2.mensch.sport.koerper#2` (Gleiten ≤
2 cm; 1 026 cm, 0 Untergründe) · `karte2.mensch.sport.medium#1` (Ski) · `karte2.mensch.netz.gestalt#1` (Gefälle p95 ≤ 9,5 %, 8 Saaten; 1) · `karte2.mensch.zeit.palimpsest#2` (≥ 0,9; 0,75) · `karte2.mensch.zeit.erleben#1` (≥ 50 %; 32 %, Asche 0) ·
`karte2.erleben.schoepfen.hebel#1` (Wille→Bild ≤ 1 s; 9,779) · `karte2.same.entfaltung.abwesenheit#1` (≤ 1 m; 8 Lagen fehlen) · `karte2.same.massstab.sprung#1` (ganz ≤ 30 s; null) · `karte2.same.kopplung.aufwaerts#1` (≥ 10 Orte; 1) ·
`karte2.planet.kosmos.kunstwelten#1` · `karte2.planet.kosmos.eigengesetz#1` · `karte2.same.physik.reaktion#3` · `karte2.same.physik.tragen#2` · `karte2.erleben.sinn.legenden#1` (200 Zeilen mit Ort; 9, 0) · `karte2.same.entfaltung.akte#2` (10³ Edits)
· `karte2.mensch.kopplung.antwort#2` (≥ 2×; 1,257, DSL ohne Weg-Akt) · LLM-Schlüssel (Drehbuch-Schritt 18, kein Macher): `karte2.mensch.geist.gespraech#2`, `karte2.erleben.schoepfen.satz#1`.

## 2. Drei Listen ohne Macher

**(i) Stations-Fehler — für den Stations-Bauer.**
- PROBE misst nichts (5): `karte2.planet.wasser.seegang#1` (spiegelTreue/posen ungemessen) · `karte2.planet.wasser.gezeiten#1` — die Akte am a954d698 liest „Hub 0 m über 12 Küsten“, obwohl w28-buendel-jagd (e71f2721, VOR dem Akten-Kopf) „Hub am Watt
  0 → 3,50 m, Periode 12,363 h“ landete: Verdacht, die Station liest gelaende-core.js:7767 `wasserSpiegel(L, x, z)` ohne Zeit statt des neuen Lesers · `karte2.planet.wasser.stroemung#2` (Täter laut Akte scripts/werkbank.cjs /bild: kein optischer
  Fluss) · `karte2.leben.oeko.dynamik#2` · `karte2.erleben.kopplung.emergenz#1` (beide: Beleg-Bild „kein nahWiese im Bild“, spielStunden ungemessen).
- Messung warf: `karte2.planet.kopplung.wetter-welt#4`, `karte2.planet.kopplung.wetter-welt#5`, `karte2.planet.kopplung.wetter-welt#6` — „/eval: M is not defined“ (scripts/lib/welt-boot.cjs:1506).
- Deckel der Leiter riss vor dem Urteil: `karte2.mensch.kopplung.kultur#3`, `#4`, `#5` (20 s) · `karte2.erleben.kopplung.wahrnehmung#3`, `karte2.erleben.kopplung.wahrnehmung#4`, `karte2.erleben.kopplung.wahrnehmung#5` (25 s; Täter tetrapoda-core
  bestaeuberBesuch/-Bahn bleiben) · `karte2.erleben.kopplung.ein-ereignis#2` (50 s) · `karte2.leben.kopplung.stadt-im-netz#2` (Probe endete vor ihr, Stille 105,8 s nach 166 s).
- Beleg-Bild fällt durch die Abnahme an der Pose (Vordergrund 28,1 % / Laub 33,5 % / kein nahWiese / Herde verdeckt): klimazonen#2, extreme#1, oeko.stoffe#2, siedlungslage#1, siedlungslage#2, kopplung.kaskade#1, land-meer-luft#1, land-meer-luft#5,
  gegenwart#5, oeko.dynamik#2, emergenz#1, `karte2.planet.relief.grossform#1` (17/20 nass, Bild ROT) · `karte2.leben.tiere.masse#1` (Ziel Herde verdeckt).
- Umfang ist die Probe, nicht die Welt: `karte2.same.preis.takt#1` (4 Boots je Gerät, 1) · `karte2.erleben.sinn.takt#2` (1 h; 0 s) · `karte2.erleben.klang.raum#2` (4 Räume in 60 s; headless klang.K3#2 misst sie) ·
  `karte2.planet.kopplung.land-meer-luft#6` (1 000 Welten; 32) · `karte2.same.preis.speicher#1` (5 min Kurve; 0,13 min) · `karte2.same.preis.ausdauer#1` (Station 0 s in 0 Fenstern).
- Der fehlende Leser ist der MESS-Leser: `karte2.same.entfaltung.gleichheit#1` (Haken vision/buche-2.cjs:261) · `karte2.same.entfaltung.reise#1` (scripts/lib/zerlege-linse.cjs:488) · `karte2.same.preis.bytes#2` (g6.js:1268) ·
  `karte2.same.preis.eingabe#2` (scripts/lib/haenger-linse.cjs:1225) · `karte2.same.preis.zugang#2` (lebt nur headless spielgang.K4#2) · `karte2.erleben.bild.himmel#1` (scripts/lib/licht-linsen.cjs:1078, kein geeichtes k).
- Urteil wartet auf Menschen-Panel: `karte2.mensch.nahrung.frucht#1` („GRÜN erst mit dem Urteil am Gerät (Blindpaar)“) · `karte2.erleben.schoepfen.gespraech#1` (20 Neulinge) · `karte2.erleben.sinn.sog#1` (12 blinde Neulinge) ·
  `karte2.erleben.sinn.staunen#1`.
- Werkzeug: front-tafel.cjs zählt bei `zaehlung: glieder` gebuchte Glieder als tiefe+ (9 von 15).

**(ii) Die 72 KEINE STATION nach Art.**
- Blind-Prüfer (2AFC · Panel · Jury · ordnen · Foto-Vergleich) — 52: planet.geologie.platten#1 (+1 tiefe) · geologie.vulkan#1 · geologie.gebirge#1 (+1 tiefe) · geologie.lagerstaette#1 · relief.formschatz#1 · relief.boden#1 · wasser.eis#3 ·
  wasser.tiefsee#2 · wetter.wolken#1 · wetter.fremde-atmosphaeren#1 · zeit.archiv#2 · erde.gestalt#1 · kopplung.siedlungslage#6 · kopplung.siedlungslage#7 · kopplung.gegenwart#3 | leben.pflanzen.arten#1 · pflanzen.lebenslauf#2 · pflanzen.jahreslauf#3
  · pflanzen.dichte#1 · tiere.lebenszyklus#2 · wasser.lebensraeume#2 · oeko.zerfall#2 · oeko.sukzession#2 · evolution.zeitreise#1 · evolution.mikroben#1 | mensch.leib.verschieden#1 · leib.tracht#1 · leib.ausdruck#1 · geist.netz#2 ·
  geist.generationen#2 · geist.innenleben#1 · stadt.groesse#1 · stadt.breite#1 · stadt.messlatte#1 · bau.bedarf#1 · bau.huelle#1 · bau.innen#3 · macht.stand#1 · kultur.verstaendigung#1 · zeit.spanne#1 · kopplung.leib#4 · kopplung.leib#6 ·
  kopplung.sport#5 · kopplung.sport#6 · kopplung.kultur#1 · kopplung.kultur#6 · kopplung.kultur#7 | erleben.sinn.entdeckung#1 · klang.musik#1 | same.physik.stoffe#1 · entfaltung.vielfalt#1 · kopplung.erdsaat#1 (alle mit Präfix karte2.).
- Spieler-/Welt-Probe (eine Zahl aus dem Spiel) — 19: karte2.planet.geologie.unterwelt#1 · wetter.vorhersage#2 · kosmos.welten#1 | leben.wasser.bild#1 · kopplung.leben-formt-planet#2 · kopplung.evolution-planet#1 | mensch.menge.rhythmus#3 ·
  netz.verkehr#2 · fahrzeug.lenker#1 · nahrung.erdbau#1 (+1 tiefe) | erleben.spieler.hand#1 · bild.ferne#1 · bild.flaeche#1 | same.physik.fluid#1 · massstab.nahe#1 · gedaechtnis.alter#1 · preis.ankunft#2 · kopplung.kaskade#3 · kopplung.stoerung#3.
- Sonst — 1: karte2.erleben.spieler.gemeinsam#1 (zwei physische Geräte).

**(iii) Akte älter als eine Landung, die die Sprosse betraf — nur Neumessung.** (Landung nennt die Sprosse im Commit; Akten-Kopf → Landung)
- GRÜN-Kandidaten (die gelandete Zahl liegt im Soll): `karte2.erleben.sinne.gesehen#1` 2da17e2e → w28-auge-farbe b2dfaeed 26.11.: 23,3 → 2,2 % (≤ 15), dahinter #2 grün · `karte2.erleben.klang.stimme#1` 31ea3847 → w28-stimme-leib-2 b939e1f8 26.11.: 28
  von 28 in ±15 % Peterson-Barney · `karte2.planet.kosmos.systeme#1` 64fcf12e → w28-kosmos-bahn 95f7fea1 26.11.: Mond 179,77° → 0,082° (≤ 0,5°) · `karte2.mensch.kopplung.leib#1` 2da17e2e → w28-leib-liest-satz 88f5904e 26.11.: Lagen Sommer 0,778 ↔
  Winter 1,000 · `karte2.mensch.kopplung.kultur#2` 2da17e2e → w28-kultur-aus-klima-4 (buendel-dorf-2) 26.11.: Dach ↔ Niederschlag r 0 → 0,79 · `karte2.mensch.wirtschaft.stoffstrom#1` f0a89f7e → w28-rennofen e303a1c9 25.11.: Kohle 682,6 → 307,6 kg,
  Gegenlauf 34 → 0 Barren.
- Neu messen, Soll noch offen laut Landung: `karte2.leben.tiere.arten#1` (5b36f69a → tiere-im-blick 25.11., 0 → 2–3 Arten) · `karte2.leben.oeko.vielfalt#1` (c445936d → tiere-im-blick) · `karte2.leben.oeko.dynamik#2` (6066c757 → oeko-kreislauf 23.11.)
  · `karte2.leben.evolution.stammbaum#1`, `karte2.leben.evolution.muster#1` (5b36f69a → erbe-geburt 24.11.) · `karte2.mensch.leib.gesicht#1` (5b36f69a → mensch-nah/front-leben 24.11., 7 von 10) · `karte2.mensch.leib.stoff#1` (c445936d → mensch-nah
  24.11., 576 → 32) · `karte2.mensch.menge.bild#2` (31ea3847 → menge-bild 25.11., 47 → 84) · `karte2.mensch.netz.stoffwechsel#1` (ddaf883d → ort-ausstattung 24.11.) · `karte2.mensch.bau.bauen#1` (31ea3847 → fachwerk-buehne 25.11., 97,9 → 17,3 %) ·
  `karte2.mensch.fahrzeug.gestalt#1` (30e01e75 → fahrzeug-gattung 25.11.) · `karte2.mensch.nahrung.jenseits#1` (30e01e75 → acker-kette 23.11.) · `karte2.mensch.macht.grenze#2` (31ea3847 → grenze-im-land 24.11.) ·
  `karte2.planet.kopplung.siedlungslage#1` (c1236fa8 → spiegel-eis 24.11.) · `karte2.planet.kopplung.land-meer-luft#1` (c1236fa8 → klima-kontinent 24.11.) · `karte2.planet.kopplung.land-meer-luft#5` (c1236fa8 → klima-hebung 24.11.) ·
  `karte2.erleben.sinne.genom#1` (31ea3847 → auge-der-art 24.11.) · `karte2.erleben.klang.getuemmel#1`, `karte2.erleben.klang.ereignis#3`, `karte2.erleben.kopplung.epoche-ganz#1` (31ea3847 → klang-leib 24.11.).
- Verdacht (Landung trifft den Täter der Akte, nennt die Sprosse nicht): `karte2.mensch.leib.spur#1` (31ea3847 „Alter 21–49“ → w28-generationen-band 23.11. „Kinder unter 15 J 0 → 38,6 %, Greis als eigener Leib“) · `karte2.mensch.menge.seuche#2`
  (31ea3847 „0 von 1213 mit Krankheit“ → bewohner-satz2 24.11. / leib-liest-satz 26.11. „Kranke 21 247“) · `karte2.erleben.bild.auge#1` (31ea3847 → bewegungs-feld 26.11., Geister 0,577 → 0,328 %) · `karte2.mensch.zukunft.medien#1` (31ea3847 „0
  Schilder“ → ort-ausstattung 24.11., 68 Schilder) · `karte2.planet.kopplung.wetter-welt#4` und `karte2.planet.wetter.lagen#2`, `karte2.planet.wetter.extreme#1` (c1236fa8/f0a89f7e → wetter-am-ort 24.11. „EIN Wetter-Feld je Ort“) ·
  `karte2.planet.kopplung.land-meer-luft#2` (→ klima-kontinent, gleicher Täter planetKlimaR).
- Breit: 106 Akten am Kopf 31ea3847 (20./21.11.) — eine Runde über ALLE Fronten mit Akte vor dem 22.11. kostet keinen Macher.

## 3. Die zehn Briefe für morgen früh (je EIN Macher, eine Fähigkeit)

1. **„Der Tag hat Feste“** — Fähigkeit 2, M. Fronten: karte2.mensch.kopplung.sport#1, karte2.mensch.kopplung.sport#2, karte2.mensch.kultur.glaube#1, karte2.mensch.kopplung.kultur#3, karte2.mensch.geist.tag#2, karte2.mensch.nahrung.tier#2. Härteste
   Station (geist.tag#2): „7 Tage: Akte je Stunde gegen ATUS-Profil ≤ 20 % je Hauptkategorie“ (ist 1; 12 von 17 leer). Vorher: kultur#3-Deckel 20 s an den Stations-Bauer.
2. **„Die Region lebt ohne Spieler“** — Fähigkeit 3, L. Fronten: karte2.mensch.geist.absicht#3, karte2.mensch.stadt.form#2, karte2.mensch.wirtschaft.handel#2, karte2.mensch.stadt.siedlungsnetz#2, karte2.planet.kopplung.siedlungslage#3,
   karte2.planet.kopplung.siedlungslage#4, karte2.mensch.macht.wehrbau#4, karte2.mensch.kultur.diffusion#1, karte2.mensch.menge.dichte#3. Härteste (siedlungslage#3): „Siedlungen an Furt, Terrasse, Küste ≥ 80 %; Gegenlauf: dieselbe Saat mit
   eingeebnetem Relief oder gekapptem Fluss → Anteil fällt auf das Zufallsniveau (≤ 30 %); Städte > 10⁵ ≤ 10 km von Küste oder Strom ≥ 70 %“.
3. **„Mühle, Grabstein, Turm“** — Fähigkeit 4, M. Fronten: karte2.mensch.wirtschaft.energie#2, karte2.mensch.fahrzeug.maschine#2, karte2.mensch.kultur.schrift#2, karte2.mensch.stadt.vertikal#2, karte2.mensch.stadt.habitat#1. Härteste
   (kultur.schrift#2, Umfang „U_eff ≥ 10 Schrift-Typen, 500 Grabsteine“): „OCR liest ≥ 80 % zu den Akten zurück“.
4. **„Der Himmel als Katalog“** — Fähigkeit 5, M. Fronten: karte2.planet.kosmos.sternhimmel#2, karte2.planet.kosmos.galaxien#1, karte2.planet.kosmos.ereignisse#1, karte2.erleben.spieler.forscher#1, karte2.planet.kosmos.sterne#1. Härteste
   (galaxien#1): „am Ziel steht die Heimatgalaxie am Himmel in der richtigen Richtung und Größe ±5 %; Bildpaar Anflug gegen Teleskop-Aufnahme (2AFC ≤ 80 %)“.
5. **„Der Bewohner sieht, erinnert, antwortet“** — Fähigkeit 12, L. Fronten: karte2.mensch.menge.kollektiv#2, karte2.mensch.macht.recht#1, karte2.mensch.macht.megastadt#1, karte2.mensch.macht.krieg#1, karte2.erleben.sinn.tod#3,
   karte2.erleben.sinn.ziele#2, karte2.mensch.kopplung.leben#2, karte2.mensch.zeit.kausal#3. Härteste (kopplung.leben#2): „Gegenlauf: mit Missernte ziehen ≥ 10 % der Betroffenen um und ändern ihren Tag, ohne Missernte keine Umzugswelle; Betroffene
   nennen das Ereignis auf Frage ≥ 0,8“.
6. **„Ball, Brett, Bühne“** — Fähigkeit 13, L (startet nach Brief 1 oder auf ihm). Fronten: karte2.mensch.sport.regeln#2, karte2.mensch.sport.mannschaft#2, karte2.mensch.sport.arena#2, karte2.mensch.sport.koennen#3, karte2.mensch.sport.geistspiel#2,
   karte2.mensch.kultur.erzaehlkunst#1, karte2.mensch.kopplung.sport#3, karte2.mensch.kopplung.sport#4. Härteste (koennen#3): „Wettkampf im Bild bei N = 10², 10³, 10⁴: Bestleistung wächst mit der Zahl der Teilnehmer UND ihrer Übung; Gegenlauf:
   Teilnehmer ÷ 10 oder Übung gekappt → der Bestwert sinkt um die Extremwert-Erwartung ±5 %“.
7. **„Luft im Löser“** — Fähigkeit 1, S. Fronten: karte2.same.physik.flug#1, karte2.same.physik.koerper#1, karte2.same.massstab.physik#2. Härteste (flug#1): „Stein und Feder: Wurfweiten gegen Rechnung ±10 %, Feder fällt sichtbar langsamer“ (ist 2 260
   %).
8. **„Das Genom liest Jahr und Breite“** — Fähigkeit 6, S. Fronten: karte2.mensch.kopplung.leib#5, karte2.mensch.kopplung.leib#2 (karte2.mensch.leib.spur#1 zuerst neu messen, s. iii). Härteste (leib#2): „200 Saaten: Hautton ↔ Breite r ≥ 0,7“.
9. **„Der Fels erzählt den Ort“** — Fähigkeit 7, S. Fronten: karte2.planet.kopplung.gegenwart#1, karte2.planet.kopplung.gegenwart#5. Härteste (gegenwart#1): „1 000 Relikte: Ursache in der Geschichte des Orts = 100 %“ (ist 99,9 %).
10. **„Jede Saat ist ein ganzer Planet“** — Fähigkeit 14, L. Fronten: karte2.leben.evolution.fremde-physik#1, karte2.erleben.kopplung.wahrnehmung#6, karte2.erleben.kopplung.klang#5, karte2.erleben.kopplung.klang#6,
    karte2.erleben.spieler.wegfindung#1, karte2.same.kopplung.kohaerenz#1. Härteste (wahrnehmung#6): „Bildpaar zweier Planeten (roter/heller Stern): Vegetationsfarbe und Augenspektren unterscheiden sich gesetzmäßig, N = 20 Paare ≥ 0,8“.

Nachrücker (Hebel 2,0, unter 5 Fronten und nicht S — nur gebündelt): Wind-Feld (4) · Klang-Quellen (4) · Herde (4) · Feld und Handlung (4).
