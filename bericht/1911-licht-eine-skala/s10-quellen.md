## S10 gegengelesen: jede Quelle physikalisch, Arbeitsbaum licht-eine-skala, HEAD cd85e4d54, sauber

Die Tafel nennt HEAD f9d373017 mit ungespeicherten Änderungen. Der Baum steht heute auf cd85e4d54 und ist sauber. Alle Zeilennummern unten sind am heutigen Baum nachgeprüft.

Gelesen habe ich jede der 20 X-Zeilen im Code. Dazu 16 grüne Stichproben: Nr 1, 2, 5, 6, 7, 8, 9, 16, 25, 28, 31, 34, 35, 39, 40, 43. Nachgerechnet habe ich mit node am Kern: lichtFarbe-Y, glutLeuchtdichte, die Wandlaterne und die Lumas der Farben. Außerdem habe ich gezielt nach fehlenden Schreibern gesucht, über emissiveNode, MeshBasic, Sprite, Points und AdditiveBlending.

### Teil 1: Himmel und große Lichter (17)

| Nr | Schreiber | heute Datei:Zeile | Wert im Code | Datum/Quelle, Rechnung | P/E/F/X |
|---|---|---|---|---|---|
| 1 | Sonnen-Richtlicht | stamm/bild-himmel.js:1886; welt-licht.js:49, 53, 715–717 | `KEY_BASE·π·a.lum` | e0 = 8,168 E. × 16 090 = 131 400 lx; geeicht nach welt-licht.js:74–79 | P |
| 2 | Mond-Richtlicht | welt-licht.js:81–86, 117–122; stamm/bild-himmel.js:1894; welt-licht.js:1175 | `MOND_LX/EINHEIT_LX/Y(mond)` | 0,26 lx (Kyba 2017), Luma herausgeteilt | P |
| 3 | Ambient der Nacht | stamm/bild-himmel.js:2210 (nur Kommentar) | — | gefallen | F |
| 4 | Hemisphäre der Nacht | stamm/bild-himmel.js:2416 (nur Kommentar) | — | gefallen | F |
| 5 | Himmels-Tafel | welt-licht.js:722–734; stamm/bild-himmel.js:1617–1622 | `sonneE`, `mondE`, `nachtE` | folgt E0, MOONLIGHT und STERNENLICHT | P |
| 6 | Sternen-Leuchten | welt-licht.js:133–144, 152–155 | `0.0005/EINHEIT_LX/π` | 0,0005 lx (USNO) | P |
| 7 | Dämmerlicht | welt-licht.js:141, 151–155 | `3/EINHEIT_LX/π` | 3 lx bei −6° | P |
| 8 | Wolken, Diffus-Anteil | welt-licht.js:1052–1060, 1069–1076 | Lambert × Zweistrom | folgt der Tafel | P |
| 9 | Wolken-Saum | welt-licht.js:1077–1081 | HG × τe^−τ × `sonneE` | folgt der Sonne | P |
| 10 | Stern-Sprites | stamm/bild-himmel.js:339–340, 362–372, 406–407, 456; :3272, 3284–3286 | `sternLx0·10^(−0,4m)/EINHEIT_LX` × Farbe | Farbe nicht auf Luma 1 gebracht: kühl Y 0,853, warm 0,925, Mars 0,718 | **X** |
| 11 | Sonnenscheibe | stamm/bild-himmel.js:2537–2538, 3296, 1163; stamm/dirigent-ankunft.js:327–334 | `1.6e9/EINHEIT_LX` × (1; 0,92; 0,7) × `lightMul·direkt`, opacity 0,95 | Y 0,921 × 0,95 = −12,5 %. Dazu fehlt der Scheibe der Durchlass der Atmosphäre (`a.lum` und `a.col` trägt nur das Richtlicht, :1886). Am Horizont steht sie also mit vollem Wert. | **X** |
| 12 | Mondscheibe | stamm/dirigent-ankunft.js:340–349; stamm/bild-himmel.js:3290 | `0xd0d4e0 × 2500/EINHEIT_LX`, nur einmal beim Bau gesetzt | Y 0,659, also −34 %. Ohne Wetter und ohne `_mondDurchlass` (in stamm/bild-himmel.js:2539–2545 wird nur die Lage gesetzt). Radius 9 m in 380 m ergibt 2,71° statt 0,52°: der Raumwinkel ist 27-mal zu groß. | **X** |
| 13 | Luft / Einstreuung | stamm/bild-himmel.js:2213–2221 (Prosa), Knoten ungelesen | Himmel × E0 | folgt dem Himmel | P |
| 14 | Godrays | stamm/bild-kosten.js:1559–1580; stamm/dirigent-takt.js:2538 | Puffer × Schwelle × `strength` | Zuschlag ohne Quelle auf Licht, das schon im Puffer steht | **X** |
| 15 | Umgebung (IBL) | welt-licht.js:850–858 | Tafeln × `licht` | folgt dem Himmel | P |
| 16 | Rückstrahl | stamm/bild-schatten.js:185–186 | `farbe.load/kBild` | Puffer ÷ k | P |
| 17 | Wasser-Sonnenterm | stamm/bild-himmel.js:2491, 2500; stamm/wasser-hydro.js:837; **stamm/gelaende-fern.js:1705–1727** | `max(0.22, dl.intensity)` | 0,22 ohne Quelle, nachts rund 6 500-fach. Der Fern-Wasser-Ring liest dasselbe `U.light`. | **X** |

### Teil 2: Ort-Lichter, Leuchtflächen und die nachgetragenen Schreiber (29)

| Nr | Schreiber | heute Datei:Zeile | Wert im Code | Datum/Quelle, Rechnung | P/E/F/X |
|---|---|---|---|---|---|
| 18 | Herdfeuer | fachwerk-core.js:6539; stamm/dirigent-kern.js:1743–1748, 1679–1683, 1708–1712; fachwerk-core.js:6592–6603 | `cd 10.2/EINHEIT_LX` × `lichtFarbe(2000)` | 3,515 lx gerechnet. Die Farbe ist auf den hellsten Kanal normiert (Y 0,396), real also 1,39 lx, unter dem Band 2–5 lx | **X** |
| 19 | Glut ohne Gestalt | stamm/dirigent-kern.js:1785, 1804, 1846 | Herdfeuer × Fläche/0,4536 | wie 18 | **X** |
| 20 | Laterne | fachwerk-core.js:6541 | `cd 25.7` × `lichtFarbe(1900)` | 2,0013 lx, mit Y 0,378 real 0,76 lx | **X** |
| 21 | Wandlaterne | fachwerk-core.js:6549–6569 | cd 3,608, Kern 2,742 | Boden 2,0012 lx, real 0,76 lx | **X** |
| 22 | Stahl der Esse | stamm/feld-leben.js:2555–2584, 3120–3131 | 10,2·0,06/0,4536 = 1,35 cd × g | glutLeuchtdichte(1 573 K) = 16 076 cd/m² × 0,06 m² = 965 cd. Faktor ≈ 1/715 | **X** |
| 23 | Brand (Licht) | stamm/dirigent-kern.js:1728–1736, 1816 | `π·15000·k²/(1+k²)` × Farbe 2 000 K | real 5 940 cd/m² | **X** |
| 24 | Lava (Licht) | stamm/dirigent-kern.js:1824; :1732 (`...Lf`, kelvin 2000) | `glutLeuchtdichte(t0)` × Farbe 2 000 K | 33 263 cd/m² bei 1 650 K, real ≈ 13 200 und in der Farbe des Holzfeuers | **X** |
| 25 | Tor (Licht) | stamm/siedlung-tor.js:347–351, 766–780 | `glutIntensity × 2.7` cd, Farbe 0xffd9a0 | 10 cd, mit Y 0,734 real 7,3 cd, im Band 5–20 | P (Hypothese) |
| 26 | Augen-Licht | stamm/bild-himmel.js:2049–2096 | `I·EINHEIT_LX`, I ∝ 1/k | Laut Bauplan Z. 60 bleibt es an k („Tor-Membran und Augen-Licht bleiben an k (Bild-Größen)“). Es steht auch in BELICHTUNG_TEILER, scripts/diag-altlasten.cjs:1577. | **K** (an k laut Bauplan) |
| 27 | Flamme/Glut, Rolle `feuer` | fachwerk-core.js:2109, 2111–2115; stamm/studio-stoff.js:409–414 | Vertex-Farbe × `LEUCHT_FEUER` 2,5 | Laborzahl. Die Glut-Mitte (0,75/0,25/0,08) × 2,5 ergibt Y 0,86 E. = 13 840, also die Leuchtdichte einer Flamme statt glutLeuchtdichte(T) | **X** |
| 28 | Lava-Kruste | stamm/siedlung-wege.js:552–566; stamm/stoff-material.js:970–971 | `glutLeuchtdichte(t0)/EINHEIT_LX/luma` | Planck × V(λ), Luma herausgeteilt | P |
| 29 | Fensterglas | fachwerk-core.js:6540, 2081, 2108; stamm/dirigent-kern.js:1604–1607; stamm/stoff-material.js:2107–2111 | `cdM2 8` × `lichtFarbe(2800)` × Schaltplan, Deckkraft 0,42 | 8 × 0,534 × 0,42 = **1,79 cd/m² (−78 %)** | **X** |
| 30 | Laternenglas | fachwerk-core.js:6541, 2100, 2107 | `640` × `lichtFarbe(1900)`, Deckkraft 0,42 | 640 × 0,378 × 0,42 = **102 cd/m² (−84 %)** | **X** |
| 31 | Funken | stamm/kampf.js:929–937, 2684 | `glutLeuchtdichte/EINHEIT_LX/luma` | Luma herausgeteilt | P |
| 32 | Fahrzeug: Tagfahrlicht, Linsen | vehicle-core.js:162–186, 227–230; stamm/studio-stoff.js:344–355 | ei 0,9 / 1,1 / 0,85 / 0,8 als Welt-Einheit | Laborzahl. Tagfahrlicht 9 700 < Band R87, Rücklicht 3 090 > Band R7 | **X** |
| 33 | Fahrzeug, Epochen | vehicle-core.js:340–341, 360–364 | ei 1,0 / 1,6 | ohne Band | **X** |
| 34 | Tor: Filigran, Saum, Scheibe | porta-core.js:1335, 1336, 1449; stamm/koerper-leib.js:1467–1471; stamm/studio-stoff.js:413 | Bildwert ÷ k | scripts/diag-altlasten.cjs:1564 | E |
| 35 | Tor-Rahmen, Beschläge | porta-core.js:1331–1334; stamm/studio-stoff.js:355, 740 | Emissiv ÷ k | scripts/diag-altlasten.cjs:1565–1566 | E |
| 36 | Glimmen: Glutbett der Esse | stamm/bau-teile.js:1771–1774; stamm/stoff-material.js:868–879, 3871 | `(glimmen/0.5)·1·boost/EINHEIT_LX` | ≤ 3,4 cd/m² gegen 16 076 beim selben `ESSE.feuerK` | **X** |
| 37 | Glimmen: Kristall | stamm/bau-teile.js:1641–1663; stamm/stoff-material.js:757–770, 878 | dto., boost 0,42–1,7 | Die Achse geht bis 2 × boost × Y(Farbe), also bis ≈ 3,4 cd/m². Die quarz-Tags sind ungelesen, das Band ist nicht belegt. | **?** ungelesen |
| 38 | Glimmen: Holz, Laub, Leder | stamm/siedlung-bauten.js:985–995; stamm/stoff-material.js:762, 878 | dto., boost 1 | Bis 2 cd/m² × Y. Der Code selbst sagt: „ihr Glimmen ist ein Ton, kein Feuer“. Die Tags sind ungelesen. | **?** ungelesen |
| 39 | Tierauge | tetrapoda-core.js:3692; foundry-core.js:8443–8446; stamm/studio-stoff.js:355 | Emissiv ÷ k | Rest ohne Gesetz, scripts/diag-altlasten.cjs:1555–1558 | E (Rest) |
| 40 | Kreatur-Aura | stamm/kreatur-verhalten.js:2220, 2269 | `_erscheinungStoff` | scripts/diag-altlasten.cjs:1567–1568 | E |
| 41 | Platzhalter eines Mitspielers | stamm/netz-p2p.js:2175, 2180 | `_erscheinungStoff` | scripts/diag-altlasten.cjs:1569 | E |
| 42 | Flamme des Brands (Bild) | stamm/feld-brand.js:798–801, 844–848, 945 | `lichtFarbe(K)·(K/K0)⁴ × 15000/EINHEIT_LX` | Wurzel bei Y(3 000 K) 0,566 ergibt 8 490 cd/m² | **X** |
| 43 | Tor-Membran (Zielbild) | stamm/siedlung-tor.js:281; stamm/bild-kosten.js:2245–2247 | Zielbild ÷ k | scripts/diag-altlasten.cjs:1563 | E |
| **44** | **Regen-Schlieren** (fehlte) | stamm/bild-himmel.js:1037, 1050, 1090; foundry-core.js:203–204 | PointsNodeMaterial, unbeleuchtet, `0xbcd2e2` × Deckung bis 0,72 | Y 0,623 ergibt ≈ 10 000 cd/m² × 0,72, bei Tag und Nacht gleich. Ohne Quelle, folgt keinem Licht. | **X** |
| **45** | **Namensschild eines Mitspielers** (fehlte) | stamm/netz-p2p.js:2240–2262, 2291–2295 | SpriteMaterial mit Canvas, in `state.scene` | Schrift #f0e6d2, Y 0,798, also ≈ 12 840 cd/m². Nicht unter den acht, nicht Rest. | **X** |
| **46** | **Haut-Saum, Fell-Rim/Glanz/Funkeln, Strähnen-Rim/Glanz** (fehlte) | stamm/studio-stoff.js:486–489, 510–513, 608–627, 667, 670–676; koerper-core.js:774–780; tetrapoda-core.js:3711–3740 | Farbe × rim^p × amt als **emissiveNode**, ohne Licht | Laborzahlen als Welt-Einheit, „er leuchtet im Schatten wie in der Sonne“ (koerper-core.js:777). Haut ≤ 416 cd/m², Fell-Rim ≤ 2 420, microFur ≤ 1 960, Strähnen-Spitze ≤ 5 190. Nachts also das 10⁴–10⁵-Fache der Wand im Mondlicht. | **X** |

### Korrigiert

1. **Nr 26 Augen-Licht: X wird K.** Der Bauplan Z. 60 lässt Tor-Membran und Augen-Licht ausdrücklich an k. Die Linse führt es als erlaubten Teiler (scripts/diag-altlasten.cjs:1577). Es ist kein ROT.
2. **Nr 37 und 38 Glimmen: P wird „? ungelesen“.** Der Code erlaubt (glimmen/0,5) × boost bis 2 × 1,7 cd/m² × Y(Farbe), also über dem Band 0,1–1 (stamm/stoff-material.js:762, 878). Die Achsen von quarz und holz hat die Tafel selbst nicht gelesen, ein P ist so nicht belegt.
3. **Nr 29 und 30:** Die Deckkraft 0,42 aus fachwerk-core.js:2081 und :2100 multipliziert das Emissiv mit. Real stehen 1,79 cd/m² (−78 %) und 102 cd/m² (−84 %), nicht −47 % und −62 %.
4. **Nr 11 Sonnenscheibe:** Zusätzlich fehlt der atmosphärische Durchlass. Die Scheibe trägt nur `lightMul·direkt` (stamm/bild-himmel.js:1163, 2537).
5. **Nr 12 Mondscheibe:** Zusätzlich ist der Wert konstant, ohne Wetter und ohne Durchlass. Die Scheibe ist 2,71° groß statt 0,52°, der Raumwinkel also 27-mal zu groß (stamm/dirigent-ankunft.js:340).
6. **Nr 17:** Der Fern-Wasser-Ring liest denselben Boden 0,22 (stamm/gelaende-fern.js:1705–1727).
7. **Neu Nr 44 Regen-Schlieren:** ein unbeleuchteter Schreiber mit fester Farbe, er fehlte in Zensus und Tafel.
8. **Neu Nr 45 Namensschild:** ein unbeleuchtetes Sprite in der Welt-Szene, außerhalb der Klasse.
9. **Neu Nr 46 Haut-, Fell- und Strähnen-Additive:** eine ganze Familie Emissiv ohne Lichtquelle in der Welt-Einheit. Das ist dieselbe Klasse wie das additive Band, das mit F6 fiel (stamm/stoff-material.js:777–783), nur auf der Studio-Gestalt überlebt.
10. **Geprüft und nicht aufgenommen:** Werkstatt-Marker und Sitz-Geist (stamm/bau-teile.js:2236–2246, nur mit `opts.connectionLines`), die Schmiede-Überlagen (schmiede-core.js:161–199, nur im Labor) und koerper-Emissiv (foundry-core.js:9650–9656, „koerper deklariert heute kein emissiv“).

### Endsummen (46 Schreiber)

- **P: 13.** Teil 1: Nr 1, 2, 5, 6, 7, 8, 9, 13, 15, 16. Teil 2: Nr 25, 28, 31.
- **E: 6 Zeilen** (Nr 34, 35, 39, 40, 41, 43). Sie decken die acht Namen und den Rest Tierauge.
- **K: 1.** Nr 26, Augen-Licht an k laut Bauplan.
- **F: 2.** Nr 3, 4.
- **?: 2.** Nr 37, 38, ungelesen.
- **X: 22.** Sie verteilen sich so:
  - **Farb-Norm, 12:** Nr 10, 11, 12, 18, 19, 20, 21, 23, 24, 29, 30, 42.
  - **Eigener Faktor ohne Quelle, 7:** Nr 14, 17, 27, 32, 33, 44, 46.
  - **Widerspruch im Code, 2:** Nr 22, 36.
  - **Außerhalb der Klasse, 1:** Nr 45.

**Weiter ungelesen:**
- die Knoten der Luft (stamm/bild-himmel.js ab 2358)
- die emissiv-Tags von quarz, glut und holz
- welche anderen Studio-MeshBasic über stamm/koerper-leib.js:1467 und stamm/studio-stoff.js:413 laufen und unter „Filigran, Saum, Scheibe“ fallen
- ein Platzier-Geist in der Welt

Geschnitten: nichts, der Auftrag war nur lesend.
Gemessen: 46 Schreiber am Code: P 13 · E 6 · K 1 · F 2 · ? 2 · X 22. Drei Schreiber fehlten in der Tafel, darunter die ganze Familie Haut-/Fell-Additive; Nr 26 war kein ROT.
Pflicht-OFFEN Rest: A, B, C, E, F (docs/PFLICHT-OFFEN.md).
Status: ZWISCHENSTAND