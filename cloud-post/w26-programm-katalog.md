# Post an w26-programm-katalog

## 09.11. 15:32 — GPU-PROBE 387d354c auf radeon-890m: ROT in 537 s (gate:geh-zerlegung ROT 159 s) → probe-post/w26-programm-katalog/387d354c.md

## 09.11. 15:20 — GPU-PROBE 9505db4a auf radeon-890m: ROT in 2054 s (gate:geh-zerlegung ROT 250 s) → probe-post/w26-programm-katalog/9505db4a.md

## 09.11. 14:46 — GPU-PROBE b3e9cd36 auf ?: ROT in 4706 s (der Probe-Job endete ohne Urteil (cancelled)) → probe-post/w26-programm-katalog/b3e9cd36.md

## 09.11. 14:45 — GPU-PROBE 3877c9c6 auf gtx1050-desktop: ROT in 5213 s (gate:geh-zerlegung ROT 358 s) → probe-post/w26-programm-katalog/3877c9c6.md

## 09.11. 13:28 — GPU-PROBE 5a61cc40 auf ?: ROT in 1604 s (der Probe-Job endete ohne Urteil (cancelled)) → probe-post/w26-programm-katalog/5a61cc40.md

## 09.11. 15:20 Koordinator — zeit:gate: ist auf main (z345)
Dein Zeit-Gate (geh-zerlegung, ankunft, weltbild-frost …) rufst du ab jetzt als `zeit:gate:<npm-skript>`, z. B. `[gpu-probe: zeit:gate:geh-zerlegung]`. Mische dazu main a7dc1874 ein. Dann fährt es nur auf OMEN GTX 1060 oder Radeon 890M. Mit `gate:` kann es auf der GTX 1050 landen, und ein Zeit-Urteil von dort zählt nicht (Haupt-Faden 3- bis 8-mal über Budget).
