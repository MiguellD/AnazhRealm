#!/bin/bash
# Ankunft kalt GTX (Koordinator 17.10., PFLICHT-OFFEN B): integ f829df97 (abab-ak1), Linse des Kopfs + Stations-Patch (CPU-Profil 0,5 ms,
# Proben menge-probe.js), --kalt --echt (leeres Profil, echte GPU, 1920×1080) --bild, K1–K4.
R=/c/Users/micha/Desktop/AnazhRealm-OMEN; H=$R/p3/k1710ak; L=$H/fortschritt.log; WT=$R/abab-ak1
. $R/p3/gpu-schloss.sh
for N in ${LAEUFE:-K1 K2 K3 K4}; do
  [ -f $H/$N.json ] && continue
  schloss_nehmen "omen-ankunft $N"
  (cd $WT && timeout 600 node scripts/diag-boot-stage.cjs --kalt --echt --sek 180 --json $H/$N.json --bild $H/$N.png > $H/$N.txt 2>&1); ec=$?
  echo "$(date +%T) $N exit=$ec $(grep -a 't(Weltbild)\|t(Kontrolle)' $H/$N.txt | tr -s ' ' | tr '\n' ' ' | cut -c1-160)" >> $L
  schloss_loesen "omen-ankunft $N"; sleep 30
done
echo "$(date +%T) ANKUNFT FERTIG" >> $L
