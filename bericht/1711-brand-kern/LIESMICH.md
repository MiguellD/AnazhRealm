# w28-brand-kern — ZWISCHENSTAND (GTX 1050, 17.11., auf main e489088a)

Anlass: Koordinator am Bild der Nacht — „die Flammen sind blass-cremeweiße Tropfen ohne Orange; heller Kern nur in der Mitte,
Mantel orange bis rot, auch nach der Belichtung der Nacht — prüfe, ob der Ton am Ausgabe-Pfad ins Weiß klippt."

## Befund (gemessen, `kern-zahl.bef`: Flammen-Pixel mit − ohne Flammen-Satz aus dem Ausgabe-Pfad)

- Die Tonkurve klippt NICHT: am Tag stehen die hellsten Flammen-Pixel bei 247/176/102, kein Pixel trägt Blau > 200.
- Nachts 241/185/139 — dieselbe Flamme, blasser. Die Wurzel ist **„das Auge der Nacht" der Post-Kette** (K66,
  `stamm/bild-kosten.js`, mesopische Entsättigung je Pixel nach seiner Leuchtdichte): der Ton der Flamme ist an das BILD
  gebunden (`ziel` ÷ Belichtung, vor der Tonkurve), nicht an die Leuchtdichte einer Flamme — das Auge las sie als ~0,7 cd/m²
  und nahm ihr ~30 % der Farbe.
- Der Ton der Zunge fiel nur längs der Höhe, nie quer: kein Kern.

## Geschnitten

- **Der Ton fällt quer zur Achse** (`stamm/feld-leben.js` `_brandFlammenZeichnen`, `BRAND.bild.flamme.mantel` 1): bei ξ = |x|/r
  liest der Ton die Tafel der Temperatur bei h + (1 − h)·mantel·ξ² — die Achse heiß (gelb), der Mantel orange bis rot, mit
  dem Rauschen des Radius zerrissen. Eine Abtastung der Tafel mehr je Fragment der Zunge.
- **Das Auge der Nacht ist EIN Glied** (`stamm/bild-kosten.js` `_nachtAuge(farbe, vor)`): die Post-Kette ruft es (vorher
  inline), die Flamme stellt ihren Ton über seine UMKEHR davor (dieselbe Rechnung, dieselben Schwellen `NACHT_AUGE`, dieselbe
  Uniform der Nacht — keine zweite Tafel).
- Linse: `gate:post-kette` Fall (j) FLAMME (echter Renderer): der Ton der Flamme NACH der ganzen Kette bei Tag ↔ Nacht, die
  Mutante ohne Umkehr, die Bänder des Tons, und EINE QUELLE (die Schwellen des Auges liest der Stamm nur in `_nachtAuge`, die
  Kette und die Flamme rufen es).

## Gemessen

- **Das Bild ohne Flamme ist byte-gleich:** das Ausgabe-Fragment der Post-Kette (`post:ausgabe`, darin das Auge) am Kopf und
  mit dem `bild-kosten.js` von 46f69d7b: je 9 807 Bytes, sha256 88d2ef14…4c7279, `cmp` = 0.
- Linse (j), swiftshader, Belichtung 1,5 (nur das Auge unterscheidet Tag und Nacht):
  KERN 3000 K: Tag [249,184,122] ↔ Nacht [249,184,124], Δ 2/255 (ohne Umkehr [247,195,151], Δ 29).
  MANTEL 2350 K: Tag [200,118,18] ↔ Nacht [199,115,85], Sättigung 0,91 ↔ 0,573 (ohne Umkehr 0,474).
- Bilder (Mess-Wiese, Herd −248/−1064, 60 s Brand), alle angesehen: NACHT 2 m `kern-vor-2m` ↔ `kern-nach-2m`, 8 m
  `kern-vor-8m` ↔ `kern-nach-8m`; TAG 8 m `kern-vor-8m-tag` ↔ `kern-nach-8m-tag`, 2 m nur nachher `kern-nach-2m-tag`.
  Nachts tragen die Zungen einen hellen gelben Kern und einen roten Mantel; am Tag orange mit hellerem Kern.
- Preis ABAB (Dorf-Wiese, `lauf 15`, Brand 60 s, 2 Zellen, 56 Flammen; vor · nach · vor · nach, vor = main e489088a), mit
  Brand: Frame p50/p95 16,69/33,38 · 16,70/33,38 · 16,70/33,39 · 16,70/33,39 ms; GPU-Durchsatz p50 17,04 · 17,54 · 17,94 ·
  18,38 ms, CPU-Takt p50 15,72 · 16,13 · 16,31 · 16,81 ms — beide steigen monoton mit der Sitzung (Drift der Maschine); gegen
  das Mittel der Nachbarn steht der Schnitt bei +0,05 / −0,02 ms GPU und +0,11 / −0,16 ms CPU: kein messbarer Preis. (Eine
  erste Fahrt war gestört: eine Sitzung lief auch OHNE Brand langsam, Frame p95 dort 49,9 ms — verworfen.)

## Ehrlich offen

- **Die Grenze der Umkehr:** unter einem Auge, das je Pixel nach der Leuchtdichte entsättigt, gibt es einen dunklen
  gesättigten Ton nicht (jeder Kanal trägt mindestens Leuchtdichte × Stäbchen-Anteil). Der helle Kern kommt ganz zurück, der
  dunkle Mantel nur zum Teil: nachts lachsrot statt orange (Blau 18 → 85). Ganz fiele es nur, wenn das Auge die Flamme als
  Quelle erkennt (eine Marke im Szenen-Ziel) — das ändert das Fragment der Post-Kette und ist nicht in diesem Schnitt.
- **Der Ton der Flamme ist ans Bild gebunden, nicht an eine Leuchtdichte der Welt** — die Stelle des nächsten Bruchs. Welche
  leuchtende Fläche heute welchen Weg geht:
  - Herdfeuer, Glut, Flamme der Feuerstelle (Stoff mit `leucht`): Vertex-Farbe × `leucht`, feste Welt-Einheiten; das Auge
    der Nacht liest ihre Leuchtdichte, die Belichtung der Nacht hebt sie im Bild.
  - Fenster, Laterne (Stoff mit `licht`): Kelvin-Farbe × Zeitplan (`lichtGlut`), Welt-Einheiten.
  - Lava: kein eigenes Leuchten im Stoff (die Albedo mischt über `glut`), Licht nur über den Pool (`BRAND.licht × Glut` am
    Herdfeuer-Datum, mit Zeitplan — die Zeile, die in w28-lava-zuendet fällt).
  - Brand-Flamme: ans Bild gebunden (`ziel` ÷ Belichtung) — seit diesem Schnitt vor dem Auge der Nacht.
  - Tor-Zielbild (`stamm/siedlung-tor.js` `uBelicht` = 1 ÷ Belichtung): dieselbe Klasse wie die Flamme, wird nachts vom Auge
    der Nacht mit entsättigt. NICHT angefasst (kein Bild eines Tors bei Nacht gemessen) — derselbe Ruf wäre eine Zeile.
- Der Rauch (das EINE Rauch-Bild) ist der nächste Schnitt.
