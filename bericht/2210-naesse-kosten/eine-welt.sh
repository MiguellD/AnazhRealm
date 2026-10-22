#!/bin/bash
# naesse-kosten Zerlegung in EINER Welt (Wiese Ego im Regen, Kopf integ 85cec9c1 + mess-patch): Lagen D N1 N0 N0 N1 D ×2 je gpu-bank 12 --runden 5
# (Takt/Drossel per nvidia-smi). Schloss omen-2210-k, Nachtruhe 03:25–04:15, wartet auf GLAETTE ENDE.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN; WT=$BASE/n2210-nk; OUT=$BASE/p3/n2210/nk/${TAG:-e1}; H=$BASE/p3/n2210/nk; mkdir -p $OUT/stand
STOPP=$(cygpath -w $H/stopp.ps1); export WERKBANK_PORT=4490; W="node $WT/scripts/werkbank.cjs"; F=stamm/stoff-material.js
say() { echo "$(date +%T) $*" | tee -a $OUT/fortschritt.log; }
stopp() { powershell -NoProfile -ExecutionPolicy Bypass -File "$STOPP" >> $OUT/stopp.log 2>&1; sleep 3; }
nachtruhe() { while :; do hm=$((10#$(date +%H%M))); if [ $hm -ge 325 ] && [ $hm -lt 415 ]; then sleep 60; else break; fi; done; }
. $BASE/p3/gpu-schloss.sh
# (die Glätte ist durch)
cd $WT && node $H/mess-patch.cjs $F || exit 3
nachtruhe; schloss_nehmen omen-2210-k; stopp
mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $OUT/stand/ 2>/dev/null
(cd $WT && PORT=4312 node "$(cygpath -w $WT)\save-server.js" > $OUT/save.log 2>&1 &)
for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
(cd $WT && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 --ort wiese > $OUT/werkbank.log 2>&1 &)
for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $OUT/werkbank.log 2>/dev/null && break; sleep 5; done
say "start $(git -C $WT log -1 --format=%h) Änderungen[$(git -C $WT status --porcelain | wc -l)]"
$W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null 2>&1
$W fenster 1920 1080 > /dev/null 2>&1
$W umstellen --ort wiese --sicht ego > $OUT/umstellen.txt 2>&1
$W eval "window.__nkLage = 'N1'; $(cat $H/lage.js)" > $OUT/lage-0.txt 2>&1
$W lauf 30 --ein 20 --ruhe 300 --regler voll --tiere frei > $OUT/lauf.txt 2>&1
i=0
for L in D N1 N0 N0 N1 D D N1 N0 N0 N1 D; do
  i=$((i+1))
  $W eval "window.__nkLage = '$L'; $(cat $H/lage.js)" > $OUT/$i-$L-lage.txt 2>&1
  nvidia-smi --query-gpu=clocks.gr,clocks_throttle_reasons.active,temperature.gpu --format=csv,noheader > $OUT/$i-$L-smi.txt 2>/dev/null
  $W gpu-bank 12 --runden 5 > $OUT/$i-$L-bank.txt 2>&1
  say "$i $L $(tr -d ' \n' < $OUT/$i-$L-lage.txt | cut -c1-100) bank $(grep -o '"gpuJeFrameMs": [0-9.]*' $OUT/$i-$L-bank.txt) smi $(cat $OUT/$i-$L-smi.txt)"
done
$W schirm --datei $(cygpath -m $OUT/schirm-N1.png) > /dev/null 2>&1
$W stop > /dev/null 2>&1; stopp
mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $OUT/stand/ 2>/dev/null
schloss_loesen omen-2210-k
cd $WT && git -c core.autocrlf=false checkout -- $F
say "ENDE Änderungen[$(git -C $WT status --porcelain | wc -l)]"
