# Fluss-Spike: Priority-Flood über das Netz der Ebene 0 (Kopie, kein Kern-Commit)

Rechnung: `spike.cjs` auf `gelaende-kopie.js` (= main fbbd597c `gelaende-core.js`, nur eine Export-Zeile `__spike` zusätzlich), Saat
anazh-realm-seed, Netz der Ebene 0 (S = 1 600 m), Domäne ±160 km um den Messort wiese (−280,4/−1 045,6), 40 401 Knoten.
Füllung nach Barnes, Lehman & Mulla 2014 (Priority-Flood): Meer-Knoten (hp < wl = −3 m) und der Domänen-Rand sind Saaten; jeder Knoten
füllt bis max(hp, Füllung des Entdeckers), der Abfluss folgt dem Entdeckungs-Baum (über den tiefsten Sattel). A = Knoten × S².
Heute = `knotenFluss`/`knotenA` (D8 bis zur Senke). Domänen-Probe: ±120, ±160, ±250 km liefern für ±12 km dieselben Zahlen, für
±100 km ab ±160 km dieselben (bei ±120 km enden 1,9 % am Rand).

## (1) Läufe ≥ 27,8 m (A ≥ 100 km²)

| | heute | nach der Füllung |
|---|---|---|
| ±12 km: Fluss-Knoten / Systeme | 0 / 0 (größte 23,9 m) | 7 / 2 (größte 39,8 m) |
| ±100 km: Fluss-Knoten / Systeme | 1 / 1 (28,5 m, 107,5 km² bei 96881/−58221, 112,7 km, Quadrat-Ecke) | 590 / 93 (größte 56,7 m) |
| der nächste | im Kreis 100 km keiner | **2245/−5701, 28,1 m, 102,4 km², 5,30 km vom Messort** |

## (2) Läufe, die in einer Senke über dem Meer enden

Landfläche, die in eine Senke über dem Meer läuft: heute **85,78 %** (±12 km) bzw. **70,02 %** (±100 km); nach der Füllung **0 %**
(kein Rand-Abfluss ab ±160 km). Läufe der Ebene 0 im 40-km-Fenster heute: 421 von 591 (71 %) enden in „see“.
Außen: endorheische Becken bedecken etwa ein Fünftel der Landfläche der Erde (Wang et al. 2018, Nature Geoscience 11: 926–932: 31,8 Mio. km²,
≈ 20 %). Band also ≈ 20 % — heute liegt die Welt bei 70–86 %, die reine Füllung bei 0 %. Für das Band braucht die Füllung ein zweites
Gesetz (Verdunstung gegen Zufluss je Mulde: ein See ohne Überlauf, wo die Verdunstung den Zufluss trägt); der Spike rechnet nur die Füllung.

## (3) Bach der Mess-Wiese, Seen und Spiegel der Messorte

- Bach der Mess-Wiese (Ebene 1, −269/−1127): **0,16 km², 4,4 m — unverändert.** Knoten der Ebene ≥ 1 enden nie in einer Senke
  (`gelaende-core.js:669–670`, sie münden in die Ebene darunter); die Füllung ändert nur die Ebene 0. Nicht gerechnet: die Aue der Ebene 0
  verschiebt sich mit den neuen Läufen, das kann `inAue` der Ebene-1-Knoten ändern.
- Messorte (wiese, genesis, dorf, buehne, hochhaus-dach, gipfel-blick; stadt/stadt-voll/ort-zeichen stehen am Dorf-Anker): Alle Orte liegen
  auf Ebene-0-Knoten außerhalb jeder Mulde. Muldentiefe am Ort **0,0000 m**, Knotenhöhe unverändert (wiese/genesis/dorf 52,2530 m,
  buehne 35,3289 m, hochhaus-dach 35,5073 m, gipfel-blick 41,2956 m). Kein Messort wird überflutet.
- Alle sechs laufen heute in DIESELBE Senke bei 2245/−5701 (Grund −0,1400 m, Einzug 64 km², benannter See „senke 1“). Nach der Füllung
  ist dort ein See mit Spiegel **21,9933 m**, Tiefe 22,1333 m und 16 Knoten (≈ 40,96 km²). Sein Überlauf ist der nächste Fluss (102,4 km²,
  28,1 m), 2,64 km (hochhaus-dach) bis 6,13 km (genesis) von den Messorten.

## (4) Rechenzeit

Domäne ±160 km (40 401 Knoten): Höhen (`knotenHp`) 125–196 ms, heute `knotenA` 41–71 ms, Füllung **31–44 ms** (±120 km: 11 ms, ±250 km: 28 ms
nach warmem Cache). Die Füllung ist keine Fenster-Rechnung: der Abfluss einer Mulde hängt an einem Sattel bis 100+ km entfernt. Sie kostet
einmal je Welt und Domäne (≈ 0,2 s mit Höhen), nicht je 2-km-Fenster; heute kostet das Fenster nur die Knoten in seiner Nähe. Die Grenze
gegen Gebot 7 ist die Domäne: ab ±160 km ist das Ergebnis um den Messort stabil, darüber hinaus nicht gemessen.
