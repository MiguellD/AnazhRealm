#!/bin/bash
# Leib K1 Staffel 2 GTX an main f3865c80 (n2010-b2b): `werkbank latenz --proben 50` je Verb × Sicht als EIGENER Aufruf unter timeout 600
# (der Sammel-Lauf hing 06:48 ohne Ausgabe): hieb (am Kopf), springen und einsteigen (latenz-patch2.cjs, danach checkout; der GT per
# latenz-gt.js). Wiese, EIN Boot. Schloss omen-2210-h.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN; WT=$BASE/n2010-b2b; H=$BASE/p3/n2210/hieb; OUT=$H/staffel2; mkdir -p $OUT/stand
STOPP=$(cygpath -w $H/stopp.ps1); export WERKBANK_PORT=4490; W="node $WT/scripts/werkbank.cjs"; F=scripts/werkbank.cjs
say() { echo "$(date +%T) $*" | tee -a $OUT/fortschritt.log; }
stopp() { powershell -NoProfile -ExecutionPolicy Bypass -File "$STOPP" >> $OUT/stopp.log 2>&1; sleep 3; }
nachtruhe() { while :; do hm=$((10#$(date +%H%M))); if [ $hm -ge 325 ] && [ $hm -lt 415 ]; then sleep 60; else break; fi; done; }
. $BASE/p3/gpu-schloss.sh
cd $WT && node $H/latenz-patch2.cjs $F || exit 3
nachtruhe; schloss_nehmen omen-2210-h; stopp
mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $OUT/stand/ 2>/dev/null
(cd $WT && PORT=4312 node "$(cygpath -w $WT)\save-server.js" > $OUT/save.log 2>&1 &)
for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
(cd $WT && node $F start --echt --port 4490 --seite http://localhost:4312 --ort wiese > $OUT/werkbank.log 2>&1 &)
for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $OUT/werkbank.log 2>/dev/null && break; sleep 5; done
say "start $(git -C $WT log -1 --format=%h) Änderungen[$(git -C $WT status --porcelain | wc -l)]"
$W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null 2>&1
$W fenster 1920 1080 > /dev/null 2>&1
$W umstellen --ort wiese --sicht ego > $OUT/umstellen.txt 2>&1
$W lauf 10 --ein 20 --ruhe 300 --regler voll --tiere frei > $OUT/lauf0.txt 2>&1
for V in hieb springen GT einsteigen; do
  if [ $V = GT ]; then $W eval "$(cat $H/latenz-gt.js)" > $OUT/gt.txt 2>&1; say "gt $(tr -d '\n ' < $OUT/gt.txt | cut -c1-260)"; continue; fi
  for S in ego third; do
    timeout 600 $W latenz --proben 50 --sicht $S --verb $V --json $(cygpath -m $OUT/$V-$S.json) > $OUT/$V-$S.out 2>&1; E=$?
    say "$V $S EXIT=$E $(grep -E "^$S/$V|LATENZ" $OUT/$V-$S.out | tr '\n' ' ' | cut -c1-300)"
  done
done
$W stop > /dev/null 2>&1; stopp
mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $OUT/stand/ 2>/dev/null
schloss_loesen omen-2210-h
cd $WT && git -c core.autocrlf=false checkout -- $F
say "STAFFEL2 ENDE Änderungen[$(git -C $WT status --porcelain | wc -l)]"
