#!/bin/bash
# 2310 Messschuld GTX M39 profiband.K4 am Kopf $WT: 4 frische Boots, Wiese Ego, je `werkbank lauf 30 --ein 20 --ruhe 300 --regler frei` und
# `haenger 60 --regler frei --tiere frei --wandern bahn`. Soll 1: ≥ 3 von 4 ohne Frame > 100 ms. Regler FREI (R8). Schloss je Boot, Vorfahrt
# Runner.Worker, Nachtruhe. Kopie von p3/n2210/ms/m34.sh.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN; WT=${WT:-$BASE/n2010-b2b}; H=$BASE/p3/n2310/ms; OUT=$H/m39-${TAG:-x}; mkdir -p $OUT/stand
STOPP=$(cygpath -w $H/stopp.ps1); export WERKBANK_PORT=4490; W="node $WT/scripts/werkbank.cjs"
say() { echo "$(date +%T) $*" | tee -a $H/fortschritt.log; }
stopp() { powershell -NoProfile -ExecutionPolicy Bypass -File "$STOPP" >> $H/stopp.log 2>&1; sleep 3; }
nachtruhe() { while :; do hm=$((10#$(date +%H%M))); if [ $hm -ge 325 ] && [ $hm -lt 415 ]; then sleep 60; else break; fi; done; }
worker() { tasklist //FI "IMAGENAME eq Runner.Worker.exe" 2>/dev/null | grep -qi Runner.Worker; }
vorfahrt() { local w=0; while worker; do [ $w = 0 ] && say "VORFAHRT: Runner.Worker läuft - warte"; w=1; sleep 30; done; }
. $BASE/p3/gpu-schloss.sh
say "M39-${TAG:-x} START Kopf $(git -C $WT log -1 --format=%h)[$(git -C $WT status --porcelain | wc -l)]"
for N in 1 2 3 4; do
  P=$OUT/b$N; [ -s $P-haenger.out ] && continue
  nachtruhe; vorfahrt; schloss_nehmen omen-2310-ms; stopp
  mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $OUT/stand/ 2>/dev/null
  (cd $WT && PORT=4312 node "$(cygpath -w $WT)\save-server.js" > $P-save.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
  rm -f $P-werkbank.log; (cd $WT && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 --ort wiese > $P-werkbank.log 2>&1 &)
  for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $P-werkbank.log 2>/dev/null && break; sleep 5; done
  $W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null 2>&1
  $W fenster 1920 1080 > /dev/null 2>&1
  $W umstellen --ort wiese --sicht ego > $P-umstellen.txt 2>&1
  $W lauf 30 --ein 20 --ruhe 300 --regler frei > $P-lauf.txt 2>&1
  $W haenger 60 --regler frei --tiere frei --wandern bahn --json $(cygpath -m $P-haenger.json) > $P-haenger.out 2>&1; E=$?
  $W stop > /dev/null 2>&1; stopp
  mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $OUT/stand/ 2>/dev/null
  schloss_loesen omen-2310-ms
  say "m39-${TAG:-x}-b$N haenger EXIT=$E $(head -3 $P-haenger.out | tr '\n' ' ' | cut -c1-260)"
  sleep 15
done
say "M39-${TAG:-x} ENDE"
