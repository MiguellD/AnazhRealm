#!/bin/bash
# 2210 Messschuld GTX M30 speicher.K1 Staffel 2 am Kopf b0b2d8ed (n2010-b2b): `echt-k1.cjs 20` (Host ohne save-server, 10 Tode am Schreib-Haken,
# 10 zufällig). Soll 2: Alter ≤ 10 s, 0 korrupt, 0 halbe Welten. Schloss, Vorfahrt Runner.Worker, Nachtruhe.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN; H=$BASE/p3/n2210/ms
say() { echo "$(date +%T) $*" | tee -a $H/fortschritt.log; }
worker() { tasklist //FI "IMAGENAME eq Runner.Worker.exe" 2>/dev/null | grep -qi Runner.Worker; }
while worker; do sleep 30; done
. $BASE/p3/gpu-schloss.sh; schloss_nehmen omen-2210-ms
say "M30 START Kopf $(git -C $BASE/n2010-b2b log -1 --format=%h)"
(cd $H && WT=C:/Users/micha/Desktop/AnazhRealm-OMEN/n2010-b2b OUT_DIR=$(cygpath -m $H/m30) timeout 3000 node echt-k1.cjs 20 gtx > $H/m30/echt-k1.out 2>&1); E=$?
schloss_loesen omen-2210-ms
say "M30 ENDE EXIT=$E $(grep ERGEBNIS $H/m30/echt-k1.out | cut -c1-400)"
