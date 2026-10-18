#!/bin/bash
# 1810 Ego-Sonde (Koordinator auftrag/1810-ego-probe): je Stand die Linse + Bündel-Mitschrift, zweimal, GPU-Schloss NUR um jeden Lauf.
#   sonde.sh  -> roh/<stand>-<n>.{json,log}, Zeile "EXIT=<n>" je Log; A = 4d5f1c0c (n1810-ego-a), B = 9b3acc1d (n1810-ego-b)
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
D=$BASE/p3/n1810/ego; mkdir -p $D/roh
. $BASE/p3/gpu-schloss.sh
for wt in n1810-ego-a n1810-ego-b; do
  node $BASE/koordination/auftrag/1810-ego-probe/mach-probe.cjs $BASE/$wt > $D/roh/mach-$wt.txt 2>&1
done
for N in a1 b1 a2 b2; do
  case $N in a*) WT=$BASE/n1810-ego-a; S=4d5f;; b*) WT=$BASE/n1810-ego-b; S=9b3a;; esac
  L=$D/roh/$S-$N.log
  schloss_nehmen omen-1710-n
  echo "$(date +%T) Schloss, Kopf $(git -C $WT rev-parse --short HEAD) gpu $(nvidia-smi --query-gpu=clocks.gr,temperature.gpu,pstate --format=csv,noheader)" > $L
  ( cd $WT && PROBE_AUS=$D/roh/$S-$N.json LINSE_GPU=karte EGO_SCHATTEN_PORT=7905 node scripts/_probe-ego-schatten.cjs ) >> $L 2>&1
  ec=$?
  schloss_loesen omen-1710-n
  echo "$(date +%T) Schloss geloest" >> $L; echo "EXIT=$ec" >> $L
  echo "$(date +%T) $S-$N EXIT=$ec" >> $D/fortschritt.log
  sleep 20
done
echo "SONDE ENDE" >> $D/fortschritt.log
