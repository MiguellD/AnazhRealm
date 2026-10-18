#!/bin/bash
# 1810 F6: echt-Batterie auf dem CI-Weg — jeder Schritt des Jobs `echt` (check.yml im Baum, Reihenfolge des Jobs), je Schritt
# CI=true CI_KLASSE=gpu LINSE_GPU=karte, Node 22 des Läufers vorn im PATH, npm_config_script_shell = Git-bash wie C:/actions-runner/.env.
# GPU-Schloss omen-1710-n um JEDEN Schritt. Aufruf: bash echt.sh <baum> <ausgabe-ordner> [gate …] (ohne gates: alle 21).
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN
WT=$1; OUT=$2; shift 2; mkdir -p $OUT; LOG=$OUT/fortschritt.log
N22DIR=/c/actions-runner/_work/_tool/node/22.23.3/x64
ALLE="gate:fern-ring gate:fernwald gate:streu-fern gate:luft-sicht gate:seam gate:schatten-bias gate:ziel-zensus gate:scatter-lod gate:analog-nah gate:foundry-crossfade gate:s4-impostor-workshop gate:foundry-impostor gate:freie-slots gate:pruefbuehne-licht gate:wasser-leben:bild gate:post-kette gate:portal-membran gate:ego-schatten gate:verdeckungs-abfrage gate:weltbild-frost:echt gate:gpu-fehler"
LISTE=${*:-$ALLE}
. $BASE/p3/gpu-schloss.sh
echo "$(date +%T) ECHT START baum=$WT kopf=$(git -C $WT rev-parse --short HEAD) node=$($N22DIR/node.exe --version)" >> $LOG
i=0
for G in $ALLE; do
  i=$((i+1)); case " $LISTE " in *" $G "*) ;; *) continue;; esac
  NAME=$(printf '%02d' $i)-$(echo ${G#gate:} | tr ':' '_')
  L=$OUT/$NAME.log
  schloss_nehmen omen-1710-n
  t0=$(date +%s)
  echo "$(date +%T) Schloss omen-1710-n, Schritt $i $G, Kopf $(git -C $WT rev-parse --short HEAD), gpu $(nvidia-smi --query-gpu=clocks.gr,temperature.gpu,pstate --format=csv,noheader)" > $L
  ( cd $WT && PATH="$N22DIR:$PATH" CI=true CI_KLASSE=gpu LINSE_GPU=karte npm_config_script_shell='C:\Program Files\Git\bin\bash.exe' npm run $G ) >> $L 2>&1
  ec=$?
  t1=$(date +%s)
  schloss_loesen omen-1710-n
  echo "$(date +%T) Schloss geloest" >> $L
  echo "EXIT=$ec DAUER=$((t1-t0))s SCHRITT=$i GATE=$G" >> $L
  echo "$(date +%T) $NAME EXIT=$ec DAUER=$((t1-t0))s" >> $LOG
  sleep 5
done
echo "$(date +%T) ECHT ENDE" >> $LOG
