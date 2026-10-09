#!/bin/bash
P3=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3
WT=/c/Users/micha/Desktop/AnazhRealm-OMEN/welle-m-impuls; SEITE=7902; export WERKBANK_PORT=7900
W="node $WT/scripts/werkbank.cjs"
(cd $WT && PORT=$SEITE node save-server.js > $P3/save-$SEITE.log 2>&1 &)
sleep 3
(cd $WT && node scripts/werkbank.cjs start --echt --port 7900 --seite http://localhost:$SEITE > $P3/werkbank-strahl.log 2>&1 &)
for t in $(seq 1 120); do grep -q "WERKBANK bereit" $P3/werkbank-strahl.log 2>/dev/null && break; sleep 5; done
$W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
$W fenster 1920 1080 > /dev/null
$W umstellen --ort wiese > /dev/null
node $P3/reiter-bild.cjs 7900 supersport > $P3/strahl-ss.json
$W eval "const a = window.__reiterAbbild; if (a) { a.pm.attach(a.kind); window.__reiterAbbild = null; } return 1" > /dev/null
$W eval "$(cat $P3/strahl-eval.js)" > $P3/strahl-ergebnis.json
$W stop > /dev/null 2>&1; sleep 3
for pid in $(netstat -ano | grep "LISTENING" | grep ":$SEITE " | awk '{print $NF}' | sort -u); do taskkill //PID $pid //F > /dev/null 2>&1; done
