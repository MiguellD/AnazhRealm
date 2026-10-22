#!/bin/bash
# 2210 Leib K1 Nachtrag: `werkbank latenz --verb gehen --sicht ego,third --proben 50` an der GTX am Kopf main e3dd2b67 (n2010-b2a),
# frischer Boot, Wiese (wie Staffel 2). Dazwischen in der K1-Serie: das Schloss wird enger gepollt (2 s), damit der nächste K1-Boot
# (15 s Pause nach dem Lösen) wartet. Schloss omen-2210-lg, Nachtruhe.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN; WT=$BASE/n2010-b2a; H=$BASE/p3/n2210/lg; mkdir -p $H/stand
STOPP=$(cygpath -w $BASE/p3/n2210/hieb/stopp.ps1); export WERKBANK_PORT=4490; W="node $WT/scripts/werkbank.cjs"
say() { echo "$(date +%T) $*" | tee -a $H/fortschritt.log; }
stopp() { powershell -NoProfile -ExecutionPolicy Bypass -File "$STOPP" >> $H/stopp.log 2>&1; sleep 3; }
nachtruhe() { while :; do hm=$((10#$(date +%H%M))); if [ $hm -ge 325 ] && [ $hm -lt 415 ]; then sleep 60; else break; fi; done; }
. $BASE/p3/gpu-schloss.sh
nachtruhe
until ! ci_wartet && mkdir "$GPU_SCHLOSS" 2>/dev/null; do sleep 2; done; printf '%s' omen-2210-lg > "$GPU_SCHLOSS/besitzer.txt"; ci_ruhe
say "schloss $(date +%T)"; stopp
mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $H/stand/ 2>/dev/null
(cd $WT && PORT=4312 node "$(cygpath -w $WT)\save-server.js" > $H/save.log 2>&1 &)
for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
(cd $WT && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 --ort wiese > $H/werkbank.log 2>&1 &)
for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $H/werkbank.log 2>/dev/null && break; sleep 5; done
say "start $(git -C $WT log -1 --format=%h) Änderungen[$(git -C $WT status --porcelain | wc -l)]"
$W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null 2>&1
$W fenster 1920 1080 > /dev/null 2>&1
$W umstellen --ort wiese --sicht ego > $H/umstellen.txt 2>&1
$W lauf 10 --ein 20 --ruhe 300 --regler voll --tiere frei > $H/lauf0.txt 2>&1
timeout 900 $W latenz --verb gehen --sicht ego,third --proben 50 --json $(cygpath -m $H/gehen.json) > $H/gehen.out 2>&1; E=$?
say "gehen EXIT=$E $(grep -E "^(ego|third)/gehen|LATENZ" $H/gehen.out | tr '\n' ' ' | cut -c1-400)"
$W stop > /dev/null 2>&1; stopp
mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $H/stand/ 2>/dev/null
schloss_loesen omen-2210-lg
say "ENDE Änderungen[$(git -C $WT status --porcelain | wc -l)]"
