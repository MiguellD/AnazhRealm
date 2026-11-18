# ENTWURF B — vom Menschen und der Nutzung her (Bau-Zensus, main 18058dba, nur gelesen)

Gelesen: die acht Lese-Blätter a–h ganz, das Muster leben/entscheid.md. An der Quelle nachgeprüft (n1011-hg): fachwerk-core.js
2165–2276 (BAU_NUTZUNG, _bauweiseWurf, bauRezept, bauProgramm), 3600–3734 (REGION_HIST, EPOCHEN, SIEDLUNG, GROESSE_N,
siedlungsGroesse), 4140–4301 (GROESSE_BAND, chronikAnker, chronikJahr, wachstum), 4303–4517 (STADT_GRAMMATIK, STADT_DICHTE,
stadtViertel, DORF), 9519–9538 (LEUTE_GESETZ, leuteVon); stamm/siedlung-ort.js 1678–1745 (Site-Veto, _ortNaehrt);
stamm/siedlung-bewohner.js 770–880 (Bewohner je Tür, Beruf); gelaende-core.js 745–765 (flussBreite, gewaesserArt), 5753–5774
(ORT_SIEDLUNG, ortKraut), 7342–7347 (flussAm); planet-core.js 268, 2290–2340 (planetOrt: Temperatur, Niederschlag, Köppen, wuchs).
Rechnungen: node, Skript im Scratchpad (rech.cjs), Zahlen unten wörtlich aus dessen Ausgabe.

## DAS GESETZ (Entwurf)

Eine Siedlung hat einen GRUND (Wasser, Furt, Nahrung; Kreuzung erst im zweiten Durchgang) und eine Bevölkerung E(t), die
über die Zeit bis zur Tragfähigkeit ihres Grunds wächst. Ein Haus ist eine ADRESSE im Samen — (Siedlung · Los · Baujahr) —,
sein HAUSHALT (Köpfe, Gewerbe, Wohlstand, Vieh) ist eine reine Funktion der Adresse und der Siedlung zu ihrem Baujahr. Aus dem
Haushalt folgt das RAUMPROGRAMM (Herd, Stube, Kammern je Schlafplatz, Werkstatt/Laden/Lager/Stall nach Gewerbe), aus dem
Programm die Fläche, aus Fläche und LOS (Breite an der Gasse aus Hofstätte und Teilung, Tiefe aus dem Tragwerk) die Geschosse.
Die Mauer umschließt die Bevölkerung ihres Baujahrs bei der Dichte ihrer Epoche, nicht einen Radius aus der Häuserzahl.
Leute FOLGEN nicht mehr dem Haus — das Haus folgt den Leuten.

## (0) DIE UMKEHR AN DER QUELLE

Heute (Blatt a §1/§4, Blatt h §4, an der Quelle bestätigt):
```
DORF  FC:4435  kn = pool[rnd]                         die Kultur aus dem Pool des Baujahrs
      FC:4436  p = bauRezept({bauweise:kn}, null, hs)  W/D/st = Kultur-Mittel ± Würfel (FC:2207–2210); haushalt = null
      FC:4438  wohl = (1,22 − 0,5·Rang)·(0,78 + 0,44·rnd) gewürfelter Gradient, Konstanten ohne Anker
      FC:4439  W ·= 0,84 + 0,30·wohl                   Reichtum macht das Haus breiter
      FC:4444  städtisch ∧ wohl > 0,9 → +1 Geschoss
      FC:4446–4449  Keller 0,35 · Anbau 0,25 · arm · Balkon · Grundriss I/L — Würfel
leuteVon FC:9535  Leute = W·D·st·0,7 / (20 + 20·wohl)  das Haus bestimmt, wie viele darin wohnen
Wirt  SB:839   n = FC.leuteVon(sl.ov)                  so viele Bewohner
      SB:874–875  beruf = Rolle des Hauses             das Gewerbe ist ein Etikett des Gebäudes
```
Das Gegen-Gesetz steht schon im Kern und hat alle LESER, nur keinen SCHREIBER:
- `bauProgramm` (FC:2245–2276) rechnet Personen × Wohlstand → Räume → Fläche → Geschosse/Grundriss; Rufer nur das Labor
  (worlds/fachwerk/fachwerk.js:629), alle acht Welt-Rufe übergeben `null` (FC:4381, 4382, 4398, 4436, 4450, 4462, 4468, 4473).
- Es liest `hp.parzelle` (FC:2255) — ohne Erzeuger (Blatt a §3). Es liest `rahmen.dicht` (FC:2255) — ohne Erzeuger.
- Es schreibt `hp.leute` (FC:2274), und `leuteVon` liest `hp.leute` VOR der Flächenformel (FC:9531). Die Kette
  Programm → hp.leute → leuteVon → SB:839 ist also verdrahtet; die Welt schreibt nur nie hinein.

Die Umkehr kostet deshalb die SCHREIBER (DORF je Los, das Los selbst, die Haushalts-Funktion), nicht die Leser.

## (1) SIGNATUREN UND KONSTANTEN — je mit Anker

Ort: das Bau-Gesetz in fachwerk-core.js neben `bauProgramm` (EINE Quelle, Blatt a §3 Zwillinge fallen hinein). Der Kern liest
kein Gelände selbst (Blatt e §4: fachwerk-core liest `__gelaendeCore` nur für Erdbau/Höhe); der Wirt reicht Proben herein, wie er
heute H an `strassengraph` reicht (Blatt f §1). Alle Funktionen rein, ohne eigenen Zufall: der Same zieht wie heute aus dem
DORF-Strom `rnd` (FC:4404).

### 1.1 Konstanten
```
BAU_MENSCH = Object.freeze({
  // GRUND
  furtTiefeM:   0.8,   // durchwatbar für Mensch und Wagen — unsicher (Größenordnung Knie–Hüfte; keine Quelle nachgeschlagen)
  wasserNahM:   150,   // Weg zum Wasser je Gang — unsicher
  naehrt:       → gelaende-core ORT_SIEDLUNG.naehrt 0,5 (gc:5762) GELESEN, kein Zwilling
  ertragHaJeKopf: 1.0, // Ackerfläche je Kopf vorindustriell ~0,5–1,5 ha (Ertrag 1:3–1:5 Korn, Slicher van Bath 1963) — unsicher
  // HAUSHALT
  hhMittel:     4.75,  // mittlere Haushaltsgröße England 1574–1821 inkl. Gesinde (Laslett 1972, Household and Family in Past Time)
  kinder:       [2, 2.5, 3],   // je Wohlstand arm/mittel/reich — Gefälle der überlebenden Kinder, unsicher
  // RAUM (netto m²)
  schlafplatzM2: 2.5,  // × (1 + wohl): geteiltes Bett arm 3,6 · Bürger 5 · reich 7 — unsicher (geteilte Betten vor 1800 üblich)
  kammerZuschlag: 1.5, // je Kammer Tür/Gang — unsicher
  herdraum:     [9, 2],  // Einraum: 9 + 2·Kern — unsicher
  kueche:       [9, 14], // eigene Küche arm-mittel / reich — unsicher
  stube:        [8, 2],  // die eine heizbare Stube: 8 + 2·Kern·min(1,5; wohl) — unsicher
  stubeAb:      1300,  // Stube mit Ofen im Bürgerhaus ab ~13./14. Jh. — unsicher
  kuecheEigenAb:1700,  // eigene Küche auch der Armen — unsicher
  nutz:         → LEUTE_GESETZ.nutz 0,7 (FC:9526) GELESEN (netto/brutto; DIN 277 NUF/BGF liegt ~0,65–0,75 — unsicher)
  // LOS
  hofstaetteB:  15,    // Gründungs-Hofstätte 50 Fuß (Zähringer Gründungsstädte, Freiburg i. Br.) — unsicher
  hofstaetteT:  30,    // 100 Fuß — unsicher
  dMax:         → Tragwerk (Blatt b: Tiefe ≤ 11, FC:2209/2270) GELESEN — dieser Winkel setzt sie nicht
  // STADT
  dichteEha:    [150, 250],  // Einwohner/ha innerhalb der Mauer, MA/FNZ — unsicher (Band der Literatur 100–300)
})
GEWERBE = { // je Gewerbe: Gesinde und Räume [id, m², geschoss] — die Zeile ersetzt BAU_NUTZUNG.mass
  tageloehner:{ gesinde:{},                                   raeume:[] },
  baecker:    { gesinde:{geselle:1, lehrling:1, magd:1},       raeume:[['backstube',18,'eg'],['laden',6,'eg'],['mehlkammer',8,'og'],['holzlege',6,'hof']] },
  kaufmann:   { gesinde:{diener:2, lehrjunge:1, magd:2, knecht:1}, raeume:[['diele',30,'eg'],['kontor',14,'eg'],['lager',80,'dach'],['keller',40,'keller']] },
  ackerbuerger:{ gesinde:{knecht:1, magd:1}, raeume:[['stall', 'vieh×5', 'eg'],['scheune','getrennt']] },   // 4–6 m² je Rind — unsicher
  … (schmied, wirt, gerber, weber, brauer, krämer, geistlich) — jede Zeile mit Raum-m², alle „unsicher“
}
GEWERBE_ANTEIL[epoche][groesse] = { tageloehner 0,2–0,4 · handwerk 0,4–0,6 · lebensmittel ~0,1 · handel 0,02–0,08 · acker … }
  // Sozialtopographie spätmittelalterlicher Städte aus Steuerlisten — Größenordnung, unsicher; ein Bäcker je ~200–400 E — unsicher
```

### 1.2 Funktionen
```
siedlungsGrund(proben)            → {art: 'furt'|'ufer'|'see'|'acker', guete, x, z}
    proben = [{x, z, kraut, fluss:{breite, depth}|null, hang}] vom Wirt: kraut = gc ortKraut (gc:5772), fluss = gc flussAm
    (gc:7347, trägt breite und depth), hang wie heute (ort:1691). Ersetzt „der erste Punkt, der das Veto besteht“
    (_autoSettlementFindSite ort:1726–1744) durch „der beste Punkt der Proben“: Furt (fluss ∧ depth ≤ furtTiefeM) > Ufer > Acker.
tragfaehigkeit(grund, ackerHa)    → E_max = ackerHa / ertragHaJeKopf · guete
bevoelkerung(grund, gr0, t)       → E(t) logistisch von 1 Hof bis E_max (Form der heutigen chronikAnker FC:4195, Ziel statt GROESSE_N)
adresse(siedlung, i)              → {s, i, baujahr: chronikJahr(A, i)}        (FC:4215 bleibt — das Baujahr ist schon eine Funktion)
gewerbeVon(adr, E, jahr, rangLage)→ gewerbe   Zuteilung nach GEWERBE_ANTEIL über die Gründungs-Folge (Kern zuerst Markt/Handel)
wohlstandVon(adr, rangLage, u)    → w        Quantil der Wohlstands-Verteilung der Epoche an u; Lage = Bodenrente (Alonso 1964)
haushalt(adr)                     → {gewerbe, wohl, kern, gesinde, koepfe, vieh}
raumProgramm(H)                   → [[id, m², geschoss]]          Wohnräume nach 1.1 + GEWERBE[H.gewerbe].raeume
losVon(netz, block, k, jahr, E)   → {b, t, kante}   b = hofstaetteB / teilung(E/E_max), Kaufmann ganze, Tagelöhner Drittel
form(programm, los, kultur)       → hp            = bauProgramm(N, hp, H, {dicht: teilung > 1}) mit hp.parzelle = los
mauerRadius(E(T_mauer), jahr)     → √(E / dichte · 10⁴ / π) m     je Mauer-Epoche ein Ring
```

## (2) DURCHGERECHNET (node, Wurf-Mitte rnd = 0,5)

| | heute (Stellwerte FC:4436–4444, 2184–2200, 9535) | Entwurf B |
|---|---|---|
| **Tagelöhner 1450** (Rand, Rang 0,9) | Kultur mittelalterlich 7×6×2 → wohl 0,77 → W 7,5 · D 6 · 2 G. · BGF 90 m² · leuteVon **2** · **45 m² BGF/Kopf** | Kern 4, Gesinde 0 → Einraum (herdraum 17) + 1 Kammer 16 → netto 33, brutto 47 → Los ⅓ Hofstätte **5 m** · D 7 · **2 G.** · **8,3 m² netto/Kopf** · Hof 115 m² |
| **Bäcker 1620** (Rang 0,6) | als `backhaus`: 6×6×1, LEUTE_GESETZ.rolle **2** Leute (18 m²/Kopf); als Wohnhaus-Los: W 11 · D 7 · 3 G. · 231 m² · **4** Leute (58 m²/Kopf) | Kern 4,5 + Geselle, Lehrling, Magd = **7,5** → Küche 9, Stube 17, 3 Kammern 42, Backstube 18, Laden 6, Mehlkammer 8 → netto 100, brutto 143 → Los ½ Hofstätte **7,5 m** · D 11 · **2 G.** · 13,3 m²/Kopf |
| **Kaufmann 1780** (Kern, Rang 0,05) | Kultur barock 12×10×2, wohl 1,2 → kaufhaus-Ops: W ≤ 8,5 · D ≥ 10 · ≥ 3 G. · 255 m² · **4** Leute (64 m²/Kopf) | Kern 5 + 6 Gesinde = **11** → Küche 14, Stube 23, 6 Kammern 86, Saal 16, Diele 30, Kontor 14 (+ Lager 80 im Dach, Keller 40) → netto 183, brutto 261 → ganze Hofstätte **15 m** · D 11 · **2 G.** · 16,6 m²/Kopf |

Befund aus der Zahl:
- Heute wohnt der Arme mit 45 m² BGF je Kopf (≈ 31 netto), der Kaufmann mit 64 — modern deutsche Größenordnung (≈ 47 m²/Kopf
  2022, Destatis; unsicher im Wert). B gibt 8–17 m² netto, ein Drittel bis ein Viertel. Die Welt beherbergt heute ~40–50 % der
  Köpfe, die ihre Häuser historisch trügen (Vermutung aus den drei Fällen; die Stadt-Statistik ist ERSTER PUNKT 2).
- Heute ist der Kaufmann SCHMALER als der Tagelöhner-Rand (8,5 gegen 7,5 m bei 3 gegen 2 G.) — die kaufhaus-Ops FC:2187
  kappen ihn. In B ist die Breite an der Gasse das Zeichen des Reichtums (15 gegen 5 m), die Höhe gleich: das ist die
  Bodenrente, kein Stellwert.
- Die Bäckerei ist heute zwei verschiedene Dinge je nachdem, ob die Grammatik das Los trifft (36 m² mit 2 Leuten oder 231 m²
  mit 4); in B ist sie ein Haushalt mit Backstube.
- **Mauer** (Dichte 200/250 E/ha, Köpfe je Haus 5–6 — unsicher): Stadt 36 Häuser → r 54 m (heute FC:5364: 76) · Großstadt 90
  → 89 m (106) · Metropole 220 → 130 m (151). B macht die Ringe 15–30 % enger, weil die Häuser schmaler werden; die Formel
  `min(195, 26 + 8,4·√nG)` und ihr Zwilling `wasserReich` (FC:4626, Blatt f §3) fallen.

## (3) WAS FÄLLT — beim Namen

1. **BAU_NUTZUNG als Maß-Tafel**: die `mass`-Ops der Haushalts-Bauten (gasthaus, schmiede, kaufhaus, kontor, werkstatt,
   backhaus, speicher, gerberei, wohnturm, patrizierhaus, pfarrhaus — FC:2184–2200) werden GEWERBE-Zeilen mit Räumen. Die Tafel
   bleibt als DATEN (Räume in m²), die Form fällt aus ihr heraus. Der Zwilling `wohnhaus.raeume` 20/20 (FC:2183) fällt.
   Nicht-Haushalte (rathaus, kapelle, bergfried, torhaus, zeughaus) erklärt dieser Winkel NICHT ganz → ERSTER PUNKT 4.
2. **Die Würfel des Loses FC:4436–4449**: W/D/st aus der Kultur (4436; die Kultur behält Neigung, Figur, Stil, Farbe),
   Parzellen-Gedächtnis (4437), wohl-Gradient (4438 → `wohlstandVon`), Breite × wohl (4439), Stadtkörper (4440–4443, für die
   Bänder ≤ 1800; Moderne siehe Punkt 5), +1 Geschoss (4444), Keller/Anbau (4446 → aus Gewerbe: Keller beim Kaufmann/Wirt,
   Anbau aus `raeume` lage anbau), arm (4447 → aus H.wohl), Grundriss (4449 → aus dem Packer). Balkon (4448) bleibt —
   kein Haushalts-Grund.
3. **Die Flächenformel `leuteVon` FC:9532–9537** und LEUTE_GESETZ.flaeche/wohlFlaeche (FC:9526): `leuteVon` liest nur noch
   `hp.leute` (FC:9531); Rollen ohne Haushalt behalten ihre Zahl. Der Blatt-a-Zwilling „Fläche je Person zweimal“ stirbt ganz.
4. **Die je-Folgen der Grammatik** (backhaus je 9, speicher je 7/6, gerberei je 5, kontor je 4, wohnturm je 5, Patrizier-
   Schwellen wohl ≥ 1,1/1,05 — FC:4331–4340) → GEWERBE_ANTEIL je Einwohner. Die Viertel-LAGE (platz/kirche/seite) bleibt.
5. **Die zwei Los-Setzer**: `kachelMassen` (FC:4086–4110, eigene Plätze einzugM/platzM/eckeM) und `dorfLayout`→`tryPlace`
   (FC:5487–5532, Cursor + gap) → EIN `losVon(netz, block, k)` auf dem Netz, das beide schon teilen (FC:5365 `plan.netz`,
   Blatt g Z9). Das Haus hat dann fern und nah dieselbe Adresse; der Sprung beim Erwachen (fwc:4067 eingestanden) fällt.
   **Vermutung**: für Dörfer ohne Kachel (strassengraph wächst, FC:5262) muss `losVon` am gewachsenen Graphen laufen — gelesen
   habe ich nur, dass beide Setzer existieren, nicht, ob der Graph Blöcke als Flächen kennt.
6. **Mauer-Radius** FC:5364 und `wasserReich` FC:4626 → `mauerRadius(E(T_mauer))`; MAUER_BIS 1750 (FC:5342) wird die
   letzte Mauer-Epoche statt einer Schwelle. Mehrere Ringe = Mauer-Epochen (die Stadt wächst über ihre Mauer, Vorstadt
   FC:5412–5433 wird der nächste Ring).
7. **Größe aus dem Hash** (siedlungsGroesse FC:3700–3706, GROESSE_N FC:3680) → `tragfaehigkeit` × Zentralität. Zipf (gate:
   settlement Z3) wird gemessenes Ergebnis statt Setzung. Das ist der teuerste Fall → ERSTER PUNKT 6, nicht in der ersten Welle.

Absenz-Grep für die Welle, die 1–5 trägt: `bauRezept\([^)]*null` in DORF = 0 · `LEUTE_GESETZ\.flaeche` = 0 · `je:\s*\d` in
STADT_GRAMMATIK = 0 · `platzM|einzugM|eckeM` außer `losVon` = 0.

## (4) DER PREIS

- **Bytes**: jedes Haus jeder Siedlung ändert W, D, storeys, grundriss, keller, annexN. Alle Bake-Platten kalt; die erste
  Ankunft danach zahlt (Pflicht B, 16,6 s GTX laut CLAUDE.md). gate:settlement J/Z, gate:studio-huelle H9 und die Labor-Regler
  (fachwerk.js:626–632) laufen neu.
- **Bewohner**: Köpfe je Haus heute 2–4 in den drei Fällen, in B 4–11 (Faktor ≈ 2,3 in den Fällen; im Stadtmittel nach Laslett
  4,75 gegen heute ~3 → Vermutung ×1,5–2). `LEUTE_GESETZ.max` 12 bleibt Kappe. Mehr Sätze in SB:837–880 und im Takt — die
  Kosten von gate:kreatur-takt bewohner steigen; ungemessen.
- **Wachstum**: `wachstum` rechnet Kraft ∝ leute × wohl (FC:4262). Mit doppelten Köpfen halbiert sich die Verdopplungszeit
  (heute ≈ 21 min, FC:4251), solange `kraftJeS` (FC:4254) gesetzt bleibt — er braucht dann einen Anker (Geburtenüberschuss je
  Kopf und Jahr) oder er fällt mit.
- **Geometrie**: die heute unerreichbaren Pfade des Packers (L aus Überlauf, Anbau-Zellen, Keller, Laube — Blatt a §3 Tote)
  erreichen die Welt. Der Fern-Zwilling `hausMasse` (FC:4119, Blatt g Z8) kennt nur den Kasten — ein L-Haus springt an 300 m
  sichtbarer als heute. Heilung liegt in Blatt g, nicht hier.
- **Bild**: 5-m-Buden in Reihe, Hof 115 m² dahinter — historisch wahr, im Bild ungeprüft. Engere Mauerringe (−15 bis −30 %).
- **Grund**: `_autoSettlementFindSite` (ort:1726) prüft je Zelle bis 9 Punkte; B wertet dieselben Proben, fragt aber zusätzlich
  `flussAm` je Probe (gc:7347) — Kosten je Zelle einmal beim Erwachen, schirmgebunden (Gebot 7); ungemessen.
- **Code**: Schreiber in DORF (~40 Zeilen um FC:4428–4451), `losVon` neu, GEWERBE-Tafel ersetzt 11 mass-Zeilen, Grammatik-
  je-Folgen fallen; Leser (FC:9531, SB:839, FC:2255) bleiben.

## (5) WAS DIESER WINKEL NICHT ERKLÄRT — ehrlich

- **Querschnitte und Spannweite**: Ständer 0,16, Balken 0,15 × 0,21 (FC:179, Blatt b) — der Haushalt sagt, wie viel Fläche,
  nicht, wie sie trägt. Die Tiefe dMax 11 m, mit der B die Geschosse rechnet, LEIHT B vom Tragwerk; Blatt b rechnet bei 11 m
  Durchbiegung 636 mm gegen erlaubte 37 mm. Ohne Entwurf „Tragwerk“ ist die Geschosszahl in B an einer falschen Zahl geeicht.
- **Stoff und Farbe** (Blatt e): kein Haushalt wählt Holz, Stein, Ziegel; der Wohlstand KÖNNTE Putz statt Lehm bezahlen —
  Vermutung, nicht Teil dieses Gesetzes.
- **Dachneigung, Überstand, Deckung** (Blatt d): Klima, nicht Nutzung. Einziger Beitrag: Lager/Mehlboden im Dach verlangen
  `hasAttic` (FC:255) — eine Bedingung, keine Neigung.
- **Öffnungen** (Blatt c): B liefert je Raum Fläche und Funktion; ein Licht-Gesetz (Fensterfläche je Raumfläche) KÖNNTE sie
  lesen — Größe, Brüstung, Sturz bleiben Sache des Öffnungs-Entwurfs.
- **Kultur, Figur, Stil**: die Kultur-Tafel (FC:2122–2153) bleibt Quelle der Gestalt; B nimmt ihr nur W/D/st.
- **Sonderbauten**: Kirche, Burg, Rathaus, Mauer-Türme sind kein Haushalt. Ein Gemeinde-Programm (Sitzplätze je Pfarrei,
  Ratsstube je Rat) ist denkbar, hier nicht entworfen.
- **Rohstoff als Grund**: kein Gesteins-, Erz- oder Ton-Gesetz in gelaende-core/planet-core (Grep `geolog|gestein|lithol|\berz`:
  0 einschlägige Treffer). Salz-, Erz-, Tonorte kann B nicht gründen.
- **Kreuzung als Grund**: das Wegenetz folgt heute den Orten (WEGENETZ ort:3559, Blatt f §4). Zentralität (Christaller 1933)
  braucht einen zweiten Durchgang Orte → Wege → Rang; im ersten Durchgang gibt es nur Wasser, Furt und Nahrung.
- **Moderne** (Downtown FC:4453, Halle FC:4458): der Mietshaus-Block mit vielen Haushalten je Los ist in B denkbar
  (`teilung` > 1 in der Höhe statt in der Breite), hier nicht gerechnet.

## SPIKE, DER B WIDERLEGEN SOLL

Am exportierten Plan eines Messorts (stadt-voll, „dorf 7 4750“) je Los `haushalt` → `raumProgramm` → `bauProgramm` mit
`hp.parzelle = losVon(…)` in node, ohne Bild und ohne GPU. B fällt, wenn (a) mehr als 10 % der Lose eine Form verlangen, die
der Packer nicht trägt (W < 4,5 oder st > Kultur-Maximum + 2), (b) die Häuser der Mauer-Epoche nicht in `mauerRadius` passen
(Summe der Lose > Ringfläche × Bebauungsanteil), oder (c) die Köpfe der Stadt die Tragfähigkeit ihres Grunds um mehr als das
Doppelte übersteigen. Erst dann eine Bau-Welle.

## ERSTE PUNKTE DER NÄCHSTEN RUNDE

1. Der Spike oben am Messort stadt-voll: drei Zahlen (Anteil untragbarer Formen, Ring-Belegung, Köpfe/Tragfähigkeit).
2. Die Stadt-Statistik heute ↔ B: Köpfe je Haus, m² netto je Kopf über alle Lose eines Plans (heute nur drei Fälle gerechnet).
3. Die unsicheren Anker nachschlagen und belegen oder ersetzen: Hofstätte 50 × 100 Fuß, Dichte 150/250 E/ha, Furt 0,8 m,
   Schlafplatz 2,5·(1+w) m², Stube ab 1300, Gewerbe-Anteile und Bäcker je Einwohner, Gesinde je Gewerbe, ertragHaJeKopf.
4. Sonderbauten (rathaus, kapelle, bergfried, torhaus, zeughaus, Kirche, Burg): Gemeinde-Programm oder offen als Maß-Zeilen
   benannt — eine Entscheidung, keine dritte Lösung.
5. `losVon` an Dörfern ohne Kachel: an der Quelle lesen, ob `strassengraph` (FC:5262) Blöcke als Flächen liefert; sonst ist
   Fall-Punkt 5 nur für Kachel-Städte haltbar.
6. Größe aus dem Grund statt aus dem Hash (siedlungsGroesse, GROESSE_N): Zipf als Messung — Bewertung, ob gate:settlement Z3
   gegen das Ergebnis besteht.
7. `kraftJeS` (FC:4254): Anker (Geburtenüberschuss je Kopf) oder Fall mit dem Wachstum, weil B die Köpfe verdoppelt.
8. Kosten: Bewohner-Sätze je Stadt heute ↔ B im Takt (gate:kreatur-takt bewohner), bevor eine Welle die Köpfe verdoppelt.
