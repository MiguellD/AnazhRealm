#!/bin/bash
# vorrat-pingpong: Dorf Ego 8 Uhr, vorher A = n2010-b2b (integ-zug 01ba2bf3) gegen nachher B = n2210-vp (vorrat-pingpong), A B A B;
# je Boot `umstellen --ort dorf`, Uhr 8 (uhr8.js), `lauf 30 --ein 20 --ruhe 300 --regler voll --tiere frei`. Werkbank aus B. Schloss je Boot.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN; A=$BASE/n2010-b2b; B=$BASE/n2210-vp; H=$BASE/p3/n2210/vp; mkdir -p $H/stand
STOPP=$(cygpath -w $H/stopp.ps1); export WERKBANK_PORT=4490; W="node $B/scripts/werkbank.cjs"
say() { echo "$(date +%T) $*" | tee -a $H/fortschritt.log; }
stopp() { powershell -NoProfile -ExecutionPolicy Bypass -File "$STOPP" >> $H/stopp.log 2>&1; sleep 3; }
nachtruhe() { while :; do hm=$((10#$(date +%H%M))); if [ $hm -ge 325 ] && [ $hm -lt 415 ]; then sleep 60; else break; fi; done; }
kurz() { node -e 'const t=require("fs").readFileSync(process.argv[1],"utf8");try{const e=JSON.parse(t.slice(t.indexOf("{"),t.lastIndexOf("}")+1));const b=e.belegung;process.stdout.write(`fps ${e.fps} C50 ${e.cpuTaktMs.p50} C95 ${e.cpuTaktMs.p95} Bel95 ${b.belegungMs.p95} aT95 ${b.ausserTaktMs.p95} ruhe ${JSON.stringify(e.ruhe)}`)}catch(x){process.stdout.write("LEER")}' "$1"; }
. $BASE/p3/gpu-schloss.sh
say "START A=$(git -C $A log -1 --format=%h)[$(git -C $A status --porcelain | wc -l)] B=$(git -C $B log -1 --format=%h)[$(git -C $B status --porcelain | wc -l)]"
for N in A1 B1 A2 B2; do
  P=$H/$N; [ -s $P-steht.txt ] && continue
  case $N in A*) WT=$A;; B*) WT=$B;; esac
  nachtruhe; schloss_nehmen omen-2210-vp; stopp
  mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $H/stand/ 2>/dev/null
  (cd $WT && PORT=4312 node "$(cygpath -w $WT)\save-server.js" > $P-save.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
  (cd $B && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 --ort dorf > $P-werkbank.log 2>&1 &)
  for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $P-werkbank.log 2>/dev/null && break; sleep 5; done
  $W fenster 1920 1080 > /dev/null 2>&1
  $W umstellen --ort dorf --sicht ego > $P-umstellen.txt 2>&1
  $W eval "$(cat $H/uhr8.js)" > $P-uhr.txt 2>&1
  $W lauf 30 --ein 20 --ruhe 300 --regler voll --tiere frei > $P-steht.txt 2>&1
  $W stop > /dev/null 2>&1; stopp
  mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $H/stand/ 2>/dev/null
  schloss_loesen omen-2210-vp
  say "$N $(kurz $P-steht.txt)"
  sleep 15
done
say "ENDE"
