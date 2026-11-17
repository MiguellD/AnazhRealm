# w28-brand-nacht — ZWISCHENSTAND (GTX 1050, 17.11., auf w28-brand-saum 6b248935; zweite Abgabe)

Anlass: Bildpaar `zunge-nah-nacht` — nachts brennt das eigene Licht des Brands das Gras weiß aus, die Flammen gehen unter, der
Rauch steht als helle Scheiben (Stand von main). Entscheidung des Koordinators: der Brand bei Nacht vor der Lava-Zündung.

**Die erste Abgabe 63c7e567 war falsch und ist zurückgezogen:** sie band das LICHT an den Bild-Ton der Flamme (× ziel ÷
Belichtung). Die Nacht stimmte, am Tag (Belichtung 0,51) trug die Flamme 22 statt 7,5 und färbte Gras und Rauch orange
(`nacht-falsch-8m-tag`). Das Tag-Bild war geschossen, aber vor der Abgabe nicht angesehen.

## Geschnitten

- **Der Brand leuchtet als Flammen-Fläche aus EINER Zahl** (`stamm/dirigent-kern.js` `_flammenLicht`, gerufen in
  `_leuchtQuellen`): die Bestrahlung AN der Flamme ist `BRAND.bild.flamme.schein` 7,5 in Welt-Einheiten — bei Tag und Nacht
  dieselbe (das Licht einer Flamme hängt weder an der Stunde noch an der Belichtung der Kamera). Der Kern der Quelle ist der
  Halbmesser der Front (√(a·b) der Ellipse, höchstens die halbe Zelle): nah bleibt das Licht unter dem Deckel, fern wächst es
  mit der Fläche; die Reichweite wächst mit dem Halbmesser (≤ 2 Zellen). Farbe, Abfall und Flackern bleiben die von
  `LICHT_GESETZ.feuer`.
- **Gefallen im Brand:** der Zeitplan des Herdfeuers (nacht × 45) und `BRAND.licht` 4 — sie multiplizierten sich
  (im Pool in 1 m nachts 565; am Tag 20). Jetzt in 1 m ~21 bei Tag und Nacht. Die Zeile der Lava-Decke trägt `BRAND.licht`
  noch (der Zweig der Lava ist im Umbau; sie fällt in w28-lava-zuendet).
- Linse: `diag-stand-takt.cjs --narbe` N7 — der Schein an der Flamme in Welt-Einheiten im Band [3, 10,5], kein Zeitplan,
  und N7-UHR: am Mittag derselbe Schein wie nachts (± 2 %). Zwei Mutanten: der Herdfeuer-Punkt × BRAND.licht × Zeitplan und
  „am Bild-Ton" (Masse ÷ Belichtung, der zurückgezogene Stand).

## Gemessen

Bilder (Mess-Wiese, Herd −248/−1064, 60 s Brand), je vorher ↔ nachher, beide angesehen:
- NACHT 8 m `nacht-vor-8m` ↔ `nacht-nach-8m`, 2 m `nacht-vor-2m` ↔ `nacht-nach-2m`, Stations-Pose `nacht-vor-station` ↔
  `nacht-nach-station`: kein weißes Ausbrennen mehr, das Gras in 1–3 m trägt den Feuerton, die Flammen sind die hellste
  Fläche, der Rauch ist eine braune, mit der Höhe dunklere Fahne.
- TAG 8 m `nacht-vor-8m-tag` ↔ `nacht-nach-8m-tag`: das Gras um die Front steht wie vorher (kein oranger Schleier), der Rauch
  braun mit einem schwachen warmen Ton nahe der Front.
- N7 (Null-Renderer): Schein nachts 8,63 = am Mittag 8,63 (2 Quellen, Kern 5,75 m, kein Zeitplan); Mutante Herdfeuer-Punkt
  565,7; Mutante am Bild-Ton nachts 4,67 ↔ mittags 0,25.
- Preis ABAB (Dorf-Wiese, `lauf 15`, Brand 60 s, 2 Zellen, 56–57 Flammen; nach · vor · nach · vor; gemessen am ersten Stand,
  die Heilung ändert nur eine Zahl je Quelle), mit Brand: Frame p50/p95 16,70/33,38 ms in allen vier; CPU-Takt p50
  16,17 · 16,26 · 15,94 · 15,71 ms.

## Ehrlich offen

- **Nachts sind die Flammen cremeweiße Tropfen ohne Orange.** Wurzel gemessen: nicht die Tonkurve — „das Auge der Nacht" der
  Post-Kette (K66, `stamm/bild-kosten.js`) liest die Flamme als ~0,7 cd/m² (ihr Ton ist an das BILD gebunden, `ziel` ÷
  Belichtung) und nimmt ihr ~30 % Farbe. Fällt im nächsten Schnitt w28-brand-kern (Ton quer zur Achse + die Flamme vor dem
  Auge der Nacht).
- **Der Rauch aus 2 m steht als einzelne weiche Ballen, aus 8 m fleckig gestuft** — das EINE Rauch-Bild (RAUCH_BILD), nach
  dem Kern als Klasse für alle Kamine.
- `schein` 7,5 ist am Bildpaar der Nacht geeicht (1 = das Gras bleibt dunkel, 27 = weiß), keine hergeleitete Zahl.
- Das Licht der Lava-Decke (`BRAND.licht × Glut` am Herdfeuer-Datum) steht unverändert.
