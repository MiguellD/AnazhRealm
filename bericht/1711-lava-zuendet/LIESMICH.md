# w28-lava-zuendet — ZWISCHENSTAND (GTX 1050, 17.11., auf main 16f45362 trägt den Stapel)

Anlass: Auftrag des Koordinators — die Lava zündet (Rand der Decke über die Zünd-Temperatur der Brennstoff-Zeile, keine
zweite Glut-Zahl), die Zeile BRAND.licht × Glut am Herdfeuer-Datum fällt; vor dem ersten Schnitt vier Bilder von main als
Zielbild, EIN Kopf für die Klasse.

## Zielbild von main (`lava-main-{nah,fern}-{tag,nacht}`, Mess-Wiese, Guss bei −248/−1064, Decke 1 377 °C)

1. KEINE ZÜNDUNG: das Gras steht grün bis an den Rand der Decke, Brand-Feld leer.
2. HALME IN DER DECKE: grüne Büschel im glühenden Rand.
3. NACHT NAH: weiß-rosa Fleck in der Mitte (Herdfeuer-Punkt × BRAND.licht 1 m über der Decke), die Kruste überstrahlt.
4. NACHT FERN: eine kleine rosa Scheibe, kaum Schein im Gras.
(Die drei fremden Flecken links sind Glutbrunnen der Mess-Wiese, `_leuchtQuellen` „glutbrunnen" — keine Lava.)

## Geschnitten

- **Der Rand zündet** (`stamm/siedlung-wege.js` `_lavaZuendet`, aus `_lavaTakt`): solange die Decke heißer ist als `tZuend`
  der Bett-Zeile daneben, fängt jede der acht Nachbar-Zellen. Teilt sie eine Kante mit der Decke, zündet der Rand auf seiner
  LÄNGE: 9 Eintritte je Kante, jeder dort, wo die Decke nach außen endet (`_lavaDeckeAt` 0). Sie fragt neu nur, wenn eine Tat
  heilt (`_tatGen`) oder die Nässe wandert — in Ruhe ein Vergleich je heißer Decke.
- **Die Front läuft vom Minimum über ihre Eintritte** (`stamm/feld-leben.js` `_brandWeg`; Leser: Ankunft `_brandZuenden`,
  Narbe `_brandFront`, die Flammen). Ein gewöhnlicher Brand trägt weiter EINEN Punkt.
- **Das Bett einer Zelle** (`_brandStoff`) liest Mitte + vier Viertel-Punkte; der ANTEIL mit Brennstoff geht als Last in das
  Gesetz (`leb` × k/5). Vorher nur die Mitte: an der Zelle vor der Kamera liegt dort ein Stein, die Wiese von 16 m hatte kein
  Bett, die Front hielt vor grünem Gras.
- **Kein Halm auf der Decke** (`stamm/vegetation-wiese.js` `_wieseGrund`): 0, wo `_lavaDeckeAt` > 0 — vorher dünnte die Decke
  nur (× (1 − Decke)), im Rand blieben Büschel.
- **Das Licht der Lava** (`stamm/dirigent-kern.js` `_leuchtQuellen`) ist eine Flammen-Fläche ihrer Zelle (`_flammenLicht`,
  der Weg des Brands, kein Zeitplan) auf Höhe der Decke, die Stärke folgt ihrer Glut (∝ T⁴). Die Zeile Herdfeuer ×
  BRAND.licht × Glut ist gefallen.

## Gemessen

- Bilder vorher ↔ nachher an gleichen Posen, 60 s nach dem Guss, alle angesehen: `lava-main-*` ↔ `lava-z8-*`
  (Zwischenstände `lava-z4-*`, `lava-z7-*`: dort standen die Eintritte noch 2 m in der Zelle der Lava). Nachher: 7 von 8
  Nachbarn brennen (die achte: Kies, kein Bett), 354 Flammen; rund um die Decke stehen Flammen, Rauch und ein versengter
  Saum, keine Büschel in der Decke; nachts sind die Schollen dunkel, der weiß-rosa Fleck ist weg, der Schein der Flammen
  liegt im Gras. (Die Abnahme der fernen Pose meldet ROT „brand-rauch 40 % im Vordergrund" — der Rauch zieht auf die Kamera.)
- WIDERLEGT am Bild (`lava-z6-nah-nacht-widerlegt`): die Glut über die Umkehr des Nacht-Auges (`_nachtAuge(…, true)`) — die
  dunklen Schollen liegen unter dem Stäbchen-Anteil, die Umkehr hebt sie zehnfach ins Rosa-Rot, die Risse bleiben blass.
  Rechnung: der Riss trägt Leuchtdichte 0,85 → Stäbchen-Anteil nachts 0,23; das Blass kommt aus Leucht-Gesetz ×
  Nacht-Belichtung durch die Tonkurve. Zurückgenommen.
- Gewöhnlicher Brand (Herd −248/−1064, Mess-Wiese, Sommer trocken; Flammen · brennende Zellen · Feld):
  nach 60 s 45 · 1 · 9 ↔ 45 · 1 · 9; nach 120 s 53 · 1 · 8 ↔ 56 · 2 · 12; nach 300 s 61 · 4 · 17 ↔ 107 · 6 · 20
  (vorher = main 7de938ab ↔ nachher; EIN Punkt-Eintritt, die Verschiebung kommt allein aus dem Bett der fünf Punkte).
- Linse `gate:stand-takt --narbe`, Fälle L1–L5 (Null-Renderer, Mess-Wiese, je eine echte Mutante in der Seite, 41
  Selbsttest-Täter), Kopf ↔ Mutante:
  L1 ZÜNDUNG 8 brennend von 8 Betten (Decke 1 650 K, tZuend 523–533 K) ↔ `_lavaZuendet` leer 0; kalt (513 K) 0, lau (543 K,
  Glut 0) 8 — die Schwelle ist tZuend, nicht das Glühen.
  L2 RAND 9 Eintritte je Kante, Decke am Eintritt 0, Spanne der Front längs der Kante nach 60 s 16 m ↔ ohne `ein` 1,75–9,25 m
  (Band ≥ 12 m).
  L3 BETT Stein unter der Mitte, 4 Viertel-Punkte Gras: `leb` 0,642 = 0,802 × 4/5 ↔ nur die Mitte: kein Bett.
  L4 HALM 32 Punkte im Rand (Decke 0,043–0,962): `_wieseGrund` 0 ↔ alte Formel 0,038–0,957.
  L5 LICHT nachts Schein 6,8–7,9 (Band 3–10,5 wie N7), Kern 8 m, kein Zeitplan, auf Höhe der Decke ↔ altes Datum 444–519,
  Kern 0,76 m, + 1 m.
  DIE LINSE FAND ZWEI FEHLER DES SCHNITTS, beide gefallen: die Lava zündete VOR dem Malen ihrer Decke (die Eintritte
  standen 2 m in der Zelle der Lava, L2-DECKE) — sie zündet jetzt nach dem Malen; und der Weg der Front kostete je Texel
  einen Methoden-Ruf (Stand-Linse BRAND-ZELLEN 916–2 367 Einheiten bei 12–16 Zellen, Soll ≤ 64 je Zelle) — `_brandWeg`
  gibt jetzt EINE Funktion je Leser.

## Ehrlich offen

- **Die Flammen am Rand stehen als gleichmäßige Reihe gleich kleiner Zähne** (9 Eintritte in gleichem Abstand, gegen den
  Wind ein kriechendes Rückfeuer).
- **Der versengte Saum liest sich am Tag dunkelgrün statt schwarz/aschig.**
- **Nachts trägt der Rauch das Orange, die Decke wärmt die Halme nicht**: das Licht sitzt auf Höhe der Decke (1 m darüber
  bleicht es die eigene Decke), flach auf nach oben stehende Normalen.
- **Die Risse sind nachts blass-rosa statt orange** (am Tag satt orange) — die Klasse „Glut bei Nacht-Belichtung", vom
  Koordinator als eigener nächster Kopf `w28-glut-nacht` gesetzt (alle Leser in einer Welle).
- **kaskade#1 ist an beiden Geräten neu zu messen**: das Bett aus fünf Punkten verschiebt Brand-Zahlen überall.
- **Mehrspieler:** jede Seite trägt die Tat der Lava und zündet aus ihr zu ihrer eigenen Takt-Zeit (ein Akt der Seite, nicht
  reisend) — der Gleichlauf der Zünd-Zeit zwischen zwei Seiten ist nicht gemessen.
- Die Ankunft der Front in den Nachbarn einer Zelle mit Rand-Eintritt rechnet ihren nächsten Punkt und die Achse weiter vom
  EINEN Punkt (ex/ez); die Ecken und Kanten-Mitten lesen das Minimum.
- Die vier Viertel-Punkte des Betts lesen ihren Stoff auf der Ebene des Gefälles (y + Gefälle × Versatz), nicht an eigener
  Höhe: ein Bau oder Eis an einem Viertel-Punkt kann verfehlt werden. Grund: mit eigener Höhe je Punkt riss am Stapel-Kopf
  `gate:stand-takt` BRAND-ZELLEN (Schritt 10: 1 649 Einheiten bei 16 Zellen, Soll ≤ 64 je Zelle; jetzt 62,4 — knapp).
- Der Blitz zündet nicht (kein Blitz in der Welt) — benannt, nicht gebaut.
