#!/bin/bash
# 1410 boden3: Gehend-ABAB boden-stufen 9e2f9c7c (B) gegen main 062ec357 (A); Sitzung 1, 3 = A B, Sitzung 2, 4 = B A (3+4 nachgelegt wegen Zeit-Trend)
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/k1410k; R=/c/Users/micha/Desktop/AnazhRealm-OMEN
A=$R/abab-m062; B=$R/abab-p9e2; L=$H/fortschritt.log
gpu() { nvidia-smi --query-gpu=pstate,clocks.gr,temperature.gpu --format=csv,noheader; }
lauf() { echo "$(date +%T) s$1 $2 start [$(gpu)]" >> $L; bash $H/gehen.sh $2 $3 >> $L 2>&1; echo "$(date +%T) s$1 $2 ende" >> $L; sleep 60; }
for S in 1 2 3 4; do
  [ -f $H/s$S/B-geht-2.txt ] && [ -f $H/s$S/A-geht-2.txt ] && { echo "s$S schon da" >> $L; continue; }
  rm -rf $H/gehen
  if [ $((S % 2)) = 1 ]; then lauf $S A $A; lauf $S B $B; else lauf $S B $B; lauf $S A $A; fi
  mkdir -p $H/s$S && mv $H/gehen/* $H/s$S/
done
echo "$(date +%T) SERIE FERTIG" >> $L
