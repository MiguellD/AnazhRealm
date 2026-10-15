#!/bin/bash
# 1510-k10-abab GEGENPROBE: A (main bd38fb16) geht auf SEINER Dorf-Achse (bis K10-6 Ostsüdost 0,953/−0,304) in sein Dorf,
# B (0bbee8fc) auf der Achse von K10-6 (0,690/0,723) in seins — je 4 Sitzungen A B · B A · A B · B A; VOR K62 (Auftrag 15.10.).
# Je Sitzung `<seite>-dorf.txt`: der Anker des eigenen Dorfs (settlementCells), belegt die Achse.
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/k10abab; R=/c/Users/micha/Desktop/AnazhRealm-OMEN; L=$H/fortschritt.log
A=$R/abab-pbd3; B=$R/abab-p0bb
. $R/p3/gpu-schloss.sh; schloss_nehmen "omen-abab k10 kontra"; trap 'schloss_loesen "omen-abab k10 kontra"' EXIT
gpu() { nvidia-smi --query-gpu=pstate,clocks.gr,temperature.gpu --format=csv,noheader; }
lauf() { if [ $2 = A ]; then W=$A; X="0.953 -0.304"; else W=$B; X="0.690 0.723"; fi
  echo "$(date +%T) kontra $1 $2 start [$(gpu)]" >> $L; bash $H/gehen-eigen.sh $2 $W $X >> $L 2>&1; echo "$(date +%T) kontra $1 $2 ende" >> $L; sleep 60; }
for S in 1 2 3 4; do
  [ -f $H/e$S/B-geht-2.txt ] && [ -f $H/e$S/A-geht-2.txt ] && continue
  rm -rf $H/gehen-eigen
  if [ $((S % 2)) = 1 ]; then lauf e$S A; lauf e$S B; else lauf e$S B; lauf e$S A; fi
  mkdir -p $H/e$S && mv $H/gehen-eigen/* $H/e$S/
done
echo "$(date +%T) KONTRA FERTIG" >> $L
