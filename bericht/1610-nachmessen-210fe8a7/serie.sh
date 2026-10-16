#!/bin/bash
# 1610-Nachmessen B' = integ-probe 210fe8a7 (d5deed14 + F1 Foto-Kette + G1 Geräte-Grenzen + W1 Wiese farbig + B2 Horizont im
# Fern-Faden) gegen B = d5deed14 (A hier), unter dem GPU-Schloss, nach der a9e-Serie: (4) Wiese Ego Uhr 0,72 mit der GPU-Fehler-Linse
# (bild.sh; Soll 0 Absagen), (1) die GTX-Kalt-Zeile 3+3 (kalt.sh, B-Instrument, IDB leer), (2) gehend Wiese s1–s4 (CPU-Takt p95 und
# Spitzen: der Prüfer sah Einhäng-Spitzen von 7,9–13 ms je Scheibe), (3) stehend Wiese Ego und Genesis Third je 2+2 (stehen.sh).
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/k1610n; R=/c/Users/micha/Desktop/AnazhRealm-OMEN; L=$H/fortschritt.log
until grep -q "SERIE FERTIG" $R/p3/k1510a9e/fortschritt.log 2>/dev/null && [ -d $R/abab-p210 ]; do sleep 30; done
A=$R/abab-pd5d; B=$R/abab-p210
. $R/p3/gpu-schloss.sh
schloss_nehmen "omen-abab nachmessen"; trap 'schloss_loesen "omen-abab nachmessen"' EXIT
echo "$(date +%T) SCHLOSS genommen A=$(git -C $A log -1 --format=%h) B=$(git -C $B log -1 --format=%h)" >> $L
nachtruhe() { while :; do hm=$((10#$(date +%H%M))); if [ $hm -ge 325 ] && [ $hm -lt 415 ]; then sleep 60; else break; fi; done; }
gpu() { nvidia-smi --query-gpu=pstate,clocks.gr,temperature.gpu --format=csv,noheader; }
nachtruhe; bash $H/bild.sh >> $L 2>&1
nachtruhe; bash $H/kalt.sh
lauf() { nachtruhe; echo "$(date +%T) $4 $1 $2 start [$(gpu)]" >> $L; bash $H/$4.sh $2 $3 >> $L 2>&1; echo "$(date +%T) $4 $1 $2 ende" >> $L; sleep 60; }
for S in 1 2 3 4; do
  [ -f $H/s$S/B-geht-2.txt ] && [ -f $H/s$S/A-geht-2.txt ] && { echo "gehen s$S schon da" >> $L; continue; }
  rm -rf $H/gehen
  if [ $((S % 2)) = 1 ]; then lauf s$S A $A gehen; lauf s$S B $B gehen; else lauf s$S B $B gehen; lauf s$S A $A gehen; fi
  mkdir -p $H/s$S && mv $H/gehen/* $H/s$S/
done
bash $H/stehen.sh >> $H/stehen.out 2>&1
echo "$(date +%T) SERIE FERTIG" >> $L
