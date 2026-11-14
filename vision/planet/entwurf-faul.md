# Entwurf „faul“: der Planet als Funktion, vorab grob, je Punkt analytisch

Architekt-Blatt zu `planet-core.js` — Blickwinkel FAULE SIMULATION. Stand 14.11.2026, Baum `w28-planet-kern` auf main gelesen.
Kein Repo-Code berührt. Der Spike, der jede Zahl unten trägt: `vision/planet/entwurf-faul-spike.cjs` (node, ohne Fremd-Pakete,
PNG über zlib selbst geschrieben). Lauf: `node entwurf-faul-spike.cjs <samen> <ordner> <t1,t2,…> <W>` (Umgebung `WASSER` = Wasser-Haushalt in km).

## Die Bilder zuerst

| Bild | was es zeigt |
|---|---|
| `entwurf-faul-saat1-t0.png` | Saat `anazh-realm-seed`, t = 0: fünf Kontinente, ein geschlossenes Rücken-Netz durch alle Ozeane (helle Linien), Tiefseegräben an den Subduktionen (dunkle Linien), Gebirge im Schummer, Polkappen mit Meereis |
| `entwurf-faul-saat1-t300.png` | dieselbe Saat, t = −300 Ma: die Kontinente stehen als Superkontinent beisammen, Nähte als Gebirgsgürtel quer durch das Land — Zeitreise, ohne die 300 Ma dazwischen zu simulieren |
| `entwurf-faul-saat2-t0.png` | Saat `zweite-saat`, t = 0: andere Lage, andere Plattenzahl, dasselbe Gesetz |

Ehrliches Urteil am eigenen Auge: die Karten lesen als Planet (Kontinente, Rücken, Gräben, Gürtel), nicht als Rauschen. Sie
tragen sichtbare Mängel, unten unter „Was der Ansatz nicht kann“ mit Zahl: Klecks-Küsten, zu viel Wüste, kaum Schelf, Streifen
an den Polen.

## Der Kern in sechs Sätzen

1. Der Planet ist eine dreistufige Funktion: **Skelett(samen)** → **Schnitt(skelett, t)** → **Punkt(schnitt, breite, länge)**.
2. Das Skelett ist die einzige sequentielle Rechnung: eine Kette von 10–15 Superkontinent-Zyklen (je 300–500 Ma aus dem Samen),
   je Zyklus ein Zerfall in 5–8 Fragmente, ihre Bahnen als Rotationen um Euler-Pole und ihr Zusammenbau — gerechnet auf ~3 400
   Lagrange-Punkten der Kruste, die ihr Gedächtnis (Zeiten der Gebirgsbildung) mittragen.
3. Innerhalb eines Zyklus ist die Bewegung analytisch (Slerp der Fragment-Rotation über zwei Stützen: Ausbreitung, Zusammenbau),
   darum kostet ein Schnitt zu JEDEM t dasselbe: keine Zeitschritte, nur das Abtasten der Lage zu t auf ein grobes Kugelraster.
4. Der Schnitt trägt Ursachen, nicht Höhen: Krusten-Anteil, Abstand und Art der nächsten Plattengrenze, Konvergenzrate,
   Ozeanalter, Alter der letzten Gebirgsbildung, Küstenabstand — dazu Meeresspiegel (Wasser-Bilanz) und Klima (Energiebilanz
   je Breite + Feuchte-Fege längs des Windes).
5. Der Punkt rechnet die Höhe aus den interpolierten Ursachen mit geschlossenen Gesetzen (Parsons-Sclater/GDH1 für den Ozean,
   Graben- und Bogenprofil über dem Grenz-Abstand, exponentieller Abtrag alter Gebirge) und legt bandbegrenztes Detail darauf —
   so ist ein Graben an jeder Auflösung scharf, obwohl das Raster 78 km Zellen hat.
6. LOD ist die Zahl der Detail-Oktaven derselben Funktion: das Orbit-Bild schneidet die Oktaven an der Pixel-Größe ab, der Boden
   nimmt alle bis zur Übergabe-Wellenlänge 24 km, darunter fährt `gelaende-core` mit seinem Gesetz des Ortes.

## Datenstruktur

```
Skelett (Funktion des Samens; nie geladen, nur gerechnet; ~110 KB roh im Speicher, gemessen 19 KB Metadaten + Punkt-Tafeln)
  samen, version                         Gesetzes-Version (Plan-Hash), die Antwort ist f(samen, version)
  welt: { radiusKm, masseErde, wasserKm, schiefe0, alterMa, waermeFluss }   aus dem Samen; die Erde ist eine Saat
  kruste: Float32Array 3·Mk              Lagrange-Punkte der kontinentalen Kruste (Fibonacci-Kugel M=8192, Anteil 0,33–0,45 → Mk≈3 400)
  oro:    CSR (Uint16 offsets + Float32 Zeiten)   je Punkt die Zeiten seiner Gebirgsbildungen (Nähte beim Zusammenbau)
  zyklen[k]: {
    T0, T1, tZerfall, tMitte             Ma; Zusammenbau bei T0, Zerfall bei T0+0,12·L, Ausbreitungs-Gipfel bei T0+0,5·L
    lage: Float32Array 3·Mk              Weltlage der Punkte bei T0 (Superkontinent k)
    frag: Uint8Array Mk                  Fragment je Punkt (Neuschnitt beim Zerfall, bevorzugt an jungen Nähten)
    fr[f]: { c, qMid, qEnd, n }          Schwerpunkt, Quaternion zur Ausbreitung, Quaternion zum Zusammenbau k+1
    oz[o]: { site, om }                  3–6 rein ozeanische Platten: Stätte + Winkelgeschwindigkeit (3–9 cm/a)
  }
  plumes[p]: { lage (Mantel-fest), t0, t1, staerke }   Hotspots (5–15), im Mantel-Rahmen ruhend
  orbit: { perioden [23,41,100 ka ± Saat], amplituden, phasen }   Milanković als Sinus-Summe

Schnitt (Funktion von Skelett und t; Cache, jederzeit neu rechenbar; Würfel-Kugel 6·n², n=128 → 98 304 Zellen)
  kont Float32        Krusten-Anteil (weicher Splat der Punkte, Radius 1,3·Punktabstand)
  platte Int8         Fragment-Platte oder ozeanische Platte
  dKonv, konvOzean, konvRate   Abstand zur nächsten konvergenten Grenze (km), Ozean-Anteil an ihr (Subduktion ↔ Kollision), Rate cm/a
  ozAlter Float32     Ozeanboden-Alter (Ma) = Abstand zum Rücken / halbe Spreizrate, gekappt 180 Ma
  oroAlter Float32    t − letzte Gebirgsbildung ≤ t der Punkte in der Zelle
  dKueste, dOzean     Abstände (Schelf, Kontinentalität)
  meerKm              Meeresspiegel aus Wasser-Bilanz (+ Eisvolumen der Orbit-Phase)
  klima: tJahr, tAmp, regen, windZonal   Jahresmittel, Jahresamplitude, Niederschlag, Zonalwind je Zelle
  vulkane: Bogen-Abszisse je Grenzsegment, Plume-Spuren (Liste ≤ 15 × 40 Stützen)
  Speicher: 12 Felder × 98 304 × 2 B (Float16/Uint16 quantisiert) ≈ 2,4 MB — ein Cache, KEIN Download (ehrlich: Megabytes, nicht Kilobytes)
```

Nur das Skelett ist „vorab“ im Sinn des Auftrags (Kilobytes, Funktion des Samens). Der Schnitt ist eine Abtastung der Funktion zu
einer Zeit, so wie ein Mip-Level eine Abtastung einer Textur ist: zwei leben gleichzeitig (Zeit-Schlüsselbilder A und B).

## Die Abfrage — Funktions-Signaturen

```js
// planet-core.js — UMD wie die anderen Kerne, rein, THREE-frei, ohne Wanduhr, ohne Math.random
PlanetCore.skelett(samen, { version }?)                    // → Skelett          einmal je Saat
PlanetCore.schnitt(skelett, tMa, { n = 128 }?)              // → Schnitt          je Zeit-Schlüsselbild, Kosten ∝ 6·n²
PlanetCore.punkt(schnitt, breite, laenge, { okt, aus }?)    // → { hKm, meerKm, kruste, platte, grenze: { typ, dKm, rate },
                                                            //     vulkan: { dKm, aktiv }, klima: { tJahr, tAmp, regen }, biom }
PlanetCore.zeitPunkt(skelett, A, B, breite, laenge, tMa, o?)// zwischen zwei Schlüsselbildern: Abfrage-Punkt mit der Platten-
                                                            //   Rotation nach tA und tB zurückgedreht, beide gelesen, gemischt
PlanetCore.orbit(skelett, tMa)                              // → { schiefe, exz, praez, leucht }  analytisch (Gough-Sonne, Milanković)
PlanetCore.anker(schnitt)                                   // → { breite, laenge }  der Ankunftsort: gemäßigt, Küste ≤ 30 km, aus dem Samen
PlanetCore.ortRahmen(breite0, laenge0, radiusKm)            // → { zuKugel(x, z), zuEbene(breite, laenge) }  azimutal-abstandstreu
PlanetCore.ortParameter(schnitt, rahmen)                    // → die Erbgut-Werte für gelaende-core (Brücke, unten)
```

`okt` ist die Abtast-Dichte (LOD): `okt = clamp(log2(fussabdruckKm0 / fussabdruckKm), 0, oktMax)` — die Orbit-Karte liest
`okt ≈ 3`, der Boden `oktMax` bis zur Übergabe-Wellenlänge. Jede Oktave ist mittelwertfrei: die Ferne sieht den Mittelwert
dessen, was die Nähe im Einzelnen zeigt (Blatt 32, L5).

## Das Verfahren je Größe

**Platten (Skelett, Kinematik statt Dynamik).** Urkruste: Fibonacci-Kugel, Anteil 0,33–0,45 aus dem Samen, als Kappe mit
Rausch-Rand. Je Zyklus k: Neuschnitt des Superkontinents in F = 5–8 Fragmente (Voronoi um Rift-Stätten, Malus für junge
Nähte — Wilson: Risse folgen alten Nähten); Ausbreitung = Drehung jedes Fragments weg vom alten Zentrum um 40–80°; Zusammenbau =
Drehung auf eine Spirale um ein neues Zentrum (Introversion/Extroversion aus dem Samen). Bahn = Slerp I → qMid → qEnd: eine
Euler-Pol-Rotation je Stufe, so wie GPlates die Erdgeschichte als Rotationstafel speichert. Ozeanische Platten: 3–6 Stätten je
Zyklus mit eigenem Pol; eine Ozeanzelle gehört ihnen, wenn sie ≥ 500 km von Kruste liegt und der Stätte näher als 1,6 × dem
Krustenabstand, sonst fährt sie mit der nächsten Kruste (die Mittelachse zwischen auseinanderfahrenden Kontinenten IST dann der
Rücken). Im Spike gezählt: 5–8 Fragmente, dazu 3–6 ozeanische aus dem Samen = 8–14 (Erde: 7 große + 8 mittlere); Konvergenzraten
0,3–9,4 cm/a, Mittel 3,6 cm/a (Erd-Band 1–15).

**Grenzen (Schnitt).** Je Zellpaar verschiedener Platten: Relativgeschwindigkeit (ω_a − ω_b) × p auf der Normalen → konvergent
(> 0,3 cm/a), divergent (< −0,3), sonst Transform. Abstandsfelder per Jump-Flooding auf der Kugel (log₂ n Durchgänge, 9 Nachbarn,
Abstand = acos des Skalarprodukts) — vier Felder: Konvergenz, Divergenz, Kruste, Ozean.

**Relief (Punkt).** Ozean: GDH1 (Stein & Stein) `d = 2,6 + 0,365·√a` für a < 20 Ma, sonst `5,651 − 2,473·e^(−0,0278·a)` km.
Graben: `−4 km · Rate · e^(−(d/70 km)²)` auf der abtauchenden Seite. Land: Plattform 0,25–0,6 km (mit Küstenabstand),
Kollision `4,2 km · Rate · e^(−(d/280 km)²)`, Vulkanbogen `2,6 km · e^(−((d − 220)/120)²)`, altes Gebirge
`2,8 km · e^(−Alter/160 Ma)` (Ural/Appalachen-Abtrag als Zeitkonstante), Grat-Rauschen im Gebirge. Schelf: −0,15 km bis
~150 km vor der Küste, dann Hang. Gemessene Hypsometrie (Saat 1, t = 0, Flächen-%): Gipfel bei −6…−5 km (48 %) und 0…+1 km
(9,9 %) + 1…2 km (8,3 %) — **bimodal**, Abstand der Gipfel ~5,5 km (Erde ~4,5–5 km). Saat 2: 40 % / 10,4 %, ebenfalls bimodal.

**Vulkanismus (Punkt, analytisch).** Bögen: Vulkane als Poisson-Kette längs der Bogen-Abszisse (Abstand ~70 km, Hash aus
(Samen, Grenzsegment, Index)) — der Punkt fragt nur die zwei Nachbar-Stützen. Hotspots: Plume p ruht im Mantel-Rahmen; die
Insel, die zur Zeit τ entstand, liegt zur Zeit t bei `R_platte(t) · R_platte(τ)⁻¹ · p` — die Hawaii-Kette ist eine geschlossene
Formel, 40 Stützen je Plume, ihre Höhe sinkt mit demselben GDH1 wie der Ozeanboden. Ausbrüche: Poisson-Prozess in der Zeit, Hash
aus (Samen, Vulkan, Epoche) → „nächster Ausbruch nach t“ ist eine Funktion, kein Zustand. Trapps: Plume-Kopf-Ankunft (t0) setzt
ein Flutbasalt-Feld (Radius 500–1 000 km, +0,5–1 km) und einen CO₂-Puls ins Klima. Der fließende Lavastrom am Ort bleibt Gesetz
des Ortes (Vulkan-Leiter L2.1), der Planet liefert ihm nur „hier, so stark, dann“. Im Spike ungebaut (nur Bögen als Relief).

**Meeresspiegel (Schnitt).** Bisektion (50 Schritte) über die Hypsometrie der Höhenkarte bis Volumen = Wasser-Haushalt. Das ist
der echte Mechanismus: junge, flache Ozeanböden (schnelle Spreizung) heben den Spiegel — die Kreide-Hochstand-Kopplung ist
eingebaut, nicht gemalt. Eis: Eisvolumen aus dem Orbit-Antrieb (Tiefpass erster Ordnung, geschlossen wie `traegTage` in
gelaende-core ~1287) senkt ihn um bis zu ~120 m. Gemessen: −130 bis −655 m Versatz je Zeit bei Wasser 3,9 km (siehe Grenzen).

**Klima (Schnitt).** 1D-Energiebilanz (Budyko-Sellers) je Breite: Einstrahlung aus Leuchtkraft `L(t) = L0 / (1 + 0,4·(−t)/4570)`
(Gough) und Schiefe, Eis-Albedo-Rückkopplung, Diffusion über das globale Mittel, 400 Iterationen. 2D: Höhengradient −6,5 K/km.
Niederschlag: Zonalwind nach Zellen (Passat Ost→West, Westwind West→Ost, Polar Ost→West), je Breitenzeile zwei Fege-Durchgänge
windab: Feuchte füllt sich über dem Meer, regnet über Land mit dem Hub aus (Regenschatten), 55 % Rückverdunstung. Kosten gemessen
13–46 ms für 1024×512. Ergebnis Saat 1, t = 0: Äquator 28,7 °C, Pol −1,2 °C; t = −300 Ma: 24,0 / −5,2 °C.

**Biome (Punkt).** Whittaker-Tafel aus (tJahr, regen, tAmp) → 12 Klassen (Eis, Tundra, Taiga, gemäßigter Wald, Grasland,
Steppe, Wüste kalt/heiß, Savanne, Regenwald, Fels, Meereis); daneben die Köppen-Hauptklasse aus denselben drei Größen (Klima-
Leiter L3.5 will sie messen). Die Tafel ist ein Gesetz in planet-core, ihre Leser sind phyto-core (Art-Wahl) und das Orbit-Bild.

**Zeit — Drift, Gebirgsbildung, Klima über Äonen.** Siehe eigener Abschnitt.

## Kosten-Modell (gemessen im Spike, Laptop Radeon 890M-Klasse, node 24, unoptimiert, Claude-App lief daneben)

| Stufe | gemessen | wovon abhängig | nie abhängig von |
|---|---|---|---|
| Skelett | 174–419 ms (12 Zyklen, Mk = 3 395 von M = 8 192) | Zyklen × Mk (Naht-Suche im 64×32-Eimer) | Planet-Radius, t |
| Schnitt 256×128 | 128–315 ms | Zellen (JFA: Zellen × log₂ W × 9) | Radius, t (t = 0: 173 ms, t = −4 000 Ma: 128 ms) |
| Schnitt 512×256 | 356–765 ms | dito | dito |
| Schnitt 1024×512 | 2 606 ms | dito | dito |
| Klima | 13–46 ms (1024×512) | Zellen | Radius, t |
| Punkt | 1,06–2,63 µs (2 × fbm 6 Oktaven + 8 bilineare Felder) | Oktaven (+0,15 µs je Oktave, abgeschätzt aus dem Zwei-fbm-Anteil: ungemessen) | Radius, Zellenzahl, t |
| Orbit-Karte 1024×512 | 0,52 Mio. Punkte × ~1,5 µs ≈ 0,8 s auf einem Faden | Pixel | Planet |

Begründung „nie an der Größe“: der Radius geht nur als Konstante in km-Umrechnungen ein; Zellenzahl und Oktaven sind an Schirm
und Abtast-Dichte gebunden. Ein Super-Erd-Planet (2 R⊕) hat dieselben Zellen mit doppelter Kantenlänge (156 km bei 512) und
braucht eine Oktave mehr bis zur Übergabe 24 km — +1 Oktave, nicht ×4 Fläche. Vorab bis zum ersten Bild: Skelett + ein Schnitt
256×128 + Klima ≈ 0,3–0,8 s gemessen, unter dem Ziel 2 s; mit Typed-Arrays statt Arrays-von-Arrays und Würfel-Kugel n = 128 ist
ein Schnitt ≤ 150 ms das Bau-Ziel (ungemessen). Determinismus: zwei Läufe derselben Saat, SHA-1 der PNGs byte-gleich
(`111b82f4…` t = 0, `8d8c4044…` t = −4 000 Ma) — auf EINEM Gerät gemessen, quer über Geräte und Engines ungemessen.

## Wie die Zeit wirkt

**Beliebiges t ohne Voll-Simulation.** Der Trick ist, dass der Zustand an den Superkontinent-Zeitpunkten T_k (Schlüsselbilder
im Sinn eines Video-Codecs) im Skelett liegt und alles zwischen zwei T_k eine geschlossene Bahn ist. Ein Sprung auf t kostet:
Zyklus suchen (≤ 15 Vergleiche) → Fragment-Quaternionen per Slerp → Gedächtnis je Punkt filtern (letzte Gebirgsbildung ≤ t) →
EIN Schnitt. Gemessen: t = −4 000 Ma kostet wie t = 0. Die Kette selbst (Zusammenbau k → Neuschnitt k+1 → Nähte) ist die einzige
Sequenz und läuft einmal je Saat, nicht je Sprung.

**Drift.** Plattengeschwindigkeit = Ableitung der Slerp-Bahn (ω aus zwei Quaternionen im Abstand 0,5 Ma); gemessen 0,3–9,4 cm/a.
Zeitraffer: zwei Schnitte A (tA) und B (tB) leben; ein Punkt zur Zeit t wird je Schlüsselbild mit seiner Plattenrotation
zurückgedreht (Advektion statt Überblenden: der Kontinent gleitet, er blendet nicht), dann linear gemischt. Ein neuer Schnitt im
Neben-Faden (Worker) alle ~0,4 s; bei 4 Ma Abstand trägt das 10 Ma/s — der ungeschnittene Raffer −4,5 Ga → 0 in 10 min (Tiefzeit L1.7)
braucht 7,5 Ma/s: im Band, ungemessen am Bild.

**Gebirgsbildung.** Junge Gebirge entstehen dort, wo zu t konvergiert wird (aus dem Schnitt), alte als Gedächtnis der Punkte:
jede Naht beim Zusammenbau stempelt eine Zeit, die Höhe fällt mit `e^(−Alter/160 Ma)`. Weil das Gedächtnis an den Lagrange-
Punkten hängt, reist ein Gebirge mit seinem Kontinent und kommt nach dem nächsten Zerfall als Rückgrat eines Fragments wieder an.

**Klima über Äonen.** Drei Zeitskalen, drei Wege, keiner simuliert: (1) Tektonik-Skala (≥ 1 Ma) — Energiebilanz je Schnitt aus
Kontinentlage, Leuchtkraft, CO₂-Antrieb (Ausgasung ∝ Rücken- und Bogenlänge, Verwitterung ∝ tropische Landfläche); (2) Orbit-
Skala (23/41/100 ka) — die Energiebilanz ist linear um ihr Gleichgewicht: je Schnitt drei Antwort-Profile vorab (eins je Orbit-
Mode), zu t die gewichtete Summe — ein Sprung auf −21 ka kostet eine Multiplikation je Breite; Eisvolumen und Meeresspiegel als
geschlossener Tiefpass; (3) Jahr und Tag — wie heute in gelaende-core (`temperaturFeld`), nur mit Mittel und Amplitude vom
Planeten statt der Konstanten 18/−4 °C.

## Die Brücke zu gelaende-core

Heute (gelesen): `grossform(N, x, z)` (~570) bildet C aus zwei Rausch-Termen + `P.land`, E aus zwei Termen, mappt sie über
`OFFSET_KNOTEN`/`RELIEF_KNOTEN` (~400) auf off (−48…+62 m) und rel (2…175 m) und gibt `{ off, rel, K, U, stil, trog }`; die
Regler `land`, `kontinentLambda`, `hoehe`, `rauhLambda` (~381) sind Erbgut; der Meeresspiegel ist `baseHeight − 3` (Konstante der Lage ohne Wirt,
~2682); das Klima ist `TEMPERATUR = { sommer: 18, winter: −4, … }` (~1293).

Die Brücke hat EINE Richtung (Planet → Ort) und zwei Stufen, beide ohne Zwilling:

1. **Parameter am Anker.** `PlanetCore.anker(schnitt)` wählt den Ankunftsort, `ortParameter` liefert dort: `land` (aus dem
   Krusten-Anteil und Küstenabstand), `hoehe` (aus der Hüllen-Amplitude des Gebirges), `kontinentLambda`/`rauhLambda` (aus dem
   Küstenabstand und der Gürtel-Breite), `waterLevel` (Planet-Meeresspiegel relativ zur Basis), `TEMPERATUR.sommer/winter`
   (tJahr ± tAmp/2 am Anker), die Wind-Hauptrichtung (Zonalwind am Anker statt Zufalls-Winkel in `windSaat`, phyto-core ~4130). gelaende-core
   rechnet unverändert; byte-gleich bleibt alles, was aus denselben Erbgut-Werten folgt — T2 Flussnetz, T3 Rinnen, T5 Schichten,
   Höhlen, Schnee, Temperatur-Formel. Die Eingangs-Welt ändert ihr Bild (gewollt).
2. **Großform je Punkt.** `grossform` liest C nicht mehr aus seinem ersten Rausch-Term + `P.land`, sondern aus dem Planeten:
   `c = cPlanet(zuKugel(x, z)) + Bandrest`, wobei der Bandrest die bisherigen Rausch-Terme sind, beschnitten auf Wellenlängen unter
   der Übergabe 24 km (die Planet-Oktaven enden dort). E bekommt die Gebirgs-Stärke des Planeten als Versatz. Damit gibt es EINE
   Quelle der Großform über 24 km (der Planet) und EINE darunter (gelaende-core) — kein Doppel-Band. Die Rückgabe
   `{ off, rel, K, U, stil, trog }` und alles dahinter bleibt Byte für Byte derselbe Code; U (Hebung, ks = ks₀·U) bekommt die
   Konvergenzrate des Planeten als Faktor — der Steilheits-Index hat dann eine Ursache.

**Stauchung, offen benannt.** Die Welt staucht heute die Höhe (160 m tragen, was die Alpen in 3 km tragen; Kommentar ~1290).
Der Planet rechnet in Kilometern. Die Brücke trägt EINE benannte Konstante `STAUCHUNG = 160/3000` an EINER Stelle, bis der Ort in
Erd-Höhe steht (Klima-Leiter L3.2) — das ist ein Weg, keine Sprosse.

**Koordinaten.** `ortRahmen` (azimutal-abstandstreu um den Anker): bei 100 km Abstand Längenfehler ~0,004 % auf Erd-Radius —
die Ebene des Ortes bleibt Ebene, die Krümmung im Bild ist Aufgabe des Renderers (Architektur-Blatt L3.4), nicht des Kerns.

## Was der Ansatz NICHT kann (ehrlich, mit Zahl wo gemessen)

- **Keine Dynamik.** Platten folgen Bahnen aus dem Samen, keinen Kräften; Fragmente, die sich mitten im Zyklus kreuzen, gehen
  durcheinander durch (der Schnitt wertet das als Kollision, hält sie aber nicht an). Kruste wird nicht erhalten: Subduktion
  frisst keinen Kontinent, Akkretion von Inselbögen fehlt (Kontinente wachsen nicht).
- **Ozeanalter ohne Isochronen.** Alter = Abstand zum HEUTIGEN Rücken / Rate; Rückensprünge geben falsche Alter. Gemessen:
  mittleres Ozeanalter 106 Ma (Erde ~64 Ma) → Böden zu tief → der Wasser-Haushalt musste auf 3,9 km statt Erd-2,65 km gesetzt
  werden, damit die Küste bei 0 liegt; der Gipfel-Abstand der Hypsometrie ist ~5,5 statt ~4,5 km.
- **Kaum Schelf.** −1…−3 km tragen 0,0–0,1 % der Fläche (Erde: Schelf und Hang ~7–10 %): das Schelf-Gesetz greift im Spike
  nur, wo der Krusten-Anteil > 0,02 — die Ränder sind zu hart.
- **Klecks-Küsten.** M = 8 192 Punkte ≈ 250 km Abstand; der Splat zeichnet Scheiben, das Detail-Rauschen bricht sie nur zum Teil.
  Landengen und Fjorde unter ~250 km entstehen nicht aus der Tektonik, nur aus dem Rauschen. M = 32 768 kostet ~4× Skelett.
- **Zu viel Wüste.** Die Fege kennt keinen Monsun, keine Meeresströme (kein Golfstrom), keine Jahreszeiten in 2D; Innenländer
  trocknen zu schnell aus. Köppen gegen Erde ungemessen.
- **Junge Sonne ungelöst.** t = −4 000 Ma: Äquator −45 °C — der CO₂-Thermostat im Spike ist zu schwach (Paradox der schwachen
  jungen Sonne); das Hadaikum (Magma-Ozean, Stagnant Lid) ist nicht modelliert, die Kette beginnt mit einem Superkontinent.
- **Wetter ist nicht drin.** Der Planet liefert Klima (Mittel, Amplitude, Zonalwind, Regen); synoptisches Wetter (Fronten,
  Tiefs, Stürme) bleibt `wetterAt` mit seinen Sinus-Bändern (phyto-core ~4163) — die Wetter-Leiter L1 braucht ein eigenes Gesetz,
  das diese Statistik als Rand nimmt.
- **Pol-Streifen.** Das Breiten-Längen-Raster des Spikes zieht an den Polen Streifen (sichtbar in Saat 2); der Bau nimmt die
  Würfel-Kugel.
- **Erosion nur als Zerfall.** Keine Sedimente, keine Becken, keine Deltas im Planet-Maßstab; Isostasie implizit.
- **Determinismus quer über Engines ungemessen.** Der Spike nutzt `Math.sin/acos/exp/atan2`; ECMAScript schreibt deren letzte
  Stelle nicht vor. Der Bau braucht eigene Polynom-Kerne (nur `+ − × ÷ √`, √ ist IEEE-exakt), `Math.fround` an jeder Feld-Grenze
  und Index-Tiebreak in jedem argmax/JFA — sonst kippt eine Plattengrenze auf Safari um eine Zelle.
- **Schnitt ist Megabyte, nicht Kilobyte.** ~2,4 MB je Schlüsselbild (quantisiert); nur das Skelett hält die Kilobyte-Forderung.

## Risiken für den Macher

- Die Naht- und Neuschnitt-Regeln im Skelett sind die Stelle, an der „liest als Planet“ steht oder fällt; sie brauchen den Blick
  an ≥ 30 Saaten (Saat-Statistik nach R2) bevor irgendein Leser sie konsumiert.
- Brücken-Stufe 2 ändert die Ankunfts-Welt sichtbar; jede Linse, die heute Bytes der Großform festhält, wird ROT und muss als
  Gesetzes-Wechsel neu gebucht werden, nicht still geheilt.
- Ankunft B: ein Schnitt im Haupt-Faden kostet 130–770 ms — er gehört in einen Worker und darf die Ankunft nicht verlängern
  (Skelett + Schnitt 256 parallel zum Laden der Szene).

## Erd-Statistik, gegen die der Bau misst (Richter, alle aus dem Gesetz über ≥ 30 Saaten)

Hypsometrie zweigipflig (Gipfel-Abstand 3–6 km) — Spike: ja, 5,5 km, 2 Saaten. Land-Anteil 20–35 % — Spike: 17,6–23,0 %.
Platten 8–15 — Spike: 5–8 Fragmente gezählt, dazu 3–6 ozeanische aus dem Samen (Summe 8–14, nicht im Bild gezählt). Drift 1–15 cm/a — Spike: 0,3–9,4 cm/a. Gebirge an konvergenten Rändern — im Bild ja, als Zahl
ungemessen. Klimazonen nach Breite und Regenschatten — im Bild Breitenzonen ja, Regenschatten-Verhältnis ungemessen.
Superkontinent-Phase in 1 Ga — im Bild bei −300 Ma ja (Saat 1), Anteil über Saaten ungemessen.
