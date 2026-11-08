# Post an w23-k6-flimmern

## 08.11. 18:29 — GPU-PROBE 33d0e5a8 auf radeon-890m: GRÜN in 15236 s (gate:kamera-leib:echt GRÜN 63 s · gate:kamera-leib:echt GRÜN 73 s · gate:kamera-leib:echt GRÜN 76 s) → probe-post/w23-k6-flimmern/33d0e5a8.md

## 08.11. 18:03 — GPU-PROBE 33d0e5a8 auf radeon-890m: GRÜN in 13671 s (gate:kamera-leib:echt GRÜN 77 s · gate:kamera-leib:echt GRÜN 72 s · gate:kamera-leib:echt GRÜN 66 s) → probe-post/w23-k6-flimmern/33d0e5a8.md

## 08.11. 17:34 — GPU-PROBE 33d0e5a8 auf radeon-890m: GRÜN in 11902 s (gate:kamera-leib:echt GRÜN 71 s · gate:kamera-leib:echt GRÜN 76 s · gate:kamera-leib:echt GRÜN 72 s) → probe-post/w23-k6-flimmern/33d0e5a8.md

## 08.11. 17:15 — GPU-PROBE 33d0e5a8 auf radeon-890m: GRÜN in 10769 s (gate:kamera-leib:echt GRÜN 61 s · gate:kamera-leib:echt GRÜN 67 s · gate:kamera-leib:echt GRÜN 65 s) → probe-post/w23-k6-flimmern/33d0e5a8.md

## 08.11. 16:56 — GPU-PROBE 33d0e5a8 auf radeon-890m: GRÜN in 9647 s (gate:kamera-leib:echt GRÜN 70 s · gate:kamera-leib:echt GRÜN 67 s · gate:kamera-leib:echt GRÜN 69 s) → probe-post/w23-k6-flimmern/33d0e5a8.md

## 08.11. 16:08 — GPU-PROBE 33d0e5a8 auf radeon-890m: GRÜN in 6755 s (gate:kamera-leib:echt GRÜN 74 s · gate:kamera-leib:echt GRÜN 70 s · gate:kamera-leib:echt GRÜN 71 s) → probe-post/w23-k6-flimmern/33d0e5a8.md

## 08.11. 15:57 — GPU-PROBE 33d0e5a8 auf omen-gtx1060: GRÜN in 6071 s (gate:kamera-leib:echt GRÜN 99 s · gate:kamera-leib:echt GRÜN 84 s · gate:kamera-leib:echt GRÜN 81 s) → probe-post/w23-k6-flimmern/33d0e5a8.md

## 08.11. 15:29 — ABGABE 33d0e5a8 (Cloud-Sitzung w23-k6-flimmern)

ABGABE 33d0e5a8a9e05841514aa21ca5675c645d71246b

- Geschnitten: `scripts/diag-kamera-laub.cjs:302` — K6 misst den Rückstrahl in einem eigenen Gang ohne Schuss (je Stand nach den Proben des Leibs, links und rechts, 40 Bilder Anlauf + 90 gezählt, der Halton-Versatz der zeitlichen Auflösung steht); die Proben des Leibs im Stand `an` fahren byte-gleich zu main. Die Schwelle (1 %) steht. Die Decke zahlen drei Zwillinge (diag-haus-welt `regionenStehen`, diag-ci-deckung `V`, diag-altlasten `ausAl`): scripts −17 Atome.
- Quelle (Radeon, 8 Läufe in 4 Boots, Mess-Fassung 664e127d/f423f129): der rote Rückstrahl war IMMER genau die erste Änderung nach dem eigenen Schuss ohne Leib (0,85–1,21 %, Bild 2–3 des Fensters) — die Aufnahme ohne Leib misst den Boden ihrer Szene, der Sprung des Auges (`_traaR.neu`, folge 1) nimmt danach den Gang ganz. Eine Wirkung der Linse, kein Bild des Spiels. Der Rest im Gang ist der Halton-Versatz des Szenen-Passes: Gang 0,59–0,77 %, Versatz fest 0,21–0,40 %, Dither-Phase allein fest 0,54–0,74 %; Wind, Laub und Leib 0 (Stand fest 0,01 % bei laufender Zeit, ohne Leib wie mit). Die Mutante (Raster) bleibt ROT: 4,4–8,2 %, bei festem Versatz 3,7–6,9 %.
- Am Kopf 33d0e5a8: Rückstrahl 0,2–0,3 % in 18 von 18 Läufen (Radeon 9, GTX 9; vorher 0,85–1,21 %). K6 gesamt Radeon 9/9 GRÜN, GTX 8/9 — der eine ROTE ist NICHT der Rückstrahl (0,2 %), sondern der Leib: Kopf A0 5,6 % > 5 %.
- Puls grün (Code-Check 33d0e5a8), `npm run check` grün, `playtest:fast` 21/21, `gate:haus-welt` grün (37 Welten).
- FUND (nicht meine Klasse, Größe M): w21-leib-bau macht K6 auf der GTX am Kopf A0 zum Wackler. Zug 6fc7d52 (nur w21-leib-bau): echt-Versuch 1 und 2 rot an K6, Versuch 2 A0 Kopf 5,4 %; davor ef66795 A0 0,0 %, Leib 3 102–3 356 px; seitdem Leib 2 875–3 176 px, A0 0,9–5,6 % (GTX, 9 Läufe an diesem Kopf), integ-probe 137a3f7 3,1 %. Die Zahl der getragenen Teile (`_traegerPassung`, stamm/bild-kosten.js:2290) ist vorher wie nachher 23 von 24, aber `head` und `mensch` sind über der EINEN Haut anders geschnitten. Kriterium: K6 Kopf A0 ≤ 2 % auf der GTX in 10 Läufen.
- FUND (Größe M): `stamm/bild-schatten.js:184` — der Rückstrahl des Spiels liest den Szenen-Pass mit Halton-Versatz (Boden je Messung im Gang p50 0,3 %, bis 0,8 %; an der Unterseite ein Fünfzehntel davon).
- Nachtrag 16:10: Wiederholung 8 (GTX) und 9 (Radeon) je 3/3 GRÜN — am Kopf jetzt Radeon 12/12, GTX 11/12 (der eine ROTE der Leib-Kopf A0 5,6 %), Rückstrahl 0,2–0,3 % in 24 von 24 Läufen; GTX A0 Kopf über 12 Läufe 0,9–5,6 %.
- Nachtrag 18:30 (Ende des Wartezimmers, 3 h ohne Post): am Kopf Radeon 27/27 GRÜN, GTX 11/12 (die OMEN trug seit 16:00 nur echt-Jobs), Rückstrahl 0,2–0,4 % in 39 von 39 Läufen.
- Ehrlich offen: zehn GTX-Läufe GRÜN in Folge stehen aus. Sie hängen am FUND w21-leib-bau, nicht am Rückstrahl. Keine weitere Wiederholung läuft; das Wartezimmer endete nach 3 h ohne Post.

## 08.11. 15:24 — GPU-PROBE 33d0e5a8 auf omen-gtx1060: ROT in 4104 s (gate:kamera-leib:echt GRÜN 80 s · gate:kamera-leib:echt GRÜN 79 s · gate:kamera-leib:echt ROT 79 s) → probe-post/w23-k6-flimmern/33d0e5a8.md

## 08.11. 14:52 — GPU-PROBE 33d0e5a8 auf omen-gtx1060: NACHGEGEBEN in 2166 s (gate:kamera-leib:echt NACHGEGEBEN 37 s · gate:kamera-leib:echt NACHGEGEBEN 2 s · gate:kamera-leib:echt NACHGEGEBEN 2 s) → probe-post/w23-k6-flimmern/33d0e5a8.md

## 08.11. 14:48 — GPU-PROBE 33d0e5a8 auf omen-gtx1060: GRÜN in 1933 s (gate:kamera-leib:echt GRÜN 76 s · gate:kamera-leib:echt GRÜN 78 s · gate:kamera-leib:echt GRÜN 76 s) → probe-post/w23-k6-flimmern/33d0e5a8.md

## 08.11. 14:43 — GPU-PROBE 33d0e5a8 auf radeon-890m: GRÜN in 1638 s (gate:kamera-leib:echt GRÜN 69 s · gate:kamera-leib:echt GRÜN 71 s · gate:kamera-leib:echt GRÜN 70 s) → probe-post/w23-k6-flimmern/33d0e5a8.md

## 08.11. 14:37 — GPU-PROBE 33d0e5a8 auf radeon-890m: GRÜN in 1293 s (gate:kamera-leib:echt GRÜN 62 s · gate:kamera-leib:echt GRÜN 63 s · gate:kamera-leib:echt GRÜN 71 s) → probe-post/w23-k6-flimmern/33d0e5a8.md

## 08.11. 14:28 — GPU-PROBE 33d0e5a8 auf omen-gtx1060: GRÜN in 749 s (gate:kamera-leib:echt GRÜN 78 s · gate:kamera-leib:echt GRÜN 81 s · gate:kamera-leib:echt GRÜN 81 s) → probe-post/w23-k6-flimmern/33d0e5a8.md

## 08.11. 14:20 — GPU-PROBE 33d0e5a8 auf radeon-890m: GRÜN in 266 s (gate:kamera-leib:echt GRÜN 62 s · gate:kamera-leib:echt GRÜN 63 s · gate:kamera-leib:echt GRÜN 61 s) → probe-post/w23-k6-flimmern/33d0e5a8.md

## 08.11. 14:13 — GPU-PROBE da0dbfd9 auf omen-gtx1060: GRÜN in 681 s (gate:kamera-leib:echt GRÜN 75 s · gate:kamera-leib:echt GRÜN 80 s · gate:kamera-leib:echt GRÜN 82 s) → probe-post/w23-k6-flimmern/da0dbfd9.md

## 08.11. 13:59 — GPU-PROBE bd670e52 auf radeon-890m: ROT in 395 s (gate:kamera-leib:echt ROT 76 s · gate:kamera-leib:echt GRÜN 68 s · gate:kamera-leib:echt GRÜN 66 s) → probe-post/w23-k6-flimmern/bd670e52.md

## 08.11. 13:47 — GPU-PROBE a776bd61 auf radeon-890m: ROT in 320 s (gate:kamera-leib:echt GRÜN 63 s · gate:kamera-leib:echt GRÜN 70 s · gate:kamera-leib:echt ROT 74 s) → probe-post/w23-k6-flimmern/a776bd61.md

## 08.11. 13:39 — GPU-PROBE f423f129 auf radeon-890m: GRÜN in 1463 s (gate:k6-mess GRÜN 132 s · gate:k6-mess GRÜN 131 s) → probe-post/w23-k6-flimmern/f423f129.md

## 08.11. 13:11 — GPU-PROBE 664e127d auf radeon-890m: ROT in 616 s (gate:k6-mess GRÜN 117 s · gate:k6-mess ROT 120 s) → probe-post/w23-k6-flimmern/664e127d.md
