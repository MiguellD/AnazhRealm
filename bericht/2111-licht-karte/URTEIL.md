# Licht-Karte: Nah und Fern derselben Wahl (nacht-lichter-2), 21.11.

Leiter `karte2.erleben.bild.nacht`. Gerät: Radeon 890M, Werkbank 1920×1080 (Schirm am Bild geprüft: 1920×1080, 703,7 px/m),
unter dem GPU-Schloss. main = 44446d65 (Baum AnazhRealm-nacht-main), Kopf = nacht-lichter-2.

## Zensus je Sprosse

| Nr | Richter | Was fehlte | Datei:Zeile | Nach dem Schnitt |
|---|---|---|---|---|
| 1 | Pfosten-Kontrast ≥ 3:1 2 m vom Feuer; Gasse ±200 K | Kelvin: kein Leser. Pfosten: Leser schatten.K5 (`gate` der Schatten-Familie), nicht neu gemessen | stamm/bild-schatten.js:637; scripts/lib/licht-linsen.cjs:3435 | Kelvin ±33 K (Stadt, 10 Laternen), ±43 K (Dorf, 4). Pfosten offen (Messname schatten.K5). |
| 2 | Bodenfleck ≥ 1 EV, Anteil ≥ 0,9 in 50 m; Gassen-Histogramm ΔEV-Median ≤ 0,5 gegen Fotosatz | Vier Plätze in 48 m. Die 5. bis 42. Laterne der Stadt war dunkel. Kein Leser. Kein Fotosatz im Repo. | stamm/stoff-material.js:3850; stamm/dirigent-kern.js:1708, 1937 | Bodenfleck: Stadt 13/13, Dorf 4/4, Wiese 1/1. Histogramm offen, weil der Fotosatz fehlt. |
| 3 | Fenster 20 → 4 Uhr gegen Nachtgang-Kurven; Straße 5–30 lx | Fenster sind Emission, keine Quelle der Wahl. Kein Leser. | stamm/dirigent-kern.js:1937 (`_leuchtWahl` kennt keine Fenster) | offen |
| 4–8 | 10⁴ bis 10¹⁰ Quellen | Die Wahl liest `_leuchtQuellen` im Umkreis, je Bild höchstens 455 Quellen. Ferne Lichtteppiche haben keinen Schreiber. | stamm/dirigent-kern.js:1937 | offen (Umfang) |

## Das Gesetz

EIN Licht, nah und fern. `_leuchtWahl` reicht jede Quelle seiner Wahl als `pool.alle` weiter:
- Die vier Plätze tragen Glanz und Wurf.
- Die Licht-Karte trägt jede übrige Quelle mit 1 − ihrer Blende, in vier Stufen.
- Der Belichtungsmesser `_poolAmAuge` liest dieselbe Liste.

Es gibt keinen zweiten Pool, kein Flag und keinen stillen Rückfall. Der Schreiber `_lichtKarteTakt` hält je Quelle ihren Beitrag und
schreibt nur den Fleck der Quelle, die sich ändert. Die neue Mitte baut er im Hintergrund.

## Gemessen (`gate:nacht-licht:echt`, `werkbank licht --nacht`)

| Ort | Quellen in 50 m | Bodenfleck ≥ 1 EV | ohne Karte (Gegenprobe) | Kelvin | ein Fleck | Takt höchstens | Bau der Mitte |
|---|---|---|---|---|---|---|---|
| stadt-voll:third | 42 | 13/13 = 1 | 3/13 = 0,231 | ±33 K | 0,56 ms | 5,26 ms | 1,84 ms |
| dorf:third | 14 | 4/4 = 1 | 4/4 = 1 | ±43 K | 0,50 ms | 4,94 ms | 1,79 ms |
| wiese:third | 13 Glutbrunnen | 1/1 = 1 | — | — | — | — | — |

Die Kosten der vollen Schrift vor dem inkrementellen Schreiber: 20,1 ms je Blendstufe (42 Laternen). Mit ihm kostet ein Fleck 0,56 ms.

## Kosten main ↔ Kopf (gleiche Welt, identische Kameras, gpu-bank 24 × 3 Runden, zweimal)

| Ort | GPU ms main | GPU ms Kopf | dc main → Kopf | Dreiecke main → Kopf |
|---|---|---|---|---|
| stadt-voll | 17,03 / 17,81 | 15,32 / 15,16 | 348 → 350 | 633 576 → 633 754 |
| dorf | 20,90 / 21,76 | 17,23 / 16,27 | 124 → 125 | 551 431 → 551 412 |
| wiese | 24,61 / 24,81 | 23,00 / 18,54 | 186 → 186 | 473 427 → 469 726 |

Die Karte kostet +1 bis +2 Befehle (ein Hochladen) und drei Texel-Taps je Fragment; im Rauschen der Radeon liegt kein Mehrpreis.
Die CPU-Kosten hängen an der Änderung (ein Fleck je Quelle, die wechselt) und an der Fläche um das Auge (144² Zellen).
An der Größe der Welt hängen sie nie.

## Mein Urteil am Bildpaar (stadt-voll, Mitternacht)

Auf main standen hinter den vier Plätzen schwarze Fassaden. Die Laternen links vorn, an der Hausecke und unter den Bögen rechts
glühten nur als Lampenkörper. Auf dem Kopf werfen sie ihr Licht auf Fassade, Hang und Arkade, und die Gasse liest sich als Kette
von Lichtinseln. Der Platz vorn ist auf dem Kopf etwas dunkler, weil der Belichtungsmesser jetzt alle Quellen der Wahl liest und
nicht mehr nur vier. Das ist gewollt (dieselbe Wahl wie die Karte), und ich nenne es. Im Dorf ändert sich wenig: nur die hintere
Hausecke und der linke Hang bekommen Licht, weil dort ohnehin fast jede Quelle einen Platz hatte.

## Ehrlich offen

- #1 Pfosten-Kontrast: nicht neu gemessen (Messname schatten.K5).
- #2 Gassen-Histogramm: es gibt keinen Fotosatz.
- #3 Fenster: sind keine Quellen der Wahl.
- #4–#8: Umfang.
- Die Richter-Station in punkte-maschine ruft die neue Linse noch nicht („Leser fehlt“).
