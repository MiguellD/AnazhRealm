# w28-glut-nacht — ZWISCHENSTAND Zahlen (GTX 1050, 17.11., Mess-Wiese, 960 × 540, Sommer trocken)

`m` = main 16f45362 · `s` = Kopf im Baum (WIP 57fc60a2 `bildZapfen` 0,18 … 1 + das skotopische Grau der Stäbchen, nicht
committet). Bilder `glut-{m,s}-{brunnen,flamme}-{tag,nacht}`, `glut-{m,s}-dunkel-nacht`, `glut-s-brunnen-k32`.
Werkzeug: Schuss-Satz `glut-8.bef`, Zahlen `zahlen.cjs` (HSV am Bild, Farbton als Kreis-Mittel gewichtet mit S·V).

## Geschnitten (eine Stelle, `stamm/bild-kosten.js` `_nachtAuge`)

Das Grau, zu dem das Auge zieht, ist die SKOTOPISCHE Leuchtdichte der Farbe: V′ = −0,702·X + 1,039·Y + 0,433·Z (Pattanaik
et al. 1998) durch die sRGB→XYZ-Matrix = R −0,060 · G 0,544 · B 0,360, das Rot auf 0, geeicht am Ton des Mondlichts
(`ATMO_GESETZ.nacht.mond`: Faktor 1,012). Der Stäbchen-ANTEIL s und die Blende am Bild bleiben photopisch.

## Gemessen, nachts, main ↔ Kopf

| Leser | Zahl | Tag (Soll) | main | Kopf |
| --- | --- | --- | --- | --- |
| Brunnen, Licht-Scheibe (14 863 px, Luma > 0,5 auf main) | Anteil min(R,G,B) > 0,85 | — | 1,0 % | 1,0 % |
| | Farbton · Sättigung | — | 25,0° · 0,446 | 28,7° · 0,603 |
| | Pixel Orange (10–45°, S > 0,5, V > 0,5) | 1 764 | 6 566 | 13 080 |
| Flamme | Pixel Orange im Flammen-Feld | 30 250 / 28 062 | 23 121 | 30 125 |
| Gras im Feuerschein (unteres Fünftel) | Farbton · Sättigung | 48,9° · 0,81 | 29,0° · 0,485 | 33,3° · 0,714 |
| Rauch über 1 m | Farbton · Sättigung · Luma | 36° · 0,41 · 103 | 20,6° · 0,404 · 76,0 | 24,4° · 0,581 · 66,7 |

Am Bild: das Rosa ist weg an Brunnen, Flamme, Rauch und äußerem Schein — der Rauch steht orange statt lachs, das Gras
orange auf Grün. Die weiße Scheibe am Brunnen steht (Kopf 2).

## Gegenprobe Nacht ohne Feuer — ÜBER 3/255, das Paar `glut-{m,s}-dunkel-nacht`

Ganzes Bild: mittlere Abweichung 5,27/255, größter Farbton-Sprung (Blöcke 32 × 30) 20,8° (Baumkrone 120° → 100°).
Die Pose trägt einen Glutbrunnen in der Mitte; abseits von ihm, je Feld (Mittel R/G/B main → Kopf):

| Feld | mittlere Abweichung | main | Kopf |
| --- | --- | --- | --- |
| Wiese unten | 6,19 | 36,8 / 40,4 / 25,3 | 31,5 / 35,6 / 16,9 |
| Wiese links | 6,53 | 40,0 / 43,2 / 28,1 | 34,4 / 38,0 / 19,4 |
| Bäume | 3,98 | 22,8 / 22,8 / 15,1 | 20,2 / 20,0 / 10,3 |
| Himmel | 2,90 | 19,9 / 24,9 / 32,4 | 23,3 / 27,8 / 34,5 |

Die mondbeschienene Wiese wird DUNKLER und satter, nicht heller: ihr Ton ist Gelb-Grün mit viel Rot (Farbton 66–70°), das
Rot trägt skotopisch nichts — das Grau der Stäbchen fällt unter die photopische Leuchtdichte, der Blau-Kanal (den nur das
Grau hob) am stärksten. Der Himmel steht heller. Neutral im Mondton bleibt gleich (die Eichung).

## Messung zu (3), Brunnen-Flamme im Satz

Der Stoff der Glut im Satz: Schlüssel `unknown|0.62|0.00|0|1.00|l:2.50|v:glut|xf|satz`, 245 Ecken im Umkreis 1,6 m, Tag =
Nacht (ein Attribut, kein Zeitplan). `aGlut` 1,5 an jeder Ecke (0xff5212 × 1,5, das Emissiv des Studios `M.feuer`) — und
UNGELESEN: der Stoff trägt `leucht` 2,5 (fachwerk `LEUCHT_FEUER`), sein Emissiv ist Vertex-Farbe × 2,5 (Mittel der Ecken
0,297 / 0,125 / 0,035, hellstes Rot 0,42 → Emissiv bis 1,05).
FALL: das Studio erklärt ein Leuchten, der Satz konsumiert es (Leucht-Gesetz) — KEIN Konsum-Verlust, kein Zwilling. Im
Ausschnitt steht die Flamme nachts als heller Kegel, das Glutbett braun-orange; beide lesen sich „aus", weil die Scheibe
ringsum weit über Weiß steht. Wurzel (3) fällt in Wurzel (2).

## Die EINE Zahl für Kopf 2

Scheibe am Brunnen ohne Nacht-Auge, Belichtung ÷ 32 und ÷ 128 (lineare Luma am Bild 0,158 ↔ 0,0397 im 99. Perzentil,
0,331 ↔ 0,0896 im Maximum — Verhältnis 3,7–4,0 bei Faktor 4, also im linearen Teil der Tonkurve): die Scheibe trägt das
5,1-Fache (99. Perzentil) bis 11,5-Fache (Maximum) von Bild-Weiß.

## Ehrlich offen

- Nicht geschossen am Kopf: Lava-Risse, Tor; die Sonderwege (Umkehr an Flamme und Tor) stehen noch.
- Die Linsen `gate:post-kette` (j)/(k) und `pruefbuehne-licht` sind am Kopf nicht gelaufen.
- Fenster: 0 Quellen im Umkreis 90 m, nicht belegt.
