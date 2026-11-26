# erdbau-boeschung — Stand-Blatt (ZWISCHENSTAND)

Keine Sprosse der Meisterkarte 2 nennt die Böschung am Rand des Erdbaus. Der Schnitt trägt zu `planet.kopplung.siedlungslage`
Sprosse 1 bei („Wasserspiegel + Boden-Höhe, 50 Punkte“: EINE Boden-Höhe, Huf, Rad und Fuß ≤ 3 cm). Er trägt auch zu
`mensch.netz.gestalt` Sprosse 1 bei („1 Ort, ~10 km, 4 Klassen“: jede Klasse ohne Wand oder Klemmen befahren). Keine von
beiden ist durch ihn gebucht: die erste verlangt ihr Bildpaar an 50 Punkten, die zweite die Fahrt.

Zweig `erdbau-boeschung` von origin/main 2da17e2e. Karte 2 gebucht 118 von 1 718. Status ZWISCHENSTAND.

## Geschnitten

- **Der Täter** stand bei `gelaende-core.js:2340` (main): `if (d > R) continue;` mit `R = ERDBAU.reichweiteM = 16`. Die Böschung
  `clamp(h, y − 0,6·d, y + 0,6·d)` lief bis 16 m und brach dort ab. Lag die Natur höher oder tiefer, als der Kegel bei 16 m trug
  (9,6 m), fiel der Rest in einer Probe auf sie zurück.
- **EINE Hülle statt Klammer-Folge** (`erdbauY`). Jeder Splat in Reichweite bildet ein Band um die Natur h0:
  - unten l = min(y − 0,6·d, h0 + 1,0·(R − d));
  - oben u = max(y + 0,6·d, h0 − 1,0·(R − d)).
  Der Kegel 0,6 (31°) läuft, bis er die Natur trifft. Trifft er sie nicht, hält die steile Böschung `steil` 1,0 (45°) den Rest,
  der an der Reichweite `reichweiteM` 48 m auf 0 fällt. Die Höhe ist h0 im Schnitt aller Bänder; die Reihenfolge zählt nicht,
  überlappende Erdbauten bilden EINE Fläche.
- **Die Rampe.** Schneiden sich die Bänder nicht (zwei Flächen näher, als die Böschung ihren Höhenunterschied trägt), gilt die
  Höhe, an der die größte Übersteilung (l − h)·w gegen (h − u)·w am kleinsten ist, mit w = (R − d)/(R·d). Die Höhe ist an
  jeder Fläche und an der Reichweite stetig.
- **Die Normalform** trägt je Zell-Eintrag ihre Grenze [lo, hi] (`grenzen`) und die Brücken je Zelle (`freiZellen`). Die Frage
  überspringt jeden Splat, dessen Kegel die Höhe in der ganzen Zelle hält, und rechnet so nur Zelle und Erdbauten in
  Reichweite. Das Raster ist eine eigene Funktion (`erdbauRaster`) mit kleinen ganzzahligen Schlüsseln: Schlüssel über 2³¹
  kosteten je Eintrag ein Zahl-Objekt. `erdbauWand` liest dieselbe Grenze.
- **Kein Zwilling, kein Flag.** `ERDBAU.reichweiteM` bleibt die EINE Zahl; ihre Leser folgen ihr ohne Änderung:
  `_bautenAmGrund` (stamm/gelaende-boden.js:595), `_erdbauWirkt` (:1035) und `_forestDartsFallen` (stamm/vegetation-wiese.js:2896).
- **Die Linse** `--boeschung` in `gate:gelaende-realismus` (scripts/diag-worker-dichte.cjs, die Gelände-Familie, ohne Browser).
  - Sie misst den Genesis-Ort, die Stadt des Haushalts (`stadt-voll`, Gründung „dorf 7 300“) und zwei Dörfer am Hang.
  - Sie rastert 0,5 m im Ring 10–60 m und meldet jede Stufe über 0,6 m abzüglich der Natur ROT beim Namen: Ort, (x, z),
    Höhe beider Proben, Abstand.
  - Konsum-Leser ist `hoehe` über der Lage mit `erdbau`: der Chunk-Boden des Fadens (voxel-worker `state.erdbau`) und der Fuß
    im Stamm (`_erdbauNorm`). gate:worker-dichte --kern hält beide gleich dem Kern.
  - Der Selbsttest pflanzt den harten Schnitt bei 16 m ein.

## Gemessen (vorher main 2da17e2e → nachher, node, gleiche 26 Erdbauten, gleiche Rechnung)

Die 26 Erdbauten sind die Stadt (Ort 836,0867/438,2428, Same 7, 300 Häuser), der Genesis-Ort und 24 Orte (Same 1–24, 8–160
Häuser, trocken, Hang ≤ 0,6). Gemessen ist je Erdbau die größte Höhen-Stufe zwischen Nachbar-Proben im 0,5-m-Raster, abzüglich
der Stufe der Natur an derselben Kante.

| Messung | vorher | nachher |
|---|---|---|
| Ring 10–24 m: Erdbauten mit Stufe > 0,6 m | **12 von 26 = 46,2 %** | **0 von 26 = 0,0 %** |
| Ring 10–24 m: Kanten > 0,6 m | 10 422 von 3 577 858 | 0 |
| Ring 10–24 m: größte Stufe | 23,66 m (Ort 8 an 1521,5/507, d 16,1) | 0,51 m (Stadt an 974/145, d 10,1) |
| Ring 10–60 m: Erdbauten mit Stufe > 0,6 m | — | 0 von 26 (13 128 106 Kanten), max 0,51 m |
| Stadt, größte Stufe außen | 16,19 m an 937/83,5 (d 16,4) | 0,51 m |
| Genesis, größte Stufe außen | 19,92 m an 103,5/−279,5 (d 16,3) | 0,30 m (Ring 10–24), 0,50 m (bis 60) |
| Ring 0–10 m (die innere Klasse, s. Offen): Erdbauten > 0,6 m | 22 von 26 | 22 von 26 |
| Ring 0–10 m: Kanten > 0,6 m · größte Stufe | 30 646 · 16,17 m (Stadt) | 32 881 · 11,15 m (Ort 18) |

Die 0,50 m bei d 47–48 m im weiten Ring sind keine Stufe. Dort läuft die steile Stufe aus, 0,5 m auf 0,5 m (45°): die
Obergrenze des Profi-Bands (DIN 4124).

**Byte-Gleichheit auf 4 Dezimalen** (die 26 Erdbauten):

| Bereich | abweichende Punkte | größte Abweichung | Ort |
|---|---|---|---|
| ohne Erdbau | 0 von 100 000 | 0 | — |
| auf den Flächen (Platten, Trassen) | 0 von 499 860 | 0 | — |
| über 48 m von jeder Fläche | 0 von 2 100 142 | 0 | — |
| 16–48 m (der Schnitt selbst: dort stand die Natur hinter der Stufe) | 78 763 von 1 027 092 | 23,6 m | Ort 8 |
| 0–16 m (wo Bänder sich widersprechen: Rampe statt „der letzte gewinnt“) | 31 414 von 645 451 | 12,99 m | Stadt 978,25/141,25 |

**Die Wand** (`erdbauWand`, Fels-Stoff), Stadt, 80 000 Proben auf dem Boden: die Summe stieg von 9 901 auf 11 622 (+17 %). Die
Böschung reicht jetzt bis an die Natur. Wo die Höhe gleich blieb, ist die Wand an 76 236 von 76 628 Proben gleich.

**Kosten** (node im Haupt-Kontext wie im Faden, Stadt, 200 000 Zufallspunkte in 600 m, drei Läufe ABAB):

| Kosten | vorher | nachher |
|---|---|---|
| `erdbauY` je Frage | 2,55–2,71 µs | 3,23–3,34 µs |
| `hoehe` mit Erdbau | 5,7–6,6 µs | 6,4–7,2 µs |
| `hoehe` ohne Erdbau | 2,7–2,9 µs | 2,7–3,0 µs |
| Normalform, Median | 13,6–16,0 ms | 29,2–33,0 ms |
| Zellen · Einträge | 835 · 70 687 | 1 155 · 281 911 |

Die Kosten hängen an der Zelle und den Erdbauten in Reichweite: die Reichweite wuchs 16 → 48 m, die Einträge ×4, die Frage
+25 %. Die vm-Zahlen des ersten Blatts (9,6 µs je Frage) waren vom vm-Kontext aufgebläht (Math und Infinity als Interceptor);
gezählt wird der Haupt-Kontext.

**Die Linse:**
- Auf main ist sie **ROT an 4 von 4**, jeweils bei 15,5–16,4 m Abstand:
  - Genesis 19,92 m an 103,5/−279,5 (d 16,32, Höhe 52,34 → 72,52 m);
  - Stadt 16,19 m an 937/83,5 (d 16,43);
  - dorf 20 8: 12,69 m an −655,5/−889 (d 16,03);
  - dorf 12 18: 19,46 m an −1799/−988 (d 15,53).
- Am Schnitt ist sie **GRÜN**, höchstens 0,51 m.
- Der Selbsttest (16-m-Schnitt eingepflanzt) ist ROT beim Namen: Genesis 19,92 m bei d 16,32.
- Ein Lauf mit Selbsttest dauert 47 s.

`npm run check:statik` ist GRÜN (506 s), ebenso `gate:settlement --selftest` (104 s) und `--realismus --selftest` (8 s). `merge-tree` ist konfliktfrei gegen origin/main 2da17e2e und gegen
origin/integ-probe 4c9e6aab.

## Bild

Ruf `bild:dorf@0.42` am Kopf. Vorher ist `probe-post/absicht-zug-3/40c7113c-dorf-0.42.png`, Stand 18.546.425: dasselbe
Gelände-Gesetz wie main, `gelaende-core.js` und `voxel-worker.js` byte-gleich. Kamera −720,31/−922,46, Blick nach Osten.
Das Urteil steht aus, bis die Probe zurück ist.

## Offen (mit Grund und Messnamen)

- **Die innere Klasse** (Ring 0–10 m, 22 von 26 Erdbauten, 32 881 Kanten > 0,6 m, max 11,15 m). Der Plan legt Flächen mit großem
  Höhenunterschied aneinander, z. B. Stadt 809/347,5: Platte #2299 auf 65,73 m und #2472 auf 76,21 m nur 0,7 m voneinander.
  - Die Hülle macht aus dem Sprung eine stetige steile Rampe: BF 4 132 → 1 789 Kanten, max 9,34 → 7,24 m; BB 76 → 3 513 Kanten,
    max 4,5 → 6,78 m.
  - Fläche an Fläche (FF 6 073 Kanten, max 10,42 m) bleibt.
  - Die Wurzel sind die Höhen des Plans (fachwerk `ortPlan`), nicht `erdbauY`. Messname: Ring 0–10 m der Böschungs-Messung.
- **Die Normalform kostet das Doppelte** (Stadt 15 → 30 ms). Sie läuft einmal je gelegtem Ort, im Faden und im Stamm
  (`_erdbauNorm`). Messname: Normalform ms (Stadt).
- **Das Bild und sein Urteil:** die Probe läuft.
- **Die volle CI** (`[ci voll]` am Vorprüf-Kopf): das Ergebnis steht aus.
