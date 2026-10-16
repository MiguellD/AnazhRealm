#!/bin/bash
# FZ Teil 2: GTX A3 B3 A4 B4 (2+2 dazu), dann swiftshader (LINSE_GPU=software, ohne --echt) sA1 sB1 sA2 sB2 — der FZ-Befund (CI
# swiftshader 75–185 s gegen 47–78 s) auf DIESER Maschine mit derselben Linse. A = 1d831571, B = 27ae78bf.
R=/c/Users/micha/Desktop/AnazhRealm-OMEN; H=$R/p3/k1610fz; L=$H/fortschritt.log; A=$R/abab-i1d8; B=$R/abab-p27a
. $R/p3/gpu-schloss.sh
say() { echo "$(date +%T) $*" | tee -a $L; }
for N in A3 B3 A4 B4 sA1 sB1 sA2 sB2; do
  [ -f $H/$N.json ] && { say "$N steht schon"; continue; }
  case $N in A*|sA*) WT=$A;; *) WT=$B;; esac
  schloss_nehmen "omen-fz $N"; say "$N start"
  case $N in s*) (cd $WT && LINSE_GPU=software timeout 900 node scripts/diag-boot-stage.cjs --kalt --sek 400 --json $H/$N.json > $H/$N.txt 2>&1);;
             *) (cd $WT && timeout 600 node scripts/diag-boot-stage.cjs --kalt --echt --sek 180 --json $H/$N.json > $H/$N.txt 2>&1);; esac
  say "$N exit=$? $(grep -a 'KALT-ZEILE' $H/$N.txt | grep -o '— [^·]*· [^·]*' | head -1) $(grep -a 't(Weltbild)' $H/$N.txt | tr -s ' ' | cut -c1-80)"
  schloss_loesen "omen-fz $N"; sleep 30
done
say "FZ2 FERTIG"
