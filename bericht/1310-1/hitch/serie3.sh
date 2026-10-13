#!/bin/bash
# (Runde 3, ungedrosselt mit Bau-Liste) erzeugt _buendelReihe mehr oder andere Pipeline-Bauten? gate:hitch-telemetrie gedrosselt (2 Kerne) im Wechsel:
# M = integ-probe 01958457 (mit der Reihe), O = 01958457 ohne den Aufruf this._buendelReihe(scene), K = 3e5bd68a (K25, ohne OMEN).
B=/c/Users/micha/Desktop/AnazhRealm-OMEN; H=$B/p3/hitch; LOG=$H/fortschritt.log
say() { echo "$(date +%T) $*" | tee -a $LOG; }
for N in ${FOLGE:-M1 O1 K1 M2 O2 K2}; do
  case $N in M*) WT=ip-mit;; O*) WT=ip-ohne;; K*) WT=ip-k25;; esac
  t0=$(date +%s)
  cmd //c "$(cygpath -w $H/lauf3.cmd) $(cygpath -w $B/$WT) $(cygpath -w $H/$N.txt) $(cygpath -w $H/$N-bauliste.json)"
  t=$(( $(date +%s)-t0 ))
  say "$N $WT $t s · $(grep -a 'EXIT=' $H/$N.txt | tail -1) · $(grep -a 'Bundle-Neubau bei offener' $H/$N.txt | head -1 | cut -c1-80) · $(grep -ao 'am Ende [^·]*·[^·]*' $H/$N.txt | head -1 | cut -c1-140) · $(grep -aE '^(✅|❌) (GRÜN|ROT)' $H/$N.txt | tail -1 | cut -c1-60)"
done
say "SERIE ENDE"
