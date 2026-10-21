#!/bin/bash
# 2110 leib.K1 an der GTX: EINMAL je Seite `werkbank latenz --proben 50` an der Wiese (Gehen + Wechsel, Ego/Third), Instrument B.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN; INS=$BASE/n2010-b2b; OUT=$BASE/p3/n2110/abab6/latenz; LOG=$OUT/fortschritt.log; mkdir -p $OUT
STOPP=$(cygpath -w $BASE/p3/n2110/abab6/stopp.ps1); export WERKBANK_PORT=4490; W="node $INS/scripts/werkbank.cjs"
say() { echo "$(date +%T) $*" | tee -a $LOG; }
stopp() { powershell -NoProfile -ExecutionPolicy Bypass -File "$STOPP" >> $OUT/stopp.log 2>&1; sleep 3; }
. $BASE/p3/gpu-schloss.sh
for N in A B; do
  case $N in A) WT=$BASE/n2010-b2a;; B) WT=$BASE/n2010-b2b;; esac
  schloss_nehmen omen-2010; stopp; mkdir -p $OUT/stand-$N; mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $OUT/stand-$N/ 2>/dev/null
  (cd $WT && PORT=4312 node "$(cygpath -w $WT)\save-server.js" > $OUT/$N-save.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
  (cd $INS && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 --ort wiese > $OUT/$N-werkbank.log 2>&1 &)
  for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $OUT/$N-werkbank.log 2>/dev/null && break; sleep 5; done
  say "$N start $(git -C $WT log -1 --format=%h)"
  $W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null 2>&1
  $W fenster 1920 1080 > /dev/null 2>&1
  $W umstellen --ort wiese --sicht ego > $OUT/$N-umstellen.txt 2>&1
  $W lauf 10 --ein 20 --ruhe 300 --regler voll --tiere frei > $OUT/$N-lauf0.txt 2>&1
  $W latenz --proben 50 --json $(cygpath -m $OUT/$N-latenz.json) > $OUT/$N-latenz.out 2>&1; ec=$?
  $W stop > /dev/null 2>&1; stopp; mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $OUT/stand-$N/ 2>/dev/null
  schloss_loesen omen-2010; say "$N latenz EXIT=$ec $(tail -3 $OUT/$N-latenz.out | tr '\n' ' ' | cut -c1-300)"; sleep 15
done
say "LATENZ ENDE"
