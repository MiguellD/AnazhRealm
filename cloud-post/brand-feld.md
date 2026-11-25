# Vorprüfung brand-feld — das EINE Brand-Feld zeichnet sich selbst

ZWISCHENSTAND: Geschnitten · Gemessen (Zahl) · Karte 2 gebucht 105 von 1 718 (Stand-Datei `vision/karte-2-stand.json`,
Zweig `punkte-maschine`; diese Abgabe beansprucht keine Sprosse — die Station misst der Koordinator an Radeon und GTX 1060).

**Geschnitten:** Die Flammen sind die Front des Felds. `_brandFrontGang` setzt jede Flamme auf das Integral der Front
Φ = τR·∫ds/a(θ) mit Byrams Flammen-Länge je Ort; vorher sampelte eine eigene Winkel-Zählung je Ellipse (N = 96·12 m ÷ d).
`_brandTempo` trägt den Wind ohne Rothermels Wind-Grenze 0,9·I_R (Andrews, Cruz & Rothermel 2013). **Gemessen:** Station-Auge
11 → 18 Flammen, Sturm 8,1 m/s 92 → 222 Flammen und 8 → 12 Zellen, das Auge der Narbe 25/16 → 32/32. **Ehrlich offen:** das
Bildpaar und jede Pixel- und Luma-Zahl (hier stürzt der GPU-Prozess ab), der kalte Tafel-Bau (Spitze 9–12 ms), p95 bei
3 613 Zellen teurer (0,41–0,56 → 0,57–0,62 ms).

Basis: main 0692960c, vor dem Push main 2646ae93 hineingemergt (berührt keine Brand-Datei).

## Zahlen vorher ↔ nachher (dieselbe Konsum-Probe, Null-Renderer, je zwei Läufe main ↔ Zweig)

| Größe | main 0692960c | brand-feld | Ort |
| --- | --- | --- | --- |
| brennende Zellen nach 60 s trocken, Wind der Station | 1 | 1 | Herd −248/−1080, Wind 0,38 m/s |
| Flammen, Station-Auge (20 m, 12 m hoch) | 11 | 18 | derselbe Herd |
| Flammen, Ego (Auge 1,7 m, 9 m vor dem Herd) | 15 | 18 | derselbe Herd |
| Schirm-Fläche der Flammen (Summe lang²·breite am Schirm 960×540; kein Pixel) | 488 · 5 525 px | 672 · 6 426 px | Station · Ego |
| Frame-ms `_brandBild` p95, Station · Ego | 0,105–0,13 · 0,105–0,15 | 0,07 · 0,05–0,07 | 120 Bilder |
| Sturm 8,1 m/s in 10 m, 60 s: Zellen · Reichweite · Flammen | 8 · 50,6 m · 92 | 12 · 71,6 m · 222 | volles Bett um den Herd |
| Sturm: Schirm-Fläche · p95 | 5 772 px · 0,32–0,50 ms | 18 808 px · 0,36–0,46 ms | 20 m quer, 12 m hoch |
| 3 613 brennende Zellen: Flammen · p50 · p95 · max | 322 · 0,20–0,22 · 0,41–0,56 · 3,6–3,7 ms | 282 · 0,24–0,27 · 0,57–0,62 · 9,3–12,2 ms | Mess-Wiese, 1 200 Bilder |
| Tempo Herd-Bett (Anteil 0,34) bei 4 · 6 · 8,1 m/s | 0,28 · 0,28 · 0,28 m/s | 0,33 · 0,73 · 1,33 m/s | `_brandTempo` |
| Tempo volles Gras bei 15 m/s | 2,65 m/s | 4,68 m/s (281 m/min) | Zeile gras = Modell 1 |
| Narbe N5: Flammen · Abstand ÷ Breite | 25 · 1,228 | 32 · 0,956 | gate:stand-takt --narbe |
| N5-AUGE: die Herd-Zelle allein, aus 6 m · 40 m | 25 · 16 | 32 · 32 | dieselbe Linse |
| Regen löscht nach | 7 s | 7 s | Station-Folge |
| Asche an der Mitte nach Regen, Herd −248/−1080 | 0 | 0 | Mitte auf Stein, Bett-Anteil 0,344 |
| Asche an der Mitte nach Regen, Herd der Station heute −248/−1064 | 1,0 (gemessen auf 31ea3847) | 1,0 | Bett-Anteil 1; ±6 m rundum 1,0 |
| Luma-Verhältnis der Zelle | — | — | ungemessen, GPU |

## Die Schnitte (Datei:Zeile)

- **Die Wurzel „eine Zelle in 60 s“** ist Gesetz und kein Defekt. Bei 0,38 m/s am Herd gibt Rothermel für Modell 1 R = 0,07 m/s.
  Die Front läuft damit 4,2 m in 60 s und bleibt in der 16-m-Zelle. Der echte Defekt lag im Wind: Rothermels Grenze 0,9·I_R
  deckelte das Herd-Bett ab 4 m/s auf 0,28 m/s, also unter das Band der Wiese (0,5–2 m/s). Der Schnitt steht in
  `_brandTempo` (stamm/feld-brand.js:395): R ≤ max(R0, U_eff), nach Andrews 2013 (Abb. 7, die Schlüsse S. 9–10). Die
  Feldmessungen McArthur 1969, Cheney et al. 1998 und Gould 2005 (100–390 m/min bei 30–55 km/h) stehen dort als Band mit
  ihrer Quelle. Das Herd-Bett liegt jetzt bei 6 · 8,1 m/s mit 0,73 · 1,33 m/s im Band. Kein Soll ist falsch.
- **Die Flammen aus der Front:** `_brandBogen` (stamm/feld-brand.js:726) baut je Zelle die Tafel der Einheits-Front (256
  Stücke in exzentrischer Anomalie) mit Byram L = 0,0775·(I·R·r)^0,46. Der Abstand ist a = max(abstandMinM, abstand·L, weit),
  und der Schritt `weitStufe` 0,05 hält den Cache. `_brandFrontGang` (stamm/feld-brand.js:798) setzt die Flammen am
  Integral des Kopfs an und liest Bett-Maske und Eintritte derselben Zelle. `_brandBild` (stamm/feld-brand.js:871) verteilt
  über ψ = Σℓ/d ÷ flammenMax, nur über der Schranke 384. ℓ ist je Zelle und `schrittS` mit versetzter Phase gecacht. Die
  eigene Winkel-Zählung (`winkel`, `winkelMin`, `nahM`) fiel ganz.
- **Die Asche aus dem Feld:** Sie floss vorher schon aus dem EINEN Feld, und gelesen ist es bis zum Boden. `_brandMalen` /
  `_ascheMalen` schreiben `_brandNarbeFn(_brandZellen())` in Kanal G der Kronen-Karte. Die brennende Zelle trägt ihre Front
  (`_brandFront`) und die verbrannte ihre Tat. `_ascheAt` (`_bodenDeckeAt`, stamm/siedlung-wege.js:425) und der Boden-Stoff
  (`_wegeBodenFarbe`, stamm/siedlung-wege.js:1234: `mix(dFern.g, dNah.g, innen)`) lesen dieselben Bytes. Hier war nichts zu
  schneiden; Zwilling oder Flag kam keins dazu.
- **Die Linse:** Die Familie gate:stand-takt --narbe bekommt die Zeile N5-AUGE (scripts/diag-stand-takt.cjs:1565). Die
  Herd-Zelle allein im Bild muss aus 6 m und 40 m gleich viele Flammen tragen, mindestens 8. Im Selbsttest steht die
  Täter-Zeile „→ ROT“ mit dem Stand von main, 25/16. Konsum-Leser ist `_brandBild` → `_brandFrontGang`.

## Ehrlich offen (mit Adresse)

- **Das Bildpaar** (Ego 1,7 m vor −248/−1080, 60 s trocken ↔ 60 s nach Regen; die Zelle vor ↔ nach dem Brand) ist offen. Über
  `scripts/lib/ausgabe-aufnahme.cjs` geht es in diesem Container nicht: swiftshader bringt den GPU-Prozess zum Absturz.
  Flammen-Pixel (Soll ≥ 200) und Luma-Verhältnis (Soll ≤ 0,5) sind ebenso ungemessen; die Schirm-Fläche oben ist ein
  Stellvertreter, kein Pixel. Adresse: `karte2.same.kopplung.kaskade#1` und `stoerung#1`, die Station an Radeon und GTX 1060.
- **Asche 0 an der Station (stoerung#1)** ist nach dieser Messung kein Bruch der Asche-Kette. Die Station maß am 20.11. auf main
  31ea3847. Ihr Herd −248/−1080 trug dort „Bett 1“, am Null-Renderer liest dieselbe Zelle den Anteil 0,344, und in der Mitte
  liegt Stein (`_bodenGruenUnter` 0,227 → `_terrainMaterialAt` stein). Nach dem Gesetz liegt auf Stein keine Asche
  (`_brandBettFn`, w28-lava-nachlauf). Das Grün unter dem Kontakt hing bis fahrt-weltzeit (22.11.) am Bau-Stand der Karte, also
  am Gerät (stamm/gelaende-boden.js:2784). Auf 31ea3847 wie auf dem Zweig wählt die Herd-Suche der Station am Null-Renderer
  −248/−1064 (Anteil 1); dort liegt nach Regen an der Mitte und ±6 m rundum Asche 1,0. Der nächste Stationslauf ist der
  Richter.
- **Die Kosten:** Bei 3 613 brennenden Zellen steigt p95 von 0,41–0,56 auf 0,57–0,62 ms. Der Grund ist die Zahl je Ort, denn
  der Ausschnitt trägt jetzt die Byram-Länge seiner Front. Der kalte Bau von 33 Tafeln auf einmal (ein Ring, der in einem Bild
  eintritt) bringt eine Spitze von 9,3–12,2 ms, nach dem ersten Bild entfällt sie. Adresse: `_brandBogen`, die Tafel je Zelle.
- **Die Front bei Windstille:** Bei 0,38 m/s rechnet Modell 1 nach Rothermel 0,07 m/s. Die Front verlässt die Herd-Zelle in
  60 s nicht, das ist Gesetz und keine Bremse. Ob ein Grasland-Modell bei schwachem Wind anders rechnet, ist hier nicht
  gelesen, steht also offen und bleibt unzitiert. Adresse: `_brandTempo`.
