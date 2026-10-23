#!/bin/bash
# 2310 Station tiere.K1 Herde am Zug-6-Kandidaten (n2010-b2b, 6579e8f4): `werkbank start --echt --port 4490 --ort wiese`, `fenster 1920 1080`,
# dann `diag-kreatur-takt.cjs --proben herde --werkbank 4490` (echter Wurf, scheue Hirsche, wandernd und fliehend). 1 Boot, Schloss, Vorfahrt.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN; WT=$BASE/n2010-b2b; H=$BASE/p3/n2210/zug6; OUT=$H/herde; mkdir -p $OUT/stand
STOPP=$(cygpath -w $H/stopp.ps1); export WERKBANK_PORT=4490; W="node $WT/scripts/werkbank.cjs"
say() { echo "$(date +%T) $*" | tee -a $H/fortschritt.log; }
stopp() { powershell -NoProfile -ExecutionPolicy Bypass -File "$STOPP" >> $H/stopp.log 2>&1; sleep 3; }
nachtruhe() { while :; do hm=$((10#$(date +%H%M))); if [ $hm -ge 325 ] && [ $hm -lt 415 ]; then sleep 60; else break; fi; done; }
worker() { tasklist //FI "IMAGENAME eq Runner.Worker.exe" 2>/dev/null | grep -qi Runner.Worker; }
. $BASE/p3/gpu-schloss.sh
nachtruhe; while worker; do sleep 30; done; schloss_nehmen omen-2310-herde; stopp
say "HERDE START Kopf $(git -C $WT log -1 --format=%h)[$(git -C $WT status --porcelain | wc -l)]"
mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $OUT/stand/ 2>/dev/null
(cd $WT && PORT=4312 node "$(cygpath -w $WT)\save-server.js" > $OUT/save.log 2>&1 &)
for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
rm -f $OUT/werkbank.log; (cd $WT && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 --ort wiese > $OUT/werkbank.log 2>&1 &)
for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $OUT/werkbank.log 2>/dev/null && break; sleep 5; done
$W fenster 1920 1080 > /dev/null 2>&1
(cd $WT && timeout 900 node scripts/diag-kreatur-takt.cjs --proben herde --werkbank 4490 > $OUT/herde.out 2>&1); E=$?
$W stop > /dev/null 2>&1; stopp
mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $OUT/stand/ 2>/dev/null
schloss_loesen omen-2310-herde
say "HERDE ENDE EXIT=$E $(grep -iE "kohäsion|kohaesion|herde|ROT|GRÜN" $OUT/herde.out | tail -6 | tr '\n' ' ' | cut -c1-500)"
