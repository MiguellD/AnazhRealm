#!/bin/bash
# 1510-k10-abab: je Seite EIN Einström-Profil am Dorf (A auf 0,953/−0,304, B auf 0,690/0,723), unter dem GPU-Schloss.
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/k10abab; R=/c/Users/micha/Desktop/AnazhRealm-OMEN; L=$H/fortschritt.log
. $R/p3/gpu-schloss.sh; schloss_nehmen "omen-abab k10 profil"; trap 'schloss_loesen "omen-abab k10 profil"' EXIT
gpu() { nvidia-smi --query-gpu=pstate,clocks.gr,temperature.gpu --format=csv,noheader; }
p() { echo "$(date +%T) profil $1 start [$(gpu)]" >> $L; bash $H/gehen-profil-dorf.sh $1 $2 $3 $4 >> $L 2>&1; echo "$(date +%T) profil $1 ende" >> $L; sleep 60; }
[ -f $H/profil/profil-A1.txt ] || p A1 $R/abab-pbd3 0.953 -0.304
[ -f $H/profil/profil-B1.txt ] || p B1 $R/abab-p0bb 0.690 0.723
node $R/p3/k59/diff.cjs $H/profil 40 > $H/profil/vergleich.txt 2>&1
echo "$(date +%T) PROFIL FERTIG" >> $L
