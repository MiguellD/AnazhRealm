# Zensus Referenz-Szenen — Gruppe Pflanzen · Biome · Wasserleben · Zerfall und Sukzession

Leser: champion (nur lesen), 25.11. · Stand punkte-maschine (front-tafel 25.11. 06:17, karte-2-stand heute 105), Haupt-Klon main 6c210411.

## 0. Lage der 15 Leitern (95 Sprossen)

Gebucht laut `vision/meisterkarte-2.json` (Feld `heute`): jahreslauf 1, kraft 1, wasser.lebensraeume 1, wasser.netz 1, wasser.rhythmen 1,
oeko.zerfall 1, oeko.sukzession 1, oeko.stoffe 1 = **8 von 95**. Die Fronten:

| Front | Fach der Tafel | was sie hält |
|---|---|---|
| pflanzen.arten#1 | KEINE STATION | Blindtest/Herbar-Panel (R11) |
| pflanzen.biome#1 | FERN ✗, BEANSPRUCHT w28-front-planet-leben | uferProzent 64,7 % < 90 %; waermeAussen 2 > 0 |
| pflanzen.lebenslauf#1 | KEINE STATION | Richter `ohneZahl` (k2-leben.js:853) kann nie GRÜN werden |
| pflanzen.jahreslauf#2 | GRUEN+PREIS, BEANSPRUCHT | rang 0,975 ≥ 0,8 ✓ — wartet auf Buchung |
| pflanzen.dichte#1 | KEINE STATION | Richter `ohneZahl` (k2-leben.js:1272) |
| pflanzen.kraft#2 | GRUEN+PREIS, BEANSPRUCHT | laufzeitAbw 6,5 % ≤ 20 % ✓ |
| wasser.lebensraeume#2 | KEINE STATION | Klassifikator, Ufer-Stichprobe |
| wasser.bild#1 | KEINE STATION | Sicht-Bänder stehen (k2-leben.js:4318–4320), keine Messung im Fenster |
| wasser.netz#2 | KEINE STATION | kein Plankton-Feld |
| wasser.rhythmen#2 | Umfang nicht erzeugbar | hubM 0,001 m gegen ≥ 200 m; das Meer der Welt ist 16,97 m tief |
| oeko.vielfalt#1 | Ort, rot | Ego 0 Sichtungen in 601 s, Third 2 (Bär) |
| oeko.zerfall#2 | KEINE STATION | 10 Kadaver, Bildreihe 0/3/10/30 Tage |
| oeko.sukzession#2 | KEINE STATION | 1 km² Waldbrand, Bildpaar 1/5/25 Jahre |
| oeko.stoffe#2 | Umfang nicht erzeugbar | EIN Nährstoff-Skalar (vegetation-wiese.js:2097), kein N/P |
| oeko.partner#1 | Ort, ROT | r 0,088 < 0,5 (7 Orte) |

## 0b. Kann das Spiel an den Ort und in die Zeit?

- **Es gibt keinen Erd-Samen mit der Geografie der Erde.** `planet-core.js:2` ist „der Planet als FUNKTION f(samen, breite, laenge, zeit)“,
  `PLANET_ERDE` (planet-core.js:264) trägt nur Konstanten (Radius, g, Neigung, Jahr 365 d, Alter 4 570 Ma). Kontinente, Klima (kT, kN, Köppen,
  planet-core.js:1965) entstehen aus der Saat. Yellowstone, Białowieża, Glacier Bay gibt es als Ort nicht — nur als **Klima-Analog**.
- **Die Reise steht:** Konsole `reise <Breite> <Länge> [<Zeit in Ma>]` (stamm/feld-leben.js:1278–1298) → `planet-ort` → `_reiseBetreten`
  (stamm/netz-portal.js:660) → `ortGesetz(teil)` (gelaende-core.js:5916) bildet Klima, Schnee, Meer, Spende, Wetter und den Wuchs
  (`ortWuchs`, gelaende-core.js:5798: decke, wald, gras, laub, nadel, sand). Die Arten bleiben die der Heimat: 9 Bäume
  (stamm/vegetation-baum.js:3306: tanne, kiefer, buche, birke, eiche, erle, karst, palme, zypresse).
- **Die Zeit:** `zeitMa` in ganzen Ma (−4 000 … +1 000) — für Pflanzen nutzlos grob. Die Zeit der Pflanzen ist Saison (`setSeason`,
  `_tickSeason` stamm/bild-himmel.js:1118) und Prozesszeit (`state.spielZeit` → `_baumAlter`, die Station verschiebt sie synchron).
- **Die Heimat IST schon ein Klima-Referenzort:** `TEMPERATUR` (gelaende-core.js:1313) Sommer 18 °C, Winter −4 °C, Mittel 7 °C — mitteleuropäisch-
  kontinental; Spende `PEGEL.spende` 0,0009 m/d (gelaende-core.js:1605) = 328 mm/a (als Abflussspende gelesen; ungeprüft, ob Niederschlag gemeint ist).
- **Messorte** (spec/profiband/haushalt.json): `wiese` [−280,4, −1 045,6] (Wald, Wiese, Streu, Waldrand) trägt Szene 1 und 3 (Bach am Wald);
  kein Messort für Brandfläche, See-Mitte, Kadaver oder Altwald.

---

## (a) Referenz-Szenen

### Szene 1 — Der Mischwald der Heimat im Frühsommer (Klima-Analog Mitteleuropa / Białowieża), Mess-Wiese und 200 m Bestand dahinter

**Ort/Zeit:** Heimat-Saat, Messort `wiese`, Juni (Saison sommer, Mittag) und dieselbe Kamera im Winter; Bestand Alter 50/100/150 über `_baumAlter`.

**Bänder**

| Größe | Wert | Quelle | URL | geprüft |
|---|---|---|---|---|
| Stammzahl Mischwald | 370–900 je ha (BWI4 600/ha > 7 cm) | spec/abnahme/real-mischwald.json | (Repo) | Repo |
| Stammzahl Dauerflächen Białowieża (Wirtschaftsteil) | 445–593 je ha | Paluch et al. (poln., Abstract) | https://agro.icm.edu.pl/agro/element/bwmeta1.element.agro-c11454bb-e8bd-44be-bedf-73750b81df7f/c/2012_09_663au.pdf | Such-Auszug |
| Selbstdurchforstung Reineke | log N = −1,605 · log Dq + k; Bezug Dq 10 in (25,4 cm) | Reineke 1933 | https://en.wikipedia.org/wiki/Stand_density_index | Seite gelesen |
| Ertragstafel Fichte I. Ekl. | N(150)/N(50) ≈ 0,3; G(150)/G(50) ≈ 1,4 | Wiedemann 1936/42 (refQuelle k2-leben.js:873–874) | (Station) | Station |
| Grundfläche Urwald Mitteleuropa | 34–40 m²/ha trocken; ~60 m²/ha Erlen-Eschen-Fichten-Bruch | Review europ. Urwälder | https://zenodo.org/records/6559267/files/Monografia%20EN.pdf (Treffer der Suche) | Such-Auszug |
| Starkbäume Urwald | 10–20 lebende Bäume/ha mit BHD > 70 cm | ebd. | ebd. | Such-Auszug |
| Blattflächenindex | Laubmischwald ~5,5; Kiefer 3–4; dichte Fichte bis 10; Buche 4,5–9,5 | Körner (Strasburger); Buchen-Studien | https://bionumbers.hms.harvard.edu/bionumber.aspx?id=113232 | Such-Auszug |
| Totholz-Anteil Urwald | „fast die Hälfte allen Holzes ist tot“, ~10× Wirtschaftswald | Białowieża | https://en.wikipedia.org/wiki/Bia%C5%82owie%C5%BCa_Forest | Seite gelesen |
| Totholz Wirtschaftsteil | 24,8 m³/ha gegen 5,3 m³/ha | FAO-Bericht (Plan 2012–2021) | https://fao.org/forestry-fao/43191-0f2590f1fbfd6624ec9457f030794ee7d.pdf | Such-Auszug |
| Abbau liegendes Totholz k | Buche 0,054/a · Fichte 0,033/a · Kiefer 0,032/a | Herrmann, Kahl & Bauhus 2015 | https://forestecosyst.springeropen.com/track/pdf/10.1186/s40663-015-0052-5 | Such-Auszug (Seite: Paywall-Umleitung) |
| Temperatur-Antwort k | ≈ 2,6× je 10 °C Jahresmittel | Harmon et al. 2020 | https://andrewsforest.oregonstate.edu/sites/default/files/lter/pubs/pdf/pub5121.pdf | Such-Auszug |
| Phänologie-Folge | Hasel eröffnet den Vorfrühling … Buche-Blattentfaltung schließt den Frühlingsindex; 1991–2020 im Mittel 12 Tage früher als 1961–1990 | DWD / MeteoSchweiz / Hamburg | https://www.meteoschweiz.admin.ch/service-und-publikationen/applikationen/ext/climate-pheno-springindex.html | Such-Auszug |
| Whittaker-Zelle Laubwald | Jahresmittel ~10 °C (5–17), Niederschlag 750–1 500 mm | NASA Earth Observatory | https://www.earthobservatory.nasa.gov/biome/biotemperate.php | Such-Auszug (Seite umgeleitet) |
| Bestäuber ↔ Blütendichte | Besuch am höchsten bei mittlerer lokaler Blütendichte, Dichte-Effekt skalen-abhängig (> 100 Arten) | Oecologia 2023 | https://doi.org/10.1007/s00442-023-05461-3 | Such-Auszug, keine Zahl |

**Sprossen, die sie richtet:** karte2.leben.pflanzen.dichte#1, karte2.leben.pflanzen.dichte#2, karte2.leben.pflanzen.lebenslauf#1,
karte2.leben.pflanzen.lebenslauf#3, karte2.leben.pflanzen.jahreslauf#2, karte2.leben.pflanzen.jahreslauf#3, karte2.leben.pflanzen.biome#1,
karte2.leben.oeko.partner#1, karte2.leben.oeko.partner#2, karte2.leben.oeko.partner#3, karte2.leben.oeko.zerfall#3, karte2.leben.oeko.vielfalt#2,
karte2.leben.oeko.stoffe#3.

**Heute im Spiel:** Bestand mit Selbst-Ausdünnung, gemessen Dach 261/296 + Schicht 123/168 = 384/464 Stämme/ha bei Stand 0,5/0,8, Kronendeckung
0,77/0,83 (phyto-core.js:3347–3380, Kommentar); reverse-J-Größe `groesse` [0,55, 1,95] (phyto-core.js:3367); Uferart ab Feuchte 0,6
(phyto-core.js:3364); Waldgrenze unter dem Sommer-Schnee (phyto-core.js:3381); Saum `forestOrt` (phyto-core.js:3450); das Jahr über
`kroneImJahr` (phyto-core.js:7451) und `_tickSeason` (stamm/bild-himmel.js:1118); Bestäuber je gezeichneter Blüte (`_bestaeuberTakt`,
stamm/kreatur-fauna.js:617–660); Totholz und Konsole als zeitlose Gestalt (foundry-core.js:5155 laut Karte).

**Fehlt:** ein Zahl-Richter für lebenslauf#1 und dichte#1 (beide `ohneZahl`, „kein GRÜN ohne Schwelle“ — k2-leben.js:26–33); die Bestäuber-Probe
zählt Blüten als Pixel des ganzen Bilds, Bestäuber nur im Kreis von 12 m (g2.js:3740–3790: zwei verschiedene Fenster); Totholz wächst nicht in der Zeit;
kein Pilz-Partner; Ego im Bestand ist kein Messort.

**Wo das Gesetz lebt:** phyto-core.js `bestand` (3340–3390), `forestSteht`/Matérn III (3586), `treeParams` (2592), `forestStehende` (3810),
`planForestCell` (4007); stamm/kreatur-fauna.js `_bestaeuberTakt` + tetrapoda `BESTAEUBER_GESETZ`; Station k2-leben.js (punkte-maschine) Zeilen 853, 1272.

**Erste Welle (EIN Schnitt): die Familie `ohneZahl` fällt — ihr Soll wird ein Band dieser Szene.** Chokepoint: `ohneZahl` in
meisterkarte-quelle/punkte/stationen/k2-leben.js:26–33 (fünf Richter: lebenslauf S1, jahreslauf S4, dichte S1, kraft S3, S4). Was stirbt: der Richter
„gegen die Referenz“, der nie GRÜN wird. lebenslauf#1 urteilt das Höhenhistogramm des Bestands gegen Reineke (Steigung −1,605 ±10 %) und die
Ertragstafel; dichte#1 den Ring-Bildanteil über den Lückenanteil P = exp(−G·LAI/cos θ) (das Gesetz `laiWirk` steht schon in g2.js:2436, G 0,5)
gegen LAI-Band Wiese/Wald. Im selben Schnitt misst die Bestäuber-Probe Blüten und Bestäuber im SELBEN Kreis von 12 m (Fenster-Fehler).
Dateien: stationen/k2-leben.js, stationen/g2.js (partnerSitzungProbe). Bildpaar: Ego 30 m im Bestand hinter dem Waldrand der Mess-Wiese, Juni, gegen
die Foto-REF real-mischwald; dazu die Mess-Wiese Ego stehend (Ringe 2–5/5–10/10–20 m).
Erwartet an der Front: **2** (dichte#1, lebenslauf#1), partner#1 nur, wenn das Gesetz im gleichen Kreis trägt (ehrlich: offen) · ~5 h.

### Szene 2 — Die Wunde: Yellowstone-Brand 1988 bis 25 Jahre danach (Klima-Analog kontinental-subalpin), dazu Glacier Bay für die Primärsukzession

**Ort/Zeit:** per `reise` an einen kalt-kontinentalen Ort der Saat (Kiefer-Dominanz über `wuchs.nadel`), Sommer; ein Brand von 1 km² aus
Brennstoff und Wind, dann `spielZeit` +1/+5/+25 Jahre. Glacier Bay als zweiter Band-Satz für den nackten Grund (0 → 225 Jahre).

**Bänder**

| Größe | Wert | Quelle | URL | geprüft |
|---|---|---|---|---|
| Brandfläche 1988 | fast 1 Mio. von 2,2 Mio. acres | High Country News 1994 | https://www.hcn.org/issues/issue-21/yellowstone-fires-produce-new-trees-not-meadows/ | Seite gelesen |
| Kiefern-Sämlinge, mäßiger Brand | bis 400 je acre (≈ 990/ha) | ebd. | ebd. | Seite gelesen |
| Espen-Sämlinge | 1 bis 1 000 je m² | ebd. | ebd. | Seite gelesen |
| Sämlingsdichte über die Landschaft | ~100 bis > 500 000 je ha | Kashian et al. 2005, Ecology | https://s.wayne.edu/kashianforest/files/2020/01/Kashian_et_al_2005_Ecology.pdf | Such-Auszug |
| nach 10 Jahren | 0 bis > 500 000 Jungbäume/ha; > 60 % der Brandfläche < 5 000/ha | Kashian et al. 2004, CJFR | https://s.wayne.edu/kashianforest/files/2020/01/Kashian_et_al_2004_CJFR.pdf | Such-Auszug |
| SDI-Maximum Drehkiefer | 277 je acre bei 10 in (≈ 684/ha) | Cochrane et al. 1994 (über Wikipedia) | https://en.wikipedia.org/wiki/Stand_density_index | Seite gelesen |
| Glacier Bay Abfolge | jüngste Flächen Dryas + Alnus; 50–150 Jahre Fichte/Pappel | Chapin et al. 1994 (über Studie 2018) | https://link.springer.com/article/10.1007/s10021-018-0245-1 | Such-Auszug |
| Boden-N Glacier Bay | Zuwachs 2,3–3,6 g N m⁻² a⁻¹ (seit 1840 eisfrei) | Fastie 1994 | https://scholarworks.alaska.edu/uaf_unassigned_theses/365 | Such-Auszug |
| N-Verlust | am höchsten bei 140–165 Jahren | Malone et al. 2018 | https://link.springer.com/article/10.1007/s10021-018-0245-1 | Such-Auszug |
| Fichten-Ankunft | Abstand zur Samenquelle erklärt bis 58 % der Varianz | Fastie 1994 | https://scholarworks.alaska.edu/uaf_unassigned_theses/365 | Such-Auszug |

**Sprossen:** karte2.leben.oeko.sukzession#2, karte2.leben.oeko.sukzession#3, karte2.leben.oeko.sukzession#4, karte2.leben.pflanzen.lebenslauf#3,
karte2.leben.oeko.stoffe#2 (Erle bindet N — Glacier Bay ist die Referenz dafür), karte2.leben.oeko.zerfall#3, karte2.leben.pflanzen.biome#2.

**Heute im Spiel:** Brand → Asche → Gras → Busch → Wald an Brand-Zellen um das Dorf, Halme 477 → 70 → 491, Sämling 0 → 1 (stamm/feld-leben.js,
laut Karte; sukzession#1 gebucht); Asche +0,4 auf EINEN Nährstoff-Skalar (stamm/feld-leben.js:3736 laut Karte); Kiefer und Erle als Arten.

**Fehlt:** Feuer, das sich aus Brennstoff und Wind über 1 km² ausbreitet (Mosaik, Überlebenden-Inseln); Sämlingsdichte nach Feuer-Regime; N getrennt
von P; kein Messort Brandfläche; die Station sukzession#2 misst nur „jahre ≥ 25“ (k2-leben.js:6286) — die Yellowstone-Zahlen stehen nicht im Soll.

**Wo das Gesetz lebt:** stamm/feld-leben.js (SUKZESSION, Nährstoff je Zelle), phyto-core.js `forestStehende`/`planForestCell` (die Geburt), der EINE Wind `_windAt`.

**Erste Welle:** der Brand als Feld (Brennstoff = Bestand × Trockenheit, Ausbreitung mit dem Wind) im Nährstoff-Feld von feld-leben, die Geburt
der Darts danach aus `planForestCell` mit Sämlingsdichte im Band 10²–5·10⁵/ha. Bildpaar: Überflug derselben Kamera 1/5/25 Spieljahre.
Erwartet an der Front: **1** (sukzession#2) · ~16 h. Sichtbar: der Spieler sieht das schwarze Mosaik und den Kiefern-Jungwuchs.

### Szene 3 — Bach und See der Heimat im Sommer, Mittag und Mitternacht

**Ort/Zeit:** Heimat, Bach am Rand der Mess-Wiese (der Bach-Kolk von lebensraeume#1) und ein See-Körper, feste Posen unter Wasser, Uhr 0,5 und 0.

**Bänder**

| Größe | Wert | Quelle | URL | geprüft |
|---|---|---|---|---|
| Sicht Bach | 5–20 m | Davies-Colley & Smith 2001 (refQuelle k2-leben.js:4318) | (Station) | Station |
| Sicht See oligo–meso | 2–16 m | Carlson 1977 (k2-leben.js:4319) | (Station) | Station |
| Sicht Tieflandfluss | 1–1,5 m | Davies-Colley & Smith 2001 (k2-leben.js:4320) | (Station) | Station |
| Secchi nach Trophie | oligotroph 5,6 ± 1,5 m · mesotroph 2,5 ± 1,1 · eutroph 1,3 ± 0,6 | Seen-Tabelle | https://pmc.ncbi.nlm.nih.gov/articles/PMC8216980/table/ece37651-tbl-0001 | Such-Auszug |
| Secchi Grenze | oligotroph ≥ 5 m, eutroph < 2,5 m | GVSU | https://www.gvsu.edu/wri/education/instructors-manual-water-transparency-8.htm | Such-Auszug (Seite 404) |
| Secchi Extrem | 230–260 ft (Blue Lake NZ), 80 m beansprucht (Weddell-See) | Wikipedia Water clarity | https://en.wikipedia.org/wiki/Water_clarity | Seite gelesen |
| Vertikalwanderung See | Daphnia ~5–20 m; Ozean „mehrere hundert Meter“ | Biological Reviews (Abstract) | https://www.cambridge.org/core/product/3AEDFB1DBF829F647D8FBD4254FB60F9 | Such-Auszug |
| Größenspektrum | Abundanz-Steigung −1,04 (95 %: −1,05 bis −1,02) Bakterie bis Wal ⇒ Biomasse je log-Klasse ~gleich | Hatton et al. 2021 | https://pmc.ncbi.nlm.nih.gov/articles/PMC8580314 | Such-Auszug |
| Sheldon 1972 | Partikel 1–100 µm, Klassen V, 2V, 4V | Sheldon, Prakash & Sutcliffe 1972 | https://misclab.umeoce.maine.edu/ftp/classes/OO2017/readings/Sheldonetal1972.pdf | Such-Auszug |

**Sprossen:** karte2.leben.wasser.bild#1, karte2.leben.wasser.lebensraeume#2, karte2.leben.wasser.netz#2, karte2.leben.wasser.rhythmen#2,
karte2.leben.wasser.bild#4, karte2.leben.wasser.netz#4.

**Heute im Spiel:** Sicht 19,6 m am Bach, Absorption/Rückstreuung je Kanal nach Gordon 1975 (stamm/bild-sicht.js:217 laut Karte) — headless;
3 feste Wasserkörper, das Meer liest den See-Körper; Fischleib ein Oktaeder; Fische mittags/mitternachts 25,079/25,08 m (front-tafel, FISCH_GESETZ ohne
Uhr); Meer der Welt 16,97 m tief; Hydrosphäre und Spiegel im Kern (gelaende-core.js:6112 `hydrosphaere`, :7772 `wasserSpiegel`).

**Fehlt:** die Sicht-Messung im Fenster (bild#1 steht in „KEINE STATION“); Trübe aus Plankton/Schwebstoff am Ort statt 3 Körpern; ein Plankton-Feld;
eine Uhr der Fische; ein tiefes Meer (≥ 200 m) — Planet-Domäne.

**Erste Welle:** bild#1 im Fenster an drei festen Posen (Bach, See, Fluss) gegen die Station-Bänder messen; Sichtbar: der Blick unter Wasser im Bach
reicht 19,6 m, im See weniger. Erwartet: **1** (bild#1, falls Fluss und See ihr Band treffen; der See-Körper deckt das Meer — ehrlich unsicher) · ~4 h.

---

## (b) Richter-Urteil

| Richter | Soll wörtlich | Herkunft | Urteil | Grund |
|---|---|---|---|---|
| leben.oeko.partner#1 | „r(Bestäuber, Blüten) ≥ 0,5 aus dem Bild“ | erfunden (alte luftwasser.K4) | band | Die Probe misst Blüten im ganzen Bild, Bestäuber im Kreis von 12 m (g2.js:3740ff) und urteilt r über 7 Punkte; die Natur zeigt eine nicht-monotone Dichte-Antwort — das Soll wird Besuche je Blüte und Stunde im Feldband im selben Kreis. |
| leben.pflanzen.lebenslauf#1 | „Höhenhistogramm aus dem Bild gegen Ertragstafel“ | unklar (`ohneZahl`) | band | Kann nie GRÜN werden; Reineke −1,605 und Wiedemann stehen schon in der Station (S3). |
| leben.pflanzen.dichte#1 | „Ring-Bildanteil gegen Foto“ | unklar (`ohneZahl`) | band | Lückenanteil aus LAI (Körner ~5,5 Wald) über `laiWirk` (g2.js:2436) gibt die Zahl. |
| Familie `ohneZahl` (jahreslauf S4, kraft S3, S4) | „… gegen Satelliten-NDVI / Video / Sturm-Statistik“ | unklar | band | Derselbe Bauplan-Fehler; jede Sprosse braucht ihre Zahl (z. B. Grünwelle 3–4 Tage je 100 m steht in der Karte). |
| leben.pflanzen.biome#1 | „Uferarten am Wasser ≥ 90 %, Wärme-Arten außerhalb der Wärme 0“ | erfunden (Schwelle), Fall echt | bleibt | Fand zwei echte Fehler: Palme folgt dem Rauschen `lebendig`, Erle ohne Wasser (64,7 %); der Fix steht (phyto-core.js:3364). |
| leben.pflanzen.jahreslauf#2 | „Rangkorrelation ≥ 0,8“ | aussen (Reihenfolge DWD), Schwelle eigen | bleibt | GRÜN 0,975 mit Preis; misst echte Reihenfolge. |
| leben.pflanzen.kraft#2 | „Kreuzkorrelation Gras ↔ Krone mit Laufzeit ±20 %“ | gesetz (Taylor 1938) | bleibt | GRÜN 6,5 %; physikalisch begründet. |
| leben.oeko.vielfalt#1 | „Spielgang 10 min, Tier im Bild ≥ 200 px“ (≥ 3 Sichtungen) | erfunden | bleibt | Fand den echten Fehler „Tiere nicht im Blick“ (Ego 0 Sichtungen in 601 s) — genau die Klage des Schöpfers. |
| leben.wasser.bild#1 | „Sichtweite in m an fester Pose gegen das Band des Gewässertyps“ (5–20 · 2–16 · 1–1,5 m) | aussen | bleibt | Schon Band mit Quelle; es fehlt nur die Messung im Fenster. |
| leben.wasser.rhythmen#2 | „Hub ≥ 200 m“ | aussen (Ozean) | bleibt | Das Soll ist wahr, für Seen liegt das Band bei 5–20 m; der Fehler ist das 16,97 m tiefe Meer (Planet), nicht die Schwelle. |
| leben.wasser.netz#2 | „Phase der Blüte ±1 Monat“ | aussen (SeaWiFS) | bleibt | Es fehlt das Plankton-Feld, nicht das Maß. |
| leben.oeko.stoffe#2 | „nach 5 Spieljahren … Wuchs-Unterschied > 0“ | gesetz (Richter-Wort) | bleibt | Fand das Fehlen (EIN Skalar statt N/P); Glacier-Bay-Erle gibt später das Band (2,3–3,6 g N m⁻² a⁻¹). |
| leben.oeko.zerfall#3 | „Totholz 10–30 % der Biomasse“ | aussen-nah, ungeprüft | band | Białowieża: fast die Hälfte des Holzes tot — das Band hängt am Bestandesalter (Wirtschaftswald 5 m³/ha bis Urwald), nicht ein fester Bereich. |

## (c) Widerspruch — wo die These in dieser Gruppe nicht trägt

1. **Es gibt keinen Erd-Samen mit Erd-Geografie.** planet-core ist f(samen, breite, laenge, zeit); `PLANET_ERDE` trägt nur Konstanten. „Geh an den
   richtigen Ort“ heißt für Pflanzen: an die richtige **Klima-Zelle** (Whittaker T × P, Köppen) und das richtige **Bestandesalter** — das kann das Spiel
   heute (Reise + Saison + `_baumAlter`). Die Heimat (18/−4 °C) ist schon die Zelle Mitteleuropa; eine Reise braucht Szene 1 nicht.
2. **Die Zeit der Pflanzen ist keine Epoche.** `zeitMa` springt in Millionen Jahren; Sukzession und Zerfall brauchen Jahre bis Jahrhunderte in der
   Prozesszeit. Die „richtige Zeit“ ist Saison × Alter, nicht Erdgeschichte.
3. **Die meisten roten Fronten hält ein fehlender Macher, kein falsches Soll:** stoffe#2 (kein N/P), wasser.netz#2 (kein Plankton), rhythmen#2 (kein tiefes
   Meer, keine Fisch-Uhr), sukzession#2 (kein Flächenbrand), zerfall#2 (keine 10 Kadaver). Eine Referenz eicht erst, wenn das Gesetz existiert.
4. **Panel-Richter** (arten#1 Gattung ≥ 80 %, Herbar ≥ 0,7; arten#4, dichte#4, wasser.bild#6) brauchen Menschen (R11), keine Daten.
5. **Wasser:** die datenreichen Orte (offener Ozean: Sheldon, Jerlov, Vertikalwanderung von mehreren hundert Metern) gibt es im Spiel nicht — 3 feste
   Wasserkörper, das Meer 16,97 m tief.
6. **Die These stimmt genau an der `ohneZahl`-Familie und an der Bestäuber-Probe:** dort ist das Soll unklar oder erfunden, und eine Quelle gibt die Zahl.

## (d) Nicht gelesen

k2-leben.js nur an den Soll-Zeilen und Zeugen-Köpfen (nicht die Mess-Funktionen ganz); g1.js/g2.js nur Auszüge; front-tafel nur meine Zeilen;
stamm/feld-leben.js Sukzession und Nährstoff (nur aus der Karte zitiert); vegetation-wiese.js; tetrapoda-core (BESTAEUBER_GESETZ, FISCH_GESETZ);
foundry-core Totholz; bild-sicht.js; der Körper von `hydrosphaere`/`wasserSpiegel`; FELD_WURF (stamm/siedlung-satz.js:1992) nur gefunden;
Originalarbeiten Turner 1997, Kashian 2004/2005, Herrmann 2015 (Paywall-Umleitung), Chapin 1994, Whittaker 1975, USA-NPN, Arten-Areal-Daten
(nur aus der Karte: z 0,15–0,35), Bestäuber-Besuchsraten mit Zahl (nicht gefunden → ungeprüft). Keine Git-Geschichte.
