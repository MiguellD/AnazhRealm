#!/bin/bash
# 1510-a9e-abab: das Integ-Urteil am Kopf d5deed14 gegen main 015a3f74, unter dem GPU-Schloss, nach der Boot-Fenster-Probe
# (p3/k1510ge): (1) gehend Dorfweg d1–d4 (A B · B A · A B · B A), (2) die GTX-Kalt-Zeile 3+3 (kalt.sh), (3) die D10-Zerlegung
# ffe0e956 gegen d5deed14 an Wiese Ego und Genesis Third (d10.sh), (4) stehend Wiese und Genesis × Ego/Third je 4+4 (stehen.sh,
# Nachtruhe 03:25–04:15 vor jedem Boot). Gemessene Teile werden übersprungen.
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/k1510a9e; R=/c/Users/micha/Desktop/AnazhRealm-OMEN; L=$H/fortschritt.log
until grep -q "FENSTER FERTIG" $R/p3/k1510ge/fortschritt.log 2>/dev/null; do sleep 30; done
A=$R/abab-p015; B=$R/abab-pd5d
. $R/p3/gpu-schloss.sh
schloss_nehmen "omen-abab a9e"; trap 'schloss_loesen "omen-abab a9e"' EXIT
echo "$(date +%T) SCHLOSS genommen A=$(git -C $A log -1 --format=%h) B=$(git -C $B log -1 --format=%h)" >> $L
nachtruhe() { while :; do hm=$((10#$(date +%H%M))); if [ $hm -ge 325 ] && [ $hm -lt 415 ]; then sleep 60; else break; fi; done; }
gpu() { nvidia-smi --query-gpu=pstate,clocks.gr,temperature.gpu --format=csv,noheader; }
lauf() { nachtruhe; echo "$(date +%T) $4 $1 $2 start [$(gpu)]" >> $L; bash $H/$4.sh $2 $3 >> $L 2>&1; echo "$(date +%T) $4 $1 $2 ende" >> $L; sleep 60; }
for S in 1 2 3 4; do
  [ -f $H/d$S/B-geht-2.txt ] && [ -f $H/d$S/A-geht-2.txt ] && { echo "gehen-dorf d$S schon da" >> $L; continue; }
  rm -rf $H/gehen-dorf
  if [ $((S % 2)) = 1 ]; then lauf d$S A $A gehen-dorf; lauf d$S B $B gehen-dorf; else lauf d$S B $B gehen-dorf; lauf d$S A $A gehen-dorf; fi
  mkdir -p $H/d$S && mv $H/gehen-dorf/* $H/d$S/
done
nachtruhe; bash $H/kalt.sh
nachtruhe; bash $H/d10.sh
bash $H/stehen.sh >> $H/stehen.out 2>&1
echo "$(date +%T) SERIE FERTIG" >> $L
