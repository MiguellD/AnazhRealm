#!/bin/bash
# 2210 Tiere K3 GTX-Hälfte (auftrag/2210-tier-gang-gtx.md): am Kopf integ-probe (n2010-b2a) (1) gate:tier-gang (Null-Renderer, Port 4449),
# (2) das Gang-Bild aus 10 m: start --echt · umstellen --ort genesis · gang-buehne.js · bild 2.4 91.2 14 2.4 89.6 24 --w 1280 --h 720 --wahl 0 --ziel gang.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN; WT=$BASE/n2010-b2a; OUT=$BASE/p3/n2210/tg; mkdir -p $OUT/stand
STOPP=$(cygpath -w $OUT/stopp.ps1); export WERKBANK_PORT=4490; W="node $WT/scripts/werkbank.cjs"
say() { echo "$(date +%T) $*" | tee -a $OUT/fortschritt.log; }
stopp() { powershell -NoProfile -ExecutionPolicy Bypass -File "$STOPP" >> $OUT/stopp.log 2>&1; sleep 3; }
nachtruhe() { while :; do hm=$((10#$(date +%H%M))); if [ $hm -ge 325 ] && [ $hm -lt 415 ]; then sleep 60; else break; fi; done; }
. $BASE/p3/gpu-schloss.sh
say "Kopf $(git -C $WT log -1 --format='%h') V$(node -p "require('$(cygpath -m $WT)/package.json').version") Änderungen[$(git -C $WT status --porcelain | wc -l)]"
cd $WT; cpu_ruhe
TIER_GANG_PORT=4449 npm run gate:tier-gang > $OUT/tier-gang.log 2>&1; echo "EXIT=$?" >> $OUT/tier-gang.log
say "tier-gang $(tail -1 $OUT/tier-gang.log) $(grep -E '^(✅|❌|⛔) (GRÜN|ROT)' $OUT/tier-gang.log | tail -1 | cut -c1-160)"
nachtruhe; schloss_nehmen omen-2210-t; stopp
mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $OUT/stand/ 2>/dev/null
(cd $WT && PORT=4312 node "$(cygpath -w $WT)\save-server.js" > $OUT/save.log 2>&1 &)
for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
(cd $WT && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 > $OUT/werkbank.log 2>&1 &)
for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $OUT/werkbank.log 2>/dev/null && break; sleep 5; done
$W umstellen --ort genesis > $OUT/umstellen.txt 2>&1
$W eval "$(cat $OUT/gang-buehne.js)" > $OUT/buehne.txt 2>&1
$W bild 2.4 91.2 14 2.4 89.6 24 --w 1280 --h 720 --wahl 0 --ziel gang --datei $(cygpath -m $OUT/gtx-k3-schritt-10m.png) > $OUT/bild.txt 2>&1; E=$?
$W stop > /dev/null 2>&1; stopp
mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $OUT/stand/ 2>/dev/null
schloss_loesen omen-2210-t
say "bild EXIT=$E $(tr -d '\n' < $OUT/buehne.txt | cut -c1-300)"
