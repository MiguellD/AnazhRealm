# w28-brand-nacht — ZWISCHENSTAND (GTX 1050, 17.11., auf w28-brand-saum 6b248935)

Anlass: Bildpaar `zunge-nah-nacht` — nachts brennt das eigene Licht des Brands das Gras weiß aus, die Flammen gehen unter, der
Rauch steht als helle Scheiben (Stand von main). Entscheidung des Koordinators: der Brand bei Nacht vor der Lava-Zündung.

## Geschnitten

- **Der Brand leuchtet als Flammen-Fläche aus EINEM Gesetz** (`stamm/dirigent-kern.js` `_flammenLicht`, gerufen in
  `_leuchtQuellen`): die Bestrahlung AN der Flamme = `schein` × `ziel` ÷ Belichtung — `ziel` ist der Ton, mit dem die Flamme
  gezeichnet wird (`BRAND.bild.flamme`, `_brandFlammenZeichnen`), also EINE Zahl für Flamme und Licht, und die Belichtung der
  Nacht kürzt sich heraus. Der Kern der Quelle ist der Halbmesser der Front (√(a·b) der Ellipse, höchstens die halbe Zelle):
  nah bleibt das Licht unter dem Deckel, fern wächst es mit der Fläche; die Reichweite wächst mit dem Halbmesser (≤ 2 Zellen).
  Farbe, Abfall und Flackern bleiben die von `LICHT_GESETZ.feuer`.
- **Gefallen im Brand:** der Zeitplan des Herdfeuers (nacht × 45) und `BRAND.licht` 4 — sie multiplizierten sich
  (Bestrahlung in 1 m nachts 565 bei Belichtung 1,5; das Herdfeuer selbst 141). Die Zeile der Lava-Decke trägt `BRAND.licht`
  noch (der Zweig der Lava ist im Umbau; sie fällt in w28-lava-zuendet).
- Linse: `diag-stand-takt.cjs --narbe` N7 (das Schein-Maß des Brand-Lichts nachts, Mutante Herdfeuer-Punkt × BRAND.licht ×
  Zeitplan).

## Gemessen

Bilder (Mess-Wiese, Herd −248/−1064, 60 s Brand, Mitternacht): `nacht-vor-8m` ↔ `nacht-nach-8m`, `nacht-vor-2m` ↔
`nacht-nach-2m`, `nacht-vor-station` ↔ `nacht-nach-station`; am Tag `nacht-nach-8m-tag`.

- Eichung von `schein` an der Reihe `reihe-A…D`: 1 (π × Bild-Ton, Bestrahlung in 1 m ≈ 3) lässt das Gras dunkel; 7 (≈ 21 in
  1 m) trägt den Feuerton in 1–3 m unter der Flamme; der alte Stand (≈ 565) ist weiß.
- Nachher: die Flammen sind die hellste Fläche im Bild, das Gras in 1–3 m steht im Feuerton, der Rauch ist eine braune,
  vom Feuer beleuchtete Fahne, die mit der Höhe dunkler wird.
- Preis ABAB (Dorf-Wiese, `lauf 15`, Brand 60 s, 2 Zellen, 56–57 Flammen; nach · vor · nach · vor), mit Brand:
  Frame p50/p95 16,70/33,38 · 16,70/33,38 · 16,70/33,38 · 16,70/33,38 ms; CPU-Takt p50 16,17 · 16,26 · 15,94 · 15,71 ms.

## Ehrlich offen

- **Der Rauch aus 2 m steht weiter als einzelne weiche Ballen** (`nacht-nach-2m`): sein Licht folgt jetzt dem Gesetz (er
  leuchtet nicht mehr heller als die Flamme), aber die Normale des Rauch-Bilds zeigt zum Auge (`RAUCH_BILD.woelbung`), eine
  Unterseite hat der Ballen nicht. Nicht angefasst: das Rauch-Bild ist das EINE aller Kamine.
- Der helle Kern der Zunge (Ton quer zur Achse) — der nächste Schnitt.
- Das Licht der Lava-Decke (`BRAND.licht × Glut` am Herdfeuer-Datum) steht unverändert.
