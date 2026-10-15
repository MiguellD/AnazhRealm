#!/bin/bash
# 1510-k69d8: die Serie unter dem GPU-Schloss — (3) stehend Genesis und Dorf × Ego/Third je A1 B1 A2 B2 (stehen.sh; Dorf: K66-2, Δ gegen das Band als Szenen-Wechsel), dazu die Pose Tor nah
# (tor-nah.sh, gpu-bank je Seite), (1) gehend Dorfweg d1–d4 (K69-2: Einströmen und eingeschwungen), (2) gehend Wiese s1–s4.
# A = main nach dem K72-FF (Baum in a-baum.txt), B = integ-probe 015a3f74 (abab-p015 = Instrument). Wartet auf das Ende der
# K72-Serie und auf a-baum.txt. Gemessene Teile werden übersprungen.
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/k1510k69d8; R=/c/Users/micha/Desktop/AnazhRealm-OMEN; L=$H/fortschritt.log
until grep -q "SERIE FERTIG" $R/p3/k1510k72/fortschritt.log 2>/dev/null && [ -s $H/a-baum.txt ]; do sleep 30; done
A=$(cat $H/a-baum.txt); B=$R/abab-p015
. $R/p3/gpu-schloss.sh
schloss_nehmen "omen-abab k69d8"; trap 'schloss_loesen "omen-abab k69d8"' EXIT
echo "$(date +%T) SCHLOSS genommen A=$(git -C $A log -1 --format=%h) B=$(git -C $B log -1 --format=%h)" >> $L
bash $H/stehen.sh >> $H/stehen.out 2>&1
bash $H/tor-nah.sh >> $L 2>&1
gpu() { nvidia-smi --query-gpu=pstate,clocks.gr,temperature.gpu --format=csv,noheader; }
lauf() { echo "$(date +%T) $4 $1 $2 start [$(gpu)]" >> $L; bash $H/$4.sh $2 $3 >> $L 2>&1; echo "$(date +%T) $4 $1 $2 ende" >> $L; sleep 60; }
for ART in gehen-dorf gehen; do
  P=s; [ $ART = gehen-dorf ] && P=d
  for S in 1 2 3 4; do
    [ -f $H/$P$S/B-geht-2.txt ] && [ -f $H/$P$S/A-geht-2.txt ] && { echo "$ART $P$S schon da" >> $L; continue; }
    rm -rf $H/$ART
    if [ $((S % 2)) = 1 ]; then lauf $P$S A $A $ART; lauf $P$S B $B $ART; else lauf $P$S B $B $ART; lauf $P$S A $A $ART; fi
    mkdir -p $H/$P$S && mv $H/$ART/* $H/$P$S/
  done
done
echo "$(date +%T) SERIE FERTIG" >> $L
