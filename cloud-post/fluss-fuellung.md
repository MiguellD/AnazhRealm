# fluss-fuellung — ZWISCHENSTAND (Zweig `fluss-fuellung`, ab `gezeiten` c765fea8, NICHT in main)

Bahn: Becken füllen sich und laufen über ihren tiefsten Sattel; Seen und Flüsse entstehen aus dem Gesetz.
Leser: Station `leben.wasser.bild#1`, jeder Blick in ein Tal.

## Geschnitten

Alles steht in EINEM Gesetz: `gelaende-core.js`, Ebene 0 des Netzes (Entscheid d).

- **Füllung (`mulde`).** Eine Minimax-Suche von jeder Land-Grube nach Priority-Flood (Barnes, Lehman & Mulla 2014) und Fill-Spill-Merge (Barnes, Callaghan & Wickert 2021).
  - Sie steigt bis zum tiefsten Sattel σ, dessen Kette ins Meer fällt oder in einen See mit tieferem Spiegel.
  - Das Becken ist alles, was unter σ liegt und mit der Grube verbunden ist. Es ergibt sich gleich, egal von welcher Grube die Frage kommt.
  - Zwei Becken auf demselben Sattel laufen nie ineinander. Das war ein Zyklus-Fund und ist im Gesetz.
- **Routing (`knotenFluss`).** Der Knoten im See folgt dem Baum zu σ, σ fließt in den tiefsten tieferen Nachbarn jenseits des Beckens. Die D8-Kette steht EINMAL in `knotenAb`, auch für die Ebenen 1 und 2.
- **Verdunstung gegen Zufluss (`seeBilanzNetz`, Entscheid c).** Die Bedingung `R·A_ein < V·A_See` macht einen Endsee. Dann steht der See auf der Fläche, die der Zufluss trägt.
  - `V = seeVerlustMm` des Orts. In der Heimat ist er 0, weil am Anker der Niederschlag die Verdunstung übertrifft (PET 715 mm gegen P ≈ 745 mm).
- **Gelände.**
  - Der See-Grund liegt ≤ 2 m unter dem Spiegel; der Spiegel ist die Sohle des Überlaufs.
  - Wo der See den Talgrund trägt (Anteil > ½), liegt das Gelände unter dem Spiegel: das Ufer bei ½, die Mitte bei `SEE_GRUND.tiefe` 3 m.
  - Die Hydrosphäre liest `netzSee` (`hydroNetzSeen`): Zellen unter dem Netz-Spiegel stehen auf ihm, über die Regionsgrenzen hinweg.
  - Die Mündung in einen See liegt 0,5 m unter seinem Spiegel.
  - Im See ziehen keine Segmente.
  - Der Talgrund trägt den See-Anteil; das Relief im See ist gedämpft, abseits der Seen bit-gleich (`rel·1`).
- **Leser im Kern.** Neu ist `netzSee(L, x, z)` (Spiegel und Anteil). `flussLaeufe` endet am See und beginnt am Überlauf neu. `benannteSeen` nennt die See-Knoten.

## Gemessen

Saat anazh-realm-seed, Mess-Wiese −280,4/−1045,6, Netz der Ebene 0 ±100 km (16 129 Knoten). Werkzeug: `strom-mess.cjs` am echten Kern.

| Zahl | vorher c765fea8 | nachher |
|---|---|---|
| Flusssysteme (≥ 100 km²) ±12 km | 0 | **2** |
| Flusssysteme ±100 km | 1 | **86** |
| breitester Fluss ±100 km | 28,5 m | **57,2 m** |
| nächster Fluss zur Wiese | 112,74 km | **5,30 km** (2245/−5701, 30,5 m, 130,6 km²) |
| Becken-Land (Lauf endet in Grube) | 70,02 % | **0 %** |
| See an der Senke der Messorte | 1 Knoten | **40,96 km², Spiegel 21,99 m (K)**, Gelände-Spiegel −1,83 m |
| Ende der Wiese | Senke (hp −0,14) | **Meer** bei 4545/−13460, A 363,5 km² |
| Wiese-Höhe (`hoehe`) | 27,61 m | **12,34 m** (Seeufer, 14,2 m über dem Spiegel, nicht überflutet) |
| Netz ms (fluss ±100 km) | 14,2 | 40,3 |
| 2 Kacheln 64² kalt | — | 87 ms |

- **Fenster-Unabhängigkeit (b).** Zwei frische Netze fragen zwei Kacheln in umgekehrter Reihenfolge. Ergebnis: Höhe maxDiff **0**, 2 601 Knoten (Unterlieger + Sohle) **0** abweichend.
- **Stamm ↔ Faden (`diag-worker-dichte --selftest`).** maxDiff **0**: 12 Gitter mit 659 982 Ecken und 28 Gitter mit 1 539 958 Ecken. Der verfälschte Kern fällt rot (28,998 m).
- **Endorheisches Band (c).** In der Heimat **0 %** — physikalisch richtig im humiden Klima, nicht der Bruch.

## Ehrlich offen (Bahn ≈ 45 %)

1. **`gate:gelaende-realismus` ROT.** Das Urteil kippt je Grund-Variante zwischen den Presets; die Ursache ist nicht gefunden.

   | Variante | Heimat | alpha | beta | gesamt |
   |---|---|---|---|---|
   | tiefer K-Grund | 2/4 | 3/4 | 2/4 | 7/12 |
   | Grund ≤ 2 m | 4/4 | 4/4 | 1/4 | 9/12 |
   | Grund ≤ 2 m + Grund unter dem Spiegel (Stand) | 1/4 | 4/4 | 3/4 | **8/12** |

   - Vorher c765fea8 waren es 12/12.
   - Widerlegt sind zwei Ursachen: das abgeschnittene A im Fenster (das größte A bei beta/alpental fiel 39 → 10,6 km²) und die See-Flächen (Flint schließt S < 1e-4 aus).
   - Die rote Zahl ist meist θ knapp unter 0,3 oder R² < 0,5.
2. **`gate:worker-dichte --faden` ROT: „kein Feld des Staus aus dem Faden"** (0 Stau-Felder). Vermutlich steht der Damm der Szene auf dem geänderten Gelände. Nicht geprüft.
3. **`gate:wasser-leben` Selbsttest ROT: N2 EIS „kein See an 1816/−6168“ (Säule 0,28 m).** Der Anker ist ein Ort des alten Senken-Sees. Ihn auf einen See des Gesetzes umzusetzen ist ein Vertragsakt und nicht entschieden. Die Hydrosphäre liest `netzSee` jetzt; was dazu noch offen ist:
   - Die Station `leben.wasser.bild#1` ist nicht gelaufen, kein Browser-Lauf. Der nächste Fluss (Art „fluss“) liegt 5,30 km von der Wiese.
   - Die Zahl der See-Zellen in der Hydrosphäre ist ungemessen.
4. **Kachel-Vorbau im Faden (a) nicht gebaut.**
   - Der Faden ruft denselben Kern und zahlt die Füllung bei der ersten Frage (lazy, memo je Netz).
   - Kosten je erste Kachel ungemessen im Faden; in node kosten 2 Kacheln 64² 87 ms.
5. **Weitere offene Punkte:**
   - Die Linse der Klasse (Strom-Urteil + Mutanten in `--realismus`) fehlt.
   - Der Golden-Re-Mint fehlt. Er ist ein Vertragsakt: Die Wiese sinkt um 12,9 m, die Goldens sind noch nicht gelesen.
   - `check:statik` ist nicht gelaufen.
   - Das Bildpaar ist nicht gemacht.
   - Der Δ `klima.seeVerlustMm` aus planet-core ist für fremde Orte nicht geliefert (fremde Orte erben 0).
   - Die Oberlieger-Mulden zählen nicht zu `A_ein`.
6. **Kein Merge in main**, solange 1–3 rot sind.
