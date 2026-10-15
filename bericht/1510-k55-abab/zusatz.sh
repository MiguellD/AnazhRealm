#!/bin/bash
# 1510-k55-abab: Genesis Third zwei Boots je Seite mehr (A3 B3 A4 B4) — 2σ hing an zwei gleichen A-Werten (6,2 · 6,2)
. /c/Users/micha/Desktop/AnazhRealm-OMEN/p3/gpu-schloss.sh
schloss_nehmen "omen-abab k55 zusatz"; trap 'schloss_loesen "omen-abab k55 zusatz"' EXIT
KOMBIS=g-third LAEUFE="A3 B3 A4 B4" bash /c/Users/micha/Desktop/AnazhRealm-OMEN/p3/k55abab/stehen.sh
echo ZUSATZ-ENDE
