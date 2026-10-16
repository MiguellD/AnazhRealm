#!/bin/bash
# FZ (Koordinator 16.10., B-Verdacht aus wand-zeit fada5603): Weltbild-Zeit kalt auf der GTX, A = 1d831571 (27ae78bf^, integ vor dem
# FW-Merge) gegen B = 27ae78bf (FW: stamm/07.js:1420/1467 „wer auf seine Pipeline wartet, läuft durch keinen Knoten“), je Seite
# `diag-boot-stage --kalt --echt --sek 180` aus ihrem eigenen Baum (die Kalt-Zeile ist an beiden gleich), Folge A1 B1 A2 B2.
R=/c/Users/micha/Desktop/AnazhRealm-OMEN; H=$R/p3/k1610fz; L=$H/fortschritt.log; A=$R/abab-i1d8; B=$R/abab-p27a
. $R/p3/gpu-schloss.sh
say() { echo "$(date +%T) $*" | tee -a $L; }
gpu() { nvidia-smi --query-gpu=temperature.gpu,clocks.gr,pstate,clocks_throttle_reasons.active --format=csv,noheader 2>/dev/null | tr -d '\n'; }
say "FZ START A=$(git -C $A log -1 --format=%h) B=$(git -C $B log -1 --format=%h)"
for N in ${LAEUFE:-A1 B1 A2 B2}; do
  [ -f $H/$N.json ] && { say "$N steht schon"; continue; }
  case $N in A*) WT=$A;; B*) WT=$B;; esac
  schloss_nehmen "omen-fz $N"
  say "$N start gpu[$(gpu)]"
  (cd $WT && timeout 600 node scripts/diag-boot-stage.cjs --kalt --echt --sek 180 --json $H/$N.json > $H/$N.txt 2>&1); ec=$?
  say "$N exit=$ec gpu[$(gpu)] $(grep -a 't(Weltbild)' $H/$N.txt | tr -s ' ' | cut -c1-120)"
  schloss_loesen "omen-fz $N"; sleep 45
done
say "FZ FERTIG"
