#!/bin/bash
# 1910 F1 der lange Ablauf als EIN Hintergrund-Skript: 1. Fahrt-ABAB 4+4 (fahrt.sh, Werkzeug der Radeon), 2. Lauf-ABAB
# (serie.sh: stehend 4 Zellen je 4+4, gehend 4 Zellen je 4+4), danach die Auswertungen (CPU-Ruhe vorher).
F=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/n1910/f1; LOG=$F/ablauf.log
say() { echo "$(date +%T) $*" >> $LOG; }
say "ABLAUF START"
bash $F/fahrt.sh > $F/fahrt.out 2>&1; ec=$?
say "FAHRT fertig (exit $ec)"
bash $F/serie.sh > $F/serie.out 2>&1; ec=$?
say "SERIE fertig (exit $ec)"
. /c/Users/micha/Desktop/AnazhRealm-OMEN/p3/gpu-schloss.sh; cpu_ruhe
node $F/fahrt-auswertung.cjs $F/fahrt > /dev/null 2>&1
for k in w-ego w-third g-ego g-third; do node $F/auswertung-stehen.cjs $F/stehen $k > /dev/null 2>&1; node $F/auswertung-gehen.cjs $F/gehen $k > /dev/null 2>&1; done
node $F/zellen.cjs $F > /dev/null 2>&1
say "AUSWERTUNG fertig"
say "ABLAUF ENDE"
