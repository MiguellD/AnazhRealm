#!/bin/bash
# 1510-buendel-abab: die ganze Serie unter dem GPU-Schloss — stehend (stehen.sh: Wiese, Genesis, Dorf × Ego/Third, je A1 B1 A2 B2),
# gehend an der Wiese (gehen.sh, s1–s4) und am Dorfweg (gehen-dorf.sh, d1–d4), je A B · B A · A B · B A, dann die GTX-KALT-Zeile
# (kalt.sh, je Seite 3). A = main 0bbee8fc (abab-p0bb), B = integ-probe e8a370ad (abab-pe8a = Instrument). Gemessene Teile werden
# übersprungen. Wartet auf das Ende der K62-Serie (p3/k62abab).
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/k1510b; R=/c/Users/micha/Desktop/AnazhRealm-OMEN
A=$R/abab-p0bb; B=$R/abab-pe8a; L=$H/fortschritt.log
until grep -q "SERIE FERTIG" $R/p3/k62abab/fortschritt.log 2>/dev/null; do sleep 30; done
. $R/p3/gpu-schloss.sh
schloss_nehmen "omen-abab buendel"; trap 'schloss_loesen "omen-abab buendel"' EXIT
echo "$(date +%T) SCHLOSS genommen" >> $L
bash $H/stehen.sh >> $H/stehen.out 2>&1
gpu() { nvidia-smi --query-gpu=pstate,clocks.gr,temperature.gpu --format=csv,noheader; }
lauf() { echo "$(date +%T) $4 $1 $2 start [$(gpu)]" >> $L; bash $H/$4.sh $2 $3 >> $L 2>&1; echo "$(date +%T) $4 $1 $2 ende" >> $L; sleep 60; }
for ART in gehen gehen-dorf; do
  P=s; [ $ART = gehen-dorf ] && P=d
  for S in 1 2 3 4; do
    [ -f $H/$P$S/B-geht-2.txt ] && [ -f $H/$P$S/A-geht-2.txt ] && { echo "$ART $P$S schon da" >> $L; continue; }
    rm -rf $H/$ART
    if [ $((S % 2)) = 1 ]; then lauf $P$S A $A $ART; lauf $P$S B $B $ART; else lauf $P$S B $B $ART; lauf $P$S A $A $ART; fi
    mkdir -p $H/$P$S && mv $H/$ART/* $H/$P$S/
  done
done
bash $H/kalt.sh
echo "$(date +%T) SERIE FERTIG" >> $L
