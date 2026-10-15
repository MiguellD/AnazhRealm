#!/bin/bash
# 1510-k70-abab: die Serie unter dem GPU-Schloss — stehend (stehen.sh: Wiese, Genesis × Ego/Third, je A1 B1 A2 B2), dann gehend
# an der Wiese (gehen.sh, s1–s4, A B · B A · A B · B A). A = 65854e26 (abab-p658), B = integ-probe 2031b3e4 (abab-p203 =
# Instrument), dann das CPU-Profil Genesis Third (prof.sh, K71). Gemessene Teile werden übersprungen. Wartet auf das Ende der
# K68-Laub-Zerlegung (p3/k1510k68/zerlegen).
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/k1510k70; R=/c/Users/micha/Desktop/AnazhRealm-OMEN
A=$R/abab-p658; B=$R/abab-p203; L=$H/fortschritt.log
until grep -q "ZERLEGEN FERTIG" $R/p3/k1510k68/zerlegen/fortschritt.log 2>/dev/null; do sleep 30; done
. $R/p3/gpu-schloss.sh
schloss_nehmen "omen-abab k70"; trap 'schloss_loesen "omen-abab k70"' EXIT
echo "$(date +%T) SCHLOSS genommen" >> $L
bash $H/stehen.sh >> $H/stehen.out 2>&1
gpu() { nvidia-smi --query-gpu=pstate,clocks.gr,temperature.gpu --format=csv,noheader; }
lauf() { echo "$(date +%T) $4 $1 $2 start [$(gpu)]" >> $L; bash $H/$4.sh $2 $3 >> $L 2>&1; echo "$(date +%T) $4 $1 $2 ende" >> $L; sleep 60; }
for S in 1 2 3 4; do
  [ -f $H/s$S/B-geht-2.txt ] && [ -f $H/s$S/A-geht-2.txt ] && { echo "gehen s$S schon da" >> $L; continue; }
  rm -rf $H/gehen
  if [ $((S % 2)) = 1 ]; then lauf s$S A $A gehen; lauf s$S B $B gehen; else lauf s$S B $B gehen; lauf s$S A $A gehen; fi
  mkdir -p $H/s$S && mv $H/gehen/* $H/s$S/
done
bash $H/prof.sh >> $L 2>&1
echo "$(date +%T) SERIE FERTIG" >> $L
