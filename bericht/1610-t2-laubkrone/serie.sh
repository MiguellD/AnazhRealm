#!/bin/bash
# 1610-T2 (Auftrag 16.10. ~9 Uhr des Koordinators): die FW-Probe an 27ae78bf lief schon zu Ende — angehängt: f6fa9f63 (= 27ae78bf + T2
# Laubkrone aus dem Standort) stehend 2+2 gegen 27ae78bf (die Kette: A trägt L2 + B3 + FW, B dazu nur T2), Wiese Ego, Wiese Third,
# Genesis Third; je Stand die baum-Klasse (Befehle, Dreiecke, f:eiche/f:birke/f:buche L0/L1). Unter dem GPU-Schloss.
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/k1610t2; R=/c/Users/micha/Desktop/AnazhRealm-OMEN; L=$H/fortschritt.log
. $R/p3/gpu-schloss.sh
schloss_nehmen "omen-abab t2"; trap 'schloss_loesen "omen-abab t2"' EXIT
echo "$(date +%T) SCHLOSS genommen A=$(git -C $R/abab-p27a log -1 --format=%h) B=$(git -C $R/abab-pf6f log -1 --format=%h)" >> $L
bash $H/stehen.sh >> $H/stehen.out 2>&1
echo "$(date +%T) SERIE FERTIG" >> $L
