#!/bin/bash
# 2210 Profiband K4 (Glätte) an der GTX, Messschuld: `werkbank haenger 60 --wandern bahn` (die Bahn der OMEN-Zellen „geht": 4 m/s −z 0 → −60 m
# und zurück; `--wandern kreis` kennt der Kopf nicht) in 4 frischen Sitzungen an main b9537781 (n2010-b2b), Wiese Ego, Regler voll, Tiere frei,
# einschwingen mit lauf 30 --ein 20 --ruhe 300. Jeder Frame > 100 ms beim Namen (haenger-linse). Schloss je Sitzung.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN; WT=$BASE/n2010-b2b; OUT=$BASE/p3/n2210/glaette; mkdir -p $OUT/stand
STOPP=$(cygpath -w $OUT/stopp.ps1); export WERKBANK_PORT=4490; W="node $WT/scripts/werkbank.cjs"
say() { echo "$(date +%T) $*" | tee -a $OUT/fortschritt.log; }
stopp() { powershell -NoProfile -ExecutionPolicy Bypass -File "$STOPP" >> $OUT/stopp.log 2>&1; sleep 3; }
. $BASE/p3/gpu-schloss.sh
# NACHTRUHE 03:25–04:15 (Regel der Station seit 15.10.: die Wartung des Rechners läuft dann — eine Hänger-Messung zählte sie mit)
nachtruhe() { while :; do hm=$((10#$(date +%H%M))); if [ $hm -ge 325 ] && [ $hm -lt 415 ]; then sleep 60; else break; fi; done; }
for N in 1 2 3 4; do
  [ -s $OUT/s$N-haenger.txt ] && continue
  nachtruhe; schloss_nehmen omen-2210-g; stopp
  mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $OUT/stand/ 2>/dev/null
  (cd $WT && PORT=4312 node "$(cygpath -w $WT)\save-server.js" > $OUT/s$N-save.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
  (cd $WT && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 --ort wiese > $OUT/s$N-werkbank.log 2>&1 &)
  for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $OUT/s$N-werkbank.log 2>/dev/null && break; sleep 5; done
  say "s$N start $(git -C $WT log -1 --format=%h)[$(git -C $WT status --porcelain | wc -l)]"
  $W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null 2>&1
  $W fenster 1920 1080 > /dev/null 2>&1
  $W umstellen --ort wiese --sicht ego > $OUT/s$N-umstellen.txt 2>&1
  $W lauf 30 --ein 20 --ruhe 300 --regler voll --tiere frei > $OUT/s$N-lauf0.txt 2>&1
  $W haenger 60 --regler voll --tiere frei --wandern bahn --json $(cygpath -m $OUT/s$N-haenger.json) > $OUT/s$N-haenger.txt 2>&1; E=$?
  $W stop > /dev/null 2>&1; stopp
  mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $OUT/stand/ 2>/dev/null
  schloss_loesen omen-2210-g
  say "s$N haenger EXIT=$E $(grep -E 'HÄNGER|Hänger|über|>' $OUT/s$N-haenger.txt | head -3 | tr '\n' ' ' | cut -c1-300)"; sleep 20
done
say "GLAETTE ENDE"
