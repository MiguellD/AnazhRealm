# Schritt 0: die Kurve b/w über d (Opus-Messer, 19.11., Node ohne GPU)
Baum b7ed8419. `git diff --stat HEAD origin/main` (dabd69bb): gleich sind vehicle-core.js, porta-core.js, scripts/lib/kronen-linse.cjs und
scripts/diag-haus-fern.cjs. Verschieden sind fachwerk-core.js (361 Zeilen, nach Hunk-Köpfen der Trockengraben; ob der Haus-Bau byte-gleich bleibt,
ist ungeprüft), foundry-core.js (365), stamm/vegetation-streu.js (14) und stamm/studio-bruecke.js (28). Skripte und Rohdaten liegen in `schritt0/`
(kurve.cjs, auswerten.cjs, teil0–3.json). Alle Zahlen stehen in `stufe-kurve.json`.

**Messung b:** gemessen wird mit `wechselProbe` (scripts/lib/kronen-linse.cjs:455) selbst, also mit DERSELBEN Messung wie gate:haus-fern P. Die Grenze
ersetzt `grenze: () => d`, die Brennweite kommt aus dem Wirt (703,7 px/m). Das Soll steht auf ∞, damit die Probe nicht iteriert; gelesen wird ihre
Ausgabe mit 2 Dezimalen. Samen 1, Haus-Türen zu. `b` = der fernste Übergang ≥ 1 px → < 1 px, log-log zwischen den zwei Stützstellen, die ihn
einschließen. Unter 3 m und über 100 m wird nicht gerechnet („< 3").
**Messung w:** derselbe Chamfer (rasterDreieck · Kante = gedeckt ohne vier Nachbarn · EDT nach Felzenszwalb & Huttenlocher · beidseitig gemittelt ·
vier Azimute k·45°+0,2 · y ≥ 0). Gepeilt wird aus der Licht-Richtung (Sonne 35° hoch), über die Werfer nach B2c `schatten`. `rahmen`/`edt` exportiert
kronen-linse nicht; sie sind im Scratch wörtlich abgeschrieben. Eichung: bei Licht 0° liefert die Abschrift für alemannisch L1 @ 12 m 0,2216 px,
die Probe 0,22 px.

## Tafel (Versatz in px bei d = 3 · 6 · 12 · 26 · 50 · 100 m; Haus: L1 / L2; Dreiecke L0 / L1 / L2 / Stufe 3)
Haus-`w` = 0 in allen 64 Zeilen: L0, L1 und L2 werfen dieselbe Stufe 3 (fachwerk-core.js:100–102 `schatten: 3`), an allen 6 d gemessen 0,00 px.
| Haus | Versatz L1 / L2 | b L1 / L2 | heute L1 / L2 | Dreiecke |
|---|---|---|---|---|
| alemannisch | .92 .45 .22 .09 .04 .02 / 4.84 2.42 1.23 .53 .22 .19 | < 3 / 14,5 | 12 / 26 | 77526 / 18150 / 3206 / 60 |
| holzhuette | 1.71 .87 .43 .20 .11 .06 / 4.52 2.20 1.09 .53 .28 .12 | 5,2 / 13,2 | 12 / 26 | 32416 / 6724 / 1036 / 52 |
| volle_moderne | .68 .34 .17 .08 .05 .01 / .89 .42 .21 .11 .04 .01 | < 3 / < 3 | 12 / 26 | 52108 / 7792 / 1158 / 42 |
| alpenchalet | 2.72 1.35 .18 .09 .04 .03 / 5.38 2.71 .87 .45 .18 .09 | 6,7 / 11,0 | 12 / 26 | 69532 / 14332 / 2678 / 52 |
| viktorianisch | .49 .24 .11 .05 .02 .01 / 1.50 .69 .39 .15 .07 .11 | < 3 / 4,3 | 12 / 26 | 71966 / 13250 / 1344 / 94 |
| provenzalisch | .85 .43 .21 .09 .05 .03 / 2.95 1.49 .72 .30 .17 .06 | < 3 / 8,8 | 12 / 26 | 41224 / 6004 / 848 / 52 |
| norwegisch | .87 .43 .20 .10 .06 .02 / 3.97 1.95 .96 .41 .21 .07 | < 3 / 11,5 | 12 / 26 | 54992 / 12428 / 2074 / 60 |
| gotisch | 1.00 .48 .23 .08 .04 .02 / 2.85 1.38 .69 .27 .12 .06 | 3,0 / 8,3 | 12 / 26 | 65944 / 9680 / 838 / 60 |
| fraenkisch | 1.01 .50 .24 .11 .05 .03 / 5.63 2.88 1.41 .58 .25 .13 | 3,0 / 16,2 | 12 / 26 | 69884 / 16004 / 3582 / 60 |
| franzoesisch | 3.50 1.74 .86 .39 .20 .09 / 5.54 2.75 1.36 .60 .31 .15 | 10,3 / 16,0 | 12 / 26 | 47274 / 6534 / 638 / 60 |
| hochhaus | .32 .16 .08 .02 .02 .01 / 8.69 4.30 2.17 1.02 .50 .25 | < 3 / 26,5 | 12 / 32,9 | 57808 / 3324 / 1424 / 42 |
| hollaendisch | .93 .43 .24 .09 .07 .04 / 3.77 1.89 .91 .36 .24 .15 | < 3 / 11,0 | 12 / 26 | 73446 / 16746 / 788 / 60 |
| griechisch | .76 .37 .20 .09 .04 .01 / 3.15 1.56 .76 .34 .17 .08 | < 3 / 9,2 | 12 / 26 | 29560 / 4372 / 630 / 52 |
| pueblo | 3.03 1.58 .88 .48 .24 .19 / 9.19 4.65 2.51 1.09 .59 .35 | 10,3 / 28,5 | 12 / 33,4 | 28888 / 10556 / 1860 / 82 |
| russisch | 1.02 .51 .25 .11 .07 .02 / 3.91 1.97 .92 .39 .19 .09 | 3,1 / 11,1 | 12 / 26 | 48784 / 8464 / 1276 / 52 |
| barock | 0 0 0 0 0 0 / .92 .46 .24 .10 .05 .04 | < 3 / < 3 | 12 / 26 | 24524 / 8432 / 2002 / 64 |
| niedersaechsisch | 4.16 2.08 1.04 .48 .27 .00 / 7.19 3.61 1.79 .86 .46 .06 | 12,5 / 22,2 | 13,8 / 26 | 77684 / 17036 / 3056 / 60 |
| italienisch | 1.71 .85 .42 .09 .04 .03 / 3.62 1.79 .89 .28 .14 .06 | 5,1 / 10,7 | 12 / 26 | 42388 / 6052 / 836 / 52 |
| roemisch | 2.47 1.25 .63 .29 .16 .07 / 5.28 2.64 1.30 .59 .30 .13 | 7,5 / 15,5 | 12 / 26 | 48688 / 5980 / 814 / 52 |
| hanseatisch | .71 .33 .18 .08 .04 .04 / 2.82 1.40 .71 .30 .16 .08 | < 3 / 8,5 | 12 / 26 | 85266 / 20034 / 1172 / 60 |
| spanisch | .80 .39 .20 .09 .05 .01 / 2.93 1.41 .71 .30 .14 .07 | < 3 / 8,5 | 12 / 26 | 40276 / 5980 / 848 / 52 |
| marokkanisch | .49 .25 .12 .06 .03 .02 / 18.2 9.15 4.60 2.18 1.09 .61 | < 3 / 55,4 | 12 / 63,0 | 53716 / 12340 / 1498 / 96 |
| schwarzwald | .09 .04 .01 0 0 0 / 3.05 1.48 .70 .37 .19 .07 | < 3 / 8,6 | 12 / 26 | 94482 / 20622 / 3180 / 60 |
| renaissance | .73 .37 .19 .09 .05 .01 / 2.59 1.29 .64 .31 .15 .07 | < 3 / 7,7 | 12 / 26 | 49168 / 7200 / 836 / 52 |
| mittelalterlich | 1.22 .60 .29 .12 .06 .05 / 4.01 2.05 .96 .42 .19 .10 | 3,6 / 11,6 | 12 / 26 | 51580 / 12712 / 1806 / 52 |
| modern | .84 .43 .20 .09 .06 .01 / .62 .32 .11 .07 .01 0 | < 3 / < 3 | 12 / 26 | 39400 / 5896 / 852 / 42 |
| tudor | 1.14 .56 .27 .12 .06 .04 / 4.65 2.31 1.10 .49 .27 .10 | 3,4 / 13,1 | 12 / 26 | 53284 / 13120 / 1806 / 52 |
| georgian | .42 .22 .13 .05 .04 .01 / 3.81 1.97 1.09 .28 .13 .06 | < 3 / 12,6 | 12 / 26 | 72498 / 11406 / 1508 / 84 |
| andalusisch | .38 .19 .10 .04 .03 .01 / 2.74 1.37 .66 .28 .14 .06 | < 3 / 8,1 | 12 / 26 | 39792 / 5564 / 636 / 52 |
| skandinavisch | .52 .27 .13 .05 .03 .02 / 4.40 2.19 1.03 .43 .16 .11 | < 3 / 12,3 | 12 / 26 | 57568 / 12520 / 1874 / 52 |
| japanisch | 2.65 1.31 .65 .26 .14 .07 / 11.7 **40.4** 2.86 1.27 .59 .28 | 7,8 / 31,9 | 12 / 36,5 | 76156 / 19576 / 3360 / 96 |
| chinesisch | .12 .01 .06 0 .01 0 / 13.5 **39.4** 3.33 1.47 .72 .34 | < 3 / 37,0 | 12 / 43,5 | 54276 / 16992 / 1494 / 96 |

| Wagen L1 | Versatz b | b | Versatz w (Sonne 35°, L0 wirft sich, L1 wirft sich) | w | heute | Dreiecke L0 / L1 |
|---|---|---|---|---|---|---|
| gt | .27 .16 .07 .06 .01 0 | < 3 | .27 .14 .08 .03 .02 .02 | < 3 | 12 | 28424 / 9808 |
| suv | .32 .17 .08 .04 .02 .01 | < 3 | .23 .13 .07 .03 .02 0 | < 3 | 12 | 30624 / 10512 |
| supersport | .46 .20 .09 .04 .02 .01 | < 3 | .26 .14 .08 .04 .01 .01 | < 3 | 12 | 27956 / 9660 |
| limousine | .27 .15 .07 .07 .01 0 | < 3 | .17 .09 .05 .02 .01 .01 | < 3 | 12 | 28528 / 9896 |
| kompakt_fwd | .30 .16 .08 .03 .01 .01 | < 3 | .22 .12 .07 .03 .02 .01 | < 3 | 12 | 28716 / 10056 |

## Wechsel näher / ferner, Dreiecke im Blick
- Mit d_k = max(b, w) (g = 1, `haelt` = 0, ohne Hysterese) läge jeder der **69 Wechsel näher als heute, keiner ferner**. Neu/heute im Median 0,31
  (0,12–0,90). Haus L1 im Median 3,0 m statt 12, L2 11,5 m statt 26, das Höchste ist marokkanisch L2 mit 55,4 m. **27 von 69** Zeilen
  (22 Haus, 5 Wagen) liegen unter 3 m: dort bestimmt `haelt` die Grenze, nicht das Bild. Nirgends liegt L2 vor L1.
- Auch die 6 Zeilen über dem Haushalt (pueblo, hochhaus, marokkanisch, japanisch, chinesisch L2, niedersächsisch L1) rücken um 8–15 % näher. Die
  Tafel `LOD_SCHIRM.fehler` trägt den Rand × 1,1 der Täter-Iteration (kronen-linse.cjs:514).
- **Dreiecke im Blick, rechnerische Pose „Stadt gleich dicht":** 1 Haus je 400 m², jede der 32 Vorlagen gleich oft (Samen 1), waagrechter Sektor
  107,5° (75° senkrecht, 16:9), Ring 6–100 m, alles als Mesh, ohne Hysterese. **Haus heute 68 125 → mit dem Gesetz 45 909 (−32,6 %).** Wagen bei
  gleicher Dichte 238 172 → 233 393 (−2,0 %), ohne die Karte jenseits 26 m (`impostor`). Das ist NICHT die Pose stadt-voll (ihre Verteilung ist
  hier nicht gelesen).

## Die drei Vorhersagen
1. „b der Limousine L1 < 12 m": **getroffen**. b < 3 m (0,27 px bei 3 m, 0,07 bei 12), w < 3 m (0,17 px bei 3 m).
2. „≥ 20 der 32 Häuser tragen an L1 bei 12 m < 1 px": **getroffen, 31 von 32**. Nur niedersächsisch trägt 1,04.
3. „jenseits 26 m fällt der Versatz langsamer als 1/d": **nicht getroffen**. Von 42 Zeilen mit ≥ 0,1 px bei 26 m fallen 13 langsamer (bis 50 m
   wie bis 100 m). Im Median ist 100·v(100) / 26·v(26) = 0,89, der Versatz fällt also etwa mit 1/d oder schneller. Zwischen 3 und 26 m halbiert er
   sich je Verdopplung (z. B. alemannisch L2 4,84 → 2,42 → 1,23). Der Satz in vs:2886 „fern skaliert er nicht mehr mit 1/d" gilt für die Silhouette
   zwischen 3 und 100 m nicht.

## Soll-Tafel S1–S6 (EINHEIT §5) nach dieser Messung
- **S1 kann nicht rot werden:** die Grenze ist die Stelle, an der dieselbe Messung 1 px trägt. Rot kann sie nur durch einen Interpolations- oder
  Rundungsfehler werden. Ein Täter wäre damit ein Messfehler, keine Aussage über das Bild.
- **S2 kann am Haus nicht rot werden:** alle Stufen werfen dieselbe Stufe 3, gemessen ist w = 0 in 64 von 64 Zeilen. Der Satz „ohne w verlören
  15 von 32 Häusern ihren Schatten unter 12 m" (EINHEIT §2) widerspricht fachwerk-core.js:100–102. Am Wagen ist w < 3 m.
- **S3 ist hier nicht messbar, wird aber der Richter:** an 27 von 69 Zeilen setzt `haelt` die Grenze. Ohne `haelt` (Tür, Sitz) stünde jede
  dieser Stufen unter 3 m.
- **S4** gibt es hier nur rechnerisch (−32,6 % Haus, −2,0 % Wagen), mit der Annahme oben, nicht an stadt-voll. **S5** (GTX-ABAB) und **S6**
  (Garage gegen Welt) sind ohne GPU und Garage nicht messbar.

## Unbelegt
- **Nur die Silhouette:** `kantenVersatz` misst die Umriss-Kanten der Maske. Innere Kanten (Fachwerk, Fenster, Ton) sieht es nicht, und gerade die
  trennen L0 von L1 bei b < 3 m. Der „Farbbild-Versatz" ist damit nicht gemessen, nur sein Umriss-Anteil.
- **Haus-Schatten gegen die L0-Geometrie:** der Werfer Stufe 3 (42–96 Dreiecke) liegt gegen den Umriss der L0 aus Licht-Richtung im Median bei
  9,4 px @ 12 m (6,6–18,4), 4,3 @ 26, 1,14 @ 100. Diesen Fehler trägt jede Stufe gleich, keine Stufen-Grenze kann ihn heben.
- Japanisch und chinesisch L2 tragen bei 6 m 40 px gegen 12–13 px bei 3 m (nicht monoton). Ungeklärt: ein Raster- oder Rahmen-Effekt der Probe,
  oder ein Teil, das nur bei diesem Maßstab kippt. Am b (31,9 / 37,0 m) ändert es nichts.
- Nur Samen 1 (16 Gestalten je Stil, 8 je Wagen). d < 3 m und d > 100 m sind nicht gemessen. Der Schatten ist in der Licht-Peilung gemessen, nicht
  als Kaskaden-Texel und nicht als Boden-Projektion (dort längs der Sonne bis 1/sin 35° = 1,74 ×).
- `haelt`, `g` und die Hysterese sind nicht gemessen. Heute sind beim Wagen 12 m angesetzt (Maske des Baums, EINHEIT §1). Die Ausgabe der Probe hat
  2 Dezimalen (0,00 bis 0,005). Kosten: die Peilung bei 3 m braucht 6–8 min je 8 Häuser (4 Prozesse parallel).
