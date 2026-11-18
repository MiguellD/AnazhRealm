# ZENSUS der KOPPLUNG — (f) TIERE und MENSCHEN: wer liest Feuer, Regen, Kälte, Wind, Rauch

Stand: Arbeitszweig `claude/optimistic-johnson-gqo20t` = main-Kopf b7ed841. Lese-Blatt, kein Bau.

## 1. Kopf

Die Wesen sind drei Leser-Familien. **Tiere**: der Kreatur-Takt (`updateCreatures`, `stamm/kreatur-verhalten.js`) fragt je Wesen
die Furcht (`_creatureWariness`, `stamm/kreatur-furcht.js`), seine Zahlen stehen im Gesetzbuch tetrapoda (`VERHALTEN.furcht`,
`FURCHT_GESETZ`, tetrapoda-core.js:182-200, :1990-2000); dazu Vögel, Schwarm und Bestäuber (`stamm/kreatur-fauna.js`) und der
Bestand fern als Zahl (`stamm/kreatur-leben.js`). **Menschen**: der Bewohner-Takt (`_tickBewohner`, `stamm/siedlung-bewohner.js`) liest
je `planH` sein Soll aus koerper-core `tagesPlan` (koerper-core.js:5326). **Spieler-Körper**: Lebenswerte in `stamm/koerper-seele.js`
(`damagePlayer` :302), Schritt und Stand in `stamm/koerper-bewegung.js` und `stamm/koerper-leib.js`, der Wagen in `stamm/koerper-fahrt.js`.
Von allen Feldern liest das Feuer nur die Tier-Furcht direkt; Rauch liest kein Wesen, Kälte liest kein Leib, Regen nur der Plan der Bewohner.

## 2. Die Größen

| Name | Einheit | Wert/Bereich | Anker | Schreiber | Leser | FOLGT/GESETZT |
|---|---|---|---|---|---|---|
| Glut-Witterung (`furcht.noticeRadius`) | m | 22 | tetrapoda-core.js:183 – Kommentar „fern davon ignoriert das Wesen den Spieler“: ein Maß für den Spieler, beim Feuer wiederverwendet, kein Feuer-Anker | Kern-Literal | kreatur-furcht.js:90 (Glut), :119 (Spieler), :69 (Jäger) | GESETZT |
| Glut-Wariness (`combatFearWariness`) | Stellwert ohne Einheit | 1,5 | tetrapoda-core.js:198 | Kern-Literal | kreatur-furcht.js:56 | GESETZT |
| Flucht-Schwelle (`fleeThreshold`) | Stellwert ohne Einheit | 0,3 | tetrapoda-core.js:196 | Kern-Literal | kreatur-verhalten.js:3308, :3316 | GESETZT |
| Flucht-Weg (`fluchtWegJeRadius`) | × Radius, ohne Einheit | 2,2 → Flucht bis max(22 m, das fernste Glied) + 48,4 m, also ≥ 70,4 m vom Zell-Mittelpunkt | tetrapoda-core.js:1994 (Kommentar :1979, ohne Quelle) | Kern-Literal | tetrapoda-core.js:2029-2036 über kreatur-verhalten.js:3318 | GESETZT |
| Ort der Bedrohung durch Feuer | m (x, z) | Mittelpunkt der glühenden 16-m-Zelle, y + 1 m | feld-brand.js:586-591, LIFE_FIELD.cell feld-leben.js:3078 | feld-brand.js:591 (`b.ort`) | kreatur-furcht.js:94-101 | FOLGT (Raster des Felds) |
| Glut der Zelle (`z.glut`) | ohne Einheit 0–1 | Rampe über `aufS` 4 s | feld-brand.js:515, `aufS` feld-brand.js:896 | feld-brand.js:515, der Block feld-brand.js:524-532 | Furcht prüft nur, ob die Zelle im glutBlock steht (feld-brand.js:538-548), nie den Wert; `auraAt` glut feld-leben.js:1876 | GESETZT (`aufS`) |
| Tempo der Flucht | m/s | `sprintTempo(Hüftlänge)` × `wundTempo(hp-Anteil)` | kreatur-verhalten.js:465-469 | – | kreatur-verhalten.js:3327 | FOLGT (Gestalt; Herleitung des STEUER-Gesetzes nicht gelesen) |
| Regen-Kanal `rain` | ohne Einheit 0–1 | klar 0 · nebel 0 · bewölkt 0,12 · regen 0,6 · sturm 1 | koerper-core.js:5214 (Tafel phyto WX_GESETZ.rain), Lerp bild-himmel.js:2820-2838 | das Wort AM SPIELER dirigent-takt.js:1732-1740 | siedlung-bewohner.js:2223; kreatur-fauna.js:42, :624, :141 | GESETZT (Tafel je Wort) |
| Regen-Schwelle des Menschen (`regen.ab ± streuH`) | ohne Einheit | 0,3 ± 0,15 je Samen | koerper-core.js:5218; Anker nur das Bild am Genesis-Ort („31 von 77“, :5216-5217), kein physikalischer | Kern-Literal | koerper-core.js:5341-5345 | GESETZT |
| `regenfest` | Rollen-Flag, ohne Einheit | 5 Rollen: haendler, fahrer, nachtfahrer, waechter, nachtwaechter | koerper-core.js:5148-5171 | Kern-Literal | koerper-core.js:5344 | GESETZT |
| Plan-Takt `BEWOHNER.planH` | h Welt-Uhr | 0,002 | siedlung-bewohner.js:3953 | Stamm-Literal | siedlung-bewohner.js:1654 | GESETZT |
| Wetter-Gemüt der Tiere | ohne Einheit (Achsen-Hub) | nass: sorrow +0,18, peace +0,06 · Sturm: chaos +0,15, awe +0,1 · trocken: joy +0,15; je Wetterwechsel 10 % der Tiere | feld-leben.js:1749-1765 (Stamm-Literale, nicht im Gesetzbuch) | feld-leben.js:1758-1765, gerufen bild-himmel.js:3143 | Gang-Amplitude kreatur-verhalten.js:1397 (`chaosGain` 0,5 · `sorrowDamp` 0,4, tetrapoda-core.js:230-231) | GESETZT |
| Glut → Gefühl des Spielers (`FIELD_TO_EMOTION.glut`) | ohne Einheit | chaos 0,45 · awe 0,25; Drift 0,03/s | feld-sprache.js:1458, :810 | `auraAt` glut der Spieler-Zelle feld-leben.js:1876 | feld-sprache.js:809-821 → Aura-Bedrohung (`menaceFromChaos` 1,3, tetrapoda-core.js:184) → kreatur-furcht.js:136 | GESETZT |
| `heatResist` | ohne Einheit 0–0,9 | wärmeleitung·0,5 − brennbar·0,3 | bau-buch.js:2542 | `recomputePlayerStats` | koerper-seele.js:317-319 (nur bei Quelle /heat\|fire\|feuer\|hitze\|flame\|glut/) | GESETZT |
| Reichweite des Geruchs (`SCENT.rangeM`) | m | 80 (Abfall auf e⁻¹) | koerper-seele.js:1820 | Stamm-Literal | koerper-seele.js:1625 | GESETZT |
| Wind-Gewicht des Geruchs (`windFactor` / `minDirectional`) | ohne Einheit | 0,6 / 0,2 | koerper-seele.js:1824 („Erst-Wurf 0.6“), :1827 | Stamm-Literal | koerper-seele.js:1636 | GESETZT |
| Wind am Geruch | Einheitsvektor, ohne Einheit | `_windAt` an der Quelle, Sim-Uhr | koerper-seele.js:1630 | das EINE Wind-Feld | koerper-seele.js:1635 (nur Richtung; Stärke ungelesen) | FOLGT (Wind-Feld) |
| Witterung der Jagd (`jagd.scentRangeM`) | m | 50 | tetrapoda-core.js:151 | Kern-Literal | kreatur-verhalten.js:179 ff. (`_creatureScentHuntDir`) | GESETZT |
| Vogel-Lied | ohne Einheit | chor(Sonne) · (1 − regen)² · (1 − 0,8·wind) | tetrapoda-core.js:2380-2382, :2477-2489 | – | kreatur-fauna.js:42 | GESETZT |
| Schwarm `regenMax` / `sonneMin` | ohne Einheit | 0,5 / 0,05 | tetrapoda-core.js:2458-2459 | – | tetrapoda-core.js:2528 über kreatur-fauna.js:141 | GESETZT |
| Bestäuber `regen` / `windMs` | ohne Einheit / m/s | [0,25; 1] / [3; 10] | tetrapoda-core.js:2917-2918 | – | kreatur-fauna.js:624 | GESETZT |
| Brand-Narbe (lebendig sinkt) | ohne Einheit | Tiefe 0,3, 72 h, Nährstoff 0,4 | feld-leben.js:3102 | Tat `brand` feld-brand.js:575 | `_narbeAt` feld-leben.js:2684-2693 → `auraAt` lebendig → `_kreaturNahrung` kreatur-leben.js:2101-2104, Vogel-Revier kreatur-fauna.js:370 | GESETZT |
| Fraß der Herde F = n · frass | lebendig je Takt, ohne Einheit | je Region und Takt | kreatur-leben.js:2193 | `_depositLife` kreatur-leben.js:2195 | `auraAt` lebendig → Last des Brand-Betts feld-brand.js:222, :302; unter `minStoff` 0,15 kein Bett, feld-brand.js:224, :900 | FOLGT (Bestand; Herleitung von `frass` nicht gelesen) |
| Tritt je Zelle (`TRITT`) | Tritte je 0,5-m-Zelle | `tritte` 20, `erholTage` 20 | siedlung-wege.js:2907-2919 | Tiere siedlung-wege.js:1650, Spieler :1653, Bewohner siedlung-bewohner.js:2728, Mitspieler netz-p2p.js:2935 | `_pfadFeldAt` siedlung-wege.js:1616 → Wiese vegetation-wiese.js:782, :1323; Baum vegetation-baum.js:1344; Wagen koerper-fahrt.js:1834 | GESETZT |
| Tritt in die Schnee-Decke | m | Kern `schneeTrittAm` | bild-himmel.js:2876-2884 (Kommentar) | Kern | koerper-bewegung.js:1112, koerper-leib.js:597, kreatur-leben.js:1584, :1624 | FOLGT (Kern; Herleitung nicht gelesen) |
| Nässe am Wagen (`state.naesse`) | ohne Einheit 0–1 | μ je Stoff von trocken bis nass | koerper-fahrt.js:1801-1811 | `_naesseTakt` bild-himmel.js:3077-3086 | koerper-fahrt.js:1811 | FOLGT (Reibungs-Tafeln, bau-vorlagen.js) |
| Reichweite der Fackel beim Zünden | m | `FORAGE.reach` 6 | vegetation-wiese.js:3166 | Stamm-Literal | kampf.js:2429-2446 | GESETZT |
| Radius des Brennglases | m | 4 | koerper-fahrt.js:3253 | Stamm-Literal | koerper-fahrt.js:2315, :2371 | GESETZT |

**Summe: 28 Größen, davon 6 FOLGT und 22 GESETZT; 17 ohne Einheit.**

## 3. Die Flüsse

**Feuer → Tiere (die EINE direkte Kopplung).** `_creatureWarinessEigen` fragt zuerst die Glut (kreatur-furcht.js:56). `_kreaturGlutNah`
(kreatur-furcht.js:87-103) sucht die nächste glühende Zelle im glutBlock des letzten Schritts (`_brandGlutUm` feld-brand.js:538)
binnen 22 m und setzt Ort und Radius. Der Flucht-Zweig läuft dann im Sprint radial vom Mittelpunkt dieser Zelle weg, bis zum Flucht-Radius
(kreatur-verhalten.js:3308-3330). Der Alarm geht durch den Verband: wer selbst nichts wittert, flieht mit dem nächsten fliehenden Glied
(kreatur-furcht.js:7-29). Das gilt auch für wilde Tiere (die Abfrage steht vor dem wilden Zweig, :56-57).
**Probe (lief):** `KREATUR_TAKT_PORT=4791 timeout 60 node scripts/diag-kreatur-takt.cjs --proben furcht`, headless mit Null-Renderer, 18 s, GRÜN.
Brand: `flieht 1` (3 Herden zu je 5 Tieren, Herd 15 m entfernt, alle binnen 10 s auf der Flucht), `gegenlauf 0`. Im selben Lauf maß
die Flucht vor dem Menschen: Hirsch 117,6 m, Wolf 103,5 m, Bär (ruhig) 54,6 m, Fuchs 37,2 m.

**Feuer → Tiere, indirekt über die Nahrung.** Jede ausgebrannte Zelle schreibt die Tat `brand` (feld-brand.js:575). Ihre Narbe
(Tiefe 0,3, 72 h, feld-leben.js:3102) senkt `lebendig` in `auraAt` (feld-leben.js:1874). Diesen Wert lesen die Nahrung des Bestands
(kreatur-leben.js:2101-2104, also Kapazität K und Fraß) und das Vogel-Revier (kreatur-fauna.js:370).

**Feuer → Spieler, nur über das Gefühl.** `auraAt` hebt glut in der eigenen 16-m-Zelle des Spielers (feld-leben.js:1862-1876).
Diese Achse nährt chaos (feld-sprache.js:809-821, glut → chaos 0,45). chaos hebt die Aura-Bedrohung (`menaceFromChaos` 1,3), und die
Tiere fürchten den Spieler mehr (kreatur-furcht.js:136). Die Schleife lautet Feuer → Gefühl des Spielers → Furcht der Tiere.

**Regen → Menschen.** `_bewohnerSoll` reicht `_weatherFieldFor().rain` an `tagesPlan` (siedlung-bewohner.js:2223). Liegt der Regen
über der Schwelle (0,3 ± 0,15), wird jeder Akt im Freien zu „daheim, drinnen“. Ausgenommen ist die Arbeit der fünf `regenfest`-Rollen
(koerper-core.js:5341-5345). Den Plan liest jeder Bewohner je 0,002 h Welt-Uhr neu (siedlung-bewohner.js:1654). Der Schutz ist immer
die EIGENE Haustür (`orte.heim`), nie das nächste Dach.

**Regen, Sturm, Wind → Tiere.** Beim Wetterwechsel (bild-himmel.js:3143) bekommen 10 % der Tiere einen Gemüts-Impuls
(feld-leben.js:1744-1767). Er wirkt nur auf die Amplitude des Wanderns (kreatur-verhalten.js:1397) und auf die Emotion beim Wurf im
Boot (kreatur-verhalten.js:2366). Der Wind wirkt nur auf die Witterung der Jagd (koerper-seele.js:1630, nur die Richtung).
Vögel, Schwarm und Bestäuber lesen Sonne, `rain` und Wind (kreatur-fauna.js:42, :141, :622-624). Sie ruhen dann oder schweigen,
sie suchen keinen Schutz.

**Wind → Bild der Menschen.** Haar (koerper-leib.js:1869), Tuch (koerper-leib.js:3166), Kamin-Rauch (siedlung-bewohner.js:116).

**Kälte → Leib, nur über den Boden.** Die Schnee-Decke lässt Fuß, Pfote und Leib einsinken (koerper-bewegung.js:1112,
koerper-leib.js:597, kreatur-leben.js:1584, :1624). Eis wird zum Stoff „eis“ unter dem Körper (gelaende-kollision.js:1124) und so zu
μ und Klang. Kein Leib liest `_temperaturAt`: Treffer in koerper-*, kreatur-* und siedlung-bewohner nur koerper-fahrt.js:2398
(das Brennglas) und siedlung-wege.js:581 (die Lava).

**Nässe → Wagen.** μ trocken bis nass (koerper-fahrt.js:1811); Wind am Wagen (koerper-fahrt.js:1851).

**Wesen → Felder (Rückkopplung).**
- Fraß: `_kreaturFrass` senkt lebendig (kreatur-leben.js:2195). Das Brand-Bett liest das als Last (`leb`, feld-brand.js:222, :302;
  unter 0,15 trägt die Zelle kein Bett). Eine abgeäste Wiese brennt also schwächer. Das ist die einzige Rückkopplung eines Wesens
  auf das Feuer, die über die Physik läuft.
- Tritt: Tiere, Spieler, Bewohner und Mitspieler treten Pfade (siedlung-wege.js:1650, :1653, siedlung-bewohner.js:2728,
  netz-p2p.js:2935). Wiese, Baum und Wagen lesen sie (Tabelle). Das Brand-Bett liest sie NICHT (siehe Brüche).
- Zünden, Spieler: die Fackel (Verb `zuenden` kampf.js:2348 → `_fackelZuenden` :2435-2452, Arm-Reichweite 6 m) und das Brennglas
  (nur bei `weather === "sunny"`, koerper-fahrt.js:2294; es tilgt das Werk und zündet die Zelle darunter, :2355-2356), beides über
  `_brandEntfachen` (feld-brand.js:344). Indirekt zündet die DSL über `lava` (feld-dsl.js:991 → `_lavaZuendet` siedlung-wege.js:625-657).
- Zünden, Bewohner: keiner.
- Riss: Tod und Ort prägen Narbe und Gefühl (TAT_NARBE.riss feld-leben.js:3104). Die Furcht des Orts liest das (kreatur-furcht.js:197-230).
- Feuerstelle, Lagerfeuer, Esse (Bau mit Glut-Fläche, das Verzeichnis „glut“, gelaende-kollision.js:1180): Licht
  (dirigent-kern.js:1785, :1837), Ohr (klang.js:364), die Esse erwärmt den Stahl in der Hand (feld-leben.js:2499-2515). Nie das Brand-Feld,
  nie die Furcht, nie Wärme an einem Leib.
- Kamin: nur Rauch-Bild (siedlung-bewohner.js:7-131).

**FEHLT ausdrücklich:**
1. **Tiere fliehen vor Glut, nicht vor Rauch.** Rauch hat keinen Zustand außer Bild-Teilchen um das Auge (`_brandRauch`
   feld-brand.js:720-764 → `st.brandRauch.teilchen`, Leser nur `_rauchZeichnen`). Kein Wesen kann ihn lesen.
2. **Die Flucht liest weder Wind noch Front.** Sie läuft radial vom nächsten glühenden Zell-Mittelpunkt (kreatur-verhalten.js:3322-3328).
   Der Kopf der Front (`kopf`, feld-brand.js:431), ihr Tempo R und ihre Intensität (`iw`, feld-brand.js:437) bleiben ungelesen.
   Ein Tier kann windab vor dem Kopf herlaufen. Noch nicht entzündete Zellen (`t0 === null`) sind keine Bedrohung.
3. **Feuer verletzt kein Wesen.** `damageCreature` rufen nur kampf.js:506, :1331, feld-dsl.js:1452 und kreatur-verhalten.js:1548 auf,
   keiner davon aus dem Brand. Auch der Bestand fern als Zahl verliert kein Tier an das Feuer.
4. **Feuer, Hitze, Kälte, Nässe verletzen den Spieler nicht.** `damagePlayer` rufen nur kreatur-verhalten.js:1553 (Jagd),
   dirigent-takt.js:1144 (Sturz) und feld-dsl.js:1842 (Op `damage`) auf. Am Leib gibt es keinen Zustand für Wärme, Nässe oder Kälte:
   0 Treffer für `naesse` oder `_temperaturAt` in koerper-seele, koerper-leib, koerper-bewegung. Der Spieler steht ungerührt in der Lava
   (`_lavaAt` wird nur Kontakt-Stoff „glut“, gelaende-kollision.js:1125-1126).
5. **Bewohner lesen kein Feuer.** 0 Treffer für `_brandGlutUm` oder `brandFeld` in stamm/siedlung-*.js. Sie weichen nur der Gewalt
   des Spielers (`_bewohnerZeuge` siedlung-bewohner.js:2154-2171, gerufen nur aus `damageCreature` mit Quelle player, kreatur-leben.js:794).
6. **Löschen gibt es nicht.** Kein Akt von Spieler oder Bewohner. Niemand trägt Wasser, es gibt keinen DSL-Op (Ops: `weather`
   feld-dsl.js:930, `lava` :991, `damage` :1841, kein `brand`). Gelöscht wird nur über die globale Nässe (feld-brand.js:284, :509-519)
   und über Wasser im Bett bei der ersten Messung (`_nassAt` feld-brand.js:224).
7. **Bauten brennen nicht.** Ein Bett tragen nur `gras` und `laub` (bau-vorlagen.js:1646-1649). Ein Holzbau ist kein Brennstoff der
   Front. Ein Dorf bricht die Front, statt Brennstoff zu sein. Nur das Brennglas tilgt ein Werk (koerper-fahrt.js:2356).
8. **Ein Lagerfeuer scheucht kein Tier, wärmt niemanden und zündet nie das Feld** (siehe oben: das Verzeichnis „glut“ hat nur Bild,
   Ohr und Esse als Leser).
9. **Tiere suchen bei Regen, Sturm oder Kälte keinen Schutz.** 0 Leser von `rain` oder `naesse` in kreatur-verhalten und kreatur-leben,
   außer dem Gemüts-Impuls.

## 4. Die Brüche

- **Zwilling „Regen am Ort“ ↔ das Wort am Spieler.** Das Gesetz nennt `nass` „der Regen am Ort“ (koerper-core.js:5323). Der Wirt reicht
  aber `_weatherFieldFor()` ohne Ort (siedlung-bewohner.js:2223). `state.weather` ist das Wort der Front am Spieler
  (dirigent-takt.js:1732-1740). Jedes Dorf der Welt flieht also vor dem Regen über dem Spieler. Der Leser am Ort (`_wetterAmOrt`,
  bild-himmel.js:2843) steht bereit, der Wirt ruft ihn nicht.
- **Zwei Quellen des Regens für Tiere.** Der Gemüts-Impuls liest das Wort mit einer Stufe (`_weatherIsWet`, WEATHER_INTENSITY ≥ 1,
  feld-leben.js:1749). Vögel und Bestäuber lesen den stetigen Kanal `rain` (kreatur-fauna.js:42, :624). Bei „bewölkt“ (rain 0,12)
  ist das Tier „trocken froh“, der Bestäuber schon gedämpft.
- **Toter Leser:** der `heatResist`-Zweig in `damagePlayer` (koerper-seele.js:317-319). Die Zahl wird geschrieben und angezeigt
  (bau-buch.js:2542, werkstatt-bauen.js:1892), im Spielpfad ruft aber keine Feuer-Quelle `damagePlayer` auf. Nur der Op `damage`
  mit Quelle „fire“ (feld-dsl.js:1842) erreicht den Zweig.
- **Für Wesen tote Schreiber:** die Teilchen der Rauch-Fahne (feld-brand.js:720-764, nur Bild) und die Byram-Intensität `iw`
  (feld-brand.js:437, liest nur das Bild).
- **Konstanten ohne Anker:** `noticeRadius` 22 m wird für das Feuer wiederverwendet, ist aber ein Maß für den Spieler
  (tetrapoda-core.js:183). Ohne Quelle stehen außerdem `combatFearWariness` 1,5 (:198), `fluchtWegJeRadius` 2,2 (:1994),
  die Hübe des Wetter-Gemüts (feld-leben.js:1758-1765: Stamm-Literale, nicht im Gesetzbuch tetrapoda, obwohl der Kern die
  Gemüts-Zahlen sonst trägt), `regen.ab` 0,3 (koerper-core.js:5218, Anker nur eine Beobachtung), `SCENT.windFactor` 0,6
  („Erst-Wurf“, koerper-seele.js:1822-1824), `FIELD_TO_EMOTION.glut` und `driftRate` 0,03 (feld-sprache.js:1458, :810).
- **Stale Kommentar (Karte ≠ Code):** kreatur-furcht.js:46 und kreatur-verhalten.js:3301 nennen den Leser `_verhaltenGesetz`
  „fail-soft“. Er ist fail-closed (kreatur-verhalten.js:3701-3705).
- **Tritt → Bett fehlt:** `_kontaktStoffAt` (gelaende-kollision.js:1121-1134) fragt Auflage, Eis, Lava, Pflaster, Laub und Grün, nie
  `_pfadFeldAt`. Der Trampelpfad, den Wiese und Wagen lesen, nimmt dem Brand kein Bett.
- **Nachbar-Befund (fremdes Thema, beim Lesen gesehen):** Das Bett, auf dem auch der Fraß wirkt (`_brandStoff` → `_kontaktStoffAt` →
  `_bodenSichtAt`), liest `state.voxelChunks`, also den gezeichneten Boden um das Auge (gelaende-boden.js:19-27). Die Last, die der Fraß
  senkt, existiert für das Feuer nur dort, wo ein Chunk steht.

## 5. Sprossen (meisterkarte-2)

`origin/koordination` fehlte bis zum Schreiben dieses Blatts (`git branch -r`: nur `main` und der Arbeitszweig). Selbst habe ich
nicht gefetcht. Die Sprossen der Karte sind daher **nicht gelesen**. Genannt sind die Kennungen, die der Code selbst zitiert:
- `feld.K3#2` / `w28-brand-flucht` (kreatur-furcht.js:53): „die Glut ist Bedrohung“. Bedient wird sie von `_kreaturGlutNah`, gemessen oben (flieht 1, gegenlauf 0).
- `mensch.kopplung.leben` S1 (koerper-core.js:5208, siedlung-bewohner.js:2211): „der Regen treibt ins Haus“. Bedient wird sie von
  `tagesPlan` mit dem Bruch „Ort = Spieler“.
- `same.physik.feuer` S1 (kampf.js:2421, :2429): „die Glut in der Hand, die Fackel am Boden“. Bedient von `_fackelZuenden`.
- `oekologie.K4` (tetrapoda-core.js:149-150): „der Spieler ist Beute, der Wind trägt die Witterung“. Bedient von `_scentAt` (nur die Richtung).
- `leben.tiere.mensch` S1 (kreatur-furcht.js:146-163): die Fluchtdistanz je Gattung. Bedient, gemessen oben.
- `stoffe.K4` (siedlung-wege.js:1621): der Trampelpfad. `wetter.K4` (koerper-leib.js:589-590): die Schnee-Decke. `mensch.K5`
  (kreatur-leben.js:794): der Zeuge. `luftwasser.K4`/`K5` (kreatur-fauna.js:607, :78): Bestäuber und Schwarm.
- Station `karte2.same.kopplung.kaskade#1` (aus dem Brief): die Wesen tragen zu ihr nur den Fraß als Last des Betts bei. Kein Wesen
  zündet, trägt oder bricht die Ausbreitung.

## 6. Nicht verifiziert

- Die Leitern `same.kopplung.*` und die Sprossen der meisterkarte-2 im Wortlaut: **nicht gelesen** (Zweig fehlte).
- Ob `gruenMap` der Chunks den Tritt mitträgt (und der Pfad so über „gras < ½“ doch das Bett nimmt): **nicht gelesen**.
- Ob das Vogel-Revier nach einem Brand neu gerechnet wird (Zwischenspeicher `_vogelZelle`): **nicht gelesen**.
- Herleitung von `sprintTempo`, `BESTAND_GESETZ.frass` und `schneeTrittAm`: **nicht gelesen**, darum ohne Prüfung als FOLGT geführt.
- Das Verhalten der Zoo-Tiere (`_gehegeVon`) bei Feuer: die Glut-Abfrage prüft kein Gehege, das Bild dazu **nicht gelaufen**.
- Eine Probe für die Bewohner im Regen und für die Flucht windab: **nicht gelaufen**. Die Absenz ist nur per Grep belegt (die Zählungen oben).
- Die einzige gelaufene Probe ist `diag-kreatur-takt.cjs --proben furcht` (headless, 18 s).
