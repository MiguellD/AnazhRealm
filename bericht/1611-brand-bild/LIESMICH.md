# w28-brand-bild — ZWISCHENSTAND zur Abgabe aa93757f (GTX 1050, 17.11.)

## Geschnitten (EIN Brand-Bild, an der Wurzel)

- **Die Narbe folgt der Front** (`stamm/feld-leben.js` `_brandFront`, `_brandNarbeFn`, `_brandZellen`, `_brandMalen`): die brennende
  Zelle trägt Asche, so weit ihre Ellipse den Ort verzehrte. Bis hier fiel das Zell-Quadrat auf einmal grau.
- **Die Zelle brennt, bis ihre Front sie deckt** (`_brandZuenden` `ende`): bis hier fiel sie mit dem Kopf, je Brand glühte 1 Zelle.
- **Die Asche ist matt und Pulver** (`schmiede-core.js` Zeile `asche`, Rauheit 0,96 → `stoff-material.js` `_terrainGeologyAlbedo`;
  `siedlung-wege.js` reicht Farbe und Deckung): die Nässe-Kurve des dunklen Bodens greift auf Asche nicht, das Mikro-Relief ruht
  unter ihr (nachts standen unter dem Licht des eigenen Feuers helle und schwarze Trapeze — ein Wellen-Muster; der Schatten-Wurf
  ist entlastet, Bildpaar `welle-mit-wurf` ↔ ohne: gleiches Muster).
- **Das Licht steht bei den Flammen** (`_brandBild`: 1 m über der stärksten Flamme der Zelle; kein zweites Licht-Verzeichnis,
  derselbe Platz im Pool). Bis hier über der Zell-Mitte, bis 8 m neben der Front.
- **Der Halm im Saum ist versengt** (`vegetation-wiese.js`, `BRAND.versengt`).
- **Die Linse** `node scripts/diag-stand-takt.cjs --narbe` (an `gate:stand-takt`): N1 Narbe folgt der Front · N2 Brenndauer ≥
  späteste Ecke · N3 Licht ≤ 0,6 m an einer Flamme · N4 der Boden liest die Asche-Zeile; je Fall eine Laufzeit-Mutante.
  Am Zweig GRÜN (77 s), vor dem Schnitt N1–N4 ROT (N2: 14,4 s < 585 s; N3: 8,05 m neben der nächsten Flamme; N4: 0 Abrufe).

## Gemessen (Dorf-Wiese, Herd −680/−952, Augenhöhe −680/65,3/−970, GTX 1050)

| | main | Zweig |
|---|---|---|
| brennende Zellen 60 s / 300 s | 1 / 1 | 2 / 9 |
| Flammen 60 s / 300 s | 8 / 11 | 36 / 117 |
| Narben-Feld Tag 300 s (Bildmitte unten): Luma · σ · Grün-Anteil | 83,5 · 18,7 · 20,4 % | 60,2 · 2,5 · 0,3 % |
| Feld vor der Kamera Nacht 60 s: Luma | 234 (weiß ausgebrannt, Licht über der Zell-Mitte) | 60 |
| Glanz-Anteil im Narben-Feld Tag 300 s (Pixel > 2 × Median) | 0,28 % | 0,00 % |

Bilder: `auge-{vor,nach}-{10,60,300}-{tag,nacht}.png` (vor = main-Stand per Rück-Patch, gleiche Kamera). Die Bilder nach-300 tragen
den Kopf mit ruhendem Relief; nach-10 und nach-60 den Stand davor (dort liegt noch keine Asche nah am Licht).
Wald-Herd −312/−1080 (der Herd der Richter): `wald-60-auge-tag/-nacht`, `wald-60-oben`.

**Preis ABAB** (Dorf-Wiese, `lauf 15`, nach · vor · nach · vor):

| | Frame p50/p95 ms | CPU-Takt p50/p95 ms |
|---|---|---|
| ohne Brand, vor | 16,68/33,39 · 16,69/33,41 | 17,20/24,87 · 17,42/25,91 |
| ohne Brand, nach | 16,68/33,38 · 16,69/33,40 | 17,73/25,15 · 17,78/26,78 |
| Brand 60 s, vor (1 Zelle, 8 Flammen) | 16,68/33,42 · 16,67/33,38 | 14,28/37,99 · 13,81/35,27 |
| Brand 60 s, nach (2 Zellen, 39 Flammen) | 16,70/33,37 · 16,69/33,36 | 16,49/34,21 · 15,92/31,78 |

Frame p95 unverändert; der CPU-Takt ohne Brand +0,45 ms im Median (zwei Paare, an der Streuung), mit Brand +2,2 ms im Median
bei fünffacher Flammen-Zahl, p95 −3,6 ms.

## Ehrlich offen

- **Kanten-Härte als Zahl: nicht gemessen** — das Bild trägt sie (runde Narbe, versengter Saum statt Zell-Polygon).
- **Rauch nachts** nah am Licht: die jungen Ballen stehen als helle runde Scheiben (`auge-nach-60-nacht`, `wald-60-auge-nacht`).
  Der Weg liegt im Pool-Term des Rauch-Stoffs (eine Fläche statt eines Volumens), nicht im Stoff-Weg der Asche. Zwei Proben
  widerlegt: Kern des Lichts × √Masse (Szene heller, Scheiben bleiben) und Licht-Höhe 2,5 / 4 m (kein Gewinn).
- **Asche im Regen** (glänzt nur dann): nicht geprüft.
- **Blitz und Lava zünden nicht** (`_brandEntfachen` rufen nur Brennglas und Fackel) — nicht in diesem Zweig; die Glut-Emission
  ist unberührt.
- **`node scripts/diag-stand-takt.cjs --brand` ist schon auf main ROT im Aufbau**, Täter-Satz: „kein Wind ab 600 s (gebootet bis
  13.417 s) gibt binnen 700 s einen Strahl Fluss → nasses Bett → trockenes Bett (Herd mit Boden-Feuchte ≤ 0,05) binnen 320 m um
  die Mess-Wiese (Ring 4)". Nicht geheilt.
- **Brenndauer:** bei schmaler Ellipse (ecc 0,96) glüht eine Zelle ~590 s, bis das Rückfeuer sie deckt; die Tat `brand`
  (Sukzession) fällt entsprechend später.
- **`stamm/feld-leben.js` steht auf 4000 Zeilen** (die Decke); nicht geteilt, der Lava-Schneider schneidet dort.
- Richter an der Radeon (b68b59cf): zeit.erleben#1 GRÜN; stoerung#1 und kaskade#1 ROT — laut Koordinator Stations-Fragen
  (Schatten gegen Sonne, Flammen-Zähler, steile Sicht durch Kronen).
