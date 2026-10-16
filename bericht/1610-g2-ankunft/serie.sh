#!/bin/bash
# G2 Ankunft kalt auf der GTX (Koordinator 16.10., Pflicht-OFFEN B): A = cee33f91 (merge-base von 2d54d8b0 und integ-probe) gegen
# B = 2d54d8b0 (ankunft-ofen [ci voll]: Ort-Wahl und Slot-Zug rechnen unter dem Ladeschirm bis `_ladeFrist`). EIN Instrument: die
# Linse von B (+ Ort-Wahl/Dorf-Kosten) liegt in beiden Bäumen. `diag-boot-stage --kalt --echt --sek 180 --bild`, Folge A1 B1 … A4 B4.
R=/c/Users/micha/Desktop/AnazhRealm-OMEN; H=$R/p3/k1610g2; L=$H/fortschritt.log; A=$R/abab-g2a; B=$R/abab-g2b
. $R/p3/gpu-schloss.sh
say() { echo "$(date +%T) $*" | tee -a $L; }
gpu() { nvidia-smi --query-gpu=temperature.gpu,clocks.gr,pstate,clocks_throttle_reasons.active --format=csv,noheader 2>/dev/null | tr -d '\n'; }
say "G2 START A=$(git -C $A log -1 --format=%h) B=$(git -C $B log -1 --format=%h) Linse=$(md5sum < $B/scripts/diag-boot-stage.cjs | cut -c1-8)/$(md5sum < $A/scripts/diag-boot-stage.cjs | cut -c1-8)"
for N in ${LAEUFE:-A1 B1 A2 B2 A3 B3 A4 B4}; do
  [ -f $H/$N.json ] && { say "$N steht schon"; continue; }
  case $N in A*) WT=$A;; B*) WT=$B;; esac
  schloss_nehmen "omen-g2 $N"; say "$N start gpu[$(gpu)]"
  (cd $WT && timeout 600 node scripts/diag-boot-stage.cjs --kalt --echt --sek 180 --json $H/$N.json --bild $H/$N.png > $H/$N.txt 2>&1); ec=$?
  say "$N exit=$ec gpu[$(gpu)] $(grep -a 't(Weltbild)' $H/$N.txt | tr -s ' ' | cut -c1-80) $(grep -a 'halbe Weltbild\|Bild der Ankunft' $H/$N.txt | tr -s ' ' | cut -c1-120 | tr '\n' ' ')"
  schloss_loesen "omen-g2 $N"; sleep 45
done
say "G2 FERTIG"
