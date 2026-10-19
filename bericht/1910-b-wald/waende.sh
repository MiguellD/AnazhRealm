#!/bin/bash
# 1910 B-Wald: die lokalen Wände am Zweig b-wald, seriell, jede mit ihrem Exit (Lehre 9). cpu_ruhe vor jeder.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN; WT=$BASE/n1910-bwald; OUT=$BASE/p3/n1910/bwald; L=$OUT/waende.log
. $BASE/p3/gpu-schloss.sh
cd $WT
wand() { local n="$1"; shift; cpu_ruhe; echo "$(date +%T) START $n" >> $L; "$@" > $OUT/wand-${n//[: ]/_}.log 2>&1; local ec=$?; echo "$(date +%T) $n EXIT=$ec" >> $L; }
echo "$(date +%T) WÄNDE Kopf=$(git log -1 --format=%h) Status: $(git status --porcelain | wc -l) Dateien offen" >> $L
wand check npm run check
wand lint npm run lint
wand gate:worker-dichte npm run gate:worker-dichte
wand playtest:fast npm run playtest:fast
wand diag-atlas node scripts/diag-atlas.cjs --check
wand gate:ankunft npm run gate:ankunft
echo "$(date +%T) WÄNDE ENDE" >> $L
