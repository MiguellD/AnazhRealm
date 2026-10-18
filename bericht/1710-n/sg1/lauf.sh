#!/bin/bash
# 1710-n Schritt 3: SG1 der Spielgang (spielgang 72676562) auf der GTX — mit Schloss omen-1710-n um den Lauf.
#   LINSE_GPU=karte node scripts/diag-v1-pfad.cjs --bilder <roh>/sg1 ; Ausgabe sg1.log, letzte Zeile EXIT=<n>
WT=/c/Users/micha/Desktop/AnazhRealm-OMEN/n1710-sg1
D=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/n1710/sg1
mkdir -p $D/bilder
. /c/Users/micha/Desktop/AnazhRealm-OMEN/p3/gpu-schloss.sh
schloss_nehmen omen-1710-n
echo "$(date +%T) Schloss omen-1710-n, Kopf $(git -C $WT rev-parse --short HEAD), gpu $(nvidia-smi --query-gpu=clocks.gr,temperature.gpu,pstate --format=csv,noheader)" > $D/sg1.log
t0=$(date +%s)
( cd $WT && LINSE_GPU=karte V1_PFAD_PORT=7903 node scripts/diag-v1-pfad.cjs --bilder $D/bilder ) >> $D/sg1.log 2>&1
ec=$?
schloss_loesen omen-1710-n
echo "$(date +%T) Schloss geloest, Dauer $(( $(date +%s) - t0 )) s" >> $D/sg1.log
echo "EXIT=$ec" >> $D/sg1.log
exit $ec
