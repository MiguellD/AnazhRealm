# w28-brand-zunge — ZWISCHENSTAND (GTX 1050, 17.11., auf w28-brand-saum)

Anlass: Koordinator am Bildpaar des Saums — „aus der nahen Kamera ein gleichmäßig flaches oranges Band, die einzelnen Zungen und
ihr Höhen-Wechsel gehen unter; die Mitte der Front trägt keinen hellen Kern".

## Geschnitten

- **Die Zunge pulst** (`stamm/feld-leben.js` `_brandBild`, `BRAND.bild.puls` 0,35): die Front steht in Gipfeln und Tälern im
  Abstand ihrer Flammen-Länge (Finney et al. 2015), jede Zunge pufft mit f = 1,5/√D Hz über der Tiefe D = R(θ)·tr ihrer
  Flammen-Zone (Cetegen & Ahmed 1993), die Spitze geht um ± 35 % um die Byram-Länge (die Spanne der Intermittenz). Die
  Flacker-Tafel des Herdfeuer-Lichts (± 18 % in 6–10 Hz, acht Phasen) fällt: EIN Gesetz der Flammen-Höhe.
- Linse: `diag-stand-takt.cjs --narbe` N6 (die Streuung der Zungen-Höhe um ihre Byram-Länge, Mutante puls 0).

## Gemessen

Bilder (Mess-Wiese, Herd −248/−1064, 60 s Brand, 45 Flammen): `zunge-nah` (8 m) ↔ `saum-dicht-nah` (der Stand des Saums),
`zunge-station` (Pose der Station), `zunge-auge`, `zunge-nah-nacht`.

- Linse N6: Streuung der Zungen-Höhe um ihre Byram-Länge σ 0,246 über 27 Flammen (0,65–1,35 ×), ohne Puls σ 0; Schwelle 0,15.
  N5 rechnet die ruhende Breite (Byram): 1,187 am Zweig, 1,6 bei 0,5 m Abstand, Schwelle 1,4.
- Preis ABAB (Dorf-Wiese, `lauf 15`, Brand 60 s, 2 Zellen, 55 Flammen; nach · vor · nach · vor, vor = der Stand des Saums):
  Frame p50/p95 16,70/33,38 · 16,70/33,39 · 16,70/33,43 · 16,70/33,39 ms; CPU-Takt p50 16,90 · 16,32 · 16,93 · 16,99 ms.

Dieser Schnitt fährt im selben Kopf wie der Saum (Abgabe w28-brand-saum, neu nach dem roten Code-Check an edf16a1d: N5 las den
Median von Hand, die Rang-Wand der Boot-Lib in `gate:welt-boot` verlangt `rang`).

## Ehrlich offen

- **Der helle Kern fehlt weiter.** Probe widerlegt: das Medium der Zunge dünner (`flamme.dicke` 6 → 2,5) macht die Zungen
  zarter, aber das ganze Feuer blasser — kein Kern (`puls-kern-nah`). Der Ton der Zunge fällt nur längs ihrer Höhe (Temperatur
  Wurzel → Spitze), nicht von der Achse zum Rand; die helle Wurzel steht im Gras. Der Kern braucht den Ton quer zur Achse.
- **Nachts aus 8 m brennt das eigene Licht des Brands das Gras weiß aus, die Flammen gehen unter, die Rauch-Ballen stehen als
  helle Scheiben** (`zunge-nah-nacht`). Das ist der Stand von main (Licht `LICHT_GESETZ.feuer` nacht 45 × `BRAND.licht` 4, im
  Pool auf 1 m normiert), nicht dieser Schnitt — aber es trifft den Spieler. Nicht angefasst (Glut-Emission/Licht-Gesetz).
- Der Brand bleibt nach 60 s gesetzestreu ein ~5-m-Ring; die Station kaskade#1 braucht die Zählung je Pixel.
