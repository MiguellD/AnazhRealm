#!/bin/bash
# bild-nach.sh — nach der Bild-Kette: die Körper-Bilder von main in der dritten Person (die Kette schoss sie in Ego, ohne Leib)
W=/tmp/claude/w3; O=$W/bp/kette.out; G=/c/Users/micha/AnazhRealm-profiband/artifacts/profiband/werkzeug/gpu-lauf.sh
until grep -q "BILDER BEREIT" $O 2>/dev/null; do sleep 5; done
GPU_LAUF_MAX_S=900 bash $G bild-main2 bash $W/bildpaar.sh main2 $W/bp-main 7861 $W/bp/s-main2.txt >> $O 2>&1
echo "$(date +%H:%M:%S) [main2] Exit $? — KÖRPER-BILDER BEREIT" >> $O
