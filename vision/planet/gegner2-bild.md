# Gegner Bild 2 — „die Karten lesen als Planet" am frischen Samen (ZWISCHENSTAND)

Kern: Baum `w28-planet-kern`, Kopf `e33f14134a` (VERSION `planet-g3-2`; der Auftrag nennt d660f478, der Baum steht weiter), eingefroren
als Kopie (SHA-256 `959398db…a826`, byte-gleich mit dem Baum), nur gelesen. Saaten `erde-gegner2b-01 … 08` (Erd-Schlüssel, Jahr aus
gelaende-core), von keinem Bauer gesehen. Karten 1600 × 800 (relief + biom), dazu je Zeit zwei Pol-Fenster (planetKarteAusschnitt,
azimutal, 7 000 km, 801 px, Mitte 89,94°). Alles unter `artifacts/profiband/auge/planet-kern/welle2/gegner/`. Bild-Koordinaten in
Pixeln der 1600er-Karte (x nach Ost, y nach Süd). Jede Karte selbst angesehen; die Stellen unten zusätzlich vergrößert.

**Urteil:** Aus dem Orbit liest ein Mensch einen Planeten mit Ozeanen, Gräben und Gebirgen — und dann, binnen Sekunden, acht
Maschinen-Spuren. Die schärfste ist neu benannt und am Täter bewiesen: der **Stern** im Inneren der Kontinente kommt zu 76 % aus dem
Rand-Gedächtnis mit 32 Azimut-Fächern. Die Widerlegung trägt; „die Karten lesen als Planet" gilt nur aus dem Orbit.

## Funde (Saat · Zeit · Bild-Koordinate · vermutete Ursache)

### F1 Stern — Strahlen aus einem Punkt im Kontinent-Inneren (BEWIESEN, 6 von 8 Saaten)
- 03 · t 0 · x≈1147, y≈180 (12+ Strahlen, am klarsten); 03 · 0 · x≈440, y≈235; 03 · 0 · x≈150, y≈300; 04 · 0 · x≈1240, y≈180 und
  x≈110, y≈530; 07 · 0 · x≈860, y≈130; 06 · 0 · x≈300, y≈280; Pol-Fenster 07 nord (470, 660), 03 nord (440, 240).
- Täter gemessen (Ring von 128 Punkten im Radius 150 km um den Stern 03/1147/180, fuss 16 km, Terme aus `_intern.terme`): die
  Knick-Summe im Azimut der Höhe 1,322 km stammt zu 1,318 km aus dem Term `gedaechtnis`; jeder andere Term ≤ 0,024. Gegenprobe an
  einer Diagnose-Kopie (nur im Scratch, Kern unberührt): ohne die 32 Rand-Fächer fällt die Knick-Summe auf 0,318 (−76 %), ohne die
  Nähte bleibt sie 1,318. Bildpaar: `probe-stern-03-kern.png` ↔ `probe-stern-03-ohne-randfaecher.png` (2 400 km, 401 px) — der
  Stern verschwindet, schwache Rest-Strahlen bleiben.
- Ursache: `planet-core.js:1444–1455` — `fpos = az/TAU·32`, linear zwischen zwei Fächern, Azimut um die Schollen-MITTE; die Höhe
  `RT·gauss(innenKm − 300, breite)` mit Breite `85·(1 + a/200)` km (`:1157–1166`) reicht bei alten Rändern bis zur Mitte, wo alle
  32 Fächer zusammenlaufen. Tafel `:730–768`. Rest-Strahlen: Naht-Fenster im Azimut `:1434–1435` (glatt 0,6…1·halb).

### F2 Perlenschnur — Hotspot-Ketten als gleichabständige, gleich große Punkte auf Lineal-Linien (8 von 8)
- 04 · 0 · x≈530–560, y≈120–330 (senkrecht); x≈700–730, y≈200–380; x≈120–380, y≈430–460 (waagrecht); x≈840–940, y≈548.
  05 · 0 · x≈1440–1480, y≈590–690. 07 · 0 · x≈1150–1170, y≈455–560; x≈1360–1520, y≈185–220. 08 · 0 · x≈440–470, y≈100–240;
  Pol-Fenster 08 nord (400–570, 680–750) — 20 identische Perlen im gleichen Takt. 06 · 0 · x≈205, y≈440–480.
- Ursache: `planet-core.js:888–903` (24 Kegel je Kette im festen 3,5-Ma-Takt, Gewicht nur aus τ) und `:1478–1485` (ein Kegel =
  `gauss(d, sig)` mit `sig = 30 + 90·S1`, Stärke `st` je Hotspot fest). Gleicher Takt × gleiche Plattengeschwindigkeit = gleicher
  Abstand; keine Größen-Streuung, keine Doppel-Ketten, kein Knick.

### F3 Lineal-Kanten und rechte Winkel an Platten-Grenzen im Ozean (4 von 8)
- 04 · 0 · Graben x≈600–775, y≈350–365 schnurgerade Ost-West, Ecke von 90° bei x≈775, y≈358, weiter gerade nach Süd bis y≈420;
  der Inselbogen läuft parallel als Lineal. 04 · 0 · x≈460–520, y≈120–200 gerades Graben-Stück.
- 08 · 0 · x≈200, y≈90–450: senkrechte Gerade (Meridian) über 360 px ≈ 8 000 km; x≈10–440, y≈40–100 harte Bogen-Naht im Boden.
- 05 · 0 · x≈1420, y≈20–180 senkrechte Stufe im Boden-Ton.
- Kreisbögen bleiben: 05 · 0 · x≈1280–1520, y≈230–690 Halbkreis-Graben; 06 · 0 · x≈1030–1480, y≈80–560 ein geschlossener Rücken-Ring;
  Pol-Fenster 08 nord: glatter Kreisbogen von (390, 230) nach (100, 470).
- Ursache: `planet-core.js:1000` — Ozean-Platte = Kappe, Zuordnung `rho_i − Winkel(q, p_i)` (Leistungs-Diagramm auf der Kugel: bei
  ähnlichem ρ Großkreise, also Geraden und Ecken), Verzug `:953–960` mit 900 km auf 2 600 km weich bei 650 km gekappt — auf
  8 000 km Grenze unsichtbar. Gefaltet wird nie.

### F4 Rahmen, Ringe und Würmer — Gebirge laufen der Krusten-Kante im festen Abstand nach (8 von 8)
- Rechteck-Rahmen: 03 · 0 · x≈300–390, y≈430–495 — ein Gebirgs-Rahmen mit geraden Seiten und Ecken um eine flache Mitte.
- Ring: 05 · 0 · x≈720–775, y≈395–450 — geschlossener Gebirgs-Ring um ein kreisförmiges Becken („Atoll-Kreis").
- Würmer (glatte Schläuche gleichen Querschnitts, C- und S-Form, dieselbe Form wiederholt): 06 · 0 · x≈190–280, y≈345–410;
  05 · 0 · x≈235–330, y≈180–300, x≈150–200, y≈640–680, x≈840–880, y≈265–390 (zeichnet die Ellipse der Scholle nach), x≈1170–1210,
  y≈480–560; 08 · 0 · x≈555–720, y≈400–490, x≈660–740, y≈590–640, x≈990–1030, y≈465–530; 04 · 0 · x≈1000–1240, y≈690–720.
- Ursache: `planet-core.js:1452–1453` — erloschener Rand als `gauss(innenKm − 300, breite)`, `innenKm = (f − Q)·rs·R`: der Kamm
  liegt IMMER 300 km landein auf einer Höhenlinie des Schollen-Felds, also parallel zur Küste (Rahmen, Ring) und als Bogen der
  Schollen-Ellipse (`:1018–1026`, `fak` elliptisch). Nähte `:1440–1441` ebenso auf festem Bruchteil `nae[7]·rs`.

### F5 Harte waagrechte Bänder im Biom (8 von 8)
- Meereis-Kante über offenem Meer als Breitenkreis: Kante gemessen je Spalte (Hell > 135 → Meer < 90 mit 40 px Meer dahinter):
  08 nord 1 600 von 1 600 Spalten bei y 96–98 px (p05–p95 = **0,45°** über den ganzen Umfang); 04 nord 1,35°; 06 nord 1,57°;
  06 süd 1,80°. Median der Kante in 6 Saaten 95–107 px = 66,6–68,6° — dieselbe Breite auf jedem Planeten.
- Wüsten-Kante als Breitenkreis: 06 · 0 · x≈370–560, y≈450–460 und x≈1130–1250, y≈545–560 (grün/beige mit waagrechter Kante).
- Ursache: `planet-core.js:297` + `:1751` / `:2050` — Meereis allein aus Winter-Luft < −12 °C; über offenem Meer hängt die
  Winter-Luft nur von der Breite ab (Festlands-Einfluss `e^(−d/600 km)`, Randstrom nur bis ~500 km). Die Wüsten-Kante:
  Absinken `:1899–1902` (Gauß um 0,85·w mit Breite 0,3·w, nur Breite).

### F6 Wind-Strahlen — gerade Feuchte-Kanten parallel zum Wind (5 von 8)
- 03 · 0 · x≈235–500, y≈150–250: schnurgerade Grenze grün ↔ beige quer durch den Kontinent, Neigung ≈ 17° (= atan 0,3, das
  meridionale Verhältnis des Winds). 03 · 0 · x≈1230–1300, y≈200–300 senkrechte grüne Säule. 08 · 0 · x≈1460–1540, y≈450–490
  Zebra-Streifen; x≈380–470, y≈440–520 schräge Bänder. 05 · 0 · x≈600–700, y≈420–520 grün-beige-grün im Gleichtakt.
- Ursache: `planet-core.js:1926` (`vN = 0,3·uO`, Wind-Richtung je Breite fest) und `:1942–1961` — die Feuchte integriert entlang
  EINES geraden Großkreises bis 2 100 km; jede Küsten-Ecke luvwärts wirft einen geraden Schatten-Strahl leewärts. Die Kante wird
  hart durch `meerLuv` binär `:1980` (vermutet; nicht getrennt gemessen).

### F7 Ellipsen-Umriss bleibt sichtbar (6 von 8)
- 04 · 0 · x≈830–1100, y≈330–550 (gedrehte glatte Ellipse); 06 · 0 · x≈480–800, y≈50–230 (Linse mit Kamm an der Südkante);
  06 · 0 · x≈1080–1280, y≈310–640; 08 · 0 · x≈550–730, y≈255–440 (Ei), x≈745–810, y≈340–425; 05 · 0 · x≈780–850, y≈385–480.
- Gegen den Blick des Koordinators (1): die Lappen tragen jetzt Buchten, Binnen-Flachmeere (06 · 0 · x≈350–450, y≈305–375),
  Halbinseln und ein Größen-Spektrum (05 trägt 20+ Stücke). Die Ellipse liest man an den GRÖSSTEN Stücken und am Kamm von F4,
  der ihre Kontur nachzieht.
- Ursache: `planet-core.js:1022–1026` (`f = 1 − Winkel·fak/rs`, ein elliptischer Kegel je Scholle) — das grobe Lappen-Band
  `:1040` (λ bis 6 000 km) verbiegt die Kontur, bricht sie aber selten.

### F8 Graben-Fraß und Doppel-Graben (2 von 8)
- 03 · 0 · x≈1230–1450, y≈660–720 und Pol-Fenster 03 süd (480–720, 460–780): Tiefsee als Lochfraß — mäandernde dunkle Punkte im Flachmeer.
- Pol-Fenster 03 nord (130–640, 400–800): zwei parallele Gräben gleicher Krümmung im festen Abstand (ein Graben und seine Kopie).
- Ursache vermutet, nicht gemessen: `planet-core.js:1380–1386` — „die Graben-Profile sind beidseitig und bleiben scharf": jede
  Platte rechnet ihren Graben im Mittel-Band ±NAHT_KM; bei Versatz der beiden Ränder entstehen zwei.

### Kein Fund
- **Pol-Verzug:** an 12 Pol-Fenstern (8 Saaten × t 0, nord + süd; dazu 01/02 bei −200) keine Singularität, kein Wirbel, kein Strahl
  an der Pol-Mitte (400, 400). Die bunten Pol-Zeilen der Breiten-Karte (03 · 0 · y 0–15 grün; 07 · 0 · y 0–40 braun) sind echte
  Polar-Kontinente, im Fenster als normaler Kontinent lesbar.
- **Lineal-Kante an Kollisions-Plateaus durch Fächer-Grenze:** an t = 0 nicht als senkrechte Messerkante gefunden; der verwandte
  Täter ist F1/F4 (Fächer + 300-km-Kamm).

## Zeit (Saaten 01 und 02, −200 · −100 · −50 · 0 · +50)

Land-IoU, flächen-gewichtet, Gitter 256 × 128, fuss 160 km:
- 01: −200→−100 **0,243** · −100→−50 0,404 · −50→0 0,460 · 0→+50 **0,650**; je 10 Ma 0,79–0,87; über das Schlüsselbild +24,8 Ma
  24→25 **0,986**, 25→26 0,990.
- 02: −200→−177 0,83 (über das Schlüsselbild −177,7: −178→−177 **0,989**) · −177→−100 0,494 · −100→−50 0,392 · −50→0 0,395 ·
  0→+50 **0,615**; über das Schlüsselbild +20,4: 20→21 **0,991**.
- Der Riss 0 → +50 des Blicks (6) ist an frischen Saaten widerlegt: 0→+50 ist hier der RUHIGSTE 50-Ma-Schritt, und kein
  1-Ma-Schritt über ein Schlüsselbild fällt unter 0,986.

## Offen (ehrlich)
- Ursachen F3, F5 (Wüste), F6-Härte, F8 sind aus dem Code gelesen, nicht durch Abschalten bewiesen; bewiesen ist F1.
- Kein Messname im Richter fängt F1, F2, F4, F5 (Eis-Kante als Breitenkreis); `klima.kante.flach` misst Fächer, nicht Strahlen.
