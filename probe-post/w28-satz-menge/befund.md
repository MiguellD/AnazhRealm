# w28-satz-menge — der Satz der Menge trägt sein Gesicht als Funktion im Stoff (GTX 1050, 15.11.)

Zweig auf w28-iris-frei ad7ca7db (beide prägen das Golden des Menschen). Dorf, Uhr 0,5, Welt ab Boot in 1920 × 1080 (`r._schirm()`
1920 × 1080, pxJeM 703,7 · `r._laubRand()` 216), Werkbank auf der Karte (nvidia/pascal). main = 2b826a89 aus einer Baum-Kopie
(`git archive`), der Kopf aus dem Arbeitsbaum — derselbe Bewohner (Haut 58392a, 6,3 m vom Spieler), vor UND nach jedem Schuss im
Zensus „satz“, sein eigener Leib unsichtbar.

## Was geschnitten ist

- **Der Fund am Guss:** der Leib der Menge (Ofen L2) ist EINE Hülle von 946 Ecken — 174 Haut · 54 Haar · 718 Kleid. Keine Ecke trägt
  Lippe, Höhle oder Braue, kein Auge wird gegossen. Der Satz zeigte unter der Haar-Kappe EINE Fläche.
- **Das Gesetz reist mit dem Guss** (foundry-core `__gesichtFern`, Beipack `__skelett.gesicht` der Mengen-Stufen): Radius und Mitten
  der Augäpfel, Lidspalte und Iris in Radien (koerper `MENSCH_GESTALT.auge`), die Zonen der Brauen (derselbe Kasten + `brauSaum` wie
  der Brauen-Ton der nahen Haut), der Kasten der Lippen mit der Mund-Linie (`mundSpalt`, `KOPF_TON.mundLinie`), die festen Farben —
  alles aus demselben Bau wie die nahe Stufe, im Raum der Vorlage.
- **Der Stoff zeichnet es** (stamm/stoff-gang.js `_gangSeite` → `tonGesicht`): im Fragment am Ort der Ecke in der VORLAGE (`aRoh`
  als Varying — starr unter Pose und Formziel), jede Kante über den Fußabdruck des Bildpunkts geglättet; Lippe und Braue färbt die
  Palette des Bewohners (seine Zeile der Ton-Tafel), die Zahlen der Vorlage sind Stoff-Werte. Ohne Beipack bricht der Wirt laut
  (`_bewohnerSatz`), nie still.

## Preis-Zeile (Dorf-Zensus Leib 4 · Satz 13 · Feld 30 · drinnen 3, an beiden Bäumen)

| | main 2b826a89 | Kopf |
|---|---|---|
| Senken des Satzes | leib 13 × 1700 Dreiecke · wurf 17 × 360 | leib 13 × 1700 · wurf 17 × 360 |
| Stoffe des Satzes | 1 | 1 |
| Befehle im Bild (Tele-Schuss 9 m) | 69 | 69 |
| Welt-March: Felder · Kapsel-Zeiger · Kapsel-Sätze | 1120 · 2484 · 302 | 1121 · 2485 · 303 (zweites Boot 1084 · 2472 · 290) |
| Texturen | 51 | 51 |

Je Bewohner im Satz: 0 Dreiecke, 0 Befehle, 0 Felder, 0 Programme mehr — die Funktion steht im Farb-Knoten des EINEN Satz-Stoffs,
ihre Kosten hängen an den Bildpunkten des Kopfs. Die Felder des March schwanken von Boot zu Boot um die Welt (1084–1121), nicht um
den Schnitt. Eine VRAM-Zahl am Ort und eine Frame-Zeit sind NICHT gemessen (das Band urteilt an Radeon und GTX 1060).

## Bildpaar main ↔ Kopf, dieselbe Pose

| | main | Kopf |
|---|---|---|
| 9 m, Tele 26°, Ausschnitt vierfach | `tele26-9m-main.png` | `tele26-9m-kopf.png` |
| 15 m, Tele 26°, fünffach | `tele26-15m-main.png` | `tele26-15m-kopf.png` |
| 9 m, Bildwinkel des Spiels, achtfach | `spiel-9m-main.png` | `spiel-9m-kopf.png` |
| 15 m, Bildwinkel des Spiels, zehnfach | `spiel-15m-main.png` | `spiel-15m-kopf.png` |

**Was das Auge sieht:** im Tele trägt der Satz auf 9 m zwei Augen mit Weiß und Iris, zwei Brauen im Ton des Haars und einen roten
Mund mit Linie; auf 15 m zwei Augen-Punkte, die Brauen und den Mund. An main steht dort EINE dunkle Fläche unter der Haar-Kappe.

**Ehrlich:** im Bildwinkel des SPIELS trägt der Kopf auf 9 m rund 12, auf 15 m rund 7 Bildpunkte — an der dunklen Haut dieses
Bewohners liest man dort nur den hellen Brauen-Saum unter der Kappe, kein Gesicht (Auge 22 × 9 mm ≙ 1,7 × 0,7 Bildpunkte auf 9 m).
Die Funktion trägt, wo der Kopf Pixel hat (Tele, Zoom, hohe Auflösung, nahe Grenze). Der Mund ist die Ellipse im Kasten der Lippen
(liest im Tele wie ein offener Mund), die Braue die Zone der nahen Stufe (breit). Nur EIN Bewohner belegt (eine Haut); die helle und
die mittlere Haut trafen wieder eine Hauswand (die Kamera 9 m vor ihnen steht im Haus).

## Offen beim Namen

- **Das FELD** (die Kapseln im Welt-March, ab 19,8 m): unberührt — der Kopf ist dort EINE Kapsel in EINER Farbe; die Dateien hält die
  OMEN (w28-march-schirm). Messname: Kopf-Kapsel zweitonig (Haar · Haut) und Augen-Band als Funktion des March.
- **Der Mund als Form der Lippen** statt der Ellipse ihres Kastens; **die Braue** schmaler als ihre Ton-Zone.
- **Der Blick im Spiel** auf 9–20 m an heller Haut: nicht belegt.

Linse: gate:mensch-anatomie `mengeGesicht` (KOPF_SOLL [1; 1]: der Beipack der Menge gegen den nahen Guss, 6 Züge; am Stand davor 0),
Mutante SG1. Werkzeug: `.git/gtx1050-werkzeug/tmp/gesicht/` (`satz-ort.js`, `kam-satz2.js`, `preis.js`, `spike-satz.js`), `werkbank-baum-ort.sh`.
