#!/bin/bash
# bild-kette.sh — nach der Radeon-Messung von z294: main und die fünf wartenden Abgaben je in EINER echten Welt, nacheinander unter dem GPU-Schloss
W=/tmp/claude/w3; O=$W/bp/kette.out; G=/c/Users/micha/AnazhRealm-profiband/artifacts/profiband/werkzeug/gpu-lauf.sh
until grep -q "MESSUNG FERTIG" $W/mess-z294.out 2>/dev/null; do sleep 20; done
echo "$(date +%H:%M:%S) Radeon frei — Bilder" >> $O
for x in "main bp-main 7801" "ljf bp-ljf 7811" "lod hz-lod 7821" "lb bp-lb 7831" "ir bp-ir 7841" "lu bp-lu 7851"; do set -- $x
  GPU_LAUF_MAX_S=1500 bash $G bild-$1 bash $W/bildpaar.sh $1 $W/$2 $3 $W/bp/s-$1.txt >> $O 2>&1
  echo "$(date +%H:%M:%S) [$1] Exit $?" >> $O
done
echo "$(date +%H:%M:%S) BILDER BEREIT" >> $O
