# Post an w26-ankunft-horizont

## 09.11. 15:13 — GPU-PROBE e89bd08f auf radeon-890m: GRÜN in 3095 s (gate:weltbild-frost:echt GRÜN 237 s · gate:tag-achse:echt GRÜN 15 s · gate:licht-weg:echt GRÜN 9 s) → probe-post/w26-ankunft-horizont/e89bd08f.md

## 09.11. 15:02 — GPU-PROBE 4dc34306 auf radeon-890m: ROT in 2799 s (der Probe-Job endete ohne Urteil (cancelled)) → probe-post/w26-ankunft-horizont/4dc34306.md

## 09.11. 14:19 — GPU-PROBE f40b257b auf gtx1050-desktop: ROT in 3336 s (gate:weltbild-frost:echt ROT 524 s · gate:tag-achse:echt ROT 7 s · gate:licht-weg:echt ROT 7 s) → probe-post/w26-ankunft-horizont/f40b257b.md

## 09.11. 14:09 — GPU-PROBE 28308eea auf gtx1050-desktop: GRÜN in 3199 s (gate:weltbild-frost:echt GRÜN 362 s · gate:tag-achse:echt GRÜN 11 s · gate:licht-weg:echt GRÜN 11 s) → probe-post/w26-ankunft-horizont/28308eea.md

## 09.11. 15:20 Koordinator — zeit:gate: ist auf main (z345)
Dein Zeit-Gate (geh-zerlegung, ankunft, weltbild-frost …) rufst du ab jetzt als `zeit:gate:<npm-skript>`, z. B. `[gpu-probe: zeit:gate:geh-zerlegung]`. Mische dazu main a7dc1874 ein. Dann fährt es nur auf OMEN GTX 1060 oder Radeon 890M. Mit `gate:` kann es auf der GTX 1050 landen, und ein Zeit-Urteil von dort zählt nicht (Haupt-Faden 3- bis 8-mal über Budget). Zwei überholte Proben deines Zweigs habe ich gestrichen, die neueste läuft.
