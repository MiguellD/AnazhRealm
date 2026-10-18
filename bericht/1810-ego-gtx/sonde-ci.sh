#!/bin/bash
# 1810 Ego-Sonde wie der CI-Job echt: CI=true CI_KLASSE=gpu LINSE_GPU=karte, Node 22 des Läufers (actions/setup-node), an 4d5f1c0c, dreimal.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
D=$BASE/p3/n1810/ego; mkdir -p $D/roh
N22=/c/actions-runner/_work/_tool/node/22.23.3/x64/node.exe
. $BASE/p3/gpu-schloss.sh
WT=$BASE/n1810-ego-a
for N in c1 c2 c3; do
  L=$D/roh/4d5f-$N.log
  schloss_nehmen omen-1710-n
  echo "$(date +%T) Schloss, Kopf $(git -C $WT rev-parse --short HEAD), node $($N22 --version), gpu $(nvidia-smi --query-gpu=clocks.gr,temperature.gpu,pstate --format=csv,noheader)" > $L
  ( cd $WT && CI=true CI_KLASSE=gpu LINSE_GPU=karte PROBE_AUS=$D/roh/4d5f-$N.json EGO_SCHATTEN_PORT=7905 $N22 scripts/_probe-ego-schatten.cjs ) >> $L 2>&1
  ec=$?
  schloss_loesen omen-1710-n
  echo "$(date +%T) Schloss geloest" >> $L; echo "EXIT=$ec" >> $L
  echo "$(date +%T) 4d5f-$N (CI-Weg) EXIT=$ec" >> $D/fortschritt.log
  sleep 20
done
echo "SONDE-CI ENDE" >> $D/fortschritt.log
