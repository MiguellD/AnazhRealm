# w28-rauch-bild — ZWISCHENSTAND (GTX 1050, 17.11., auf w28-brand-kern f4d46124)

Anlass: Entscheidung des Koordinators — das EINE Rauch-Bild (RAUCH_BILD) als Klasse für alle Kamine: Ballen mit Unterseite
(von unten beleuchtet vom Feuer, oben dunkel), Ballen verschmelzen zur Fahne statt Scheiben, keine Stufen; zwei Leser (Brand
nachts 2 m/8 m, ein Kamin im Dorf bei Tag), Preis ABAB am Dorf.

## Befund

- Jeder Ballen trug sein EIGENES Muster (zwei Ebenen des Rausch-Atlas um seinen Samen `saat`, in den Achsen der Scheibe):
  zwei Ballen, die sich decken, zeigten zwei Muster — jede Scheibe stand für sich, ihr Rand blieb der Kreis.
- Die Normale stand fast flach zum Auge (`(q · 0,35, 1)`): das Licht des Feuers unter dem Ballen traf Unter- und Oberseite
  gleich — kein Unten, kein Oben; der Kamin am Tag las sich als dunkler Fleck über dem Schlot.
- „Stufen" aus 8 m: an einer Quantisierung oder einem Dither NICHT festgemacht (nicht gemessen). Im Bild nachher stehen
  keine mehr; gelesen habe ich sie als die einzelnen, gleich hellen Scheiben mit je eigenem Muster, die sich als Flecken
  stapelten.

## Geschnitten (`stamm/siedlung-bewohner.js` `_rauchStoff` / `_rauchZeichnen`, EIN Stoff für beide Leser)

- **Das Muster steht in der WELT** (grobe Oktave `raum` im Raum, feine als Ebene x + z | y) und steigt mit der Quelle
  (`steigMs`: Brand `BRAND.bild.rauch.steigMs` 2,5 m/s, Kamin aus RAUCH_GESETZ (vyBase + vyRange/2) × labHz): Ballen, die sich
  decken, lesen an derselben Stelle dasselbe Rauschen — Löcher und Wülste gehen ineinander über. Der Same je Ballen (`saat`) ist
  gefallen (Attribut `aRauch` vec4 → vec3).
- **Der Ballen ist längs seines Zugs gestreckt** (Attribut `aZug` = Richtung seiner Geschwindigkeit × Streckung,
  `RAUCH_BILD.zug` [0,6 s je Radius, höchstens 2]; längs des Blicks bleibt er rund) und dabei schmaler (`schmal` 0,25):
  aufeinander folgende Ballen einer Quelle schließen zur Fahne.
- **Die Normale ist die eines Ballens** (`(q · woelbung, 1 − ρ²)`, `woelbung` 1,5: bei halbem Radius 45°): die Unterseite sieht
  ins Feuer, die Oberseite in den Himmel — nachts dunkel, am Tag in der Sonne.
- **Gegen das Auge läuft er aus** (`nah` 3 × Radius): ein Ballen, in dem das Auge steht, verhängt den Schirm nicht.
- Hub des Musters `rausch` [1,2 Wellen je Größe, Hub 1,8 jung / 2,4 alt, Anteil des Steigens 1].

## Gemessen

Bilder, je vorher ↔ nachher, alle angesehen (Mess-Wiese, Herd −248/−1064, 60 s Brand; die alten Posen 2 m und 8 m stehen
windab IN der Fahne, die neue Pose „quer" 5 m quer zum Wind):
- BRAND NACHT quer `rauch-vor-quer` ↔ `rauch-nach-quer`, 8 m `kern-nach-8m` (= vorher) ↔ `rauch-nach-8m`, 2 m `kern-nach-2m`
  ↔ `rauch-nach-2m`: die Fahne ist ein Körper mit Wülsten, unten vom Feuer hell, oben dunkel; aus 2 m steigen Schwaden von
  den Zungen statt runder Scheiben.
- BRAND TAG quer `rauch-vor-quer-tag` ↔ `rauch-nach-quer-tag`, 8 m `kern-nach-8m-tag` ↔ `rauch-nach-8m-tag`, 2 m
  `kern-nach-2m-tag` ↔ `rauch-nach-2m-tag`: grauer, gegliederter Rauch statt dunkelbrauner Flecken.
- KAMIN IM DORF AM TAG nah `rauch-vor-kamin-nah` ↔ `rauch-nach-kamin-nah` (10 m, Augenhöhe am First), fern
  `rauch-vor-kamin-fern` ↔ `rauch-nach-kamin-fern` (drei Kamine): vorher ein kaum sichtbarer dunkler Schmierfleck, nachher
  eine helle graue Fahne im Wind an jedem Kamin.
- Preis ABAB (Dorf, `lauf 15`; vor · nach · vor · nach, vor = f4d46124; je Sitzung erst im Dorf an den Kaminen, dann die
  Dorf-Wiese mit Brand 60 s, 2 Zellen, 58 Flammen):
  AN DEN KAMINEN Frame p50/p95 16,67/16,78 · 16,67/16,82 · 16,67/16,80 · 16,67/16,79 ms, GPU-Durchsatz p50 16,63 · 16,63 ·
  16,42 · 16,57 ms — kein Preis.
  MIT BRAND GPU-Durchsatz p50 22,61 · 22,33 · 21,88 · 22,25 ms, CPU-Takt p50 20,84 · 20,43 · 20,13 · 19,97 ms, fps 35,2 ·
  37,8 · 36,7 · 37,1, Frame p95 66,59 · 50,02 · 50,01 · 50,02 ms — gegen das Mittel der Nachbarn +0,08 / +0,41 ms GPU, die
  beiden Vorher-Sitzungen liegen selbst 0,73 ms auseinander: kein Preis über der Streuung.
  (Die ERSTE Fassung — Streckung mit voller Fläche, beide Oktaven im Raum — kostete mit Brand GPU p50 21,11 → 22,80 und
  21,27 → 21,98 ms, fps 39,2 → 36,7 und 39,4 → 37,3; darum ist der gestreckte Ballen schmaler und die feine Oktave eine
  Ebene.)
- Linse `gate:post-kette` Fall (k) RAUCH (echter Renderer, Bild aus dem Ausgabe-Pfad; der Satz entsteht im echten Leser
  `_brandRauch`, das Licht ist eine Flammen-Fläche im Pool; jede Mutante baut den Stoff neu). Kopf ↔ Mutante, swiftshader
  (auf der GTX 1050 dieselben Zahlen ± 0,02):
  (a) UNTERSEITE Luma unten ÷ oben 5,95 (41,4 / 6,96) ↔ 3,28 mit `woelbung` 0, Band 4,8–7,2;
  (b) EIN KÖRPER Korrelation der Muster zweier sich deckender Ballen auf 1 491 gemeinsamen Pixeln 0,749 ↔ −0,316 mit dem
  Muster am Ballen, Band ≥ 0,5;
  (c) ZUG Höhe ÷ Breite quer zum Blick 2,00 ↔ 0,93 ohne Streckung (Band 1,7–2,3), längs des Blicks 0,93 (rund);
  (d) BEIDE LESER zur Laufzeit: `_brandRauch` (2,5 m/s) und der Kamin (1,2 m/s) bauen im selben `_rauchStoff`, der ohne
  Steigen laut bricht. Die Familie läuft auf swiftshader 66 s (vorher ~45 s).

- Wanduhr eines Bild-Laufs (gefragt: warum Bildpaare über 10 min dauern; Werkbank, letzte Fassung): MESS-WIESE 7 Bilder in
  2 min 40 s — Schloss abwarten 15 s · Start und Boot bis „bereit" + Umstellen auf den Ort ~1 min 55 s · Brand 60 s
  vorspulen 12,5 s · 7 Schüsse 17 s (je 1,7–3,6 s). DORF 2 Bilder in 2 min 47 s — Start, Boot und Umstellen (das Dorf
  schwingt ein) ~2 min 15 s · 600 Takte Rauch 19 s · 2 Schüsse 6 s. Die Schüsse sind Sekunden; die Zeit liegt im Start je
  Lauf (jede Fassung und jedes „vorher" ist ein neuer Lauf: hier 5 Fassungen × 2 Orte + 2 Vorher-Läufe ≈ 30 min), im
  Ansehen der Bilder (8 je Fassung, ~3–5 min) und im Warten: zwei Preis-ABAB je ~17 min (einmal 11 min hinter der CI am
  Schloss), die Wand `npm run check` zweimal je ~15 min.

## Ehrlich offen

- **Aus 2 m windab stehen die jungen Schwaden noch einzeln** (je Zunge alle ~2 s ein Ballen, `rauch.jeS` 12 je Zelle und das
  Budget 600): gestreckt und im Muster verbunden, aber kein geschlossener Schleier. Ganz fiele es nur mit mehr Ballen je
  Sekunde am Fuß — das kostet Fläche am Schirm und ist nicht in diesem Schnitt.
- **Am Tag färbt das Feuer die Unterseite der unteren Ballen kräftig orange** (dieselbe Bestrahlung `schein` 7,5 wie am Gras;
  vorher schon sichtbar, mit der Ballen-Normale deutlicher). Der Rauch schattet sich nicht selbst — ein Ballen 5 m über der
  Front bekommt das Licht ungedämpft durch die Ballen darunter.
- **Die Linse misst das Auslaufen am Auge (`nah`) nicht**, und bei (a) trennt das Maß nur um den Faktor 1,8 (auch die
  flache Scheibe ist unten heller, die Quelle steht näher) — das Band liegt ± 20 % um das Gemessene.
- **Gegenlicht:** ein dünner Ballen vor der Sonne streut nicht nach vorn (rau-Standard kennt keine Durchleuchtung); von unten
  gegen die Sonne gesehen bleibt der Kamin-Rauch dunkel.
- Die Streckung liest die Geschwindigkeit ohne Perspektive (auf die Bild-Fläche gelegt): ein Ballen, der auf das Auge zu
  zieht, bleibt rund.
- Aus der Abgabe w28-brand-kern, entschieden vom Koordinator: „das Auge erkennt Quellen" wird jetzt kein Schnitt (Mantel der
  Flamme nachts Sättigung 0,57 ↔ 0,91 am Tag); das Tor-Zielbild bekommt erst EINEN Schuss Nacht gegen Tag.
