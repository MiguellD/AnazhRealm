# Planet-Zensus — was heute Relief, Wasser, Gestein, Klima, Biom, Tag und Jahr macht

Stand: main b7ed8419 (`planet-core.js` VERSION `planet-h2-4`), gelesen am 18.11. Sechs Leser haben je ein Blatt geschrieben, jede
Zeile mit datei:zeile, und jede Zahl der Blätter ist mit ihrem eigenen Mess-Skript gemessen worden:

| Blatt | Domäne | Zeilen | Messung |
|---|---|---|---|
| `zensus/a-relief-gestein.md` + `.json` | Relief, Gestein, Boden, die Form der Welt | 124 | `zensus/a-mess.cjs` |
| `zensus/b-wasser.md` + `.json` | Meer, See, Fluss, Grundwasser, Eis | 99 | `zensus/b-mess.cjs` |
| `zensus/c-klima-wetter.md` + `.json` | Temperatur, Niederschlag, Wind, Wetter, Schnee | 83 | `zensus/c-mess.cjs` |
| `zensus/d-biom-tag-jahr.md` + `.json` | Biom, Wuchs, Tag, Jahr, Sonne, Mond | 96 | `zensus/d-mess.cjs` |
| `zensus/e-planet-kern.md` + `.json` | der Kern `planet-core.js` und seine Brücke ins Spiel | 236 | `zensus/e-mess.cjs` |
| `zensus/f-stand-vision.md` + `f-sprossen.json` | was Vision und Meisterkarte-2 schon sagen | — | `zensus/f-sprossen.cjs` |

Gezählt hat `zaehle.cjs`, nicht die Hand: Es liest die fünf Tabellen, prüft jedes Feld, legt Doppelzählungen zusammen und schreibt
`zensus.json` (alle Zeilen und die Zählung), `zensus-tabelle.md` (die Tafel je Domäne) und `zaehle.out.txt`.

Die Urteile: **folgt** heißt, der Wert folgt aus dem Samen oder der Physik, und die Formel steht in der Zeile. **gesetzt, Anker**
heißt, die Zahl ist gesetzt, trägt aber einen Literatur- oder Norm-Anker (Quelle in der Zeile). **gesetzt** heißt, die Zahl ist von
Hand gestimmt und hat keinen Anker. **Technik** heißt, die Zahl ist ein Gitter, eine Probenzahl oder eine Schranke und kein Maß der
Welt.

## §1 Die Zählung

Insgesamt sind es 638 Zeilen. 31 davon zählt `zaehle.cjs` als doppelt, weil zwei Leser dieselbe Stelle für dieselbe Größe genannt
haben. Es bleiben **607 Größen**, davon **89 Technik** und **518 Welt-Maße**.

| | Welt-Maße | folgt | gesetzt, Anker | **gesetzt ohne Anker** | ohne Leser | mit benanntem Zwilling |
|---|---|---|---|---|---|---|
| **alle** | **518** | 104 (20 %) | 56 (11 %) | **358 (69 %)** | **38** | **111** |
| im Kern `planet-core.js` | 193 | 31 | 22 | 140 (73 %) | 24 | 29 |
| in der Heimat (Gelände, Stamm, Phyto, Licht …) | 325 | 73 | 34 | 218 (67 %) | 14 | 82 |

Mit Technik (607) lauten die Zahlen: folgt 119, gesetzt mit Anker 57, gesetzt ohne Anker 431, ohne Leser 53.

Je Domäne, mit Technik (`zaehle.out.txt`):

| Domäne | Zeilen | folgt | Anker | gesetzt | ohne Leser |
|---|---|---|---|---|---|
| relief | 164 | 24 | 7 | 133 | 15 |
| klima | 119 | 29 | 18 | 72 | 6 |
| wasser | 108 | 32 | 13 | 63 | 7 |
| biom | 55 | 7 | 6 | 42 | 8 |
| planet | 46 | 5 | 4 | 37 | 7 |
| tag | 33 | 4 | 4 | 25 | 5 |
| welt | 24 | 8 | 1 | 15 | 0 |
| jahr | 20 | 6 | 2 | 12 | 3 |
| gestein | 17 | 2 | 0 | 15 | 1 |
| wind | 12 | 2 | 2 | 8 | 1 |
| boden | 9 | 0 | 0 | 9 | 0 |

**Zwillinge**, also zwei Quellen für dieselbe Welt-Größe, in drei Lesarten:

1. **Benannt:** 111 Welt-Maße tragen einen Zwilling, den der Leser mit datei:zeile nennt.
2. **Kern ↔ Heimat:** 30 Klassen stehen im Kern UND in der Heimat. Das sind 244 Zeilen in den Klassen niederschlag_jahr, gebirge,
   relief_hoehe, kueste, meeresspiegel, gestein_art, biom, wind_richtung, landform, relief_wellenlaenge, temperatur_jahresmittel,
   eis, erosion, schelf, saison_phase, wind_staerke, temperatur_jahresamplitude, relief_amplitude, sediment, regen_quote, tageslaenge,
   kraut_deckung, breite_ort, jahr_laenge, wald_deckung, sonnenstand, temperatur_hoehengradient, koordinate,
   temperatur_tagesamplitude und achsneigung.
3. **Heimat ↔ Heimat:** 36 Klassen stehen in zwei oder mehr Heimat-Dateien, zusammen 156 Zeilen. Am breitesten sind gestein_art und
   tag_achse in je 6 Dateien, wind_staerke in 5 und samen in 4.

Die Zwillinge mit dem schwersten Gewicht (Blatt e §3.1, Blatt c §0, Blatt d §0, Blatt b §0):

| Größe | Kern | Heimat |
|---|---|---|
| Höhengradient | `lapse` 6,5 K/km (`planet-core.js:1864`) | 0,1108 K/m, also 17,04× (`gelaende-core.js:5850`, `:1334`) |
| Sonne | Neigung, Breite, Jahr (`planet-core.js:263`) | `sonnenRichtung(winkel)` ohne Breite und Neigung (`welt-licht.js:711`); jeden Tag Mittag auf 74,2° |
| Jahr | `jahrTage` (`:264`) | `TEMPERATUR.jahrTage` 365 (`gelaende-core.js:1319`) gegen das 2 400-s-Jahr des Wuchses (`stamm/dirigent-kern.js:311`) |
| Schwere | `g` (`:263`) | −9,81 (`stamm/daten.js:72`) |
| Wind | `windX`/`windZ` (`planet-core.js:2336`) | Hash der Welt-Saat ±41° (`phyto-core.js:4334`, `:4357`) |
| Meeresspiegel | `meerLoesen` (`:1561–1574`) | −3 · +4 · 0 in 23 Zeilen (Blatt b §0) |
| PET | `400 + 45·T` zweimal im Kern (`:2069`, `:2144`) | — |

**Ohne Leser** sind 38 Welt-Maße. Im Kern sind es 24, darunter Köppen und Whittaker, die Wind-Richtung, die Vulkane, die
Leit-Stützen, `rand`, `stauchung` und `hoeheM` (Blatt e §3.2). In der Heimat sind es 14, darunter `_rockExposureAt`
(`stamm/gelaende-boden.js:719`) und die Gezeiten, die es nicht gibt (Blatt b, Zeile b82).

## §2 Was die Welt heute IST

**Die Heimat ist eine unbegrenzte Ebene.** Die Höhe ist `hoehe(L, x, z)` (`gelaende-core.js:2819`): eine reine Float64-Funktion von
Saat, Erbgut und (x, z), ohne Rand, Klemme oder Wrap. Sie ist weder eine Kugel noch eine Scheibe. Die Kachel von 2 048 m
(`gelaende-core.js:5679`) teilt nur das Wasser. Es gibt kein Meer: 96–100 % Land je Welle (Blatt a §F; `land 0,35`,
`gelaende-core.js:381`), unter −3 m liegen 0,24 % eines Kastens von 20 km (Blatt b (8)).

**Die Heimat ist in der ENTFERNUNG eine Funktion, in der FLÄCHE ein Sack.**

- **Entfernung:** Die Höhe kostet nah ±1 km um (0, 0) kalt im Median 1,47 µs und fern ±1 km um (1 000 km, 0) kalt 1,46 µs
  (Blatt a, Messung 1).
- **Fläche:** Die Knoten-Maps des Flussnetzes (`gelaende-core.js:546`) werden nie geräumt (`:537`).
  - Eine Adresse in neuem Gelände kostet kalt 1,28–1,50 ms und hält 403–454 KB.
  - 600 gestreute Adressen halten 262 MB. 10 000 auf einmal brechen nach 31 s mit OOM bei 2 044 MB ab (Blatt a, Messung 2).
  - Das Netz wächst um ~78 KB je km² (Blatt b (7)).
- **Wasser:** Die Hydrosphäre ist ein Sack je Kachel. Eine Kachel kostet kalt 110–185 ms, und von 2 048 auf 4 096 m Kante (Fläche ×4)
  steigt die Zeit ×5,8 (Blatt b (6)).
- **Ohne Kachel gilt überall das Meer −3** (`gelaende-core.js:7756`). Das Grundwasser ist der Meeresspiegel, auch unter jedem Berg
  (`stamm/wasser-zellen.js:206`).

**Die Heimat wiederholt sich.** Das Vendor-Simplex permutiert `i & 255` (`vendor/simplex-noise.js:54`). Dadurch kehrt der
Kontinent diagonal alle 1 330 km wieder, das Hang-Detail alle 5,6 km und der Höhlen-Wurm alle 4,9 km; gemessen ist |Δ| 4,4·10⁻¹³
(Blatt a §F2). Unbegrenzt ist die Koordinate, nicht das Gesicht.

**Klima, Tag und Jahr der Heimat haben keinen Ort.**

- **Klima:** Temperatur, Niederschlag, Wind, Wolke und Nässe sind je EINE Zahl für die ganze Welt. `temperaturFeld(L, y, traegTage)`
  hat kein x, z (`gelaende-core.js:1321`); der einzige Ortsbezug ist die Höhe.
- **Wetter:** Das Wetter ist eine Funktion (`phyto-core.js:4423`), die die Welt an EINEM Punkt abtastet, der Spieler-Position, je 120 s.
  Daraus wird ein globales Wort (`stamm/dirigent-takt.js:1714`, `:1740`; Blatt c §0).
- **Biom:** Eine Biom-Tafel gibt es nicht (`stamm/feld-leben.js:1788–1792`). Boden, Wald-Stand, Bestandsdichte und Artenwahl sind
  Rauschen des Samens; das „Klima" `clim` des Walds liest keine Temperatur (`phyto-core.js:3059`; Blatt d §0).
- **Tag und Jahr:** Das Jahr des Wuchses dauert 2 400 s, ein Uhr-Tag 3 600 s; das Jahr ist kürzer als der Tag (Blatt d §0.7–8).

**Der Kern ist eine Funktion — und das Spiel liest ihn kaum.**

- **Funktion:** `planetPunktR` kostet im Median 6,0–7,9 µs, `planetKlimaR` an Land 45–62 µs. Der Plan wiegt 36–77 KB über
  R 3 186–12 742 km (Blatt e §2). Mit dem Radius wächst keine der Kosten (Spike §a: 4R/R 1,11).
- **Eine Tür:** Das Spiel liest den Kern an genau einer Tür, dem Konsolen-Satz „reise" (`voxel-worker.js:1175–1204`), und nur als Δ
  gegen den Anker.
- **Die Heimat liest ihn nie:** `ortGesetz(null)` gibt die Konstanten `TEMPERATUR`, `PEGEL` und `GRUND` zurück
  (`gelaende-core.js:5843` ff.). **Die Konsum-Tiefe des Kerns im gespielten Pfad ohne „reise" ist 0** (Blatt e §3.2).

## §3 Was eine Adresse 1 000 km entfernt kostet

| Frage an (10⁶ m, 0) | Kosten | O(1) oder Sack | Quelle |
|---|---|---|---|
| Heimat-Höhe, warmes Gelände | 1,36 µs Median | Funktion | Blatt a, Messung 1 |
| Heimat-Höhe, neues Gelände | 1,3–1,5 ms und ~430 KB, die bleiben (Einzel-Ruf mit Netz 3,7–8,2 ms) | **Sack** | Blatt a, Messung 2; Blatt b (5) |
| Heimat-Wasser | 71,6–75,3 ms je Kachel, 483 888 B typed + 650 465 B JSON; ohne Kachel ist der Spiegel −3, mit Kachel −∞ | **Sack** | Blatt b (5) |
| Heimat-Klima, Tag, Biom | 0 (dieselbe Zahl wie daheim) | kein Ort | Blatt c §0, Blatt d §0 |
| Float32 der Boden-Vertices | ULP 0,0625 m | — | Blatt a, Messung 4 (`voxel-worker.js:3939`) |
| Kern: Höhe, Klima, Biom | 6–8 µs, 45–62 µs (Land), 0,1–0,4 µs | **Funktion**, unabhängig von R | Blatt e §2, `spike/a-kosten.out.txt` |
| Kern: der Ort mit Δ (`planetOrt`) | 0,64–1,11 ms warm | Funktion | Blatt e §2 |

## §4 Was die Meisterkarte schon sagt

Blatt f zieht aus `vision/meisterkarte-2.json` 36 Leitern mit 255 Sprossen (`zensus/f-sprossen.json`). 26 davon sind
`planet.*` (geologie, relief, wasser, wetter, zeit, erde) und 10 sind `same.*` (entfaltung, massstab). Blatt f §5 nennt die Brüche
zwischen Karte und Code:

1. **W1:** `planet.geologie.platten` bucht den Planeten noch als „ebene Welt … ohne Treffer für Tektonik"; keine Leiter nennt
   `planet-core.js`.
2. **W3:** Die K4-Formel im Kopf ist nicht die Formel im Code (`planet-core.js:21` gegen `:1159`).
3. **W4:** `LAPPEN_GROB` ist 1,5 (`planet-core.js:279`), der Entscheid E2 sagt ≈ 1. Ebenso steht `BECKEN_C` auf 3,0 (`:284`)
   gegen c 5.

Darauf baut `gesetz.md`: Die Stufen S0–S4 und S7 sind der Kern, wie er ist. Neu sind S5 Wasser, die Naht als ein Satz und das Urteil
je Größe (§6).
