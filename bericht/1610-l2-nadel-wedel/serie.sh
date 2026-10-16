#!/bin/bash
# 1610-L2 Nadel-Wedel (Auftrag 16.10. ~4 Uhr): A = 210fe8a7, B = integ-probe 0d6c8bc1 (= 210fe8a7 + L2). Wartet auf das Ende des
# Nachmessens (k1610n), dann unter dem GPU-Schloss: das Bild Wiese Ego 0,72/0,5 je Kopf mit der GPU-Fehler-Linse (Nachtrag zum
# Nachmessen (4) und L2 im Bild), dann stehend Wiese Ego, Wiese Third, Genesis Third je 2+2 (stehen.sh). Danach gibt es die
# Zweigipfel-Probe frei (p3/k1510zg/frei.txt).
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/k1610l2; R=/c/Users/micha/Desktop/AnazhRealm-OMEN; L=$H/fortschritt.log
until grep -q "SERIE FERTIG" $R/p3/k1610n/fortschritt.log 2>/dev/null; do sleep 30; done
. $R/p3/gpu-schloss.sh
schloss_nehmen "omen-abab l2"; trap 'schloss_loesen "omen-abab l2"' EXIT
echo "$(date +%T) SCHLOSS genommen A=$(git -C $R/abab-p210 log -1 --format=%h) B=$(git -C $R/abab-p0d6 log -1 --format=%h)" >> $L
nachtruhe() { while :; do hm=$((10#$(date +%H%M))); if [ $hm -ge 325 ] && [ $hm -lt 415 ]; then sleep 60; else break; fi; done; }
nachtruhe; bash $H/bild.sh >> $L 2>&1
bash $H/stehen.sh >> $H/stehen.out 2>&1
echo "$(date +%T) SERIE FERTIG" >> $L
schloss_loesen "omen-abab l2"; trap - EXIT
touch $R/p3/k1510zg/frei.txt; echo "$(date +%T) Zweigipfel freigegeben" >> $L
