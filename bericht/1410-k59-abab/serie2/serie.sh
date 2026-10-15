#!/bin/bash
# 1410-k59-abab: die ganze Serie unter dem GPU-Schloss — erst stehend (stehen.sh: 4 Kombis × A1 B1 A2 B2), dann gehend an der
# Wiese (gehen.sh, 4 Sitzungen A B · B A · A B · B A). Gemessene Teile werden übersprungen.
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/k59abab2; R=/c/Users/micha/Desktop/AnazhRealm-OMEN
A=$R/abab-md2e; B=$R/abab-pc65; L=$H/fortschritt.log
. $R/p3/gpu-schloss.sh
schloss_nehmen "omen-abab k59"; trap 'schloss_loesen "omen-abab k59"' EXIT
echo "$(date +%T) SCHLOSS genommen" >> $L
bash $H/stehen.sh >> $H/stehen.out 2>&1
gpu() { nvidia-smi --query-gpu=pstate,clocks.gr,temperature.gpu --format=csv,noheader; }
lauf() { echo "$(date +%T) gehen s$1 $2 start [$(gpu)]" >> $L; bash $H/gehen.sh $2 $3 >> $L 2>&1; echo "$(date +%T) gehen s$1 $2 ende" >> $L; sleep 60; }
for S in 1 2 3 4; do
  [ -f $H/s$S/B-geht-2.txt ] && [ -f $H/s$S/A-geht-2.txt ] && { echo "gehen s$S schon da" >> $L; continue; }
  rm -rf $H/gehen
  if [ $((S % 2)) = 1 ]; then lauf $S A $A; lauf $S B $B; else lauf $S B $B; lauf $S A $A; fi
  mkdir -p $H/s$S && mv $H/gehen/* $H/s$S/
done
bash $H/prof.sh >> $L 2>&1
echo "$(date +%T) SERIE FERTIG" >> $L
