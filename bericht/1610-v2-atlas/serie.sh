#!/bin/bash
# 1610-V2 (Auftrag 16.10. ~12 Uhr des Koordinators): B = integ-probe 5fb8eb1c (f6fa9f63 T2 + M2 + V2: Karten-, Bogen- und Ziel-Atlas
# wachsen über `_texturAbschied`, der 16-Schicht-Zwilling `tex:karte-albedo` fällt) gegen A = main 27ae78bf, stehend Wiese und Genesis
# je Ego und Third 2+2, VRAM je Klasse. Wartet auf das Ende der Bau-Zerlegung, unter dem GPU-Schloss. Danach prägt ratschen.sh die
# GTX-Ratschen an 5fb8eb1c (abbrechbar mit kein-mint.txt, falls B langsamer ist).
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/k1610v2; R=/c/Users/micha/Desktop/AnazhRealm-OMEN; L=$H/fortschritt.log
until grep -q "BAU-SPLIT FERTIG" $R/p3/k1610bau/fortschritt.log 2>/dev/null; do sleep 30; done
. $R/p3/gpu-schloss.sh
schloss_nehmen "omen-abab v2"; trap 'schloss_loesen "omen-abab v2"' EXIT
echo "$(date +%T) SCHLOSS genommen A=$(git -C $R/abab-p27a log -1 --format=%h) B=$(git -C $R/abab-p5fb log -1 --format=%h)" >> $L
bash $H/stehen.sh >> $H/stehen.out 2>&1
echo "$(date +%T) SERIE FERTIG" >> $L
