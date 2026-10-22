#!/bin/bash
# B (n2010-b2b b9d99b9e) am Dorf: wer hält die Foundry offen? EIN Boot, Schloss omen-2210-fd
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN; WT=$BASE/n2010-b2b; H=$BASE/p3/n2210/faden/offen; mkdir -p $H/stand
STOPP=$(cygpath -w $BASE/p3/n2210/faden/stopp.ps1); export WERKBANK_PORT=4490; W="node $WT/scripts/werkbank.cjs"
. $BASE/p3/gpu-schloss.sh; schloss_nehmen omen-2210-fd
powershell -NoProfile -ExecutionPolicy Bypass -File "$STOPP" > /dev/null 2>&1; sleep 3
mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $H/stand/ 2>/dev/null
(cd $WT && PORT=4312 node "$(cygpath -w $WT)\save-server.js" > $H/save.log 2>&1 &)
for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
(cd $WT && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 --ort dorf > $H/werkbank.log 2>&1 &)
for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $H/werkbank.log 2>/dev/null && break; sleep 5; done
$W fenster 1920 1080 > /dev/null 2>&1
$W umstellen --ort dorf --sicht ego > $H/umstellen.txt 2>&1
$W eval "$(cat $BASE/p3/n2210/faden/uhr8.js)" > $H/uhr.txt 2>&1
$W lauf 10 --ein 20 --ruhe 120 --regler voll --tiere frei > $H/ein.txt 2>&1
$W eval "$(cat $H/offen.js)" > $H/offen-1.txt 2>&1
$W lauf 10 --ein 2 --regler voll --tiere frei > /dev/null 2>&1
$W eval "$(cat $H/offen.js)" > $H/offen-2.txt 2>&1
$W stop > /dev/null 2>&1; powershell -NoProfile -ExecutionPolicy Bypass -File "$STOPP" > /dev/null 2>&1; sleep 3
mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $H/stand/ 2>/dev/null
schloss_loesen omen-2210-fd; echo ENDE
