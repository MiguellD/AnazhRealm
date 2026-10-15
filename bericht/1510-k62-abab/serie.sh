#!/bin/bash
# 1510-k62-abab: ENTSCHEIDUNGS-Messung K62 (Pass-Bündel) — stehend Wiese/Genesis × Ego/Third je A1 B1 A2 B2, dazu das Profil
# Genesis Third (A1 B1 B2 A2); unter dem GPU-Schloss, NACH der K10-Serie (wartet auf ihr Ende, damit die Ordnung hält).
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/k62abab; R=/c/Users/micha/Desktop/AnazhRealm-OMEN; L=$H/fortschritt.log
until grep -q "SERIE FERTIG" $R/p3/k10abab/fortschritt.log 2>/dev/null; do sleep 30; done
. $R/p3/gpu-schloss.sh
schloss_nehmen "omen-abab k62"; trap 'schloss_loesen "omen-abab k62"' EXIT
echo "$(date +%T) SCHLOSS genommen" >> $L
KOMBIS="w-ego w-third g-ego g-third" bash $H/stehen.sh >> $H/stehen.out 2>&1
bash $H/prof.sh >> $L 2>&1
echo "$(date +%T) SERIE FERTIG" >> $L
