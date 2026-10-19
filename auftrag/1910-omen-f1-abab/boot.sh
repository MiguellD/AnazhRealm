#!/bin/bash
# boot.sh <worktree> <name> : ein Boot der Fahr-Probe (Wiese, Tiere frei, GT im Kreis in Third)
WT=$1; N=$2; R=${FAHRT_AUS:-$(cd "$(dirname "$0")" && pwd)}   # Ausgabe + aufsitzen.js/pruef.js (Radeon lief in Temp/claude/f1-rig/abab)
cd "$WT" || exit 9
export WERKBANK_PORT=7979
(node scripts/werkbank.cjs start --port 7979 > $R/$N-start.log 2>&1 &)
until grep -q "WERKBANK bereit\|Error" $R/$N-start.log; do sleep 2; done
node scripts/werkbank.cjs fenster 1280 720 > /dev/null 2>&1
node scripts/werkbank.cjs umstellen --ort wiese > $R/$N-umstellen.log 2>&1
node scripts/werkbank.cjs lauf 5 --ein 30 --ruhe 300 --tiere frei > $R/$N-ein.json 2>&1
node scripts/werkbank.cjs eval "$(cat $R/aufsitzen.js)" > $R/$N-auf.json 2>&1
node scripts/werkbank.cjs lauf 15 --ein 5 --tiere frei > $R/$N-lauf.json 2>&1
node scripts/werkbank.cjs eval "$(cat $R/pruef.js)" > $R/$N-pruef.json 2>&1
node scripts/werkbank.cjs stop > /dev/null 2>&1
sleep 3
