#!/bin/bash
# B-Bündel kalt auf der GTX (Koordinator 16.10., Pflicht-OFFEN B): A = main 3caca1cd gegen B = integ 985a923b (V18.546.7: B2 Ankunft-
# Stufe, G2 Lade-Frist je Aufgabe, SO). EIN Instrument: die Linse von 985a923b mit dem Stations-Patch
# (p3/k1610bb/diag-boot-stage.omen.cjs: + Bild 10 s danach, Sprung-Zahl) in beiden Bäumen. Folge A1 B1 … A4 B4.
R=/c/Users/micha/Desktop/AnazhRealm-OMEN; H=$R/p3/k1610bb; L=$H/fortschritt.log; A=$R/abab-bba; B=$R/abab-bbb
. $R/p3/gpu-schloss.sh
say() { echo "$(date +%T) $*" | tee -a $L; }
gpu() { nvidia-smi --query-gpu=temperature.gpu,clocks.gr,pstate,clocks_throttle_reasons.active --format=csv,noheader 2>/dev/null | tr -d '\n'; }
say "BB START A=$(git -C $A log -1 --format=%h) B=$(git -C $B log -1 --format=%h) Linse=$(md5sum < $B/scripts/diag-boot-stage.cjs | cut -c1-8)/$(md5sum < $A/scripts/diag-boot-stage.cjs | cut -c1-8)"
for N in ${LAEUFE:-A1 B1 A2 B2 A3 B3 A4 B4}; do
  [ -f $H/$N.json ] && { say "$N steht schon"; continue; }
  case $N in A*) WT=$A;; B*) WT=$B;; esac
  schloss_nehmen "omen-bb $N"; say "$N start gpu[$(gpu)]"
  (cd $WT && timeout 600 node scripts/diag-boot-stage.cjs --kalt --echt --sek 180 --json $H/$N.json --bild $H/$N.png --bild2 $H/$N-10s.png --nach 10 > $H/$N.txt 2>&1); ec=$?
  say "$N exit=$ec gpu[$(gpu)] $(grep -a 't(Weltbild)' $H/$N.txt | tr -s ' ' | cut -c1-80) $(grep -aE 'halbe Weltbild|Bild der Ankunft|s danach' $H/$N.txt | tr -s ' ' | cut -c1-140 | tr '\n' ' ')"
  schloss_loesen "omen-bb $N"; sleep 45
done
say "BB FERTIG"
