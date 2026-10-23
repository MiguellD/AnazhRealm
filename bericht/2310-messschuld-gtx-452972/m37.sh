#!/bin/bash
# 2310 Messschuld GTX M37 speicher.K1 (GTX-Seite für die 2) am Kopf $WT: `echt-k1.cjs 20` (Host ohne save-server; 9 Tode am Schreib-Haken,
# 9 zufällig, 2 im Dorf-Erwachen: Zyklus 1 hart im Gang, Zyklus 2 am IDB-Schreiben eines saveState im Gang). Soll: Alter ≤ 10 s, 0 korrupt,
# 0 halbe Welten, auch beim Tod im Erwachen. Schloss, Vorfahrt Runner.Worker, Nachtruhe. Kopie von p3/n2210/ms/m30.sh.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN; H=$BASE/p3/n2310/ms; WT=${WT:-$BASE/n2010-b2b}; mkdir -p $H/m37
say() { echo "$(date +%T) $*" | tee -a $H/fortschritt.log; }
worker() { tasklist //FI "IMAGENAME eq Runner.Worker.exe" 2>/dev/null | grep -qi Runner.Worker; }
nachtruhe() { while :; do hm=$((10#$(date +%H%M))); if [ $hm -ge 325 ] && [ $hm -lt 415 ]; then sleep 60; else break; fi; done; }
nachtruhe; while worker; do sleep 30; done
. $BASE/p3/gpu-schloss.sh; schloss_nehmen omen-2310-ms
say "M37 START Kopf $(git -C $WT log -1 --format=%h)[$(git -C $WT status --porcelain | wc -l)]"
(cd $H && WT=$(cygpath -m $WT) OUT_DIR=$(cygpath -m $H/m37) timeout 3000 node echt-k1.cjs 20 gtx > $H/m37/echt-k1.out 2>&1); E=$?
schloss_loesen omen-2310-ms
say "M37 ENDE EXIT=$E $(grep ERGEBNIS $H/m37/echt-k1.out | cut -c1-500)"
