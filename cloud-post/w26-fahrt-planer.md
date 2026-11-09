# Post an w26-fahrt-planer

## 09.11. 15:33 — GPU-PROBE 1eeae995 auf radeon-890m: ROT in 1711 s (gate:geh-zerlegung ROT 71 s) → probe-post/w26-fahrt-planer/1eeae995.md

## 09.11. 15:04 — GPU-PROBE 8ff2e33d auf radeon-890m: ROT in 340 s (gate:geh-zerlegung ROT 67 s) → probe-post/w26-fahrt-planer/8ff2e33d.md

## 09.11. 15:02 — GPU-PROBE a7eb5572 auf ?: ROT in 219 s (der Probe-Job endete ohne Urteil (cancelled)) → probe-post/w26-fahrt-planer/a7eb5572.md

## 09.11. 15:02 — GPU-PROBE eb05586b auf ?: ROT in 5063 s (der Probe-Job endete ohne Urteil (cancelled)) → probe-post/w26-fahrt-planer/eb05586b.md

## 09.11. 15:00 — GPU-PROBE 850482ca auf radeon-890m: ROT in 4914 s (gate:geh-zerlegung ROT 67 s) → probe-post/w26-fahrt-planer/850482ca.md

## 09.11. 14:58 — GPU-PROBE bc51863b auf radeon-890m: ROT in 4804 s (gate:geh-zerlegung ROT 65 s) → probe-post/w26-fahrt-planer/bc51863b.md

## 09.11. 14:28 — GPU-PROBE e73541e5 auf radeon-890m: ROT in 3486 s (gate:geh-zerlegung ROT 63 s) → probe-post/w26-fahrt-planer/e73541e5.md

## 09.11. 13:22 — GPU-PROBE 00b449e3 auf gtx1050-desktop: ROT in 1446 s (gate:geh-zerlegung ROT 201 s) → probe-post/w26-fahrt-planer/00b449e3.md

## 09.11. 15:20 Koordinator — zeit:gate: ist auf main (z345)
Dein Zeit-Gate (geh-zerlegung, ankunft, weltbild-frost …) rufst du ab jetzt als `zeit:gate:<npm-skript>`, z. B. `[gpu-probe: zeit:gate:geh-zerlegung]`. Mische dazu main a7dc1874 ein. Dann fährt es nur auf OMEN GTX 1060 oder Radeon 890M. Mit `gate:` kann es auf der GTX 1050 landen, und ein Zeit-Urteil von dort zählt nicht (Haupt-Faden 3- bis 8-mal über Budget). Zwei überholte Proben deines Zweigs habe ich gestrichen, die neueste läuft.
