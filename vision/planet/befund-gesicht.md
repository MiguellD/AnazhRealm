# Befund Gesicht: die sechs Punkte im Blick des Koordinators (ZWISCHENSTAND, 14.11. abends)

Nur gelesen und gerechnet, auf der CPU. Der Kern `planet-core.js` (Zweig `w28-planet-kern`, Kopf d660f478) ist unberührt.
Jeder Schnitt ist als **gepatchte Kopie** gebaut und gemessen, nicht im Kern. Die Spikes liegen unter
`artifacts/profiband/auge/planet-kern/welle2/spike/`:
- `patch.cjs` baut die Kopien `kern-<name>.js`. Jede Ersetzung muss genau einmal passen, sonst bricht der Lauf.
- `lib.cjs` lädt Original oder Kopie und rechnet das Maß.
- Kopien der Skripte liegen im Zweig `koordination` unter `vision/planet/spike-gesicht/`.

Alle Zeilen-Angaben beziehen sich auf `planet-core.js` am Kopf d660f478. Konsum im Spiel weiter 0 %.
Kosten sind ABAB im selben Prozess gemessen (`kosten.cjs`), auf einem Laptop unter Last durch parallele Spike-Läufe. Es zählen
nur die Verhältnisse.

**Drei Sätze.**
- **Geschnitten:** Nichts im Kern. Für jeden der sechs Punkte ist die Formel benannt, die ihn erzeugt. Vier Schnitte sind als
  Kopie gebaut und über 12 Saaten gemessen (Lappen + Becken + Wurzel, Feuchte-Integral, Grenz-Normale). Zwei sind gerechnet
  (Größen-Spektrum, Kappen-Bogen).
- **Gemessen:**
  - Land-Stücke ≥ 10⁴ km²: 23 → 70,5 (Erde ~75, zu prüfen).
  - Formzahl der Kontinente: 0,83 → 0,67.
  - Flachland-Kanten im Niederschlag: 2,85 % → 0,86 %.
  - Lineal-Kante: Sprung 6,72 → 1,73 km auf 8,9 km Weg, Ursache gemessen; das Plateau läuft nach dem Schnitt aus.
  - 0 → +50 Ma: kein Riss, Schritt-IoU 0,83–0,86 in 5-Ma-Schritten.
- **Ehrlich offen:**
  - Die Lappen-Amplitude überschießt: Land > 1 000 km von der Küste 11,3 % → 2,9 % gegen geschätzte 10–20 % der Erde.
  - Das Größen-Spektrum der großen Massen fehlt noch: größter Kontinent 0,37 gegen 0,57.
  - Die Gebirgs-Gürtel zerkrümeln am verrauschten Krusten-Feld.
  - Kosten je Punkt +24–28 %.

## Punkt 1: Ellipsen-Flecken gleicher Art

**WO.**
- `schollenFeld`, planet-core.js:974–995. Das Feld einer Scholle ist ein Kegel über der Ellipse:
  `f = 1 − acos(d)·fak/rs` (Z. 979), mit `fak = √(ru²/a² + rv²·a²)` und `a = 1 + 0,6·Z` aus `ellipseJeScholle` (Z. 964–973).
- Rauschen gibt es nur im Gürtel `−0,75 < f < 0,6` (Z. 980). Die erste Wellenlänge ist `lam0 = min(3 000, rs·R)`, also der
  Radius (Z. 981). Die Amplitude ist geklemmt: `f += 0,6·n·glatt(−0,75; −0,25; f)·(1 − glatt(0,3; 0,6; f))` (Z. 992).
- Die Küste ist der Krusten-Rand. Das Profil `hA = oz(1 − S1) + S1(1 − S2)(−sd) + S2(fb + tafel)` (Z. 1252) hebt das ganze Innere
  ab der schmalen Rampe `RAMPE0 0,04 … RAMPE1 0,25` (Z. 274) auf Freibord. Unter Wasser liegt nur ein Saum der Kruste.
- Das Größen-Spektrum kommt aus `planetPlan`:
  - Schollen-Gewicht `raw = 0,35 + 1,6·u²` (Z. 326). Das Flächen-Verhältnis von der größten zur kleinsten Scholle ist ≤ 5,6.
  - Gruppen zu 2–6 Schollen der Reihe nach (Z. 342).

**WARUM.**
- Die Küste weicht höchstens um `0,6·|n|·rs` von der Ellipse ab, typisch ~0,2 rs.
- Eine erste Wellenlänge von einem Radius gibt ~6 Lappen je Umfang, alle gleich groß.
- Becken im Inneren kann es nicht geben, weil das Rauschen ab f = 0,6 ausgeschaltet ist und das Profil das Innere auf Freibord hebt.
- Inseln jenseits des Rands kann es nicht geben, weil das Rauschen unter f = −0,75 aus ist.
- Gerechnet über 2 000 Ziehungen des Plans (`spektrum.cjs`): Die größte Gruppe trägt im Median 0,22 der Kruste. Keine Gruppe
  liegt unter 5 % der Kruste, also gibt es weder einen dominanten Kontinent noch kleine Kontinente.

**SCHNITT an der Wurzel.** Drei Gesetze. Die Mechanik bleibt (Kruste zuerst, eine Gruppe = eine Platte, Q als Quantil des
Krusten-Anteils).
1. **Lappen:** Das Krusten-Feld trägt sein Spektrum ab `lam0 = 2·rs` (bis 6 000 km) auf dem ganzen Feld (Fenster ab f = −1,3) mit
   Amplitude ~2. Daraus entstehen Halbinseln, Buchten und Inselketten jenseits des Rands. Q löst sich wie heute.
2. **Becken:** Die Küste ist die Höhenlinie der Kruste über dem Meer, nicht ihr Rand.
   - Ein Feld B im Schollen-Rahmen mit Spektrum 4 000 km … Fuß, Gewinn 0,62 je Oktave (Hurst ~0,7) und Amplitude
     `5 × Freibord` wirkt auf der ganzen Kruste (Gewicht S1).
   - Schwellen heben den Schelf über das Meer; Becken fluten das Innere (Binnenmeere, Hudson-Typ).
   - Ersetzt die heutige `tafel` (0,3·fBm 1 400…600 km), keinen Zwilling.
3. **Spektrum (Plan):**
   - Schollen-Gewicht aus einer gestutzten Pareto-Verteilung (α 1,2).
   - Gruppen durch bevorzugtes Anlagern (Yule): Eine Scholle tritt einer Gruppe mit Wahrscheinlichkeit proportional zu ihrer
     Fläche bei, sonst gründet sie eine neue (p 0,25).

**SPIKE und Zahl.**
- Kopie `kern-becken+lappen+wurzel.js` gegen heute, 12 Saaten (`mass.cjs`, Tafel unten).
- Bild: `welle2/erde-09-0-relief-becken+lappen+wurzel-a2.0.png` gegen `welle2/erde-09-0-relief-heute.png`. Am Bild selbst
  gesehen: Halbinseln, Buchten, Binnenmeere, Inselketten, kein Ellipsen-Umriss mehr.
  Auch gesehen: Die Gebirgs-Gürtel zerkrümeln zu Flecken (siehe Offen).
- Amplitude der Lappen an erde-09 (Rasterweite 360 px):

  | A | Stücke ≥ 10⁴ km² | Land > 1 000 km von der Küste | Formzahl |
  |---|---|---|---|
  | heute | 40 | 11,9 % | 0,83 |
  | 0,9 | 46 | 7,3 % | 0,78 |
  | 2,0 | 106 | 4,2 % | 0,69 |
  | 3,0 | 156 | 1,5 % | 0,66 |

- Die Becken-Amplitude allein (c = 1,5) bewegt nichts: Stücke 40 → 42, weil die Rampe die Küste trägt. Erst c = 5 öffnet
  Binnenmeere.
- Spektrum, gerechnet:

  | | größte Gruppe | zweite | Gruppen < 5 % |
  |---|---|---|---|
  | heute | 0,219 | 0,182 | 0 |
  | Yule α 1,2 / p 0,25 | 0,558 | 0,183 | 5 |
  | Erde (Afro-Eurasien, Amerika; zu prüfen) | 0,57 | 0,285 | |

**KOSTEN.** Kopie Lappen + Becken + Wurzel, ABAB unter Last:
- planetPunkt 16,6 → 21,2 µs (+28 %): Das Krusten-Rauschen läuft jetzt auch im Inneren.
- planetKlima 95 → 127 µs.
- Das Spektrum kostet nur im Plan (0 µs je Punkt).

## Punkt 2: das Innere flach und leer

**WO.**
- Das Relief im Inneren liest nur diese Terme:
  - `fb + tafel` mit `tafel = 0,3·fBm(1 400 … 600 km, Gewinn 0,5)` nur auf S2 (Z. 1246–1252);
  - das Mantel-Feld (Z. 1256–1261, λ 5 000 … 1 200 km, im Kontinent zu 30 % gefüllt);
  - das Gedächtnis (Z. 1264–1310).
- Das Gedächtnis klingt mit EINER Zeitkonstante ab:
  - Naht: `H0·(1 − e^(−a/20))·e^(−a/120)` (`nahtTafel`, Z. 1062);
  - erloschener Rand: `H0·e^(−a/120)` auf einem Ring 300 km landein (Z. 1295).
- Das Alter jeder Scholle (`schollen[8s + 4]`, 1 500–4 000 Ma, Z. 331) liest der Punkt NIE (Grep: kein Leser außer dem Plan).

**WARUM.**
- Ein Gürtel von 5 km steht nach 300 Ma bei 5·e^(−2,5) = 0,41 km und nach 600 Ma bei 0,03 km. Alte Gürtel verschwinden.
  Richtwerte der Erde, ungeprüft: Appalachen und Ural nach 250–300 Ma ~1 km, Grenville nach ~1 Ga ~0,3 km.
- Gemessen über 12 Saaten (heute): Innen-Streuung der Höhe 0,336 km. Nur 1,1 % der Inner-Fläche trägt einen Gürtel (Orogen-Stärke
  > 0,1).

**SCHNITT an der Wurzel.**
1. **Wurzel (Isostasie):** zwei Zeitkonstanten, `e^(−a/120) + 0,15·e^(−a/1 500)`, in `nahtTafel` und im Rand-Gedächtnis, also an
   den beiden Lesern der einen Formel. Ein 5-km-Gürtel steht damit nach 300 Ma bei ~1,0 km und nach 1 Ga bei ~0,3 km. Die
   Breite wächst schon heute mit dem Alter (`·(1 + a/300)`), alte Gürtel werden also breit und flach.
2. **Becken** (Punkt 1, dasselbe Feld B): Becken und Schwellen über die ganze Kruste.
3. **Schild aus dem Schollen-Alter:** gerechnet, nicht gebaut. Je älter die Scholle, desto flacher ihr Kern und desto rauer ihr
   Schild-Kern. Der Leser des Alters existiert noch nicht; Wert offen, Messname `innen.schild`.

**SPIKE und Zahl** (12 Saaten, gleiche Kopie wie Punkt 1):
- Innen-Streuung 0,336 → 0,496 km.
- Anteil alter Gürtel im Inneren 1,1 % → 5,6 %.
- Innen-Mittel 0,56 → 0,84 km.

**KOSTEN.** Wurzel: eine Exponential-Funktion mehr je Naht- und Fächer-Eintrag, also im Rauschen des Punkts. Das Becken ist in
Punkt 1 gezählt.

## Punkt 3: Fächer und waagrechte Bänder in der Biom-Karte

**WO.** `planetKlimaR`, planet-core.js:1686–1727, der Luv-Gang.
- **Fächer:** Sechs Punkt-Proben der Hülle bei `KLIMA.schritte = [75, 150, 225, 300, 800, 2 000] km × skal` (Z. 1593, 1697–1701).
  Dabei ist `skal = 0,35 + 0,65·min(1, |Wind|/1,044)` und `|Wind| ∝ |sin(π·|φ|/w)|` (Z. 1679–1681).
- **Scharfe Anzeige:** Die Meeres-Anzeige je Probe ist `glatt(0,3; −0,6; Hülle)` (Z. 1704, 1710). Sie springt über ~75 km Hang.
- **Bänder:** Das Gewicht des Luv-Gangs ist `om = glatt(0,02; 0,35; |Wind|)` (Z. 1693). Wo der Wind am Zell-Rand und am Äquator
  gegen 0 geht, blendet es in ±3° auf `mNeutral` (Küstenferne) um.

**WARUM.**
- Jede scharfe Kante luvwärts (Küste, Kamm) erscheint am Beobachter als GEISTER-Küste, verschoben um 800 bzw. 2 000·skal km.
- Weil skal mit der Breite schrumpft (0,35 am Zell-Rand), laufen die Geister-Linien zu einem Brennpunkt zusammen. Das sind die
  Keile aus einem Punkt.
- Die Bänder sind die ±3°-Umblendung auf eine Feuchte (nach Küstenferne), die von der des Luv-Gangs weit abweicht.
- Gemessen am Ausschnitt erde-09 (`faecher-zerlegung.cjs`, Felder feuchte / lee / Niederschlag als PNG):
  - Die Feuchte trägt die Geister-Küste mit harter Kante und die Bänder.
  - Lee und Hub sind nicht die Ursache der Keile.

**SCHNITT an der Wurzel: Feuchte als Integral längs des Winds**, die Quelle ist das Krusten-Feld, kein Gitter.
- 14 Knoten im festen Takt 150 km bis 2 100 km, nie mit dem Wind skaliert.
- Die Meeres-Anzeige je Knoten kommt aus dem glatten Krusten-Abstand und ist über den Takt geglättet:
  `σ = glatt(+75; −75 km; kont)`.
- Dieselbe Rekursion (über Meer laden mit `meerKm`, über Land zurückführen mit `recycleKm`).
- Das Gewicht wächst stetig mit dem Wind: `om = |Wind|/1,044`.
- Die Kamm-Schranke liest nur noch die vier nahen Hüllen-Schritte (75 … 300 km, fest).
- Kosten gebunden: 14 grobe Krusten-Felder + 4 Hüllen je Land-Punkt, unabhängig von der Planetengröße.

**SPIKE und Zahl.** Kopie `kern-feuchte.js`, Bild `faecher-neu-erde09-feuchte.png` gegen `faecher-erde09-feuchte.png`:
- Am Bild: keine Keile, keine Bänder. Die Feuchte fällt von der Luv-Küste stetig landein.
- Rest: feine Streifen längs des Winds hinter der rauen Küste; das ist das physikalische Bild.
- Ganze Karte mit allen Kopien zusammen: `welle2/erde-09-0-biom-alle.png` gegen `welle2/erde-09-0-biom-heute.png` (1 024 px). Am
  Bild selbst gesehen:
  - keine Keile und keine Bänder; Grün und Wüste gehen stetig ineinander über, mit Binnenmeeren und Inselketten;
  - Rest: die Gürtel als weiße Flecken (zerkrümelt, siehe Offen) und die harte Kante der Eiskappe im Norden.

Über 12 Saaten (`klima-mass.cjs`, 480 × 240):

| Maß | heute | Feuchte-Integral |
|---|---|---|
| `klima.kante.flach` (Anteil der Flachland-Nachbarpaare mit Niederschlags-Verdopplung auf < 100 km) | 2,85 % (2,0–9,0) | 0,86 % (0,44–3,4) |
| Land-Niederschlag, Median je Pixel | 291 mm | 329 mm |
| BWh-Pixel am Land | 9,2 % | 7,4 % |

Ehrlich: Das Klima verschiebt sich (feuchter landein, weniger BWh). Die Richter `klima.wueste` und `klima.widerspruch` sind an der
Kopie nicht gelaufen.

**KOSTEN.** planetKlima 64 → 76 µs je Land-Punkt (+12 µs, +19 %).

## Punkt 4: Lineal-Kanten an Kollisions-Plateaus

**WO.** `paarRelativ`, planet-core.js:1033–1045. Die Grenz-Normale des Paars ist `n = t_j − t_i`, die Differenz der Tangenten zu den
beiden Platten-Ankern (Z. 1036). Ihr Vorzeichen entscheidet in der Rand-Schleife (Z. 1167–1178) zwischen `konv` (Orogen-Schablone
Z. 1187) und `offen` (Rift).

**WARUM.**
- In der Kollision liegt der Punkt auf Kruste über Kruste, also JENSEITS beider Anker. Dann zeigen beide Tangenten fast gleich
  (gemessen t_A·t_B = 0,97), `|n|` ist klein und kippt am Großkreis durch die beiden Anker.
- Das Vorzeichen von c springt, das Orogen fällt weg. Die Kante ist ein Großkreis, also im Bild ein Lineal.
- Gemessen (`kante-zerlegung.cjs` mit der Diagnose-Kopie, erde-09 bei −50 Ma, 58° N):
  - Zwischen zwei Pixeln 8,9 km auseinander springt c von +49,4 auf −49,4 km/Ma.
  - Die Höhe fällt von 6,72 auf 1,73 km.
  - Die Seite zum Anker-Großkreis wechselt dort das Vorzeichen (−3 km → +1 km).
- Die Vermutung im Bericht (Fächer-Grenze des Rand-Gedächtnisses) ist **widerlegt**: An der Kante trägt das Gedächtnis 0,07–0,12 km,
  das lebende Orogen 6,1 → 0 km.

**SCHNITT an der Wurzel.**
- Wo `|n| < 0,8`, trägt die Paar-Rate `paarC` statt c. paarC ist je Scheibe fest und am gemeinsamen Rand gemessen; es gibt sie
  schon (Z. 832–836).
- Blend `c = PR.c·g + paarC·(1 − g)` mit `g = glatt(0,3; 0,8; |n|)`.
- Ein Versuch vorher, die Schablone an anderen Grenzen auszublenden, löschte das ganze Plateau (Pixel > 3 km: 42 174 → 512). Er
  ist verworfen.

**SPIKE und Zahl.**
- Kopie `kern-kante.js`: Pixel > 3 km im Ausschnitt 42 174 → 31 666; das Plateau bleibt.
- Die senkrechte Kante ist weg; das Plateau läuft aus. Bilder `kante-erde09-m50-terme.png` gegen `kante-neu-erde09-m50-terme.png`.
- Der größte verbleibende Sprung im Ausschnitt (6,3 km) sitzt an der Küste: Graben neben Plateau, eine andere Klasse.
  Siehe „Grenz-Stufe“.
- Global über 12 Saaten × 2 Zeiten (0, −50 Ma) mit `sprung-mass.cjs`. Gemessen werden Unstetigkeiten im Land derselben Platte:
  Jedes Nachbar-Paar mit |dh| > 1 km wird in 1-km-Schritten nachgegangen und zählt, wenn ein Schritt > 0,4 km ist. Je Million
  Land-Paare: Median 1 414 → 1 032 (−27 %), max 3 887 → 3 689.
- Der Rest im Land sind andere Kanten derselben Art: einseitige Schablonen an der Grenze (siehe Punkt 5, Grenz-Stufe).

**KOSTEN.** planetPunkt 10,9 → 11,9 µs (+1 µs, ABAB unter Last, an der Grenze des Rauschens).

## Punkt 5: Platten-Grenzen im Ozean als Kreisbögen

**WO.** `plattenWertung`, Ozean-Zweig planet-core.js:955–959: `v = ρ − Winkel(q, Stätte)` mit `ρ = 0,42 + 0,3·Z` je Ozean-Platte
(Z. 365). Der Kontinent-Zweig (Z. 952) ist `reach − dmin`.

**WARUM.**
- Die Grenze zweier Ozean-Platten ist die Menge `d_i − d_j = ρ_i − ρ_j`. Bei gleichem ρ ist sie ein Großkreis, bei ungleichem ein
  Bogen um die schwächere Stätte. Gegen einen Kontinent gilt dasselbe mit `reach` statt ρ.
- Der Verzug (≤ 650 km, Z. 287) biegt einen 5 000-km-Bogen kaum.
- Gerechnet (`kappen-bogen.cjs`, Kleinkreis-Radius der Grenze über ±2 000 km, 90° = gerade):

  | Δρ | Stätten 40° auseinander | Stätten 70° auseinander |
  |---|---|---|
  | 0 | 90° | 90° |
  | 0,1 | 69° | 82° |
  | 0,3 | 38° | 65° |

  Im Kern ist |Δρ| bis 0,3 rad.
- Richtwerte der Erde, zu prüfen: Rücken-Segmente nahezu Großkreise mit Transform-Versatz; Gräben sind wirklich Bögen,
  ~20–40° (Frank 1968).

**Gemessen, warum man die Bögen SIEHT: die Grenz-Stufe.** Die Grenzen sind im Relief Stufen, keine Profile.
- Messung `sprung-mass.cjs`, 12 Saaten × 2 Zeiten: An jedem zweiten Ozean-Paar über eine Platten-Grenze (beide tiefer als −1 km)
  springt die Höhe um > 0,4 km je km. Je Million solcher Paare: Median 503 708 (heute), 504 416 (Kopie kante).
- Nach Rand-Art (`grenz-stufe.cjs`, erde-09, t = 0, Gitter 512, Stufe = größter Schritt auf ~1 km):

  | Rand-Art | Paare mit Stufe | Median der Stufe | davon mit Alters-Sprung > 5 Ma |
  |---|---|---|---|
  | konvergent | 98,7 % | 2,5 km | 74 % |
  | Transform | 69,8 % | 1,26 km | 80 % |
  | divergent | 20,4 % | 1,35 km | 62 % |

- Ursachen:
  - Graben-Schablonen wirken nur auf der abtauchenden Seite (`−3·s·gauss(x − 40; 45)`, Z. 1189/1191). Die obere Platte trägt an
    der Achse keinen Graben.
  - Das Ozean-Alter wird je Seite aus den Nachbarn der eigenen Platte gerechnet (Z. 1144–1164). Es springt über die Grenze.
- Auf der Erde ist die Graben-Achse die tiefste Stelle zwischen zwei stetigen Flanken. Über Bruchzonen gibt es Stufen von
  einigen hundert Metern (Richtwert, ungeprüft).

**SCHNITT an der Wurzel.**
- Jede Rand-Schablone ist EIN Profil in vorzeichenbehafteter Distanz ξ quer zur Grenze und wird von beiden Seiten ausgewertet.
  Die obere Platte liest den Graben des Partners mit ξ = −x.
- Das Alter an der Grenze ist dasselbe von beiden Seiten. Dieselbe Klasse wie Punkt 4: das Paar entscheidet, nicht die Seite.
  Ungebaut, Messname `grenze.stufe`.
- Ozean-Platten tragen gleiche Gewichte und mehrere Stätten (k = 3, längs einer Achse aus der Saat), Wertung `max_k(−Winkel_k)`.
- Die Grenzen werden Ketten von Großkreis-Stücken (Rücken), mit der Versatz-Treppe, die es schon gibt.
- Die Größe einer Platte kommt aus der Zahl und dem Abstand ihrer Stätten, nicht aus ρ.
- Gräben behalten ihre Bögen aus dem Kontinent-Zweig.

**SPIKE und Zahl.** Nur gerechnet (Tafel oben), nicht als Kopie gebaut. Grenz-Krümmung über Saaten: ungemessen, Messname
`grenze.bogen`.

**KOSTEN.** Gerechnet, nicht gemessen: k·nO zusätzliche Winkel je Punkt (nO 3–6), ~+0,5–1 µs.

## Punkt 6: der Zeit-Sprung 0 → +50 Ma

**WO.** Kein Fehler einer Formel. Gemessen an erde-09 (`zeitsprung.cjs`, `zeitsprung-fein.cjs`):
- Zwischen −100 und +50 Ma liegt KEIN Schlüsselbild. 0 von 39 Gruppen-Paaren werden getrennt.
- Die Schollen wandern 1 126 · 1 426 · 1 203 km je Intervall (2,25 · 2,85 · 2,41 cm/a).

**WARUM die IoU fällt.**
- In 5-Ma-Schritten ist die Schritt-IoU von 0 bis +50 gleichmäßig 0,83–0,86 (Band 60–90° N). Ein Riss ist das nicht.
- Die 50-Ma-IoU fällt durch zwei Dinge:
  - die Drift (1 203 km an kleinen Polar-Stücken);
  - den Meeresspiegel: meerKm +0,336 km bei −35 Ma → −0,239 km bei +50 Ma, 0,58 km in 85 Ma. Richtwert der Erde, zu prüfen:
    0,2–0,3 km.
- In meinen Bändern ist 0 → +50 nicht das schlechteste Intervall:

  | Intervall | 60–90° N | 30–90° N | global |
  |---|---|---|---|
  | −50 → 0 | 0,301 | 0,258 | 0,416 |
  | 0 → +50 | 0,363 | 0,463 | 0,513 |

- Die Nordband-Zahl des Berichts (0,26) ist mit seiner Definition nicht nachrechenbar; das Skript ist nicht gefunden.
- Die IoU ist der falsche Richter: Sie fällt mit der Zerklüftung. Mit der Kopie Lappen + Becken fällt sie auf 0,33 / 0,42 / 0,50,
  obwohl dieselbe Bewegung läuft.

**SCHNITT.**
- Kein Schnitt an der Bewegung.
- Der Richter für „reißt“ ist `zeit.stetig`: Küsten-Versatz je 1 Ma ≤ 150 km. Es gibt ihn, ROT.
- Die Spiegel-Spanne (`meer.zeit` ≤ 600 m) gehört mit Herkunft neu begründet: Das Band 600 m liegt über dem Erd-Richtwert. Das ist
  der Befund, kein still verschobenes Band.

**KOSTEN.** 0.

## Das Maß „liest als Planet“ (für den Richter)

Rechnung: `mass.cjs` (Gitter 720 × 360, ~55 km, fuss 40 km, t = 0, Saaten erde-01 … erde-12). Werte als Median (Spanne).
Erd-Werte sind **Literatur oder Schätzung aus dem Gedächtnis, ungeprüft**: Sie gehören an ETOPO1 nachgerechnet (dieselbe Funktion
`gestalt()` an einer Erd-Maske), bevor ein Band daraus wird.

| Messname | Definition | Erde (zu prüfen) | heute | Kopie Lappen + Becken + Wurzel |
|---|---|---|---|---|
| `land.anteil` | Land-Fläche | 29,2 % (ETOPO1) | 30,2 % (26,4–36,5) | 29,2 % (25,9–37,3) |
| `land.stuecke4` | Stücke ≥ 10⁴ km² | ~75 (~70 Inseln + Massen) | 23 (18–36) | 70,5 (66–88) |
| `land.stuecke5` | Stücke ≥ 10⁵ km² | ~22 | 8,5 (6–14) | 13 (7–18) |
| `land.groesster` | Anteil des größten Stücks | 0,57 (Afro-Eurasien) | 0,387 (0,21–0,69) | 0,372 (0,27–0,66) |
| `land.korcak` | B in N(> A) ∝ A^(−B), 2·10⁴…2·10⁷ km² | ~0,5–0,65 (Korčák 1938; Mandelbrot) | 0,22 (0,14–0,33) | 0,35 (0,26–0,46) |
| `land.formzahl` | Fläche / konvexe Hülle, Stücke ≥ 10⁶ km² | ~0,6–0,85, Median ~0,75 (geschätzt) | 0,834 (0,69–0,92) | 0,674 (0,61–0,73) |
| `land.schmal300` | Land außerhalb jeder 300-km-Scheibe (Halbinseln, Inseln < 600 km) | ~10–15 % (geschätzt) | 11,8 % (10–16) | 29,8 % (24–40) |
| `land.fern1000` | Land > 1 000 km von der Küste | ~10–20 % (geschätzt) | 11,3 % (2,2–16,6) | 2,9 % (0–8,8) |
| `kueste.entwicklung` | Umfang / (2√(πA)), Stücke ≥ 10⁶ km², Raster 55 km | ~1,5 (Afrika) … 3,5 (Nordamerika), geschätzt | 2,10 | 3,65 |
| `innen.streuung` | Höhen-Streuung des Landes > 500 km von der Küste, ohne aktives Orogen | ~0,4–0,6 km (geschätzt) | 0,336 km | 0,496 km |
| `innen.altguertel` | Anteil davon mit Gürtel (Orogen-Stärke > 0,1) | ~10–20 % (Ural, Appalachen, Kaledoniden, Grenville; geschätzt) | 1,1 % | 5,6 % |
| `klima.kante.flach` | Flachland-Nachbarpaare mit Niederschlags-Verdopplung < 100 km | ~0 (Niederschlags-Kanten folgen dem Relief; erwartet) | 2,85 % | 0,86 % (Feuchte-Integral) |
| `grenze.bogen` | Kleinkreis-Radius der Rücken-Segmente | Rücken ≥ 70°, Gräben 20–40° (Frank 1968) | gerechnet 38–90° je Δρ | ungemessen |
| `grenze.stufe` | Ozean-Grenz-Paare (beide < −1 km) mit Sprung > 0,4 km auf ~1 km | Graben: 0 (stetige Flanken); Bruchzone: Stufen ~0,1–0,5 km (geschätzt) | 50,4 % (12 Saaten × 2 Zeiten) | 50,4 % (Kopie kante) |
| `relief.messer` | Land-Paare derselben Platte mit Sprung > 0,4 km auf ~1 km, je Million | 0 (erwartet) | 1 414 | 1 032 (Kopie kante) |

Lesart:
- `formzahl`, `fern1000` und `kueste.entwicklung` allein trennen heute nicht von der Erde. Die Ellipse zeigt sich erst in
  `stuecke4`, `korcak` und `groesster` (zu wenige Stücke, zu flaches Spektrum, keine dominante Masse).
- Die Kopie trifft `stuecke4` und `land.anteil`, überschießt aber `schmal300` (29,8 % gegen ~10–15 %) und `fern1000` (2,9 % gegen
  ~10–20 %). Die Lappen-Amplitude 2 ist zu hoch. Die fehlende dominante Masse (Spektrum, Punkt 1.3) senkt `fern1000` zusätzlich.
- Ein Band entsteht erst, wenn die Erd-Spalte an ETOPO1 gerechnet ist und Lappen + Spektrum zusammen beide Seiten treffen.

## Ehrlich offen (mit Messnamen)

- `land.fern1000` / `land.schmal300`: Die Amplitude der Lappen überschießt. Der nächste Lauf ist Lappen + Spektrum zusammen; das
  Spektrum ist nur gerechnet, nicht in einer Kopie gebaut.
- **Zerkrümelte Gürtel:** Mit Lappen lesen die Rand-Schablonen das verrauschte Krusten-Feld, und die Gürtel zerfallen zu Flecken
  (Bild a2.0). Schnitt in Aussicht: Platten-Wertung und Schablonen lesen die grobe Kruste (`nurGrob`), die Küste die volle.
  Ungemessen, Messname `gebirge.guertel`.
- `grenze.stufe`: An 50 % der Ozean-Grenz-Paare springt die Höhe um > 0,4 km je km (konvergent 98,7 %, Median 2,5 km).
  Gemessen und benannt (Punkt 5), ungebaut. Das ist die größte Bild-Klasse dieses Befunds: Sie zeichnet die Platten-Grenzen als
  Linien.
- `innen.schild`: das Schollen-Alter hat keinen Leser.
- `grenze.bogen`: Mehrfach-Stätten nur gerechnet.
- Klima der Feuchte-Kopie: `klima.wueste`, `klima.widerspruch` und `klima.koeppen` sind an der Kopie nicht gelaufen. BWh-Pixel
  9,2 → 7,4 %.
- Kosten: planetPunkt +24–28 %, planetKlima +19 % (Feuchte) bzw. +39 % (alle Kopien zusammen). Die Schwelle `kosten.punkt` ≤ 8 µs
  reißt schon heute.
- Erd-Spalte: alles außer `land.anteil` ungeprüft (aus dem Gedächtnis oder geschätzt).
- Konsum im Spiel: 0 %. Keiner dieser Schnitte ist im Kern; kein Leser im Spiel.
