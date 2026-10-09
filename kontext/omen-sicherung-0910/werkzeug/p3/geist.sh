#!/bin/bash
# ./geist.sh <name> <seite-port> — der Wagen-Geist am echten Renderer in der Werkbank (Port 7900)
P3=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3
WT=/c/Users/micha/Desktop/AnazhRealm-OMEN/welle-m-fahren
N=$1; SEITE=$2; export WERKBANK_PORT=7900
W="node $WT/scripts/werkbank.cjs"
OUT=$(cd $P3 && pwd -W)/bilder/geist-$N; mkdir -p $P3/bilder/geist-$N
(cd $WT && node scripts/werkbank.cjs start --echt --port 7900 --seite http://localhost:$SEITE > $P3/werkbank-geist-$N.log 2>&1 &)
for t in $(seq 1 120); do grep -q "WERKBANK bereit" $P3/werkbank-geist-$N.log 2>/dev/null && break; sleep 5; done
$W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null
$W umstellen --ort wiese > /dev/null
node $P3/geist.cjs 7900 "$OUT"
$W stop > /dev/null 2>&1; sleep 3
