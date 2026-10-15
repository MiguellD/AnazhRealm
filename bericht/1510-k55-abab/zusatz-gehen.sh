#!/bin/bash
# 1510-k55-abab: zwei Geh-Sitzungen mehr (s5 A B, s6 B A) — s2 B lag durchgehend +3 ms CPU p50 (auch im Stand), Maschinen-Zustand
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/k55abab; R=/c/Users/micha/Desktop/AnazhRealm-OMEN
A=$R/abab-m340; B=$R/abab-pbd3; L=$H/fortschritt.log
. $R/p3/gpu-schloss.sh; schloss_nehmen "omen-abab k55 gehen"; trap 'schloss_loesen "omen-abab k55 gehen"' EXIT
gpu() { nvidia-smi --query-gpu=pstate,clocks.gr,temperature.gpu --format=csv,noheader; }
lauf() { echo "$(date +%T) gehen s$1 $2 start [$(gpu)]" >> $L; bash $H/gehen.sh $2 $3 >> $L 2>&1; echo "$(date +%T) gehen s$1 $2 ende" >> $L; sleep 60; }
for S in 5 6; do
  [ -f $H/s$S/B-geht-2.txt ] && [ -f $H/s$S/A-geht-2.txt ] && continue
  rm -rf $H/gehen
  if [ $((S % 2)) = 1 ]; then lauf $S A $A; lauf $S B $B; else lauf $S B $B; lauf $S A $A; fi
  mkdir -p $H/s$S && mv $H/gehen/* $H/s$S/
done
echo "$(date +%T) ZUSATZ-GEHEN ENDE" >> $L
