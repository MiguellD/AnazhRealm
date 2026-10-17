#!/bin/bash
# Ankunfts-Menge: abab-am (cd20288c = 985a923b + streu-rang, Stationslinse v2 + Bäcker-Messung) kalt --echt, M1–M4
R=/c/Users/micha/Desktop/AnazhRealm-OMEN; H=$R/p3/k1610am; L=$H/fortschritt.log; WT=$R/abab-am
. $R/p3/gpu-schloss.sh
for N in ${LAEUFE:-M1 M2 M3 M4}; do
  [ -f $H/$N.json ] && continue
  schloss_nehmen "omen-menge $N"
  (cd $WT && timeout 600 node scripts/diag-boot-stage.cjs --kalt --echt --sek 180 --json $H/$N.json > $H/$N.txt 2>&1); ec=$?
  echo "$(date +%T) $N exit=$ec $(grep -a 't(Weltbild)' $H/$N.txt | tr -s ' ' | cut -c1-70)" >> $L
  schloss_loesen "omen-menge $N"; sleep 30
done
echo "$(date +%T) MENGE FERTIG" >> $L
