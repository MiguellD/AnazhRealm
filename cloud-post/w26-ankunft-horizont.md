# Post an w26-ankunft-horizont

## 09.11. 15:49 — GPU-PROBE 0ef2ce83 auf omen-gtx1060 (Band-Gerät): GRÜN in 859 s (zeit:gate:ankunft GRÜN 143 s auf omen-gtx1060 (Band-Gerät)) → probe-post/w26-ankunft-horizont/0ef2ce83.md

## 09.11. 15:47 — GPU-PROBE 84e5eb59 auf radeon-890m: GRÜN in 1261 s (gate:ankunft GRÜN 172 s) → probe-post/w26-ankunft-horizont/84e5eb59.md

## 09.11. 15:55 — ABGABE w26-ankunft-horizont (main a7dc1874 eingemischt, Probe zeit:gate:ankunft)
ABGABE 0ef2ce8373204b8b397b36b92bc94d17662b9fde
Geschnitten: das Feld bestellt vor dem Bild nur die Spalten im Blick (`_feldPassMal` über `_blickDerAnkunft`), `hydro-an` geht im Voxel-Faden jedem Chunk-Auftrag vor (`REGIONEN_STAND`); Linse gate:fern-ring (16). Gemessen Radeon ABAB je 4: Horizont steht 9,3 → 6,1 s (Median), t(Kontrolle) 11,48 → 11,01 s. Offen: das Bild halten jetzt die Bauten (Arena ohne Programm), GTX 1060 ungemessen.

## 09.11. 15:13 — GPU-PROBE e89bd08f auf radeon-890m: GRÜN in 3095 s (gate:weltbild-frost:echt GRÜN 237 s · gate:tag-achse:echt GRÜN 15 s · gate:licht-weg:echt GRÜN 9 s) → probe-post/w26-ankunft-horizont/e89bd08f.md

## 09.11. 15:02 — GPU-PROBE 4dc34306 auf radeon-890m: ROT in 2799 s (der Probe-Job endete ohne Urteil (cancelled)) → probe-post/w26-ankunft-horizont/4dc34306.md

## 09.11. 14:19 — GPU-PROBE f40b257b auf gtx1050-desktop: ROT in 3336 s (gate:weltbild-frost:echt ROT 524 s · gate:tag-achse:echt ROT 7 s · gate:licht-weg:echt ROT 7 s) → probe-post/w26-ankunft-horizont/f40b257b.md

## 09.11. 14:09 — GPU-PROBE 28308eea auf gtx1050-desktop: GRÜN in 3199 s (gate:weltbild-frost:echt GRÜN 362 s · gate:tag-achse:echt GRÜN 11 s · gate:licht-weg:echt GRÜN 11 s) → probe-post/w26-ankunft-horizont/28308eea.md

## 09.11. 15:20 Koordinator — zeit:gate: ist auf main (z345)
Dein Zeit-Gate (geh-zerlegung, ankunft, weltbild-frost …) rufst du ab jetzt als `zeit:gate:<npm-skript>`, z. B. `[gpu-probe: zeit:gate:geh-zerlegung]`. Mische dazu main a7dc1874 ein. Dann fährt es nur auf OMEN GTX 1060 oder Radeon 890M. Mit `gate:` kann es auf der GTX 1050 landen, und ein Zeit-Urteil von dort zählt nicht (Haupt-Faden 3- bis 8-mal über Budget). Eine überholte Probe deines Zweigs habe ich gestrichen, die neueste wartet.

## 09.11. 17:48 Koordinator — NOTBREMSE (Wochenbudget 98 %): STOPP
Beende deine Runde JETZT: Committe den Stand als WIP mit [skip ci] und push ihn. Ist deine Arbeit abgegeben, steht die Zeile `ABGABE <sha>` hier. Danach KEINE weiteren Schritte und keine Wartezimmer-Schleife mehr. Weiter geht es erst nach dem Reset (12.11. 19:00) in einer neuen Sitzung, die Übergabe steht in `UEBERGABE-2026-11-09-abend.md`.
