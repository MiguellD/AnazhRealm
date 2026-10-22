#!/bin/bash
# naesse-kosten NACH dem Schnitt (Hülle des Pools), Kopf n2210-nk ungeteilt: EINE Welt je Ort (wiese, dorf) im Regen, Lagen D N N D D N N D je
# gpu-bank 12 --runden 5 — die Nässe kostet (N − D). Schloss omen-2210-k, Nachtruhe.
BASE=/c/Users/micha/Desktop/AnazhRealm-OMEN; WT=${WT:-$BASE/n2210-nk}; H=$BASE/p3/n2210/nk; OUT=$H/${TAG:-s1}; mkdir -p $OUT/stand
STOPP=$(cygpath -w $H/stopp.ps1); export WERKBANK_PORT=4490; W="node $WT/scripts/werkbank.cjs"
say() { echo "$(date +%T) $*" | tee -a $OUT/fortschritt.log; }
stopp() { powershell -NoProfile -ExecutionPolicy Bypass -File "$STOPP" >> $OUT/stopp.log 2>&1; sleep 3; }
nachtruhe() { while :; do hm=$((10#$(date +%H%M))); if [ $hm -ge 325 ] && [ $hm -lt 415 ]; then sleep 60; else break; fi; done; }
. $BASE/p3/gpu-schloss.sh
for ORT in ${ORTE:-wiese dorf}; do
  nachtruhe; schloss_nehmen omen-2210-k; stopp
  mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $OUT/stand/ 2>/dev/null
  (cd $WT && PORT=4312 node "$(cygpath -w $WT)\save-server.js" > $OUT/$ORT-save.log 2>&1 &)
  for t in $(seq 1 30); do curl -s -o /dev/null -w "%{http_code}" http://localhost:4312/ 2>/dev/null | grep -q 200 && break; sleep 1; done
  (cd $WT && node scripts/werkbank.cjs start --echt --port 4490 --seite http://localhost:4312 --ort $ORT > $OUT/$ORT-werkbank.log 2>&1 &)
  for t in $(seq 1 120); do grep -qE "bereit|FEHLER" $OUT/$ORT-werkbank.log 2>/dev/null && break; sleep 5; done
  say "$ORT start $(git -C $WT log -1 --format=%h) Änderungen[$(git -C $WT status --porcelain | wc -l)]"
  [ $ORT = dorf ] || $W eval "window.__anazhAutoSettlement = false; return 1" > /dev/null 2>&1
  $W fenster 1920 1080 > /dev/null 2>&1
  $W umstellen --ort $ORT --sicht ego > $OUT/$ORT-umstellen.txt 2>&1
  $W eval "window.__nkLage = 'N'; $(cat $H/lage-b.js)" > $OUT/$ORT-lage-0.txt 2>&1
  $W lauf 30 --ein 20 --ruhe 300 --regler voll --tiere frei > $OUT/$ORT-lauf.txt 2>&1
  $W eval "const U = r._ensureAtmoUniforms(); return { huelle: U.dachHuelle.value.toArray().map((v) => +v.toFixed(1)), oben: +U.dachOben.value.toFixed(1), plaetze: U.dachMass.filter((m) => m.value.x > 0).length }" > $OUT/$ORT-huelle.txt 2>&1
  say "$ORT huelle $(tr -d ' \n' < $OUT/$ORT-huelle.txt | cut -c1-140)"
  i=0
  for L in D N N D D N N D D N N D; do
    i=$((i+1))
    $W eval "window.__nkLage = '$L'; $(cat $H/lage-b.js)" > $OUT/$ORT-$i-$L-lage.txt 2>&1
    $W gpu-bank 12 --runden 5 > $OUT/$ORT-$i-$L-bank.txt 2>&1
    say "$ORT $i $L $(tr -d ' \n' < $OUT/$ORT-$i-$L-lage.txt | cut -c1-80) bank $(grep -o '"gpuJeFrameMs": [0-9.]*' $OUT/$ORT-$i-$L-bank.txt)"
  done
  $W stop > /dev/null 2>&1; stopp
  mv $WT/anazhRealmState.json $WT/anazhRealmState.json.bak $WT/anazhRealmPerf.json $OUT/stand/ 2>/dev/null
  schloss_loesen omen-2210-k; sleep 15
done
say "SCHNITT ENDE"
