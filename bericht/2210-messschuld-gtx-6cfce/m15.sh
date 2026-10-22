#!/bin/bash
# 2210 Messschuld GTX M15 klang.K5 am Kopf b0b2d8ed (n2010-b2b): `diag-klang-zensus --takt --echt` (gehen, Fahrt, nachts), Soll p95 <= 0,2 ms.
# Schloss, Vorfahrt Runner.Worker, Nachtruhe.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN; WT=$BASE/n2010-b2b; H=$BASE/p3/n2210/ms; mkdir -p $H/m15
say() { echo "$(date +%T) $*" | tee -a $H/fortschritt.log; }
worker() { tasklist //FI "IMAGENAME eq Runner.Worker.exe" 2>/dev/null | grep -qi Runner.Worker; }
while worker; do sleep 30; done
. $BASE/p3/gpu-schloss.sh; schloss_nehmen omen-2210-ms
powershell -NoProfile -ExecutionPolicy Bypass -File "$(cygpath -w $H/stopp.ps1)" >> $H/stopp.log 2>&1; sleep 3
say "M15 START Kopf $(git -C $WT log -1 --format=%h)[$(git -C $WT status --porcelain | wc -l)]"
(cd $WT && timeout 1500 node scripts/diag-klang-zensus.cjs --takt --echt --json $(cygpath -m $H/m15/takt.json) > $H/m15/takt.out 2>&1); E=$?
schloss_loesen omen-2210-ms
say "M15 ENDE EXIT=$E $(grep -E '── |GRÜN|ROT' $H/m15/takt.out | tr '\n' ' ' | cut -c1-400)"
